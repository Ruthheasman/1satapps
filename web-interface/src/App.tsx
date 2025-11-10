import { useState } from 'react';
import './App.css';
import { useWallet } from './hooks/useWallet';

interface DeploymentStatus {
  status: 'idle' | 'uploading' | 'deploying' | 'success' | 'error';
  message: string;
  deploymentUrl?: string;
  txid?: string;
}

type PaymentMethod = 'wallet' | 'manual';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    status: 'idle',
    message: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [paymentKey, setPaymentKey] = useState('');
  const [appVersion, setAppVersion] = useState('1.0.0');

  const { wallet, connectWallet, createPayment } = useWallet();

  // Calculate deployment cost based on file size (example pricing)
  const calculateCost = (fileSize: number): number => {
    // Base cost: 1000 satoshis + 10 satoshis per KB
    const baseCost = 1000;
    const perKbCost = 10;
    const sizeInKb = fileSize / 1024;
    return Math.ceil(baseCost + (sizeInKb * perKbCost));
  };

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

    if (paymentMethod === 'manual' && !paymentKey) {
      setDeploymentStatus({
        status: 'error',
        message: 'Please provide a payment key'
      });
      return;
    }

    if (paymentMethod === 'wallet' && !wallet.isConnected) {
      setDeploymentStatus({
        status: 'error',
        message: 'Please connect your wallet first'
      });
      return;
    }

    const formData = new FormData();
    formData.append('app', file);
    formData.append('version', appVersion);
    formData.append('paymentMethod', paymentMethod);

    try {
      setDeploymentStatus({
        status: 'uploading',
        message: 'Uploading your app...'
      });

      // If using wallet payment, create payment transaction first
      if (paymentMethod === 'wallet') {
        const cost = calculateCost(file.size);
        const paymentResult = await createPayment(
          cost,
          `Deploy ${file.name} v${appVersion}`,
          '1SatAppsDeploymentAddress' // Replace with actual recipient address
        );

        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Payment failed');
        }

        formData.append('paymentTxid', paymentResult.txid || '');
      } else {
        formData.append('paymentKey', paymentKey);
      }

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

  const estimatedCost = file ? calculateCost(file.size) : 0;

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
              <div className="file-info-container">
                <p className="file-info">
                  Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
                <p className="cost-info">
                  Estimated cost: {estimatedCost} satoshis (~${(estimatedCost * 0.00000001 * 50).toFixed(4)} USD)
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <div className="payment-method-selector">
              <button
                className={`payment-method-button ${paymentMethod === 'wallet' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('wallet')}
                disabled={deploymentStatus.status === 'uploading' || deploymentStatus.status === 'deploying'}
              >
                BRC-100 Wallet
              </button>
              <button
                className={`payment-method-button ${paymentMethod === 'manual' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('manual')}
                disabled={deploymentStatus.status === 'uploading' || deploymentStatus.status === 'deploying'}
              >
                Manual Key
              </button>
            </div>
          </div>

          {paymentMethod === 'wallet' && (
            <div className="wallet-section">
              <div className="wallet-status">
                {wallet.isConnected ? (
                  <div className="wallet-connected">
                    <span className="status-indicator connected"></span>
                    <span>Wallet Connected</span>
                  </div>
                ) : (
                  <div className="wallet-disconnected">
                    <span className="status-indicator disconnected"></span>
                    <span>Wallet Not Connected</span>
                  </div>
                )}
              </div>

              {!wallet.isConnected && (
                <div className="wallet-info">
                  <p className="hint">
                    Please ensure BSV Desktop or Metanet Desktop wallet is running on your system.
                  </p>
                  <button
                    onClick={connectWallet}
                    className="connect-wallet-button"
                    disabled={wallet.isConnecting}
                  >
                    {wallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                </div>
              )}

              {wallet.error && (
                <p className="wallet-error">{wallet.error}</p>
              )}
            </div>
          )}

          {paymentMethod === 'manual' && (
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
          )}

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
            disabled={
              !file ||
              (paymentMethod === 'manual' && !paymentKey) ||
              (paymentMethod === 'wallet' && !wallet.isConnected) ||
              deploymentStatus.status === 'uploading' ||
              deploymentStatus.status === 'deploying'
            }
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
          <h3>Payment Methods</h3>
          <div className="payment-info">
            <h4>BRC-100 Wallet (Recommended)</h4>
            <p>Connect your BSV Desktop or Metanet Desktop wallet for secure, one-click payments. Your keys never leave your device.</p>

            <h4>Manual Key Entry</h4>
            <p>Provide a payment key directly. Use this only if you don't have a BRC-100 compatible wallet installed.</p>
          </div>

          <h3>How It Works</h3>
          <ol>
            <li>Build your app using your preferred framework (React, Vue, etc.)</li>
            <li>Create a ZIP file of your build directory</li>
            <li>Choose your payment method (Wallet or Manual)</li>
            <li>Upload and pay for deployment</li>
            <li>Your app is deployed permanently to the BSV blockchain</li>
            <li>Access your app via the provided onchain URL - no servers needed!</li>
          </ol>

          <h3>Benefits</h3>
          <ul>
            <li>Permanent hosting on the blockchain</li>
            <li>Pay-per-use pricing - only pay for what you deploy</li>
            <li>No recurring hosting fees</li>
            <li>No downtime - your app lives forever</li>
            <li>Deployments typically cost less than a penny</li>
            <li>Decentralized and censorship-resistant</li>
          </ul>
        </div>
      </main>

      <footer>
        <p>
          Powered by <a href="https://github.com/danwag06/react-onchain" target="_blank" rel="noopener noreferrer">react-onchain</a>
          {' | '}
          BRC-100 Compatible
        </p>
      </footer>
    </div>
  );
}

export default App;
