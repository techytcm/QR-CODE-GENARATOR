const Joi = require('joi');

/**
 * Validation schemas using Joi
 */

// QR code generation validation
const qrGenerateSchema = Joi.object({
    text: Joi.string()
        .required()
        .trim()
        .min(1)
        .max(2000)
        .messages({
            'string.empty': 'Text is required',
            'string.min': 'Text cannot be empty',
            'string.max': 'Text cannot exceed 2000 characters',
            'any.required': 'Text is required'
        }),

    size: Joi.number()
        .integer()
        .min(200)
        .max(2000)
        .default(300)
        .messages({
            'number.min': 'Size must be at least 200px',
            'number.max': 'Size cannot exceed 2000px'
        }),

    color: Joi.string()
        .pattern(/^#[0-9A-F]{6}$/i)
        .default('#000000')
        .messages({
            'string.pattern.base': 'Color must be a valid hex code (e.g., #000000)'
        }),

    backgroundColor: Joi.string()
        .pattern(/^#[0-9A-F]{6}$/i)
        .default('#ffffff')
        .messages({
            'string.pattern.base': 'Background color must be a valid hex code (e.g., #FFFFFF)'
        }),

    format: Joi.string()
        .valid('png', 'svg', 'dataURL')
        .default('png')
        .messages({
            'any.only': 'Format must be one of: png, svg, dataURL'
        }),

    errorCorrectionLevel: Joi.string()
        .valid('L', 'M', 'Q', 'H')
        .default('H')
        .messages({
            'any.only': 'Error correction level must be one of: L, M, Q, H'
        }),

    expirationDays: Joi.number()
        .integer()
        .min(1)
        .max(365)
        .optional()
        .messages({
            'number.min': 'Expiration must be at least 1 day',
            'number.max': 'Expiration cannot exceed 365 days'
        })
});

// Analytics tracking validation
const analyticsTrackSchema = Joi.object({
    qrCodeId: Joi.string()
        .required()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'Invalid QR code ID format',
            'any.required': 'QR code ID is required'
        }),

    eventType: Joi.string()
        .valid('scan', 'generate', 'download', 'copy')
        .required()
        .messages({
            'any.only': 'Event type must be one of: scan, generate, download, copy',
            'any.required': 'Event type is required'
        }),

    referrer: Joi.string()
        .uri()
        .optional()
        .allow('')
});

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, query, params)
 * @returns {Function} Express middleware
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors
            stripUnknown: true // Remove unknown properties
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors
            });
        }

        // Replace request property with validated value
        req[property] = value;
        next();
    };
};

/**
 * Sanitize input to prevent XSS
 */
const sanitizeInput = (req, res, next) => {
    // Basic sanitization - remove potential script tags
    const sanitize = (str) => {
        if (typeof str === 'string') {
            return str
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
        }
        return str;
    };

    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = sanitize(req.body[key]);
            }
        });
    }

    next();
};

module.exports = {
    validate,
    sanitizeInput,
    qrGenerateSchema,
    analyticsTrackSchema
};
