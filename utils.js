/**
 * FILE: utils.js
 * PATTERN: Utility Functions
 * RESPONSIBILITY: Core utilities used across the application
 *
 * INCLUDES:
 * - UUID generation for unique IDs
 * - Input validation with security
 * - Debug logging system
 * - Toast notification helpers
 */

// ========================================
// DEBUG CONFIGURATION
// ========================================

/**
 * Debug mode flag
 * Set to false in production to disable console logging
 */
const DEBUG_MODE = false;

/**
 * Safe console logging that respects debug mode
 * @param {...any} args - Arguments to log
 */
function debugLog(...args) {
    if (DEBUG_MODE) {
        console.log(...args);
    }
}

// ========================================
// UUID GENERATION
// ========================================

/**
 * Generates a UUID v4 (random) compliant unique identifier
 *
 * SECURITY: Uses crypto.randomUUID() when available (modern browsers)
 * FALLBACK: Uses Math.random() for older browsers
 *
 * @returns {string} UUID string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 */
function generateUUID() {
    // Modern browsers support crypto.randomUUID()
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    // Fallback for older browsers - generates UUID v4 format
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ========================================
// INPUT VALIDATION
// ========================================

/**
 * Validates asset name with security checks
 *
 * RULES:
 * - Required (not empty after trim)
 * - Max 100 characters
 * - Only allows: letters, numbers, spaces, underscore, hyphen, period
 *
 * @param {string} name - Asset name to validate
 * @returns {Object} { valid: boolean, value?: string, error?: string }
 */
function validateAssetName(name) {
    const trimmed = (name || '').trim();

    if (!trimmed) {
        return {
            valid: false,
            error: 'Asset name is required'
        };
    }

    if (trimmed.length > 100) {
        return {
            valid: false,
            error: 'Asset name is too long (max 100 characters)'
        };
    }

    // Allow letters, numbers, spaces, and common symbols
    if (!/^[a-zA-Z0-9_\s\-\.\/]+$/.test(trimmed)) {
        return {
            valid: false,
            error: 'Asset name contains invalid characters'
        };
    }

    return {
        valid: true,
        value: trimmed
    };
}

/**
 * Validates vendor name with security checks
 *
 * RULES:
 * - Optional (can be empty)
 * - Max 100 characters if provided
 * - Only allows: letters, numbers, spaces, underscore, hyphen, period
 *
 * @param {string} vendor - Vendor name to validate
 * @returns {Object} { valid: boolean, value?: string, error?: string }
 */
function validateVendor(vendor) {
    const trimmed = (vendor || '').trim();

    // Empty vendor is allowed
    if (!trimmed) {
        return {
            valid: true,
            value: ''
        };
    }

    if (trimmed.length > 100) {
        return {
            valid: false,
            error: 'Vendor name is too long (max 100 characters)'
        };
    }

    // Allow letters, numbers, spaces, and common symbols
    if (!/^[a-zA-Z0-9_\s\-\.&,]+$/.test(trimmed)) {
        return {
            valid: false,
            error: 'Vendor name contains invalid characters'
        };
    }

    return {
        valid: true,
        value: trimmed
    };
}

/**
 * Validates and formats fix release number
 *
 * RULES:
 * - Must be a valid number
 * - Must be >= 0
 * - Must be < 1000 (reasonable upper bound)
 * - Always formatted to 2 decimal places
 *
 * @param {string} value - Input value from form
 * @returns {Object} { valid: boolean, value?: string, error?: string }
 */
function validateFixRelease(value) {
    // Normalize comma to period for international users
    const normalized = String(value).replace(',', '.');
    const num = parseFloat(normalized);

    if (isNaN(num)) {
        return {
            valid: false,
            error: 'Fix release must be a valid number'
        };
    }

    if (num < 0) {
        return {
            valid: false,
            error: 'Fix release must be a positive number'
        };
    }

    if (num >= 1000) {
        return {
            valid: false,
            error: 'Fix release must be less than 1000'
        };
    }

    // Format to exactly 2 decimal places
    const formatted = num.toFixed(2);

    return {
        valid: true,
        value: formatted
    };
}

/**
 * Validates asset data structure
 * Used when loading from localStorage
 *
 * @param {Object} asset - Asset object to validate
 * @returns {boolean} True if valid asset structure
 */
function isValidAsset(asset) {
    if (!asset || typeof asset !== 'object') return false;

    // Check required fields exist
    const requiredFields = ['id', 'name', 'vendor', 'fixRelease', 'startDate', 'lastReset', 'createdAt'];
    for (const field of requiredFields) {
        if (!(field in asset)) return false;
    }

    // Validate types
    if (typeof asset.id !== 'string') return false;
    if (typeof asset.name !== 'string') return false;
    if (typeof asset.vendor !== 'string') return false;
    if (typeof asset.fixRelease !== 'string') return false;
    if (typeof asset.startDate !== 'string') return false;
    if (typeof asset.lastReset !== 'string') return false;
    if (typeof asset.createdAt !== 'string') return false;

    // Validate dates are valid ISO strings
    if (isNaN(Date.parse(asset.startDate))) return false;
    if (isNaN(Date.parse(asset.lastReset))) return false;
    if (isNaN(Date.parse(asset.createdAt))) return false;

    return true;
}

// ========================================
// TOAST NOTIFICATION SYSTEM
// ========================================

/**
 * Shows a toast notification to the user
 *
 * TYPES: 'success', 'error', 'warning', 'info'
 * DURATION: Auto-dismisses after specified milliseconds
 *
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (default: 'info')
 * @param {number} duration - How long to show (default: 3000ms)
 */
function showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    // Add icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;

    // Add to container
    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('toast-show'), 10);

    // Auto dismiss
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
            // Remove container if empty
            if (toastContainer.children.length === 0) {
                document.body.removeChild(toastContainer);
            }
        }, 300);
    }, duration);
}

/**
 * Escapes HTML to prevent XSS attacks
 *
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// LOADING STATE HELPERS
// ========================================

/**
 * Shows a loading spinner on a button
 *
 * @param {HTMLElement} button - Button element
 * @param {string} originalText - Original button text to restore later
 */
function showButtonLoading(button) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span>';
}

/**
 * Hides loading spinner and restores button
 *
 * @param {HTMLElement} button - Button element
 */
function hideButtonLoading(button) {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || button.innerHTML;
    delete button.dataset.originalText;
}
