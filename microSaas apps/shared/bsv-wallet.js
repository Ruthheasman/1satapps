/**
 * BSV Wallet Integration Library
 * Supports BRC100-compliant wallets for Bitcoin SV payments
 * Compatible with: Yours Wallet, Panda Wallet, and other BRC100 wallets
 */

class BSVWallet {
    constructor() {
        this.provider = null;
        this.walletType = null;
        this.connected = false;
        this.address = null;
        this.listeners = {
            connect: [],
            disconnect: [],
            accountChange: []
        };
    }

    /**
     * Detect available BRC100-compliant wallet
     * @returns {Promise<string>} Wallet type detected
     */
    async detectWallet() {
        // Check for Yours Wallet (Panda Wallet uses the same interface)
        if (typeof window.yours !== 'undefined') {
            this.provider = window.yours;
            this.walletType = 'yours';
            return 'yours';
        }

        // Check for Panda Wallet (alternative naming)
        if (typeof window.panda !== 'undefined') {
            this.provider = window.panda;
            this.walletType = 'panda';
            return 'panda';
        }

        // Check for generic BSV provider
        if (typeof window.bsv !== 'undefined' && window.bsv.isProvider) {
            this.provider = window.bsv;
            this.walletType = 'bsv';
            return 'bsv';
        }

        throw new Error('No BRC100-compliant wallet detected. Please install Yours Wallet or Panda Wallet.');
    }

    /**
     * Connect to wallet and request account access
     * @returns {Promise<Object>} Connection info with address
     */
    async connect() {
        if (this.connected) {
            return { address: this.address, walletType: this.walletType };
        }

        try {
            await this.detectWallet();

            // Request account access
            if (this.provider.connect) {
                const result = await this.provider.connect();
                this.address = result.address || result.pubkey;
            } else if (this.provider.getAddress) {
                this.address = await this.provider.getAddress();
            } else if (this.provider.requestAccount) {
                const account = await this.provider.requestAccount();
                this.address = account.address || account;
            } else {
                // Fallback: try to get addresses directly
                const addresses = await this.provider.getAddresses();
                this.address = addresses[0];
            }

            this.connected = true;
            this.emit('connect', { address: this.address, walletType: this.walletType });

            return {
                address: this.address,
                walletType: this.walletType
            };

        } catch (error) {
            console.error('Failed to connect to wallet:', error);
            throw new Error(`Wallet connection failed: ${error.message}`);
        }
    }

    /**
     * Send BSV payment
     * @param {Object} params Payment parameters
     * @param {string} params.to Recipient address
     * @param {number} params.amount Amount in satoshis
     * @param {string} params.description Optional payment description
     * @returns {Promise<Object>} Transaction result with txid
     */
    async sendPayment({ to, amount, description = '' }) {
        if (!this.connected) {
            await this.connect();
        }

        try {
            let txid;

            // Different wallets may have different API methods
            if (this.provider.sendBsv) {
                // Yours/Panda Wallet method
                const result = await this.provider.sendBsv({
                    to: to,
                    amount: amount,
                    currency: 'BSV',
                    description: description || 'Payment'
                });
                txid = result.txid || result.txId || result.transactionId;

            } else if (this.provider.transferBsv) {
                // Alternative method used by some wallets
                const result = await this.provider.transferBsv({
                    receivers: [{ address: to, amount: amount }]
                });
                txid = result.txid || result.txId;

            } else if (this.provider.send) {
                // Generic send method
                const result = await this.provider.send({
                    to: to,
                    amount: amount,
                    note: description
                });
                txid = result.txid || result.txId;

            } else {
                throw new Error('Wallet does not support payment methods');
            }

            return {
                success: true,
                txid: txid,
                amount: amount,
                to: to
            };

        } catch (error) {
            console.error('Payment failed:', error);
            throw new Error(`Payment failed: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Request signature for a message
     * @param {string} message Message to sign
     * @returns {Promise<string>} Signature
     */
    async signMessage(message) {
        if (!this.connected) {
            await this.connect();
        }

        try {
            if (this.provider.signMessage) {
                return await this.provider.signMessage(message);
            } else {
                throw new Error('Wallet does not support message signing');
            }
        } catch (error) {
            console.error('Signing failed:', error);
            throw new Error(`Signing failed: ${error.message}`);
        }
    }

    /**
     * Get current BSV balance
     * @returns {Promise<number>} Balance in satoshis
     */
    async getBalance() {
        if (!this.connected) {
            await this.connect();
        }

        try {
            if (this.provider.getBalance) {
                const result = await this.provider.getBalance();
                return typeof result === 'object' ? result.satoshis : result;
            } else if (this.provider.getBsvBalance) {
                return await this.provider.getBsvBalance();
            } else {
                return null; // Balance not available
            }
        } catch (error) {
            console.error('Failed to get balance:', error);
            return null;
        }
    }

    /**
     * Disconnect from wallet
     */
    disconnect() {
        this.connected = false;
        this.address = null;
        this.emit('disconnect', {});
    }

    /**
     * Event emitter
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    /**
     * Check if wallet is installed
     * @returns {boolean}
     */
    isWalletInstalled() {
        return typeof window.yours !== 'undefined' ||
               typeof window.panda !== 'undefined' ||
               (typeof window.bsv !== 'undefined' && window.bsv.isProvider);
    }

    /**
     * Get wallet installation URL
     * @returns {string}
     */
    getInstallURL() {
        return 'https://chromewebstore.google.com/detail/yours-wallet/mlbnicldlpdimbjdcncnklfempedeipj';
    }

    /**
     * Convert USD to satoshis (approximate)
     * @param {number} usd Amount in USD
     * @param {number} bsvPrice Current BSV price in USD (optional)
     * @returns {number} Amount in satoshis
     */
    usdToSatoshis(usd, bsvPrice = 50) {
        const bsvAmount = usd / bsvPrice;
        const satoshis = Math.round(bsvAmount * 100000000);
        return satoshis;
    }

    /**
     * Convert satoshis to USD (approximate)
     * @param {number} satoshis Amount in satoshis
     * @param {number} bsvPrice Current BSV price in USD (optional)
     * @returns {number} Amount in USD
     */
    satoshisToUSD(satoshis, bsvPrice = 50) {
        const bsvAmount = satoshis / 100000000;
        return bsvAmount * bsvPrice;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BSVWallet;
} else {
    window.BSVWallet = BSVWallet;
}
