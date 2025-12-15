const crypto = require('crypto');
const Analytics = require('../models/Analytics.model');
const QRCodeModel = require('../models/QRCode.model');
const { catchAsync, AppError } = require('../middleware/errorHandler');

/**
 * Track an analytics event
 * POST /api/analytics/track
 */
exports.trackEvent = catchAsync(async (req, res, next) => {
    const { qrCodeId, eventType, referrer } = req.body;

    // Verify QR code exists
    const qrCode = await QRCodeModel.findById(qrCodeId);
    if (!qrCode) {
        return next(new AppError('QR code not found', 404));
    }

    // Update QR code scan count if this is a scan event
    if (eventType === 'scan') {
        await qrCode.incrementScan();
    }

    // Hash IP for privacy
    const ipHash = crypto
        .createHash('sha256')
        .update(req.ip || req.connection.remoteAddress || 'unknown')
        .digest('hex');

    // Parse user agent for device info (basic parsing)
    const userAgent = req.get('user-agent') || '';
    const device = {
        type: getDeviceType(userAgent),
        os: getOS(userAgent),
        browser: getBrowser(userAgent)
    };

    // Create analytics record
    await Analytics.create({
        qrCodeId,
        eventType,
        userAgent,
        ipHash,
        referrer: referrer || req.get('referrer'),
        device
    });

    res.status(201).json({
        success: true,
        message: 'Event tracked successfully'
    });
});

/**
 * Get overall statistics
 * GET /api/analytics/stats
 */
exports.getStats = catchAsync(async (req, res, next) => {
    const { days = 30 } = req.query;

    // Get overall statistics
    const stats = await Analytics.getStatistics(null, parseInt(days));

    // Get daily breakdown
    const dailyStats = await Analytics.getDailyStats(parseInt(days));

    // Get total QR codes generated
    const totalQRCodes = await QRCodeModel.countDocuments();

    // Get most popular QR codes
    const popularQRCodes = await QRCodeModel.findPopular(5);

    res.status(200).json({
        success: true,
        data: {
            period: `${days} days`,
            totalQRCodes,
            eventStats: stats,
            dailyBreakdown: dailyStats,
            popularQRCodes
        }
    });
});

/**
 * Get statistics for a specific QR code
 * GET /api/analytics/qr/:id
 */
exports.getQRCodeStats = catchAsync(async (req, res, next) => {
    const { days = 30 } = req.query;
    const qrCodeId = req.params.id;

    // Verify QR code exists
    const qrCode = await QRCodeModel.findById(qrCodeId);
    if (!qrCode) {
        return next(new AppError('QR code not found', 404));
    }

    // Get statistics for this specific QR code
    const stats = await Analytics.getStatistics(qrCodeId, parseInt(days));

    res.status(200).json({
        success: true,
        data: {
            qrCodeId,
            period: `${days} days`,
            scanCount: qrCode.scanCount,
            lastScanned: qrCode.lastScanned,
            eventStats: stats
        }
    });
});

// Helper functions for user agent parsing

function getDeviceType(userAgent) {
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet|ipad/i.test(userAgent)) return 'tablet';
    if (/desktop/i.test(userAgent)) return 'desktop';
    return 'unknown';
}

function getOS(userAgent) {
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/macintosh|mac os x/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/ios|iphone|ipad/i.test(userAgent)) return 'iOS';
    return 'Unknown';
}

function getBrowser(userAgent) {
    if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) return 'Chrome';
    if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/edg/i.test(userAgent)) return 'Edge';
    if (/opera|opr/i.test(userAgent)) return 'Opera';
    return 'Unknown';
}

module.exports = exports;
