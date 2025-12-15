const mongoose = require('mongoose');

/**
 * Analytics Schema
 * Tracks QR code scans and usage statistics
 */
const analyticsSchema = new mongoose.Schema({
    // Reference to the QR code
    qrCodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QRCode',
        required: true,
        index: true
    },

    // Event type
    eventType: {
        type: String,
        enum: ['scan', 'generate', 'download', 'copy'],
        required: true,
        index: true
    },

    // User information (anonymized)
    userAgent: {
        type: String
    },

    ipHash: {
        type: String,
        select: false
    },

    // Location data (optional - if using a geolocation service)
    location: {
        country: String,
        city: String,
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                index: '2dsphere'
            }
        }
    },

    // Referrer information
    referrer: {
        type: String
    },

    // Device information
    device: {
        type: {
            type: String,
            enum: ['mobile', 'tablet', 'desktop', 'unknown']
        },
        os: String,
        browser: String
    },

    // Additional metadata
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

// Indexes
analyticsSchema.index({ createdAt: -1 });
analyticsSchema.index({ eventType: 1, createdAt: -1 });

// Static method to get aggregate statistics
analyticsSchema.statics.getStatistics = async function (qrCodeId = null, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const matchStage = {
        createdAt: { $gte: startDate }
    };

    if (qrCodeId) {
        matchStage.qrCodeId = mongoose.Types.ObjectId(qrCodeId);
    }

    const stats = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: '$eventType',
                count: { $sum: 1 }
            }
        }
    ]);

    return stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, {});
};

// Static method to get daily statistics
analyticsSchema.statics.getDailyStats = async function (days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    eventType: '$eventType'
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id.date': 1 }
        }
    ]);
};

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;
