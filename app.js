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
let clearSearchBtn;
let addAssetForm;
let assetNameInput;
let vendorInput;
let fixReleaseInput;
let lastReviewInput;
let notesInput;
let formError;
let assetsContainer;
let emptyState;
let noResultsState;
let assetCount;
let formTitle;
let submitBtn;

// Settings DOM elements
let settingsForm;
let orangeThresholdInput;
let redThresholdInput;

// Debounce timer for search
let searchDebounceTimer;

// Edit mode state
let editingAssetId = null;

// Sort and filter state
let currentSortOrder = 'urgency';
let currentFilter = 'all';

// Settings state (for cancel/revert)
let originalSettingsBeforeEdit = null;

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
    clearSearchBtn = document.getElementById('clear-search-btn');
    addAssetForm = document.getElementById('add-asset-form');
    assetNameInput = document.getElementById('asset-name-input');
    vendorInput = document.getElementById('vendor-input');
    fixReleaseInput = document.getElementById('fix-release-input');
    lastReviewInput = document.getElementById('last-review-input');
    notesInput = document.getElementById('notes-input');
    formError = document.getElementById('form-error');
    assetsContainer = document.getElementById('assets-container');
    emptyState = document.getElementById('empty-state');
    noResultsState = document.getElementById('no-results-state');
    assetCount = document.getElementById('asset-count');
    formTitle = document.getElementById('form-title');
    submitBtn = document.getElementById('submit-btn');

    // Settings DOM elements
    settingsForm = document.getElementById('settings-form');
    orangeThresholdInput = document.getElementById('orange-threshold-input');
    redThresholdInput = document.getElementById('red-threshold-input');

    // Set up event listeners
    addAssetForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', handleClearSearch);

    // Settings form event listener
    settingsForm.addEventListener('submit', handleSettingsSave);

    // Sort and filter controls
    const sortSelect = document.getElementById('sort-select');
    const filterSelect = document.getElementById('filter-select');

    sortSelect.addEventListener('change', (e) => {
        currentSortOrder = e.target.value;
        renderAssets(searchInput.value);
    });

    filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderAssets(searchInput.value);
    });

    // Initial render
    renderAssets();

    // Add Asset button event listener
    const addAssetBtn = document.getElementById('add-asset-btn');
    const addAssetSection = document.getElementById('add-asset-section');

    addAssetBtn.addEventListener('click', () => {
        const isVisible = addAssetSection.style.display !== 'none';
        addAssetSection.style.display = isVisible ? 'none' : 'block';
        addAssetBtn.textContent = isVisible ? '➕ Add Asset' : '➖ Hide Form';

        // Hide settings when opening add form
        const settingsSection = document.getElementById('settings-section');
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsSection.style.display !== 'none') {
            settingsSection.style.display = 'none';
            settingsBtn.textContent = '⚙️ Settings';
        }

        if (!isVisible) {
            addAssetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            assetNameInput.focus();
        }
    });

    // Settings button event listener
    const settingsBtn = document.getElementById('settings-btn');
    const settingsSection = document.getElementById('settings-section');

    settingsBtn.addEventListener('click', () => {
        const isVisible = settingsSection.style.display !== 'none';
        settingsSection.style.display = isVisible ? 'none' : 'block';
        settingsBtn.textContent = isVisible ? '⚙️ Settings' : '⚙️ Hide Settings';

        // Hide add form when opening settings
        if (addAssetSection.style.display !== 'none') {
            addAssetSection.style.display = 'none';
            addAssetBtn.textContent = '➕ Add Asset';
            if (editingAssetId) {
                cancelEdit();
            }
        }

        if (!isVisible) {
            settingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Store original settings before editing (for cancel/revert)
            originalSettingsBeforeEdit = getSettings();
            loadSettings();
        }
    });

    // Cancel settings button event listener
    const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
    cancelSettingsBtn.addEventListener('click', handleSettingsCancel);

    // CSV Import event listeners
    const csvFileInput = document.getElementById('csv-file-input');
    const importCsvBtnTrigger = document.getElementById('import-csv-btn-trigger');

    importCsvBtnTrigger.addEventListener('click', () => {
        csvFileInput.click();
    });

    csvFileInput.addEventListener('change', handleCsvImport);
}

/**
 * Handles CSV file import
 *
 * EXPECTED CSV FORMAT:
 * - Headers (case-insensitive, order doesn't matter):
 *   - Asset Name (required): Name of the asset
 *   - Vendor (optional): Vendor company name
 *   - Fix Release (required): Build version (e.g., 10.30)
 *   - Link 1 (optional): URL or reference link (reserved for future)
 *   - Link 2 (optional): URL or reference link (reserved for future)
 *
 * ADDITIONAL NOTES:
 * - CSV may contain extra columns - they will be ignored
 * - lastReset will be set to current time for all imported assets
 * - startDate and createdAt will be set to current time
 * - Fix Release is the overall build version in which asset will be released
 *
 * @param {Event} event - Click event
 */
async function handleCsvImport(event) {
    const fileInput = document.getElementById('csv-file-input');
    const file = fileInput.files[0];

    if (!file) {
        showToast('Please select a CSV file', 'error');
        return;
    }

    try {
        showToast('Reading CSV file...', 'info');
        const text = await file.text();
        const assets = parseCsvToAssets(text);

        let imported = 0;
        let skipped = 0;

        for (const assetData of assets) {
            const success = saveAsset(assetData);
            if (success) {
                imported++;
            } else {
                skipped++;
            }
        }

        const message = skipped > 0
            ? `Imported ${imported} assets, ${skipped} skipped`
            : `Imported ${imported} assets successfully`;

        showToast(message, 'success');
        renderAssets(searchInput.value);

        // Reset file input
        fileInput.value = '';

    } catch (error) {
        showToast(`Import failed: ${error.message}`, 'error');
        debugLog('CSV import error:', error);
    }
}

/**
 * Parses CSV text into asset objects
 *
 * @param {string} csvText - Raw CSV text
 * @returns {Array} Array of asset objects
 */
function parseCsvToAssets(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        throw new Error('CSV file is empty or has no data rows');
    }

    // Parse headers (case-insensitive)
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    // Find column indices
    const nameIdx = headers.findIndex(h => h.includes('asset') && h.includes('name'));
    const vendorIdx = headers.findIndex(h => h.includes('vendor'));
    const releaseIdx = headers.findIndex(h => h.includes('release') || h.includes('fix'));
    // Link columns reserved for future use
    const link1Idx = headers.findIndex(h => h.includes('link 1') || h.includes('link1'));
    const link2Idx = headers.findIndex(h => h.includes('link 2') || h.includes('link2'));

    if (nameIdx === -1) {
        throw new Error('CSV must have "Asset Name" column');
    }
    if (releaseIdx === -1) {
        throw new Error('CSV must have "Fix Release" or "Release" column');
    }

    const assets = [];
    const currentTime = new Date().toISOString();

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());

        const name = values[nameIdx]?.trim();
        const vendor = values[vendorIdx]?.trim() || 'Not specified';
        const fixRelease = values[releaseIdx]?.trim();

        // Validate required fields
        if (!name) {
            debugLog(`Row ${i + 1}: Skipping - missing asset name`);
            continue;
        }

        if (!fixRelease) {
            debugLog(`Row ${i + 1}: Skipping - missing fix release`);
            continue;
        }

        // Validate fix release format
        const releaseValidation = validateFixRelease(fixRelease);
        if (!releaseValidation.valid) {
            debugLog(`Row ${i + 1}: Skipping - invalid fix release: ${releaseValidation.error}`);
            continue;
        }

        // Create asset object
        assets.push({
            id: generateUUID(),
            name: name,
            vendor: vendor,
            fixRelease: releaseValidation.value,
            startDate: currentTime,
            lastReset: currentTime,
            createdAt: currentTime
            // Note: Link1 and Link2 are reserved for future implementation
            // link1: values[link1Idx]?.trim() || '',
            // link2: values[link2Idx]?.trim() || ''
        });
    }

    return assets;
}

/**
 * Handles form submission for adding/editing asset
 *
 * VALIDATION:
 * - Asset name: required, max 100 chars, alphanumeric + common symbols
 * - Vendor: optional, max 100 chars
 * - Fix release: required, valid number 0-1000
 *
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
    // Prevent default form submission (page reload)
    event.preventDefault();

    // Clear previous errors and field highlights
    clearFormErrors();

    // Show loading state
    showButtonLoading(submitBtn);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
        // Get input values
        const nameValue = assetNameInput.value;
        const vendorValue = vendorInput.value;
        const fixReleaseValue = fixReleaseInput.value;

        // Validate asset name
        const nameResult = validateAssetName(nameValue);
        if (!nameResult.valid) {
            showFieldError(assetNameInput, nameResult.error);
            hideButtonLoading(submitBtn);
            assetNameInput.focus();
            return;
        }

        // Validate vendor
        const vendorResult = validateVendor(vendorValue);
        if (!vendorResult.valid) {
            showFieldError(vendorInput, vendorResult.error);
            hideButtonLoading(submitBtn);
            vendorInput.focus();
            return;
        }

        // Validate and format fix release
        const fixReleaseResult = validateFixRelease(fixReleaseValue);
        if (!fixReleaseResult.valid) {
            showFieldError(fixReleaseInput, fixReleaseResult.error);
            hideButtonLoading(submitBtn);
            fixReleaseInput.focus();
            return;
        }

        // Get last review date (defaults to now if not specified)
        const lastReviewValue = lastReviewInput.value;
        let lastResetTime;
        if (lastReviewValue) {
            // Convert date input to ISO string (at start of day, local time)
            const reviewDate = new Date(lastReviewValue + 'T00:00:00');
            lastResetTime = reviewDate.toISOString();
        } else {
            lastResetTime = new Date().toISOString();
        }

        // Get notes value
        const notesValue = (notesInput.value || '').trim();

        // Check if we're editing or adding
        if (editingAssetId) {
            // UPDATE EXISTING ASSET
            const updated = updateAsset(editingAssetId, {
                name: nameResult.value,
                vendor: vendorResult.value || 'Not specified',
                fixRelease: fixReleaseResult.value,
                lastReset: lastResetTime,
                notes: notesValue
            });

            if (updated) {
                showToast('Asset updated successfully', 'success');
                cancelEdit();
                renderAssets(searchInput.value);
            }
        } else {
            // CREATE NEW ASSET
            const currentTime = new Date().toISOString();
            const asset = {
                id: generateUUID(), // UUID for proper unique ID
                name: nameResult.value,
                vendor: vendorResult.value || 'Not specified',
                fixRelease: fixReleaseResult.value,
                startDate: currentTime,
                lastReset: lastResetTime,
                createdAt: currentTime,
                notes: notesValue
            };

            // Save to storage
            const success = saveAsset(asset);

            if (success) {
                showToast('Asset added successfully', 'success');
                // Clear form
                addAssetForm.reset();
                // Hide form section
                const addAssetSection = document.getElementById('add-asset-section');
                const addAssetBtn = document.getElementById('add-asset-btn');
                if (addAssetSection) {
                    addAssetSection.style.display = 'none';
                    addAssetBtn.textContent = '➕ Add Asset';
                }
                // Re-render assets (preserve search)
                renderAssets(searchInput.value);
            }
        }

        hideButtonLoading(submitBtn);
    }, 100);
}

/**
 * Displays field-specific error
 *
 * @param {HTMLElement} field - Input field element
 * @param {string} message - Error message to display
 */
function showFieldError(field, message) {
    // Add error class to field
    field.classList.add('input-error');

    // Show error message
    formError.textContent = message;
    formError.style.display = 'block';
    formError.setAttribute('role', 'alert');
}

/**
 * Clears all form errors
 */
function clearFormErrors() {
    formError.textContent = '';
    formError.style.display = 'none';

    // Remove error class from all inputs
    [assetNameInput, vendorInput, fixReleaseInput, lastReviewInput, notesInput].forEach(input => {
        if (input) input.classList.remove('input-error');
    });
}

/**
 * Enters edit mode for an asset
 *
 * @param {string} id - Asset ID to edit
 */
function startEdit(id) {
    const assets = getAllAssets();
    const asset = assets.find(a => a.id === id);

    if (!asset) {
        showToast('Asset not found', 'error');
        return;
    }

    // Set edit mode
    editingAssetId = id;

    // Show the form section
    const addAssetSection = document.getElementById('add-asset-section');
    const addAssetBtn = document.getElementById('add-asset-btn');
    if (addAssetSection) {
        addAssetSection.style.display = 'block';
        addAssetSection.classList.add('editing-mode');
        addAssetBtn.textContent = '➖ Hide Form';
    }

    // Hide settings if open
    const settingsSection = document.getElementById('settings-section');
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsSection && settingsSection.style.display !== 'none') {
        settingsSection.style.display = 'none';
        settingsBtn.textContent = '⚙️ Settings';
    }

    // Update form title and button
    formTitle.textContent = 'Edit Asset';
    submitBtn.innerHTML = '💾 Update Asset';
    submitBtn.className = 'btn btn-update';

    // Populate form
    assetNameInput.value = asset.name;
    vendorInput.value = asset.vendor === 'Not specified' ? '' : asset.vendor;
    fixReleaseInput.value = asset.fixRelease;

    // Populate last review date (convert ISO to date input format YYYY-MM-DD)
    if (asset.lastReset) {
        const lastResetDate = new Date(asset.lastReset);
        const year = lastResetDate.getFullYear();
        const month = String(lastResetDate.getMonth() + 1).padStart(2, '0');
        const day = String(lastResetDate.getDate()).padStart(2, '0');
        lastReviewInput.value = `${year}-${month}-${day}`;
    }

    // Populate notes
    notesInput.value = asset.notes || '';

    // Clear errors
    clearFormErrors();

    // Scroll to form
    addAssetForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Focus first field
    assetNameInput.focus();

    // Add cancel button if not exists
    if (!document.getElementById('cancel-edit-btn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.id = 'cancel-edit-btn';
        cancelBtn.className = 'btn btn-secondary';
        cancelBtn.innerHTML = '✕ Cancel';
        cancelBtn.addEventListener('click', cancelEdit);
        submitBtn.parentNode.insertBefore(cancelBtn, submitBtn.nextSibling);
    }

    // Highlight the card being edited
    const editingCard = document.querySelector(`[data-asset-id="${id}"]`);
    if (editingCard) {
        editingCard.classList.add('editing');
    }
}

/**
 * Cancels edit mode and returns to add mode
 */
function cancelEdit() {
    // Clear edit state
    editingAssetId = null;

    // Reset form
    addAssetForm.reset();
    clearFormErrors();

    // Update form title and button
    formTitle.textContent = 'Add New Asset';
    submitBtn.innerHTML = '➕ Add Asset';
    submitBtn.className = 'btn btn-primary';

    // Remove cancel button
    const cancelBtn = document.getElementById('cancel-edit-btn');
    if (cancelBtn) {
        cancelBtn.remove();
    }

    // Remove editing highlight from all cards
    document.querySelectorAll('.asset-card.editing').forEach(card => {
        card.classList.remove('editing');
    });

    // Hide the form section and remove editing mode
    const addAssetSection = document.getElementById('add-asset-section');
    const addAssetBtn = document.getElementById('add-asset-btn');
    if (addAssetSection) {
        addAssetSection.style.display = 'none';
        addAssetSection.classList.remove('editing-mode');
        addAssetBtn.textContent = '➕ Add Asset';
    }
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

    // Show/hide clear button
    if (searchTerm) {
        clearSearchBtn.style.display = 'flex';
    } else {
        clearSearchBtn.style.display = 'none';
    }

    // Clear existing timer
    clearTimeout(searchDebounceTimer);

    // Set new timer
    searchDebounceTimer = setTimeout(() => {
        renderAssets(searchTerm);
    }, 300); // 300ms delay
}

/**
 * Clears search input and shows all assets
 */
function handleClearSearch() {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    renderAssets('');
    searchInput.focus();
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
    const allAssets = getAllAssets();
    let assets = allAssets;

    // Filter if search term provided
    const isSearching = searchTerm.trim() !== '';
    if (isSearching) {
        assets = filterAssets(assets, searchTerm);
    }

    // Apply alert level filter
    assets = filterAssetsByAlertLevel(assets, currentFilter);

    // Apply sorting
    assets = sortAssets(assets, currentSortOrder);

    // Clear container
    assetsContainer.innerHTML = '';

    // Determine what to show
    const hasNoAssets = allAssets.length === 0;
    const hasNoResults = isSearching && assets.length === 0;
    const hasAssets = assets.length > 0;

    // Show appropriate state
    emptyState.style.display = hasNoAssets ? 'flex' : 'none';
    noResultsState.style.display = hasNoResults ? 'flex' : 'none';
    assetsContainer.style.display = hasAssets ? 'grid' : 'none';

    if (hasAssets) {
        // Create and append cards
        assets.forEach(asset => {
            const card = createAssetCard(asset);
            assetsContainer.appendChild(card);
        });
    }

    // Update count
    assetCount.textContent = allAssets.length;
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
        const notesMatch = asset.notes ? asset.notes.toLowerCase().includes(lowerSearch) : false;

        return nameMatch || vendorMatch || releaseMatch || notesMatch;
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
    const settings = getSettings();
    return assets.sort((a, b) => {
        // Calculate metrics for both assets
        const aCalDays = calculateDaysElapsed(a.lastReset);
        const aBusDays = calculateBusinessDays(a.lastReset);
        const aAlertLevel = getAlertLevel(aBusDays, aCalDays, settings.orangeThreshold, settings.redThreshold);

        const bCalDays = calculateDaysElapsed(b.lastReset);
        const bBusDays = calculateBusinessDays(b.lastReset);
        const bAlertLevel = getAlertLevel(bBusDays, bCalDays, settings.orangeThreshold, settings.redThreshold);

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
 * Sorts assets based on user-selected sort order
 * @param {Array} assets - Assets to sort
 * @param {string} sortOrder - Sort order (name, vendor, fixRelease, daysElapsed, urgency)
 * @returns {Array} Sorted assets
 */
function sortAssets(assets, sortOrder) {
    const sorted = [...assets];

    switch(sortOrder) {
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'vendor':
            return sorted.sort((a, b) => a.vendor.localeCompare(b.vendor));
        case 'fixRelease':
            return sorted.sort((a, b) => parseFloat(a.fixRelease) - parseFloat(b.fixRelease));
        case 'daysElapsed':
            return sorted.sort((a, b) => {
                const aDays = calculateCalendarDays(a.lastReset);
                const bDays = calculateCalendarDays(b.lastReset);
                return bDays - aDays;
            });
        case 'urgency':
        default:
            return sortAssetsByUrgency(sorted);
    }
}

/**
 * Filters assets by alert level
 * @param {Array} assets - Assets to filter
 * @param {string} filterValue - Filter value (all, red, orange, normal)
 * @returns {Array} Filtered assets
 */
function filterAssetsByAlertLevel(assets, filterValue) {
    if (filterValue === 'all') return assets;

    const settings = getSettings();
    return assets.filter(asset => {
        const calendarDays = calculateDaysElapsed(asset.lastReset);
        const businessDays = calculateBusinessDays(asset.lastReset);
        const alertLevel = getAlertLevel(
            businessDays,
            calendarDays,
            settings.orangeThreshold,
            settings.redThreshold
        );
        return alertLevel === filterValue;
    });
}

/**
 * Creates a DOM element for an asset card
 *
 * STRUCTURE:
 * - Header: Asset name + delete button
 * - Body: Vendor, fix release, dates, counters, alert message
 * - Actions: Edit and Review buttons
 *
 * @param {Object} asset - Asset object
 * @returns {HTMLElement} Asset card element
 */
function createAssetCard(asset) {
    // Calculate metrics using configurable thresholds
    const settings = getSettings();
    const calendarDays = calculateDaysElapsed(asset.lastReset);
    const businessDays = calculateBusinessDays(asset.lastReset);
    const alertLevel = getAlertLevel(businessDays, calendarDays, settings.orangeThreshold, settings.redThreshold);
    const alertMessage = getAlertMessage(alertLevel, settings.orangeThreshold, settings.redThreshold);

    // Alert icon for better accessibility
    const alertIcon = alertLevel === 'red' ? '🔴' : alertLevel === 'orange' ? '🟠' : '';

    // Create card container
    const card = document.createElement('div');
    card.className = `asset-card alert-${alertLevel}`;
    card.dataset.assetId = asset.id;

    // Notes section HTML (only show if notes exist)
    const notesHtml = asset.notes ? `
        <div class="card-notes">
            <p class="notes-text">📝 ${escapeHtml(asset.notes)}</p>
        </div>
    ` : '';

    // Build card HTML with prominent business days counter
    card.innerHTML = `
        <div class="card-header">
            <h3 class="asset-name">${alertIcon} 📦 ${escapeHtml(asset.name)}</h3>
        </div>
        <div class="card-meta">
            <span class="vendor">🏢 ${escapeHtml(asset.vendor)}</span>
            <span class="separator">•</span>
            <span class="fix-release">📋 v${asset.fixRelease}</span>
        </div>
        <div class="card-divider"></div>
        <div class="days-counter-prominent">
            <div class="days-counter-main">
                <span class="days-number">${businessDays}</span>
                <span class="days-label">business day${businessDays !== 1 ? 's' : ''}</span>
            </div>
            <div class="days-counter-secondary">
                <span class="calendar-days">${calendarDays} calendar day${calendarDays !== 1 ? 's' : ''}</span>
            </div>
        </div>
        ${alertMessage ? `<p class="alert-message">${alertMessage}</p>` : ''}
        <div class="card-body">
            <p class="start-date">📅 Last Reviewed: ${formatDate(asset.lastReset)}</p>
            ${notesHtml}
        </div>
        <div class="card-actions">
            <!-- Primary Action: Review -->
            <button class="btn btn-review btn-review-primary" title="Mark asset as reviewed">
                ✓ Review
            </button>

            <!-- Secondary Actions: Edit and Delete -->
            <div class="card-actions-secondary">
                <button class="btn btn-icon btn-edit" title="Edit asset" aria-label="Edit ${escapeHtml(asset.name)}">
                    ✏️
                </button>
                <button class="btn btn-icon btn-delete" title="Delete asset" aria-label="Delete ${escapeHtml(asset.name)}">
                    🗑️
                </button>
            </div>
        </div>
    `;

    // Attach event listeners
    const editBtn = card.querySelector('.btn-edit');
    const deleteBtn = card.querySelector('.btn-delete');
    const reviewBtn = card.querySelector('.btn-review');

    editBtn.addEventListener('click', () => startEdit(asset.id));
    deleteBtn.addEventListener('click', () => handleDelete(asset.id, asset.name));
    reviewBtn.addEventListener('click', () => handleReview(asset.id));

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
            showToast(`Deleted "${name}"`, 'success');
            // Cancel edit if we're editing this asset
            if (editingAssetId === id) {
                cancelEdit();
            }
            renderAssets(searchInput.value);
            debugLog('Asset deleted:', name);
        }
    }
}

/**
 * Handles marking asset as reviewed
 *
 * UPDATES: lastReset timestamp to current time
 * PRESERVES: All other asset data
 *
 * @param {string} id - Asset ID
 */
function handleReview(id) {
    const currentTime = new Date().toISOString();

    const updated = updateAsset(id, {
        lastReset: currentTime
    });

    if (updated) {
        showToast('Asset marked as reviewed', 'success');
        renderAssets(searchInput.value);
        debugLog('Asset reviewed:', id);
    }
}

// ========================================
// SETTINGS MANAGEMENT
// ========================================

const SETTINGS_KEY = 'assetTrackerSettings';

/**
 * Default settings values
 */
const DEFAULT_SETTINGS = {
    orangeThreshold: 5,
    redThreshold: 7
};

/**
 * Gets settings from localStorage
 * @returns {Object} Settings object with thresholds
 */
function getSettings() {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            const settings = JSON.parse(stored);
            return {
                orangeThreshold: settings.orangeThreshold || DEFAULT_SETTINGS.orangeThreshold,
                redThreshold: settings.redThreshold || DEFAULT_SETTINGS.redThreshold
            };
        }
    } catch (error) {
        debugLog('Failed to load settings:', error);
    }
    return { ...DEFAULT_SETTINGS };
}

/**
 * Saves settings to localStorage
 * @param {Object} settings - Settings object
 * @returns {boolean} Success status
 */
function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        debugLog('Failed to save settings:', error);
        return false;
    }
}

/**
 * Loads settings into the form
 */
function loadSettings() {
    const settings = getSettings();
    if (orangeThresholdInput) {
        orangeThresholdInput.value = settings.orangeThreshold;
    }
    if (redThresholdInput) {
        redThresholdInput.value = settings.redThreshold;
    }
}

/**
 * Handles settings form submission
 * @param {Event} event - Form submit event
 */
function handleSettingsSave(event) {
    event.preventDefault();

    const orangeThreshold = parseInt(orangeThresholdInput.value, 10);
    const redThreshold = parseInt(redThresholdInput.value, 10);

    // Validate thresholds
    if (isNaN(orangeThreshold) || orangeThreshold < 1 || orangeThreshold > 30) {
        showToast('Orange threshold must be between 1 and 30', 'error');
        return;
    }

    if (isNaN(redThreshold) || redThreshold < 1 || redThreshold > 60) {
        showToast('Red threshold must be between 1 and 60', 'error');
        return;
    }

    const success = saveSettings({
        orangeThreshold,
        redThreshold
    });

    if (success) {
        showToast('Settings saved successfully', 'success');
        // Re-render assets with new thresholds
        renderAssets(searchInput.value);
        // Close the settings panel
        closeSettingsPanel();
    } else {
        showToast('Failed to save settings', 'error');
    }
}

/**
 * Handles settings cancel - reverts to original values
 */
function handleSettingsCancel() {
    // Revert to original settings
    if (originalSettingsBeforeEdit) {
        orangeThresholdInput.value = originalSettingsBeforeEdit.orangeThreshold;
        redThresholdInput.value = originalSettingsBeforeEdit.redThreshold;
    }
    closeSettingsPanel();
}

/**
 * Closes the settings panel
 */
function closeSettingsPanel() {
    const settingsSection = document.getElementById('settings-section');
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsSection) {
        settingsSection.style.display = 'none';
    }
    if (settingsBtn) {
        settingsBtn.textContent = '⚙️ Settings';
    }
    originalSettingsBeforeEdit = null;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    init();
}
