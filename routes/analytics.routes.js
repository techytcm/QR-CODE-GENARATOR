const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { validate, analyticsTrackSchema } = require('../middleware/validator');
const { analyticsLimiter } = require('../middleware/rateLimiter');

/**
 * Analytics Routes
 */

// Track an event
router.post(
    '/track',
    analyticsLimiter,
    validate(analyticsTrackSchema),
    analyticsController.trackEvent
);

// Get overall statistics
router.get('/stats', analyticsController.getStats);

// Get statistics for a specific QR code
router.get('/qr/:id', analyticsController.getQRCodeStats);

module.exports = router;
