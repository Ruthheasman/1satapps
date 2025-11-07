# Favicon Generator - MicroSaaS App

## Overview
A lightweight favicon generator that converts logos into all required favicon sizes. Powered by Bitcoin SV with BRC100-compliant wallet integration.

**Price:** ~1,000,000 satoshis ($0.50 USD at $50/BSV)
**Payment:** BSV via BRC100-compliant wallets (Yours Wallet, Panda Wallet)
**Market:** Web designers, agencies, startups
**Value:** Saves 15 minutes of manual work

## Features
- **BSV Payment Integration**: Seamless payment via BRC100-compliant wallets
- **Wallet Detection**: Automatic detection of Yours Wallet, Panda Wallet, and other BRC100 wallets
- Upload any image format (PNG, JPG, SVG)
- Generates 6 favicon sizes: 16×16, 32×32, 64×64, 128×128, 256×256, 512×512
- Creates manifest.json for PWA support
- Downloads everything as a ZIP file
- Clean, responsive UI
- Uses Canvas API for high-quality resizing
- Transaction verification with blockchain confirmation

## File Size
- **Single HTML file:** ~9KB (uncompressed)
- Uses JSZip CDN for ZIP generation (no local dependencies)

## How It Works
1. User connects their BRC100-compliant wallet (Yours Wallet or Panda Wallet)
2. User uploads their logo
3. User clicks "Pay & Generate Favicons"
4. BSV payment is processed (~1,000,000 satoshis)
5. Canvas API resizes to all required dimensions
6. Generates optimized PNG files
7. Creates manifest.json with proper icon definitions
8. Packages everything into a downloadable ZIP

## Usage

### Prerequisites
- Install a BRC100-compliant wallet:
  - [Yours Wallet](https://chromewebstore.google.com/detail/yours-wallet/mlbnicldlpdimbjdcncnklfempedeipj) (Chrome Extension)
  - [Panda Wallet](https://pandawallet.pro)
- Fund your wallet with BSV

### Steps
1. Open `index.html` in any modern web browser
2. Click "Connect Wallet" and authorize the connection
3. Upload your logo image
4. Click "Pay & Generate Favicons"
5. Approve the payment in your wallet
6. Download the generated ZIP file

No build process or server required!

## Payment Integration

This app uses the shared `bsv-wallet.js` library for BSV payment processing:

```javascript
// Initialize wallet
const wallet = new BSVWallet();
await wallet.connect();

// Process payment
const paymentResult = await wallet.sendPayment({
    to: PAYMENT_ADDRESS,
    amount: 1000000, // satoshis
    description: 'Favicon Generator - 6 sizes + manifest.json'
});
```

### Configuration

Update these values in `index.html`:
```javascript
const PAYMENT_ADDRESS = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // Your BSV address
const PRICE_USD = 0.50;
const BSV_PRICE_USD = 50; // Current BSV price in USD
```

## Tech Stack
- **Blockchain**: Bitcoin SV (BSV)
- **Wallet Standard**: BRC100
- **Payment Library**: Custom BSVWallet class (../shared/bsv-wallet.js)
- Vanilla JavaScript
- HTML5 Canvas API
- JSZip (via CDN)
- Pure CSS (no frameworks)

## Browser Support
Works in all modern browsers that support:
- Canvas API
- File API
- Blob API
- Promises
- BRC100-compliant wallet extension (Yours Wallet or Panda Wallet)

### Recommended Browsers
- Chrome/Chromium (with Yours Wallet extension)
- Brave (with Yours Wallet extension)
- Edge (with Yours Wallet extension)

## Security Notes
- All payments are processed through your BRC100-compliant wallet
- The app never has access to your private keys
- Transactions are signed within your wallet extension
- All processing happens client-side (no data sent to servers)

## License
MIT License - See LICENSE file for details
