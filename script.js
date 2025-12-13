// ==================== DOM Elements ====================
const urlInput = document.getElementById('urlInput');
const clearBtn = document.getElementById('clearBtn');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const qrPlaceholder = document.getElementById('qrPlaceholder');
const qrResult = document.getElementById('qrResult');
const qrCodeContainer = document.getElementById('qrCodeContainer');
const sizeSelect = document.getElementById('sizeSelect');
const colorSelect = document.getElementById('colorSelect');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// ==================== State ====================
let currentQRCode = null;
let currentUrl = '';

// ==================== Event Listeners ====================
generateBtn.addEventListener('click', generateQRCode);
clearBtn.addEventListener('click', clearInput);
downloadBtn.addEventListener('click', downloadQRCode);
copyBtn.addEventListener('click', copyQRCodeToClipboard);

// Allow Enter key to generate QR code
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateQRCode();
    }
});

// ==================== Functions ====================

/**
 * Generate QR Code from input
 */
function generateQRCode() {
    const url = urlInput.value.trim();

    // Validation
    if (!url) {
        showToast('Please enter a URL or text');
        urlInput.focus();
        return;
    }

    // Get options
    const size = parseInt(sizeSelect.value);
    const color = colorSelect.value;

    // Clear previous QR code
    qrCodeContainer.innerHTML = '';

    // Generate new QR code
    try {
        currentQRCode = new QRCode(qrCodeContainer, {
            text: url,
            width: size,
            height: size,
            colorDark: color,
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        currentUrl = url;

        // Show result, hide placeholder
        qrPlaceholder.classList.add('hidden');
        qrResult.classList.remove('hidden');

        showToast('QR Code generated successfully!');

        // Add animation to the QR container
        qrCodeContainer.style.animation = 'none';
        setTimeout(() => {
            qrCodeContainer.style.animation = 'fadeInScale 0.5s ease';
        }, 10);

    } catch (error) {
        console.error('Error generating QR code:', error);
        showToast('Error generating QR code. Please try again.');
    }
}

/**
 * Clear input field
 */
function clearInput() {
    urlInput.value = '';
    urlInput.focus();
}

/**
 * Download QR Code as PNG
 */
function downloadQRCode() {
    if (!currentQRCode) {
        showToast('Please generate a QR code first');
        return;
    }

    try {
        // Get the canvas element
        const canvas = qrCodeContainer.querySelector('canvas');

        if (!canvas) {
            showToast('Error: QR code canvas not found');
            return;
        }

        // Create download link
        const link = document.createElement('a');
        link.download = `qrcode_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('QR Code downloaded successfully!');

    } catch (error) {
        console.error('Error downloading QR code:', error);
        showToast('Error downloading QR code');
    }
}

/**
 * Copy QR Code to clipboard
 */
async function copyQRCodeToClipboard() {
    if (!currentQRCode) {
        showToast('Please generate a QR code first');
        return;
    }

    try {
        // Get the canvas element
        const canvas = qrCodeContainer.querySelector('canvas');

        if (!canvas) {
            showToast('Error: QR code canvas not found');
            return;
        }

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            try {
                // Copy to clipboard using the Clipboard API
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]);

                showToast('QR Code copied to clipboard!');

            } catch (err) {
                console.error('Error copying to clipboard:', err);

                // Fallback: Copy data URL to clipboard as text
                try {
                    const dataUrl = canvas.toDataURL('image/png');
                    await navigator.clipboard.writeText(dataUrl);
                    showToast('QR Code data URL copied to clipboard!');
                } catch (fallbackErr) {
                    console.error('Fallback copy failed:', fallbackErr);
                    showToast('Could not copy to clipboard. Please try downloading instead.');
                }
            }
        }, 'image/png');

    } catch (error) {
        console.error('Error copying QR code:', error);
        showToast('Error copying QR code');
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds
 */
function showToast(message, duration = 3000) {
    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    // Auto hide after duration
    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// ==================== Initialize ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('QR Code Generator initialized');

    // Focus on input field
    urlInput.focus();

    // Add subtle animation on page load
    const card = document.querySelector('.card');
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';

    setTimeout(() => {
        card.style.transition = 'all 0.8s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, 100);
});

// ==================== Additional Features ====================

/**
 * Handle regeneration when options change
 */
sizeSelect.addEventListener('change', () => {
    if (currentQRCode && currentUrl) {
        // Regenerate with new settings
        qrCodeContainer.innerHTML = '';

        const size = parseInt(sizeSelect.value);
        const color = colorSelect.value;

        currentQRCode = new QRCode(qrCodeContainer, {
            text: currentUrl,
            width: size,
            height: size,
            colorDark: color,
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        showToast('QR Code size updated!');
    }
});

colorSelect.addEventListener('change', () => {
    if (currentQRCode && currentUrl) {
        // Regenerate with new settings
        qrCodeContainer.innerHTML = '';

        const size = parseInt(sizeSelect.value);
        const color = colorSelect.value;

        currentQRCode = new QRCode(qrCodeContainer, {
            text: currentUrl,
            width: size,
            height: size,
            colorDark: color,
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        showToast('QR Code color updated!');
    }
});

/**
 * Add keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        urlInput.focus();
        urlInput.select();
    }

    // Ctrl/Cmd + D to download (if QR code exists)
    if ((e.ctrlKey || e.metaKey) && e.key === 'd' && currentQRCode) {
        e.preventDefault();
        downloadQRCode();
    }

    // Ctrl/Cmd + C to copy (if QR code exists and input not focused)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && currentQRCode && document.activeElement !== urlInput) {
        e.preventDefault();
        copyQRCodeToClipboard();
    }

    // Escape to clear input
    if (e.key === 'Escape') {
        if (urlInput.value) {
            clearInput();
        }
    }
});

/**
 * Add smooth scrolling if needed
 */
if (window.innerHeight < document.documentElement.scrollHeight) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}
