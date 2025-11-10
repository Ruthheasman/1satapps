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

// Pricing configuration (in satoshis)
const PRICING = {
  baseCost: 1000,        // 1000 satoshis base
  perKbCost: 10,         // 10 satoshis per KB
  recipientAddress: '1SatAppsDeploymentAddress'  // Replace with actual BSV address
};

// Calculate deployment cost
function calculateDeploymentCost(fileSizeBytes) {
  const sizeInKb = fileSizeBytes / 1024;
  return Math.ceil(PRICING.baseCost + (sizeInKb * PRICING.perKbCost));
}

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

// Create payment transaction endpoint (for wallet payments)
app.post('/api/create-payment', async (req, res) => {
  try {
    const { amount, description, recipient } = req.body;

    if (!amount || !description) {
      return res.status(400).json({ error: 'Amount and description are required' });
    }

    // In a real implementation, this would create a payment transaction
    // using BRC-100 wallet interface. For now, we'll return a mock response
    // that indicates what the wallet should do.

    // The actual payment would be handled by the user's wallet through BRC-100 createAction
    // This endpoint could validate the payment later or provide payment details

    console.log(`Payment request: ${amount} satoshis for "${description}"`);
    console.log(`Recipient: ${recipient || PRICING.recipientAddress}`);

    // Return payment details that the wallet should use
    res.json({
      success: true,
      amount,
      recipient: recipient || PRICING.recipientAddress,
      description,
      // Mock transaction ID - in real implementation, this comes from wallet
      txid: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      error: 'Failed to create payment',
      details: error.message
    });
  }
});

// Get pricing information
app.get('/api/pricing', (req, res) => {
  const { fileSize } = req.query;

  if (!fileSize) {
    return res.json({
      baseCost: PRICING.baseCost,
      perKbCost: PRICING.perKbCost
    });
  }

  const cost = calculateDeploymentCost(parseInt(fileSize));
  res.json({
    cost,
    baseCost: PRICING.baseCost,
    perKbCost: PRICING.perKbCost,
    fileSize: parseInt(fileSize)
  });
});

// Deploy endpoint
app.post('/api/deploy', upload.single('app'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { paymentKey, paymentMethod, paymentTxid, version } = req.body;

    // Validate payment method
    if (!paymentMethod || (paymentMethod !== 'wallet' && paymentMethod !== 'manual')) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Validate payment based on method
    if (paymentMethod === 'manual') {
      if (!paymentKey) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Payment key is required for manual payment' });
      }
    } else if (paymentMethod === 'wallet') {
      if (!paymentTxid) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'Payment transaction ID is required for wallet payment' });
      }
      // In a real implementation, verify the payment transaction here
      console.log(`Verifying wallet payment transaction: ${paymentTxid}`);

      // Calculate expected cost and verify payment amount
      const expectedCost = calculateDeploymentCost(req.file.size);
      console.log(`Expected payment: ${expectedCost} satoshis`);

      // TODO: Verify payment transaction on blockchain
      // For now, we'll proceed assuming payment is valid
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
    // Only use paymentKey for manual payment method
    const env = {
      ...process.env,
      ...(paymentMethod === 'manual' && paymentKey ? { PAYMENT_KEY: paymentKey } : {})
    };

    // For wallet payments, we've already received payment
    // so we can use a deployment-only key or skip payment in react-onchain
    console.log(`Deploying with payment method: ${paymentMethod}`);

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

        const result = {
          success: true,
          message: 'Deployment successful',
          deploymentUrl: urlMatch ? urlMatch[0] : null,
          txid: txidMatch ? txidMatch[1] : null,
          output: deployOutput,
          paymentMethod,
          cost: calculateDeploymentCost(req.file.size)
        };

        // Include payment transaction ID for wallet payments
        if (paymentMethod === 'wallet' && paymentTxid) {
          result.paymentTxid = paymentTxid;
        }

        res.json(result);
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
  console.log(`Pricing: ${PRICING.baseCost} satoshis base + ${PRICING.perKbCost} satoshis/KB`);
  console.log(`Payment methods: BRC-100 Wallet, Manual Key`);
});
