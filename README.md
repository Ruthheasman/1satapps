# 1satapps

A 1Sat app platform for hosting BSV-powered micro-SAAS apps with BRC100-compliant wallet integration.

## Overview

This platform hosts lightweight, self-contained microSaaS applications that accept Bitcoin SV (BSV) payments through BRC100-compliant wallets like Yours Wallet and Panda Wallet. Each app is designed to be fast, efficient, and provide instant value to users.

## Features

- **BRC100 Wallet Integration**: Seamless payment processing with BRC100-compliant wallets
- **Client-Side Processing**: No server required, all processing happens in the browser
- **Instant Payments**: Direct BSV micropayments with minimal fees
- **Self-Contained Apps**: Each app is a single HTML file with embedded CSS and JavaScript
- **Modern UI**: Clean, responsive designs that work on all devices

## Apps

### 1. Favicon Generator
Convert any logo into all required favicon sizes with a single click. Generates 6 sizes (16×16 to 512×512) plus manifest.json for PWA support.

**Price**: ~1,000,000 satoshis ($0.50 USD at $50/BSV)

## BSV Wallet Integration

All apps use the shared `bsv-wallet.js` library for payment processing:

- Automatic wallet detection (Yours Wallet, Panda Wallet)
- Simple connect and pay flow
- Support for multiple BRC100-compliant wallets
- Transaction verification and error handling

### Supported Wallets

- [Yours Wallet](https://chromewebstore.google.com/detail/yours-wallet/mlbnicldlpdimbjdcncnklfempedeipj)
- [Panda Wallet](https://pandawallet.pro)
- Any BRC100-compliant BSV wallet

## Getting Started

### For Users

1. Install a BRC100-compliant wallet (Yours Wallet or Panda Wallet)
2. Fund your wallet with BSV
3. Open any app in this repository
4. Connect your wallet
5. Make a payment and use the service

### For Developers

Each app includes:
- `/microSaas apps/[app-name]/index.html` - Self-contained application
- `/microSaas apps/shared/bsv-wallet.js` - Shared wallet integration library

To add BSV payments to your own app:

```javascript
// Include the BSV wallet library
<script src="../shared/bsv-wallet.js"></script>

// Initialize wallet
const wallet = new BSVWallet();
await wallet.connect();

// Send payment
const result = await wallet.sendPayment({
    to: 'your-bsv-address',
    amount: 1000000, // satoshis
    description: 'Service description'
});
```

## Technology Stack

- **Blockchain**: Bitcoin SV (BSV)
- **Wallet Standard**: BRC100
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Payment Processing**: Client-side via wallet provider API

## License

MIT License - See LICENSE file for details
