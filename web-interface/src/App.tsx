import { useState } from 'react';
import './App.css';

interface DeploymentStatus {
  status: 'idle' | 'uploading' | 'deploying' | 'success' | 'error';
  message: string;
  deploymentUrl?: string;
  txid?: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    status: 'idle',
    message: ''
  });
  const [paymentKey, setPaymentKey] = useState('');
  const [appVersion, setAppVersion] = useState('1.0.0');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setDeploymentStatus({ status: 'idle', message: '' });
    }
  };

  const handleDeploy = async () => {
    if (!file) {
      setDeploymentStatus({
        status: 'error',
        message: 'Please select a file to upload'
      });
      return;
    }

    if (!paymentKey) {
      setDeploymentStatus({
        status: 'error',
        message: 'Please provide a payment key'
      });
      return;
    }

    const formData = new FormData();
    formData.append('app', file);
    formData.append('paymentKey', paymentKey);
    formData.append('version', appVersion);

    try {
      setDeploymentStatus({
        status: 'uploading',
        message: 'Uploading your app...'
      });

      const response = await fetch('http://localhost:3001/api/deploy', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Deployment failed');
      }

      setDeploymentStatus({
        status: 'success',
        message: 'App deployed successfully!',
        deploymentUrl: data.deploymentUrl,
        txid: data.txid
      });
    } catch (error) {
      setDeploymentStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  };

  return (
    <div className="container">
      <header>
        <h1>1Sat Apps - Onchain Deployment</h1>
        <p className="subtitle">Upload and deploy your microsaas apps onchain with feeless hosting</p>
      </header>

      <main>
        <div className="upload-card">
          <h2>Deploy Your App</h2>

          <div className="form-group">
            <label htmlFor="file-upload">
              App Build (ZIP file)
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".zip"
              onChange={handleFileChange}
              disabled={deploymentStatus.status === 'uploading' || deploymentStatus.status === 'deploying'}
            />
            {file && (
              <p className="file-info">Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="payment-key">
              BSV Payment Key (WIF format)
            </label>
            <input
              id="payment-key"
              type="password"
              value={paymentKey}
              onChange={(e) => setPaymentKey(e.target.value)}
              placeholder="Enter your payment key"
              disabled={deploymentStatus.status === 'uploading' || deploymentStatus.status === 'deploying'}
            />
            <p className="hint">Your private key is used only for signing transactions and never stored</p>
          </div>

          <div className="form-group">
            <label htmlFor="app-version">
              App Version
            </label>
            <input
              id="app-version"
              type="text"
              value={appVersion}
              onChange={(e) => setAppVersion(e.target.value)}
              placeholder="1.0.0"
              disabled={deploymentStatus.status === 'uploading' || deploymentStatus.status === 'deploying'}
            />
          </div>

          <button
            onClick={handleDeploy}
            disabled={!file || !paymentKey || deploymentStatus.status === 'uploading' || deploymentStatus.status === 'deploying'}
            className="deploy-button"
          >
            {deploymentStatus.status === 'uploading' || deploymentStatus.status === 'deploying'
              ? 'Deploying...'
              : 'Deploy to Blockchain'}
          </button>

          {deploymentStatus.message && (
            <div className={`status-message ${deploymentStatus.status}`}>
              <p>{deploymentStatus.message}</p>
              {deploymentStatus.deploymentUrl && (
                <div className="deployment-info">
                  <p><strong>Deployment URL:</strong></p>
                  <a href={deploymentStatus.deploymentUrl} target="_blank" rel="noopener noreferrer">
                    {deploymentStatus.deploymentUrl}
                  </a>
                  {deploymentStatus.txid && (
                    <p className="txid"><strong>Transaction ID:</strong> {deploymentStatus.txid}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="info-card">
          <h3>How It Works</h3>
          <ol>
            <li>Build your app using your preferred framework (React, Vue, etc.)</li>
            <li>Create a ZIP file of your build directory</li>
            <li>Upload the ZIP file and provide your BSV payment key</li>
            <li>Your app will be deployed permanently to the BSV blockchain</li>
            <li>Access your app via the provided onchain URL - no servers needed!</li>
          </ol>

          <h3>Benefits</h3>
          <ul>
            <li>Permanent hosting on the blockchain</li>
            <li>No recurring hosting fees</li>
            <li>No downtime - your app lives forever</li>
            <li>Deployments typically cost less than a penny</li>
            <li>Decentralized and censorship-resistant</li>
          </ul>
        </div>
      </main>

      <footer>
        <p>Powered by <a href="https://github.com/danwag06/react-onchain" target="_blank" rel="noopener noreferrer">react-onchain</a></p>
      </footer>
    </div>
  );
}

export default App;
