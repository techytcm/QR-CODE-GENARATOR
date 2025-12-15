const crypto = require('crypto');
const shortid = require('shortid');
const QRCodeModel = require('../models/QRCode.model');
const Analytics = require('../models/Analytics.model');
const { generateQRCode, validateQRText, getRecommendedErrorCorrection } = require('../utils/qrGenerator');
const { catchAsync, AppError } = require('../middleware/errorHandler');

/**
 * Generate a new QR code
 * POST /api/qr/generate
 */
exports.generateQR = catchAsync(async (req, res, next) => {
    const {
        text,
        size = 300,
        color = '#000000',
        backgroundColor = '#ffffff',
        format = 'png',
        errorCorrectionLevel,
        expirationDays
    } = req.body;

    // Validate text
    const validation = validateQRText(text);
    if (!validation.isValid) {
        return next(new AppError(validation.errors.join(', '), 400));
    }

    // Auto-detect error correction level if not provided
    const ecLevel = errorCorrectionLevel || getRecommendedErrorCorrection(text);

    // Generate QR code
    const imageData = await generateQRCode(text, {
        size,
        color,
        backgroundColor,
        format,
        errorCorrectionLevel: ecLevel
    });

    // Hash IP for privacy
    const ipHash = crypto
        .createHash('sha256')
        .update(req.ip || req.connection.remoteAddress || 'unknown')
        .digest('hex');

    // Generate short ID if URL shortening is enabled
    const shortId = process.env.ENABLE_URL_SHORTENING === 'true' ? shortid.generate() : undefined;

    // Calculate expiration date if specified
    let expiresAt = null;
    if (expirationDays) {
        expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);
    }

    // Save to database
    const qrCode = await QRCodeModel.create({
        text,
        size,
        color,
        format,
        errorCorrectionLevel: ecLevel,
        imageData,
        shortId,
        ipHash,
        userAgent: req.get('user-agent'),
        expiresAt
    });

    // Track analytics
    if (process.env.ENABLE_ANALYTICS === 'true') {
        await Analytics.create({
            qrCodeId: qrCode._id,
            eventType: 'generate',
            userAgent: req.get('user-agent'),
            ipHash,
            referrer: req.get('referrer')
        });
    }

    res.status(201).json({
        success: true,
        data: {
            id: qrCode._id,
            imageData: qrCode.imageData,
            shortUrl: qrCode.shortUrl,
            size: qrCode.size,
            color: qrCode.color,
            format: qrCode.format,
            errorCorrectionLevel: qrCode.errorCorrectionLevel,
            createdAt: qrCode.createdAt,
            expiresAt: qrCode.expiresAt
        }
    });
});

/**
 * Get QR code by ID
 * GET /api/qr/:id
 */
exports.getQRCode = catchAsync(async (req, res, next) => {
    const qrCode = await QRCodeModel.findById(req.params.id);

    if (!qrCode) {
        return next(new AppError('QR code not found', 404));
    }

    res.status(200).json({
        success: true,
        data: {
            id: qrCode._id,
            imageData: qrCode.imageData,
            text: qrCode.text,
            size: qrCode.size,
            color: qrCode.color,
            format: qrCode.format,
            scanCount: qrCode.scanCount,
            shortUrl: qrCode.shortUrl,
            createdAt: qrCode.createdAt,
            expiresAt: qrCode.expiresAt
        }
    });
});

/**
 * Get QR code history (recent QR codes)
 * GET /api/qr/history
 */
exports.getHistory = catchAsync(async (req, res, next) => {
    const { limit = 20, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const qrCodes = await QRCodeModel.find()
        .select('-imageData -ipHash -userAgent') // Exclude heavy/sensitive fields
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip);

    const total = await QRCodeModel.countDocuments();

    res.status(200).json({
        success: true,
        data: {
            qrCodes,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        }
    });
});

/**
 * Delete QR code
 * DELETE /api/qr/:id
 */
exports.deleteQRCode = catchAsync(async (req, res, next) => {
    const qrCode = await QRCodeModel.findByIdAndDelete(req.params.id);

    if (!qrCode) {
        return next(new AppError('QR code not found', 404));
    }

    // Delete associated analytics
    await Analytics.deleteMany({ qrCodeId: req.params.id });

    res.status(200).json({
        success: true,
        message: 'QR code deleted successfully'
    });
});

/**
 * Get QR code statistics
 * GET /api/qr/:id/stats
 */
exports.getQRStats = catchAsync(async (req, res, next) => {
    const qrCode = await QRCodeModel.findById(req.params.id);

    if (!qrCode) {
        return next(new AppError('QR code not found', 404));
    }

    // Get analytics for this QR code
    const analytics = await Analytics.find({ qrCodeId: req.params.id })
        .select('eventType createdAt')
        .sort({ createdAt: -1 })
        .limit(100);

    // Aggregate stats by event type
    const stats = analytics.reduce((acc, item) => {
        acc[item.eventType] = (acc[item.eventType] || 0) + 1;
        return acc;
    }, {});

    res.status(200).json({
        success: true,
        data: {
            qrCodeId: qrCode._id,
            scanCount: qrCode.scanCount,
            lastScanned: qrCode.lastScanned,
            createdAt: qrCode.createdAt,
            eventStats: stats,
            recentEvents: analytics.slice(0, 10)
        }
    });
});

/**
 * Get popular QR codes
 * GET /api/qr/popular
 */
exports.getPopularQRCodes = catchAsync(async (req, res, next) => {
    const { limit = 10 } = req.query;

    const qrCodes = await QRCodeModel.findPopular(parseInt(limit));

    res.status(200).json({
        success: true,
        data: {
            qrCodes
        }
    });
});
