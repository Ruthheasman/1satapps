# 1Sat Apps - Onchain Deployment Interface

A web interface for uploading and deploying microsaas applications to the BSV blockchain using [react-onchain](https://github.com/danwag06/react-onchain).

## Features

- Upload built web applications as ZIP files
- Deploy apps permanently to the BSV blockchain
- Feeless hosting with no recurring costs
- Simple, user-friendly interface
- Real-time deployment status tracking
- Secure payment key handling (never stored on server)

## How It Works

1. **Build your app**: Use any framework (React, Vue, Next.js, etc.) and build your application
2. **Create a ZIP file**: Compress your build directory (dist, build, out) into a ZIP file
3. **Upload**: Use the web interface to upload your ZIP file
4. **Provide payment key**: Enter your BSV payment key in WIF format
5. **Deploy**: Your app is deployed to the blockchain permanently
6. **Access**: Get an onchain URL to access your app forever

## Installation

### Prerequisites

- Node.js 18+ installed
- A BSV wallet with a payment key in WIF format
- Some BSV satoshis for deployment (typically costs less than a penny)

### Setup

1. Install dependencies:

```bash
cd web-interface
npm install
```

2. Install server dependencies:

```bash
cd ../server
npm install
cd ../web-interface
```

3. Start the application:

```bash
npm start
```

This will start both the frontend (Vite dev server on port 5173) and the backend API server (on port 3001).

Alternatively, run them separately:

```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server
```

## Usage

1. Open your browser to `http://localhost:5173`
2. Click "Choose File" and select your app's ZIP file
3. Enter your BSV payment key (WIF format)
4. Optionally set an app version
5. Click "Deploy to Blockchain"
6. Wait for the deployment to complete
7. Access your app via the provided onchain URL

## Building Your App for Deployment

### React/Vite

```bash
npm run build
# This creates a 'dist' directory
zip -r my-app.zip dist/
```

### Create React App

```bash
npm run build
# This creates a 'build' directory
zip -r my-app.zip build/
```

### Next.js

```bash
npm run build
npm run export  # or 'next export'
# This creates an 'out' directory
zip -r my-app.zip out/
```

## Project Structure

```
web-interface/
├── src/
│   ├── App.tsx         # Main React component
│   ├── App.css         # Styles
│   └── main.tsx        # Entry point
├── package.json
└── README.md

server/
├── index.js           # Express server
├── package.json
└── uploads/          # Temporary upload directory (auto-created)
```

## API Endpoints

### POST /api/deploy

Upload and deploy an app to the blockchain.

**Request:**
- Form data with fields:
  - `app`: ZIP file containing the built app
  - `paymentKey`: BSV payment key in WIF format
  - `version`: App version (optional, defaults to "1.0.0")

**Response:**
```json
{
  "success": true,
  "message": "Deployment successful",
  "deploymentUrl": "https://app.reactonchain.com/content/<txid>_<vout>",
  "txid": "<txid>_<vout>"
}
```

### GET /api/health

Check server health status.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Benefits of Onchain Deployment

- **Permanent Hosting**: Your app lives on the blockchain forever
- **No Recurring Costs**: Pay once for deployment, no monthly fees
- **No Downtime**: Blockchain ensures 24/7 availability
- **Censorship Resistant**: Decentralized hosting cannot be taken down
- **Low Cost**: Deployments typically cost less than a penny
- **Version Control**: Deploy multiple versions, all accessible onchain

## Security Notes

- Your payment key is used only for transaction signing
- The payment key is never stored on the server
- The payment key is sent over HTTPS (in production)
- All temporary files are deleted after deployment
- Use a dedicated deployment key with minimal funds

## Troubleshooting

### Deployment fails with "Payment key is required"
Make sure you've entered a valid BSV payment key in WIF format.

### ZIP file upload fails
Ensure your ZIP file is under 100MB. Larger apps may need to be optimized before deployment.

### Build directory not found
Make sure your ZIP file contains a standard build directory (dist, build, or out) or the built files at the root level.

### Server connection error
Ensure the backend server is running on port 3001:
```bash
npm run server
```

## Contributing

This is part of the 1Sat Apps platform for hosting microsaas applications onchain.

## License

See the LICENSE file in the root directory.

## Powered By

- [react-onchain](https://github.com/danwag06/react-onchain) - Deploy React apps to BSV blockchain
- [BSV Blockchain](https://bitcoinsv.io/) - Massively scalable blockchain
- [1Sat Ordinals](https://docs.1satordinals.com/) - Bitcoin ordinal inscriptions on BSV
