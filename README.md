# 1Sat Apps Platform

A platform for hosting microsaas applications onchain using the BSV blockchain. Deploy your web applications permanently with no recurring hosting costs.

## Overview

1Sat Apps provides a web interface that integrates [react-onchain](https://github.com/danwag06/react-onchain) to enable developers to upload and deploy their microsaas applications directly to the BSV blockchain. Once deployed, apps are hosted permanently onchain with feeless access.

## Features

- **Permanent Onchain Hosting**: Deploy apps to the blockchain for permanent, feeless hosting
- **Web Upload Interface**: User-friendly interface for uploading and deploying apps
- **Framework Agnostic**: Support for React, Vue, Next.js, and other web frameworks
- **Low Cost Deployment**: Deployments typically cost less than a penny
- **No Recurring Fees**: Pay once for deployment, access forever
- **Version Control**: Deploy multiple versions, all accessible onchain
- **Decentralized**: Censorship-resistant hosting on the BSV blockchain

## Quick Start

### Prerequisites

- Node.js 18+ installed
- A BSV wallet with a payment key in WIF format
- Some BSV satoshis for deployment (costs less than a penny per deployment)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Ruthheasman/1satapps.git
cd 1satapps
```

2. Install web interface dependencies:

```bash
cd web-interface
npm install
```

3. Install server dependencies:

```bash
cd ../server
npm install
```

### Running the Application

From the `web-interface` directory:

```bash
npm start
```

This will start:
- Frontend interface on `http://localhost:5173`
- Backend API server on `http://localhost:3001`

## Usage

1. Build your web application using your preferred framework
2. Create a ZIP file of your build directory (dist, build, or out)
3. Open the web interface at `http://localhost:5173`
4. Upload your ZIP file
5. Enter your BSV payment key (WIF format)
6. Click "Deploy to Blockchain"
7. Access your app via the provided onchain URL

## Project Structure

```
1satapps/
├── web-interface/          # React frontend for uploading and deploying apps
│   ├── src/
│   │   ├── App.tsx        # Main application component
│   │   ├── App.css        # Styles
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   └── README.md          # Detailed web interface documentation
│
├── server/                 # Backend API for handling deployments
│   ├── index.js           # Express server with deployment logic
│   ├── package.json
│   └── uploads/           # Temporary upload directory (auto-created)
│
├── LICENSE
└── README.md              # This file
```

## How It Works

1. **Upload**: User uploads a ZIP file containing their built web app
2. **Extract**: Server extracts the ZIP file and locates the build directory
3. **Deploy**: Server uses react-onchain to deploy the app to the BSV blockchain
4. **Access**: User receives an onchain URL where the app is permanently hosted

The deployment process uses 1Sat Ordinals to inscribe all app files (HTML, CSS, JavaScript, images) as immutable ordinal inscriptions on the BSV blockchain. All file references are rewritten to use ordinal content URLs, and smart caching ensures that unchanged files from previous deployments are reused to minimize costs.

## Benefits

- **No Server Maintenance**: Once deployed, no servers to maintain or monitor
- **Zero Downtime**: Blockchain ensures 24/7 availability
- **Cost Effective**: One-time deployment cost, typically less than a penny
- **Censorship Resistant**: Decentralized hosting cannot be taken down
- **Permanent**: Your app lives on the blockchain forever
- **Version History**: All deployments are versioned and accessible

## API Documentation

### POST /api/deploy

Deploy an app to the blockchain.

**Parameters:**
- `app` (file): ZIP file containing the built app
- `paymentKey` (string): BSV payment key in WIF format
- `version` (string, optional): App version (default: "1.0.0")

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

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## Security

- Payment keys are used only for transaction signing
- Payment keys are never stored on the server
- All temporary files are deleted after deployment
- Use HTTPS in production to encrypt payment key transmission
- Recommended: Use a dedicated deployment key with minimal funds

## Supported Frameworks

The platform supports any web framework that produces static build output:

- React (Vite, Create React App)
- Vue.js
- Next.js (with static export)
- Svelte
- Angular
- Plain HTML/CSS/JS

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

See the [LICENSE](LICENSE) file for details.

## Powered By

- [react-onchain](https://github.com/danwag06/react-onchain) - CLI tool for deploying apps to BSV blockchain
- [BSV Blockchain](https://bitcoinsv.io/) - Massively scalable blockchain
- [1Sat Ordinals](https://docs.1satordinals.com/) - Bitcoin ordinal inscriptions on BSV

## Learn More

- [Web Interface Documentation](web-interface/README.md)
- [react-onchain GitHub](https://github.com/danwag06/react-onchain)
- [BSV Documentation](https://bitcoinsv.io/)
- [1Sat Ordinals Docs](https://docs.1satordinals.com/)

## Support

For issues, questions, or contributions, please open an issue on GitHub.
