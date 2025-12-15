# 🎯 QR Code Generator - Production Grade

[![Version](https://img.shields.io/badge/version-2.0.0-purple?style=for-the-badge&logo=git)](https://github.com/techytcm)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge&logo=open-source-initiative)](LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/techytcm/QR-CODE-GENARATOR/graphs/commit-activity)

A beautiful, full-stack QR code generator featuring a modern purple-themed UI, robust backend API, and 3D interactive elements. This project demonstrates a production-ready application with comprehensive features including analytics, rate limiting, and Docker support.

![Project Preview](https://via.placeholder.com/800x400?text=QR+Code+Generator+Preview)

---

## 📋 Table of Contents

- [Features](#-features)
  - [Frontend Highlights](#frontend-highlights)
  - [Backend Power](#backend-power)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
- [Usage](#-usage)
  - [Development](#development)
  - [Production](#production)
  - [Docker](#-docker-deployment)
  - [Python Script](#-standalone-python-script)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## ✨ Features

### Frontend Highlights
- 🎨 **Modern UI Design**: Sleek purple-themed interface with glassmorphism and smooth transitions.
- 🎭 **Interactive 3D Elements**: Tilt effects and floating shapes powered by CSS and JavaScript.
- 📱 **Fully Responsive**: Optimized experience across desktop, tablet, and mobile devices.
- ⚡ **Smart Fallback**: Automatically switches to client-side generation if the backend is unreachable.
- 🛠️ **Customization Options**: Adjustable sizes (200px - 500px) and curated color themes.
- 💾 **Easy Export**: Download generated QR codes as PNG or copy directly to the clipboard.
- ⌨️ **Keyboard Shortcuts**: Productivity boosters like `Ctrl+K` (Focus), `Ctrl+D` (Download), and `Ctrl+C` (Copy).

### Backend Power
- 🚀 **RESTful API**: Full CRUD capabilities for QR code management.
- 📊 **Advanced Analytics**: Track scans, downloads, and copies with device and referrer data.
- 🔒 **Enterprise Security**: Implemented rate limiting, input validation (Joi), CORS, and Helmet headers.
- 💾 **MongoDB Storage**: Persistent storage with automatic TTL (Time-To-Live) cleanup for old records.
- 🔗 **URL Shortening**: Built-in URL shortener service (configurable).
- 📈 **Statistics Dashboard**: Endpoints for popular QR codes and detailed usage stats.

---

## 🛠 Tech Stack

**Frontend:**
- ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=flat-square&logo=html5&logoColor=white) HTML5
- ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=flat-square&logo=css3&logoColor=white) CSS3 (Animations, Grid/Flexbox)
- ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=flat-square&logo=javascript&logoColor=%23F7DF1E) Vanilla JavaScript

**Backend:**
- ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=flat-square&logo=node.js&logoColor=white) Node.js
- ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=flat-square&logo=express&logoColor=%2361DAFB) Express.js
- ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=flat-square&logo=mongodb&logoColor=white) MongoDB with Mongoose

**DevOps & Tools:**
- ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat-square&logo=docker&logoColor=white) Docker & Docker Compose
- ![Python](https://img.shields.io/badge/python-3670A0?style=flat-square&logo=python&logoColor=ffdd54) Python (Utility Script)

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have the following installed:
*   **Node.js** (v18.0.0 or higher)
*   **npm** (v9.0.0 or higher)
*   **MongoDB** (Local instance or Atlas URI)
*   **Python 3.x** (Optional, for the standalone script)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/techytcm/QR-CODE-GENARATOR.git
    cd "QR CODE GENARATOR"
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

### Environment Setup

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

**Configuration Options:**

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | API Server port | `3000` |
| `NODE_ENV` | Ecosystem mode | `development` |
| `MONGODB_URI` | Database connection string | `mongodb://localhost:27017/qr-generator` |
| `RATE_LIMIT_Window_MS` | Rate limit duration | `900000` (15m) |
| `ENABLE_ANALYTICS` | Toggle analytics tracking | `true` |

---

## 💻 Usage

### Development
Start the server with hot-reloading enabled:
```bash
npm run dev
```
Visit `http://localhost:3000` in your browser.

### Production
Build and start the optimized server:
```bash
npm start
```

### 🐳 Docker Deployment

Run the entire stack (App + MongoDB) using Docker Compose:

```bash
# Start services in background
docker-compose up -d

# View logs
docker-compose logs -f app
```

### 🐍 Standalone Python Script

A simple Python script is included for quick local generation.

1.  Ensure you have the `qrcode` library:
    ```bash
    pip install qrcode[pil]
    ```
2.  Run the script:
    ```bash
    python qr.py
    ```
3.  Enter the URL when prompted. The QR code will be saved to your Downloads folder (default path configured in script).

---

## 📚 API Documentation

The API runs at `http://localhost:3000/api`.

### Core Endpoints

#### `POST /qr/generate`
Generate a new QR code.
```json
// Request
{
  "text": "https://example.com",
  "size": 300,
  "color": "#7C3AED",
  "format": "png",
  "errorCorrectionLevel": "H"
}
```

#### `GET /qr/history`
Retrieve recently generated QR codes.
- **Query Params**: `limit` (default 20), `page` (default 1)

#### `GET /qr/popular`
Get the top most scanned/downloaded QR codes.

#### `POST /analytics/track`
Track user interactions.
```json
// Request
{
  "qrCodeId": "unique_id_here",
  "eventType": "scan" // scan, download, copy
}
```

---

## 📁 Project Structure

```bash
QR CODE GENARATOR/
├── controllers/       # Logic for requests (QR, Analytics)
├── middleware/        # Rate limiters, validators, error handling
├── models/            # Mongoose schemas (QRCode, Analytics)
├── routes/            # API route definitions
├── utils/             # Helpers (DB connection, QR generation)
├── index.html         # Main frontend entry point
├── script.js          # Frontend logic & interactivity
├── style.css          # Global styles & themes
├── animations.css     # 3D animations & keyframes
├── server.js          # App entry point
└── qr.py              # Auxiliary Python script
```

---

## 🗺 Roadmap

- [ ] User Authentication system
- [ ] Custom Logo embedding in QR codes
- [ ] Batch generation tool
- [ ] Export Analytics reports (CSV/PDF)
- [ ] WebSocket integration for real-time scan notifications

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Contact

**techytcm**

Project Link: [https://github.com/techytcm/QR-CODE-GENARATOR](https://github.com/techytcm/QR-CODE-GENARATOR)

---
<p align="center">Made with ♥ using modern web technologies</p>
