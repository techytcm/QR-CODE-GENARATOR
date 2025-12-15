const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Too many requests',
            message: 'You have exceeded the rate limit. Please try again later.',
            retryAfter: req.rateLimit.resetTime
        });
    }
});

/**
 * Stricter rate limiter for QR code generation
 * 50 requests per hour
 */
const qrGenerationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: parseInt(process.env.QR_GENERATION_LIMIT) || 50,
    message: {
        error: 'Too many QR codes generated from this IP',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use IP address as the key
        return req.ip || req.connection.remoteAddress;
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'QR generation limit exceeded',
            message: 'You have generated too many QR codes. Please try again in an hour.',
            retryAfter: req.rateLimit.resetTime,
            limit: req.rateLimit.limit,
            remaining: req.rateLimit.remaining
        });
    }
});

/**
 * Lenient rate limiter for analytics tracking
 * 200 requests per 15 minutes
 */
const analyticsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Analytics tracking limit exceeded',
            message: 'Too many analytics requests. Please try again later.'
        });
    }
});

module.exports = {
    apiLimiter,
    qrGenerationLimiter,
    analyticsLimiter
};
