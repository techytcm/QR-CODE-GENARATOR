const QRCode = require('qrcode');

/**
 * QR Code Generation Utility
 * Wrapper around the qrcode library with additional options
 */

/**
 * Generate QR code in various formats
 * @param {string} text - Text to encode
 * @param {Object} options - QR code options
 * @returns {Promise<string>} - Generated QR code (base64, SVG, or data URL)
 */
const generateQRCode = async (text, options = {}) => {
    const {
        size = 300,
        color = '#000000',
        backgroundColor = '#ffffff',
        format = 'png',
        errorCorrectionLevel = 'H',
        margin = 1,
        quality = 1.0
    } = options;

    // Validate inputs
    if (!text || typeof text !== 'string') {
        throw new Error('Text is required and must be a string');
    }

    if (text.length > 2000) {
        throw new Error('Text cannot exceed 2000 characters');
    }

    if (size < 200 || size > 2000) {
        throw new Error('Size must be between 200 and 2000 pixels');
    }

    // Validate hex color
    const hexColorRegex = /^#[0-9A-F]{6}$/i;
    if (!hexColorRegex.test(color)) {
        throw new Error('Invalid color format. Use hex format (e.g., #000000)');
    }

    if (!hexColorRegex.test(backgroundColor)) {
        throw new Error('Invalid background color format. Use hex format (e.g., #FFFFFF)');
    }

    // QR code generation options
    const qrOptions = {
        errorCorrectionLevel, // L, M, Q, H
        type: format === 'svg' ? 'svg' : 'image/png',
        quality,
        margin,
        color: {
            dark: color,
            light: backgroundColor
        },
        width: size
    };

    try {
        switch (format) {
            case 'png':
                // Generate as base64 PNG
                return await QRCode.toDataURL(text, qrOptions);

            case 'svg':
                // Generate as SVG string
                return await QRCode.toString(text, { ...qrOptions, type: 'svg' });

            case 'dataURL':
                // Same as PNG but explicitly called dataURL
                return await QRCode.toDataURL(text, qrOptions);

            default:
                throw new Error(`Unsupported format: ${format}. Use 'png', 'svg', or 'dataURL'`);
        }
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error(`QR code generation failed: ${error.message}`);
    }
};

/**
 * Generate QR code as a buffer (for file downloads)
 * @param {string} text - Text to encode
 * @param {Object} options - QR code options
 * @returns {Promise<Buffer>} - QR code as buffer
 */
const generateQRCodeBuffer = async (text, options = {}) => {
    const {
        size = 300,
        color = '#000000',
        backgroundColor = '#ffffff',
        errorCorrectionLevel = 'H',
        margin = 1
    } = options;

    const qrOptions = {
        errorCorrectionLevel,
        margin,
        color: {
            dark: color,
            light: backgroundColor
        },
        width: size
    };

    try {
        return await QRCode.toBuffer(text, qrOptions);
    } catch (error) {
        console.error('Error generating QR code buffer:', error);
        throw new Error(`QR code buffer generation failed: ${error.message}`);
    }
};

/**
 * Validate QR code text/URL
 * @param {string} text - Text to validate
 * @returns {Object} - Validation result
 */
const validateQRText = (text) => {
    const errors = [];

    if (!text || typeof text !== 'string') {
        errors.push('Text is required and must be a string');
    } else {
        if (text.trim().length === 0) {
            errors.push('Text cannot be empty');
        }
        if (text.length > 2000) {
            errors.push('Text cannot exceed 2000 characters');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Get recommended error correction level based on text length
 * @param {string} text - Input text
 * @returns {string} - Recommended error correction level
 */
const getRecommendedErrorCorrection = (text) => {
    const length = text.length;

    if (length < 50) {
        return 'H'; // 30% - High for short text
    } else if (length < 200) {
        return 'Q'; // 25% - Quartile for medium text
    } else if (length < 500) {
        return 'M'; // 15% - Medium for longer text
    } else {
        return 'L'; // 7% - Low for very long text
    }
};

module.exports = {
    generateQRCode,
    generateQRCodeBuffer,
    validateQRText,
    getRecommendedErrorCorrection
};
