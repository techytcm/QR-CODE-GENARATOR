const mongoose = require('mongoose');

/**
 * QRCode Schema
 * Stores generated QR codes with metadata
 */
const qrCodeSchema = new mongoose.Schema({
    // The original text/URL encoded in the QR code
    text: {
        type: String,
        required: [true, 'Text content is required'],
        trim: true,
        maxlength: [2000, 'Text cannot exceed 2000 characters']
    },

    // QR code configuration
    size: {
        type: Number,
        default: 300,
        min: [200, 'Size must be at least 200px'],
        max: [2000, 'Size cannot exceed 2000px']
    },

    color: {
        type: String,
        default: '#000000',
        match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color code']
    },

    format: {
        type: String,
        enum: ['png', 'svg', 'dataURL'],
        default: 'png'
    },

    errorCorrectionLevel: {
        type: String,
        enum: ['L', 'M', 'Q', 'H'],
        default: 'H',
        description: 'L=7%, M=15%, Q=25%, H=30% error correction'
    },

    // Generated QR code data (base64 or SVG string)
    imageData: {
        type: String,
        required: true
    },

    // Short URL ID (if URL shortening is enabled)
    shortId: {
        type: String,
        unique: true,
        sparse: true, // Allows null values to be non-unique
        index: true
    },

    // Analytics
    scanCount: {
        type: Number,
        default: 0,
        min: 0
    },

    lastScanned: {
        type: Date,
        default: null
    },

    // Privacy - store hashed IP for basic tracking without storing actual IP
    ipHash: {
        type: String,
        select: false // Don't return in queries by default
    },

    // Metadata
    userAgent: {
        type: String,
        select: false
    },

    // Expiration (optional - for cleanup of old QR codes)
    expiresAt: {
        type: Date,
        default: null,
        index: true
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
qrCodeSchema.index({ createdAt: -1 }); // Sort by newest
qrCodeSchema.index({ scanCount: -1 }); // Popular QR codes
qrCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

// Virtual field for full short URL
qrCodeSchema.virtual('shortUrl').get(function () {
    if (this.shortId && process.env.SHORT_URL_DOMAIN) {
        return `${process.env.SHORT_URL_DOMAIN}${this.shortId}`;
    }
    return null;
});

// Method to increment scan count
qrCodeSchema.methods.incrementScan = async function () {
    this.scanCount += 1;
    this.lastScanned = new Date();
    return await this.save();
};

// Static method to find popular QR codes
qrCodeSchema.statics.findPopular = function (limit = 10) {
    return this.find()
        .sort({ scanCount: -1 })
        .limit(limit)
        .select('-imageData -ipHash -userAgent');
};

// Static method to cleanup expired QR codes
qrCodeSchema.statics.cleanupExpired = async function () {
    const now = new Date();
    const result = await this.deleteMany({
        expiresAt: { $lte: now, $ne: null }
    });
    return result.deletedCount;
};

// Pre-save middleware to set expiration (optional: 30 days default)
qrCodeSchema.pre('save', function (next) {
    if (this.isNew && !this.expiresAt) {
        // Set expiration to 30 days from now (optional - can be disabled)
        const daysToExpire = process.env.QR_EXPIRATION_DAYS || null;
        if (daysToExpire) {
            this.expiresAt = new Date(Date.now() + daysToExpire * 24 * 60 * 60 * 1000);
        }
    }
    next();
});

const QRCode = mongoose.model('QRCode', qrCodeSchema);

module.exports = QRCode;
