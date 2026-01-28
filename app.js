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
let formError;
let assetsContainer;
let emptyState;
let noResultsState;
let assetCount;
let formTitle;
let submitBtn;

// Debounce timer for search
let searchDebounceTimer;

// Edit mode state
let editingAssetId = null;

// Sort and filter state
let currentSortOrder = 'urgency';
let currentFilter = 'all';

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
    formError = document.getElementById('form-error');
    assetsContainer = document.getElementById('assets-container');
    emptyState = document.getElementById('empty-state');
    noResultsState = document.getElementById('no-results-state');
    assetCount = document.getElementById('asset-count');
    formTitle = document.getElementById('form-title');
    submitBtn = document.getElementById('submit-btn');

    // Set up event listeners
    addAssetForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', handleClearSearch);

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

        if (!isVisible) {
            addAssetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            assetNameInput.focus();
        }
    });

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

        // Check if we're editing or adding
        if (editingAssetId) {
            // UPDATE EXISTING ASSET
            const updated = updateAsset(editingAssetId, {
                name: nameResult.value,
                vendor: vendorResult.value || 'Not specified',
                fixRelease: fixReleaseResult.value
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
                lastReset: currentTime,
                createdAt: currentTime
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
    [assetNameInput, vendorInput, fixReleaseInput].forEach(input => {
        input.classList.remove('input-error');
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
        addAssetBtn.textContent = '➖ Hide Form';
    }

    // Update form title and button
    formTitle.textContent = 'Edit Asset';
    submitBtn.innerHTML = '💾 Update Asset';
    submitBtn.className = 'btn btn-update';

    // Populate form
    assetNameInput.value = asset.name;
    vendorInput.value = asset.vendor === 'Not specified' ? '' : asset.vendor;
    fixReleaseInput.value = asset.fixRelease;

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

    // Hide the form section
    const addAssetSection = document.getElementById('add-asset-section');
    const addAssetBtn = document.getElementById('add-asset-btn');
    if (addAssetSection) {
        addAssetSection.style.display = 'none';
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

    return assets.filter(asset => {
        const alertLevel = getAlertLevel(
            calculateCalendarDays(asset.lastReset),
            calculateBusinessDays(asset.lastReset)
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
    // Calculate metrics
    const calendarDays = calculateDaysElapsed(asset.lastReset);
    const businessDays = calculateBusinessDays(asset.lastReset);
    const alertLevel = getAlertLevel(businessDays, calendarDays);
    const alertMessage = getAlertMessage(alertLevel);

    // Alert icon for better accessibility
    const alertIcon = alertLevel === 'red' ? '🔴' : alertLevel === 'orange' ? '🟠' : '';

    // Create card container
    const card = document.createElement('div');
    card.className = `asset-card alert-${alertLevel}`;
    card.dataset.assetId = asset.id;

    // Build card HTML
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
        <div class="card-body">
            <p class="start-date">📅 Last Reviewed: ${formatDate(asset.lastReset)}</p>
            <p class="days-counter">
                ⏱️ <strong>${calendarDays}</strong> calendar day${calendarDays !== 1 ? 's' : ''} |
                <strong>${businessDays}</strong> business day${businessDays !== 1 ? 's' : ''}
            </p>
            ${alertMessage ? `<p class="alert-message">${alertMessage}</p>` : ''}
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

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    // DOM already loaded
    init();
}
