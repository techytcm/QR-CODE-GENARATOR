const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controller');
const { validate, qrGenerateSchema } = require('../middleware/validator');
const { qrGenerationLimiter } = require('../middleware/rateLimiter');

/**
 * QR Code Routes
 */

// Generate new QR code
router.post(
    '/generate',
    qrGenerationLimiter,
    validate(qrGenerateSchema),
    qrController.generateQR
);

// Get QR code history
router.get('/history', qrController.getHistory);

// Get popular QR codes
router.get('/popular', qrController.getPopularQRCodes);

// Get specific QR code
router.get('/:id', qrController.getQRCode);

// Get QR code statistics
router.get('/:id/stats', qrController.getQRStats);

// Delete QR code
router.delete('/:id', qrController.deleteQRCode);

module.exports = router;
