require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const { connectDB } = require('./utils/database');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { sanitizeInput } = require('./middleware/validator');

// Import routes
const qrRoutes = require('./routes/qr.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Create Express app
const app = express();

// Connect to database
connectDB();

// ==================== Middleware ====================

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "blob:"]
        }
    }
}));

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

// Custom sanitization
app.use(sanitizeInput);

// Compression
app.use(compression());

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Serve static files (frontend)
app.use(express.static(path.join(__dirname)));

// ==================== API Routes ====================

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// API routes
app.use('/api/qr', qrRoutes);
app.use('/api/analytics', analyticsRoutes);

// ==================== Frontend Routes ====================

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res) => {
    if (!req.url.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// ==================== Error Handling ====================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ==================== Server ====================

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║                                                ║
║   🎯 QR Code Generator Server                 ║
║                                                ║
║   ✅ Server running on port ${PORT}              ║
║   🌐 Environment: ${process.env.NODE_ENV || 'development'}                 ║
║   📡 API: http://localhost:${PORT}/api          ║
║   🖥️  Frontend: http://localhost:${PORT}         ║
║                                                ║
╚════════════════════════════════════════════════╝
    `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('💥 Process terminated!');
    });
});

module.exports = app;
