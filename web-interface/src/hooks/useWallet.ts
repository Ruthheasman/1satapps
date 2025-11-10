import { useState, useEffect } from 'react';

// Type definitions for BSV SDK wallet operations
interface WalletConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  walletAddress?: string;
}

interface PaymentResult {
  success: boolean;
  txid?: string;
  error?: string;
}

// Custom hook for BRC-100 wallet integration
export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null
  });

  useEffect(() => {
    // Check if wallet is available
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      // Check if BRC-100 compliant wallet is running (typically on port 2121)
      const response = await fetch('https://localhost:2121/v1/status', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }).catch(() => null);

      if (response && response.ok) {
        setWallet({
          isConnected: true,
          isConnecting: false,
          error: null
        });
      } else {
        setWallet({
          isConnected: false,
          isConnecting: false,
          error: 'Wallet not detected. Please ensure BSV Desktop or Metanet Desktop is running.'
        });
      }
    } catch (error) {
      setWallet({
        isConnected: false,
        isConnecting: false,
        error: 'Failed to connect to wallet'
      });
    }
  };

  const connectWallet = async () => {
    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));
    await checkWalletConnection();
  };

  const createPayment = async (
    amount: number,
    description: string,
    recipient: string
  ): Promise<PaymentResult> => {
    try {
      if (!wallet.isConnected) {
        return {
          success: false,
          error: 'Wallet not connected'
        };
      }

      // Call backend to create payment transaction
      const response = await fetch('http://localhost:3001/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          description,
          recipient
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Request user to sign and broadcast transaction via their wallet
      // In a real implementation, this would use the BRC-100 createAction
      // For now, we'll use our backend to handle the transaction details
      return {
        success: true,
        txid: data.txid
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  };

  return {
    wallet,
    connectWallet,
    createPayment,
    refreshConnection: checkWalletConnection
  };
};
