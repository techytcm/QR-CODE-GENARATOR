# 🎯 QR Code Generator - Production Grade

A beautiful, full-stack QR code generator with a modern purple-themed UI and robust backend API.

![QR Code Generator](https://img.shields.io/badge/version-2.0.0-purple)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### Frontend
- 🎨 **Modern UI** - Beautiful purple-themed design with glassmorphism effects
- 🎭 **3D Animations** - Interactive tilt effects and smooth transitions
- 📱 **Responsive** - Works perfectly on all devices
- ⚡ **Offline Support** - Falls back to client-side generation when backend is unavailable
- 🎨 **Customization** - Multiple sizes and color themes
- 💾 **Download & Copy** - Save as PNG or copy to clipboard
- ⌨️ **Keyboard Shortcuts** - Power user features (Ctrl+K, Ctrl+D, Ctrl+C)

### Backend API
- 🚀 **RESTful API** - Complete CRUD operations for QR codes
- 📊 **Analytics** - Track generations, scans, downloads, and copies
- 🔒 **Security** - Rate limiting, input validation, CORS, helmet
- 💾 **Database** - MongoDB storage with TTL for auto-cleanup
- 📈 **Statistics** - Detailed usage analytics and popular QR codes
- 🔗 **URL Shortening** - Optional short URL generation (configurable)
- 🎯 **Privacy** - IP hashing for anonymous tracking

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- npm >= 9.0.0

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd "QR CODE GENARATOR"
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and configure your settings:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/qr-generator
ENABLE_ANALYTICS=true
```

4. **Start the server**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

5. **Open your browser**
```
http://localhost:3000
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### QR Code Generation
**POST** `/api/qr/generate`

Generate a new QR code.

**Request Body:**
```json
{
  "text": "https://example.com",
  "size": 300,
  "color": "#7C3AED",
  "backgroundColor": "#FFFFFF",
  "format": "png",
  "errorCorrectionLevel": "H",
  "expirationDays": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "imageData": "data:image/png;base64,...",
    "shortUrl": "http://localhost:3000/s/abc123",
    "size": 300,
    "color": "#7C3AED",
    "format": "png",
    "createdAt": "2025-12-14T...",
    "expiresAt": "2026-01-13T..."
  }
}
```

#### Get QR Code
**GET** `/api/qr/:id`

Retrieve a specific QR code by ID.

#### Get History
**GET** `/api/qr/history?limit=20&page=1`

Get recent QR codes (paginated).

#### Get Popular QR Codes
**GET** `/api/qr/popular?limit=10`

Get the most scanned QR codes.

#### Get QR Stats
**GET** `/api/qr/:id/stats`

Get statistics for a specific QR code.

#### Delete QR Code
**DELETE** `/api/qr/:id`

Delete a QR code and its analytics.

#### Track Analytics
**POST** `/api/analytics/track`

Track an event (scan, download, copy).

**Request Body:**
```json
{
  "qrCodeId": "...",
  "eventType": "scan",
  "referrer": "https://example.com"
}
```

#### Get Overall Statistics
**GET** `/api/analytics/stats?days=30`

Get overall analytics for the specified period.

## 🛠️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` (15min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `QR_GENERATION_LIMIT` | Max QR generations per hour | `50` |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |
| `ENABLE_ANALYTICS` | Enable analytics tracking | `true` |
| `ENABLE_URL_SHORTENING` | Enable URL shortening | `false` |
| `SHORT_URL_DOMAIN` | Short URL domain | `http://localhost:3000/s/` |
| `QR_EXPIRATION_DAYS` | Auto-delete QR codes after X days | `null` (disabled) |

### Rate Limiting

- **General API**: 100 requests per 15 minutes
- **QR Generation**: 50 requests per hour
- **Analytics**: 200 requests per 15 minutes

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t qr-generator .

# Run container
docker run -p 3000:3000 --env-file .env qr-generator
```

## 📁 Project Structure

```
QR CODE GENARATOR/
├── controllers/          # Request handlers
│   ├── qr.controller.js
│   └── analytics.controller.js
├── models/              # Database schemas
│   ├── QRCode.model.js
│   └── Analytics.model.js
├── routes/              # API routes
│   ├── qr.routes.js
│   └── analytics.routes.js
├── middleware/          # Express middleware
│   ├── rateLimiter.js
│   ├── validator.js
│   └── errorHandler.js
├── utils/               # Utility functions
│   ├── database.js
│   └── qrGenerator.js
├── index.html           # Frontend HTML
├── style.css            # Frontend styles
├── script.js            # Frontend JavaScript
├── server.js            # Express server
├── package.json         # Dependencies
└── .env                 # Environment config
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run integration tests
npm run test:integration

# Watch mode
npm run test:watch
```

## 🎨 Customization

### Frontend Themes

Edit `style.css` to customize colors:

```css
:root {
    --primary-purple: #8B5CF6;
    --secondary-purple: #7C3AED;
    /* ... */
}
```

### Backend Options

Modify `server.js` or create custom middleware in `/middleware`.

## 📊 Database Schema

### QRCode Collection
- `text`: Original URL/text
- `size`: QR code dimensions
- `color`: Foreground color
- `imageData`: Base64 encoded image
- `scanCount`: Number of scans
- `shortId`: Shortened URL identifier
- `expiresAt`: Auto-delete timestamp
- `createdAt`, `updatedAt`: Timestamps

### Analytics Collection
- `qrCodeId`: Reference to QR code
- `eventType`: Type of event (scan/download/copy)
- `userAgent`: Browser/device info
- `device`: Parsed device information
- `createdAt`: Event timestamp

## 🔧 Troubleshooting

### Backend not connecting
1. Check MongoDB is running: `mongod --version`
2. Verify `.env` has correct `MONGODB_URI`
3. Check firewall settings

### Frontend shows offline mode
1. Ensure server is running on correct port
2. Check console for backend health errors
3. Verify CORS settings in `.env`

### Rate limiting issues
1. Adjust limits in `.env`
2. Clear rate limit cache (restart server)
3. Use different IP for testing

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 👨‍💻 Author

**techytcm**

Made with ♥ using modern web technologies

---

## 🚀 Future Enhancements

- [ ] User authentication and accounts
- [ ] QR code templates and logos
- [ ] Batch QR code generation
- [ ] API key authentication
- [ ] Export analytics as CSV/PDF
- [ ] Custom domains for short URLs
- [ ] QR code design customization (patterns, shapes)
- [ ] WebSocket for real-time scan tracking

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.
