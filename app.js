/**
 * FILE: app.js
 * PATTERN: Controller (MVC-style architecture)
 * RESPONSIBILITY: Orchestrates UI interactions and coordinates between modules
 *
 * ARCHITECTURAL DECISIONS:
 * - No business logic here - delegates to dateUtils.js
 * - No direct localStorage access - goes through storage.js
 * - Handles all DOM manipulation and user interactions
 *
 * DEPENDENCIES:
 * - storage.js (data layer)
 * - dateUtils.js (business logic)
 * - holidays.js (configuration data)
 *
 * BENEFITS:
 * - Clear separation of concerns
 * - Testable (can mock storage and dateUtils)
 * - Easy to add features (e.g., swap UI framework)
 */

// DOM element references (cached for performance)
let searchInput;
let addAssetForm;
let assetNameInput;
let vendorInput;
let fixReleaseInput;
let formError;
let assetsContainer;
let emptyState;
let assetCount;

// Debounce timer for search
let searchDebounceTimer;

/**
 * Initializes the application
 *
 * PATTERN: Initialization function called on DOM ready
 *
 * FLOW:
 * 1. Cache DOM element references
 * 2. Set up event listeners
 * 3. Load and render initial data
 */
function init() {
    // Cache DOM elements
    searchInput = document.getElementById('search-input');
    addAssetForm = document.getElementById('add-asset-form');
    assetNameInput = document.getElementById('asset-name-input');
    vendorInput = document.getElementById('vendor-input');
    fixReleaseInput = document.getElementById('fix-release-input');
    formError = document.getElementById('form-error');
    assetsContainer = document.getElementById('assets-container');
    emptyState = document.getElementById('empty-state');
    assetCount = document.getElementById('asset-count');

    // Set up event listeners
    addAssetForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', handleSearch);

    // Initial render
    renderAssets();
}

/**
 * Handles form submission for adding new asset
 *
 * VALIDATION:
 * - Asset name: required, non-empty
 * - Vendor: optional
 * - Fix release: required, must be valid number >= 0
 *
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
    // Prevent default form submission (page reload)
    event.preventDefault();

    // Clear previous errors
    formError.textContent = '';
    formError.style.display = 'none';

    // Get input values
    const name = assetNameInput.value.trim();
    const vendor = vendorInput.value.trim();
    const fixReleaseValue = fixReleaseInput.value;

    // Validate asset name
    if (!name) {
        showError('Asset name is required');
        assetNameInput.focus();
        return;
    }

    // Validate and format fix release
    const fixReleaseResult = validateAndFormatFixRelease(fixReleaseValue);
    if (!fixReleaseResult.valid) {
        showError(fixReleaseResult.error);
        fixReleaseInput.focus();
        return;
    }

    // Create asset object
    const currentTime = new Date().toISOString();
    const asset = {
        id: Date.now().toString(), // Timestamp-based unique ID
        name: name,
        vendor: vendor || 'Unknown', // Default if empty
        fixRelease: fixReleaseResult.value,
        startDate: currentTime,
        lastReset: currentTime,
        createdAt: currentTime
    };

    // Save to storage
    const success = saveAsset(asset);

    if (success) {
        // Clear form
        addAssetForm.reset();

        // Re-render assets
        renderAssets();

        // Show success feedback (optional - could add a toast notification)
        console.log('Asset added successfully:', asset.name);
    }
}

/**
 * Validates and formats fix release number
 *
 * FORMATTING RULES:
 * - Must be a valid number
 * - Must be >= 0
 * - Always formatted to 2 decimal places
 *
 * @param {string} value - Input value from form
 * @returns {Object} { valid: boolean, value?: string, error?: string }
 *
 * EXAMPLES:
 * - "10.3" → { valid: true, value: "10.30" }
 * - "10" → { valid: true, value: "10.00" }
 * - "abc" → { valid: false, error: "..." }
 */
function validateAndFormatFixRelease(value) {
    const num = parseFloat(value);

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

    // Format to exactly 2 decimal places
    const formatted = num.toFixed(2);

    return {
        valid: true,
        value: formatted
    };
}

/**
 * Displays error message to user
 *
 * @param {string} message - Error message to display
 */
function showError(message) {
    formError.textContent = message;
    formError.style.display = 'block';
}

/**
 * Handles search input with debouncing
 *
 * DEBOUNCING: Waits 300ms after user stops typing before filtering
 * - Prevents excessive re-renders
 * - Improves performance with large asset lists
 *
 * @param {Event} event - Input event
 */
function handleSearch(event) {
    const searchTerm = event.target.value;

    // Clear existing timer
    clearTimeout(searchDebounceTimer);

    // Set new timer
    searchDebounceTimer = setTimeout(() => {
        renderAssets(searchTerm);
    }, 300); // 300ms delay
}

/**
 * Renders all assets (or filtered subset) to the DOM
 *
 * FLOW:
 * 1. Get all assets from storage
 * 2. Filter by search term (if provided)
 * 3. Sort by urgency (red → orange → normal, then by days)
 * 4. Create card for each asset
 * 5. Update UI (show/hide empty state, update count)
 *
 * @param {string} searchTerm - Optional search term for filtering
 */
function renderAssets(searchTerm = '') {
    // Get all assets
    let assets = getAllAssets();

    // Filter if search term provided
    if (searchTerm) {
        assets = filterAssets(assets, searchTerm);
    }

    // Sort by urgency
    assets = sortAssetsByUrgency(assets);

    // Clear container
    assetsContainer.innerHTML = '';

    // Show/hide empty state
    if (assets.length === 0) {
        emptyState.style.display = 'flex';
        assetsContainer.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        assetsContainer.style.display = 'block';

        // Create and append cards
        assets.forEach(asset => {
            const card = createAssetCard(asset);
            assetsContainer.appendChild(card);
        });
    }

    // Update count
    assetCount.textContent = assets.length;
}

/**
 * Filters assets by search term across multiple fields
 *
 * SEARCHES: name, vendor, fixRelease
 * MATCHING: Case-insensitive, partial matching
 *
 * @param {Array<Object>} assets - All assets
 * @param {string} searchTerm - Search term
 * @returns {Array<Object>} Filtered assets
 */
function filterAssets(assets, searchTerm) {
    if (!searchTerm) return assets;

    const lowerSearch = searchTerm.toLowerCase();

    return assets.filter(asset => {
        const nameMatch = asset.name.toLowerCase().includes(lowerSearch);
        const vendorMatch = asset.vendor.toLowerCase().includes(lowerSearch);
        const releaseMatch = asset.fixRelease.includes(lowerSearch);

        return nameMatch || vendorMatch || releaseMatch;
    });
}

/**
 * Sorts assets by urgency (alert level), then by days elapsed
 *
 * SORT ORDER:
 * 1. Primary: Alert level (red > orange > normal)
 * 2. Secondary: Days elapsed (highest first within same alert level)
 *
 * STABILITY: Ensures consistent ordering
 *
 * @param {Array<Object>} assets - Assets to sort
 * @returns {Array<Object>} Sorted assets
 */
function sortAssetsByUrgency(assets) {
    return assets.sort((a, b) => {
        // Calculate metrics for both assets
        const aCalDays = calculateDaysElapsed(a.lastReset);
        const aBusDays = calculateBusinessDays(a.lastReset);
        const aAlertLevel = getAlertLevel(aBusDays, aCalDays);

        const bCalDays = calculateDaysElapsed(b.lastReset);
        const bBusDays = calculateBusinessDays(b.lastReset);
        const bAlertLevel = getAlertLevel(bBusDays, bCalDays);

        // Define alert priority order
        const alertOrder = { red: 0, orange: 1, normal: 2 };

        // Primary sort: alert level
        const alertComparison = alertOrder[aAlertLevel] - alertOrder[bAlertLevel];
        if (alertComparison !== 0) return alertComparison;

        // Secondary sort: days elapsed (descending)
        return bCalDays - aCalDays;
    });
}

/**
 * Creates a DOM element for an asset card
 *
 * STRUCTURE:
 * - Header: Asset name + delete button
 * - Body: Vendor, fix release, dates, counters, alert message
 * - Actions: Reset button
 *
 * @param {Object} asset - Asset object
 * @returns {HTMLElement} Asset card element
 */
function createAssetCard(asset) {
    // Calculate metrics
    const calendarDays = calculateDaysElapsed(asset.lastReset);
    const businessDays = calculateBusinessDays(asset.lastReset);
    const alertLevel = getAlertLevel(businessDays, calendarDays);
    const alertMessage = getAlertMessage(alertLevel);

    // Create card container
    const card = document.createElement('div');
    card.className = `asset-card alert-${alertLevel}`;
    card.dataset.assetId = asset.id;

    // Build card HTML
    card.innerHTML = `
        <div class="card-header">
            <h3 class="asset-name">📦 ${escapeHtml(asset.name)}</h3>
            <button class="btn-delete" aria-label="Delete ${escapeHtml(asset.name)}" title="Delete asset">
                ❌
            </button>
        </div>
        <div class="card-meta">
            <span class="vendor">🏢 ${escapeHtml(asset.vendor)}</span>
            <span class="separator">•</span>
            <span class="fix-release">📋 Fix Release: ${asset.fixRelease}</span>
        </div>
        <div class="card-divider"></div>
        <div class="card-body">
            <p class="start-date">📅 Started: ${formatDate(asset.lastReset)}</p>
            <p class="days-counter">
                ⏱️ <strong>${calendarDays}</strong> calendar day${calendarDays !== 1 ? 's' : ''} |
                <strong>${businessDays}</strong> business day${businessDays !== 1 ? 's' : ''}
            </p>
            ${alertMessage ? `<p class="alert-message">${alertMessage}</p>` : ''}
        </div>
        <div class="card-actions">
            <button class="btn btn-reset">🔄 Reset Counter</button>
        </div>
    `;

    // Attach event listeners
    const deleteBtn = card.querySelector('.btn-delete');
    const resetBtn = card.querySelector('.btn-reset');

    deleteBtn.addEventListener('click', () => handleDelete(asset.id, asset.name));
    resetBtn.addEventListener('click', () => handleReset(asset.id));

    return card;
}

/**
 * Handles asset deletion with confirmation
 *
 * CONFIRMATION: Prevents accidental deletion
 *
 * @param {string} id - Asset ID
 * @param {string} name - Asset name (for confirmation message)
 */
function handleDelete(id, name) {
    // Confirm deletion
    const confirmed = confirm(`Are you sure you want to delete "${name}"?\n\nThis action cannot be undone.`);

    if (confirmed) {
        const success = deleteAsset(id);

        if (success) {
            renderAssets();
            console.log('Asset deleted:', name);
        }
    }
}

/**
 * Handles asset counter reset
 *
 * UPDATES: lastReset timestamp to current time
 * PRESERVES: All other asset data
 *
 * @param {string} id - Asset ID
 */
function handleReset(id) {
    const currentTime = new Date().toISOString();

    const updated = updateAsset(id, {
        lastReset: currentTime
    });

    if (updated) {
        renderAssets();
        console.log('Asset reset:', id);
    }
}

/**
 * Escapes HTML to prevent XSS attacks
 *
 * SECURITY: Essential when displaying user-generated content
 *
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    init();
}
