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

// ==================== Configuration ====================
const API_BASE_URL = window.location.origin + '/api';
let useBackend = true; // Try backend first, fallback to client-side

// ==================== Functions ====================

/**
 * Check if backend is available
 */
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000) // 3 second timeout
        });
        return response.ok;
    } catch (error) {
        console.warn('Backend not available, using client-side generation');
        return false;
    }
}

/**
 * Generate QR Code (backend-first with client-side fallback)
 */
async function generateQRCode() {
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

    // Show loading state
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
        <svg class="btn-icon animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-opacity="0.25"/>
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Generating...
    `;

    try {
        // Try backend first if available
        if (useBackend) {
            try {
                const response = await fetch(`${API_BASE_URL}/qr/generate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        text: url,
                        size: size,
                        color: color,
                        format: 'png',
                        errorCorrectionLevel: 'H'
                    }),
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });

                if (response.ok) {
                    const data = await response.json();

                    // Display QR code from backend
                    qrCodeContainer.innerHTML = `<img src="${data.data.imageData}" alt="QR Code" style="width: ${size}px; height: ${size}px; image-rendering: pixelated;">`;

                    // Store QR code ID for analytics
                    currentQRCode = { id: data.data.id, imageData: data.data.imageData };
                    currentUrl = url;

                    // Show result
                    qrPlaceholder.classList.add('hidden');
                    qrResult.classList.remove('hidden');

                    showToast('✨ QR Code generated via backend!');

                    // Track generation event
                    trackAnalytics(data.data.id, 'generate');

                    // Animate the QR code
                    animateQRCode();

                    // Reset button
                    resetGenerateButton();
                    return;
                }
            } catch (backendError) {
                console.warn('Backend generation failed, falling back to client-side:', backendError);
                useBackend = false; // Disable backend for subsequent requests
            }
        }

        // Fallback to client-side generation
        qrCodeContainer.innerHTML = '';

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

        showToast('✅ QR Code generated (offline mode)');

        // Animate the QR code
        animateQRCode();

    } catch (error) {
        console.error('Error generating QR code:', error);
        showToast('❌ Error generating QR code. Please try again.');
    }

    // Reset button
    resetGenerateButton();
}

/**
 * Animate QR Code entrance
 */
function animateQRCode() {
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
}

/**
 * Reset generate button to original state
 */
function resetGenerateButton() {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        Generate QR Code
    `;
}

/**
 * Track analytics event
 */
async function trackAnalytics(qrCodeId, eventType) {
    if (!qrCodeId || !useBackend) return;

    try {
        await fetch(`${API_BASE_URL}/analytics/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                qrCodeId: qrCodeId,
                eventType: eventType,
                referrer: document.referrer
            })
        });
    } catch (error) {
        console.debug('Analytics tracking failed:', error);
        // Don't show error to user, analytics is not critical
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
        // Get the canvas or image element
        let canvas = qrCodeContainer.querySelector('canvas');
        const img = qrCodeContainer.querySelector('img');

        // If we have an image from backend, download it directly
        if (img && !canvas) {
            const link = document.createElement('a');
            link.href = img.src;
            link.download = `QRCode_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.png`;
            link.click();

            showToast('QR Code downloaded successfully!');

            // Track download event
            if (currentQRCode.id) {
                trackAnalytics(currentQRCode.id, 'download');
            }
            return;
        }

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

            // Track download event
            if (currentQRCode.id) {
                trackAnalytics(currentQRCode.id, 'download');
            }

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
        // Get the canvas or image element
        let canvas = qrCodeContainer.querySelector('canvas');
        const img = qrCodeContainer.querySelector('img');

        // If we have an image from backend, convert to blob
        if (img && !canvas) {
            try {
                const response = await fetch(img.src);
                const blob = await response.blob();

                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]);

                showToast('QR Code copied to clipboard!');

                // Track copy event
                if (currentQRCode.id) {
                    trackAnalytics(currentQRCode.id, 'copy');
                }
                return;
            } catch (err) {
                console.error('Error copying from image:', err);
            }
        }

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

                // Track copy event
                if (currentQRCode.id) {
                    trackAnalytics(currentQRCode.id, 'copy');
                }

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
document.addEventListener('DOMContentLoaded', async () => {
    console.log('QR Code Generator initialized');

    // Check if backend is available
    useBackend = await checkBackendHealth();
    console.log('Backend status:', useBackend ? 'Available ✅' : 'Offline (using client-side) ⚠️');

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
