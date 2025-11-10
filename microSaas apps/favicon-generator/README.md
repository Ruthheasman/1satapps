# Favicon Generator - MicroSaaS App

## Overview
A lightweight favicon generator that converts logos into all required favicon sizes.

**Price:** $0.50 per generation
**Market:** Web designers, agencies, startups
**Value:** Saves 15 minutes of manual work

## Features
- Upload any image format (PNG, JPG, SVG)
- Generates 6 favicon sizes: 16×16, 32×32, 64×64, 128×128, 256×256, 512×512
- Creates manifest.json for PWA support
- Downloads everything as a ZIP file
- Clean, responsive UI
- Uses Canvas API for high-quality resizing

## File Size
- **Single HTML file:** ~9KB (uncompressed)
- Uses JSZip CDN for ZIP generation (no local dependencies)

## How It Works
1. User uploads their logo
2. Canvas API resizes to all required dimensions
3. Generates optimized PNG files
4. Creates manifest.json with proper icon definitions
5. Packages everything into a downloadable ZIP

## Usage
Simply open `index.html` in any modern web browser. No build process or server required!

## Payment Integration
To add payment processing:
1. Integrate Stripe Checkout before the `generateBtn` click handler
2. Add environment variables for Stripe API keys
3. Process payment before generating favicons
4. Consider adding user authentication for purchase history

## Tech Stack
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

## License
Proprietary - MicroSaaS App
