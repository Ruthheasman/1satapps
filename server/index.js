import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Deploy endpoint
app.post('/api/deploy', upload.single('app'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { paymentKey, version } = req.body;

    if (!paymentKey) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Payment key is required' });
    }

    // Extract the ZIP file
    const extractDir = path.join(__dirname, 'uploads', 'extract-' + Date.now());
    fs.mkdirSync(extractDir, { recursive: true });

    // Use unzip to extract the file
    const unzipProcess = spawn('unzip', ['-q', req.file.path, '-d', extractDir]);

    await new Promise((resolve, reject) => {
      unzipProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to extract ZIP file (exit code ${code})`));
        }
      });
      unzipProcess.on('error', reject);
    });

    // Find the build directory (common names: dist, build, out)
    let buildDir = null;
    const commonBuildDirs = ['dist', 'build', 'out'];

    for (const dir of commonBuildDirs) {
      const testPath = path.join(extractDir, dir);
      if (fs.existsSync(testPath)) {
        buildDir = testPath;
        break;
      }
    }

    // If no common build dir found, use the extract dir itself
    if (!buildDir) {
      buildDir = extractDir;
    }

    // Set environment variables for react-onchain
    const env = {
      ...process.env,
      PAYMENT_KEY: paymentKey
    };

    // Run react-onchain deploy
    const deployProcess = spawn('npx', [
      'react-onchain',
      'deploy',
      '--build-dir', buildDir,
      '--version', version || '1.0.0',
      '--non-interactive'
    ], {
      env,
      cwd: buildDir
    });

    let deployOutput = '';
    let deployError = '';

    deployProcess.stdout.on('data', (data) => {
      deployOutput += data.toString();
      console.log('Deploy output:', data.toString());
    });

    deployProcess.stderr.on('data', (data) => {
      deployError += data.toString();
      console.error('Deploy error:', data.toString());
    });

    deployProcess.on('close', async (code) => {
      // Clean up
      try {
        fs.unlinkSync(req.file.path);
        fs.rmSync(extractDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }

      if (code === 0) {
        // Parse the deployment output to extract the URL and txid
        const urlMatch = deployOutput.match(/https?:\/\/[^\s]+/);
        const txidMatch = deployOutput.match(/([a-f0-9]{64}_\d+)/);

        res.json({
          success: true,
          message: 'Deployment successful',
          deploymentUrl: urlMatch ? urlMatch[0] : null,
          txid: txidMatch ? txidMatch[1] : null,
          output: deployOutput
        });
      } else {
        res.status(500).json({
          error: 'Deployment failed',
          details: deployError || deployOutput
        });
      }
    });

    deployProcess.on('error', (error) => {
      // Clean up
      try {
        fs.unlinkSync(req.file.path);
        fs.rmSync(extractDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }

      res.status(500).json({
        error: 'Failed to start deployment process',
        details: error.message
      });
    });

  } catch (error) {
    console.error('Deployment error:', error);

    // Clean up on error
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`1Sat Apps deployment server running on http://localhost:${PORT}`);
  console.log('Ready to accept deployment requests');
});
