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

        // Add dramatic 3D animation to the QR container
        qrCodeContainer.style.animation = 'none';
        qrCodeContainer.style.transform = 'scale(0) rotateY(180deg)';
        qrCodeContainer.style.opacity = '0';

        setTimeout(() => {
            qrCodeContainer.style.transition = 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            qrCodeContainer.style.transform = 'scale(1) rotateY(0deg)';
            qrCodeContainer.style.opacity = '1';

            // Reset animation after entrance
            setTimeout(() => {
                qrCodeContainer.style.animation = 'qrFloat 6s infinite ease-in-out';
            }, 800);
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

        // Create a simple filename
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const filename = `QRCode_${timestamp}.png`;

        // Convert canvas to blob for proper download
        canvas.toBlob(function (blob) {
            if (!blob) {
                showToast('Error: Could not create image');
                return;
            }

            // Create object URL from blob
            const url = URL.createObjectURL(blob);

            // Create download link
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);

            showToast('QR Code downloaded successfully!');

        }, 'image/png', 1.0);

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

// ==================== 3D Card Tilt Effect ====================
const card = document.querySelector('.card');
let cardBounds = null;

// Update card bounds on window resize
function updateCardBounds() {
    if (card) {
        cardBounds = card.getBoundingClientRect();
    }
}

updateCardBounds();
window.addEventListener('resize', updateCardBounds);

// 3D Tilt effect on mouse move
document.addEventListener('mousemove', (e) => {
    if (!card || !cardBounds) return;

    // Check if mouse is over the card
    const isOverCard = (
        e.clientX >= cardBounds.left &&
        e.clientX <= cardBounds.right &&
        e.clientY >= cardBounds.top &&
        e.clientY <= cardBounds.bottom
    );

    if (isOverCard) {
        // Calculate position relative to card center
        const cardCenterX = cardBounds.left + cardBounds.width / 2;
        const cardCenterY = cardBounds.top + cardBounds.height / 2;

        // Calculate rotation angles (limited to ±15 degrees)
        const rotateY = ((e.clientX - cardCenterX) / cardBounds.width) * 15;
        const rotateX = -((e.clientY - cardCenterY) / cardBounds.height) * 15;

        // Apply 3D transform
        card.classList.add('tilt-active');
        card.style.transform = `
            perspective(1000px) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg) 
            scale3d(1.02, 1.02, 1.02)
        `;

        // Add extra glow on tilt
        card.style.boxShadow = `
            0 ${20 + Math.abs(rotateX)}px ${40 + Math.abs(rotateY)}px rgba(139, 92, 246, ${0.3 + Math.abs(rotateX) / 50}),
            0 0 ${50 + Math.abs(rotateY)}px rgba(139, 92, 246, 0.2)
        `;
    } else {
        // Reset tilt when mouse leaves
        card.classList.remove('tilt-active');
        card.style.transform = '';
        card.style.boxShadow = '';
    }
});

// Reset tilt on mouse leave
document.addEventListener('mouseleave', () => {
    if (card) {
        card.classList.remove('tilt-active');
        card.style.transform = '';
        card.style.boxShadow = '';
    }
});

// Note: 3D animation for QR container is handled by CSS @keyframes qrFloat

// ==================== Interactive Particles on Click ====================
document.addEventListener('click', (e) => {
    // Create burst of particles at click position
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.className = 'click-particle';
        particle.style.left = e.clientX + 'px';
        particle.style.top = e.clientY + 'px';
        particle.style.setProperty('--random-x', (Math.random() - 0.5) * 200 + 'px');
        particle.style.setProperty('--random-y', (Math.random() - 0.5) * 200 + 'px');
        document.body.appendChild(particle);

        // Remove after animation
        setTimeout(() => particle.remove(), 1000);
    }
});

// Add click particle styles dynamically
const clickParticleStyle = document.createElement('style');
clickParticleStyle.textContent = `
    .click-particle {
        position: fixed;
        width: 8px;
        height: 8px;
        background: var(--primary-purple);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: burstParticle 1s ease-out forwards;
        box-shadow: 0 0 20px var(--primary-purple);
    }

    @keyframes burstParticle {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(var(--random-x), var(--random-y)) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(clickParticleStyle);
