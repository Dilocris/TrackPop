/**
 * FILE: storage.js
 * PATTERN: Repository Pattern
 * RESPONSIBILITY: Abstract all data persistence operations
 *
 * ARCHITECTURAL DECISIONS:
 * - Single interface for data operations (easy to swap backend later)
 * - Centralized error handling for storage operations
 * - No business logic here - pure data layer
 *
 * BENEFITS:
 * - Can swap localStorage → database without changing app.js
 * - All storage errors handled in one place
 * - Clean separation between data and logic
 */

// Storage key constant - Single Source of Truth for where data is stored
const STORAGE_KEY = 'assetTracker';

/**
 * Retrieves all assets from localStorage with validation
 *
 * PATTERN: Try-catch for graceful error handling
 * VALIDATION: Filters out invalid/corrupted asset data
 *
 * @returns {Array<Object>} Array of valid asset objects, empty array if none exist
 *
 * EDGE CASES:
 * - No data stored yet → returns []
 * - Corrupted JSON → shows error toast, returns []
 * - Invalid asset structure → filters out bad data
 * - localStorage disabled → shows error toast, returns []
 */
function getAllAssets() {
    try {
        const jsonString = localStorage.getItem(STORAGE_KEY);

        // If no data exists yet, return empty array
        if (jsonString === null) {
            return [];
        }

        // Parse JSON string to JavaScript array
        const assets = JSON.parse(jsonString);

        // Validate that it's an array
        if (!Array.isArray(assets)) {
            debugLog('Invalid data structure in localStorage - expected array');
            showToast('Data corruption detected. Starting fresh.', 'error');
            return [];
        }

        // Filter out invalid assets and log issues
        const validAssets = assets.filter((asset, index) => {
            const valid = isValidAsset(asset);
            if (!valid) {
                debugLog(`Invalid asset at index ${index}:`, asset);
            }
            return valid;
        });

        // If we filtered out some assets, save the cleaned data
        if (validAssets.length !== assets.length) {
            debugLog(`Filtered ${assets.length - validAssets.length} invalid assets`);
            const jsonString = JSON.stringify(validAssets);
            localStorage.setItem(STORAGE_KEY, jsonString);
            showToast('Some invalid data was removed', 'warning');
        }

        return validAssets;

    } catch (error) {
        debugLog('Failed to load assets from localStorage:', error);
        showToast('Failed to load saved data. Please refresh the page.', 'error');
        // Return empty array so app still works
        return [];
    }
}

/**
 * Saves a new asset to storage
 *
 * PATTERN: Get current data → add new item → save all
 *
 * @param {Object} asset - Asset object with all required fields
 * @returns {boolean} True if saved successfully, false otherwise
 *
 * VALIDATION:
 * - Expects asset to have: id, name, vendor, fixRelease, startDate, lastReset, createdAt
 * - Validation should happen in app.js before calling this function
 */
function saveAsset(asset) {
    try {
        // Get current assets
        const assets = getAllAssets();

        // Add new asset to array
        assets.push(asset);

        // Save updated array back to localStorage
        const jsonString = JSON.stringify(assets);
        localStorage.setItem(STORAGE_KEY, jsonString);

        return true; // Success

    } catch (error) {
        debugLog('Failed to save asset:', error);

        // Check if storage quota exceeded
        if (error.name === 'QuotaExceededError') {
            showToast('Storage is full! Try deleting some old assets.', 'error', 5000);
        } else {
            showToast('Failed to save asset. Please try again.', 'error');
        }

        return false; // Failure
    }
}

/**
 * Updates an existing asset by ID
 *
 * PATTERN: Find by ID → merge updates → save all
 *
 * @param {string} id - Unique asset ID
 * @param {Object} updates - Object with fields to update
 * @returns {Object|null} Updated asset object, or null if not found
 *
 * EXAMPLE:
 * updateAsset('1234', { lastReset: new Date().toISOString() })
 */
function updateAsset(id, updates) {
    try {
        const assets = getAllAssets();

        // Find the asset by ID
        const assetIndex = assets.findIndex(asset => asset.id === id);

        // Asset not found
        if (assetIndex === -1) {
            debugLog(`Asset with ID ${id} not found`);
            showToast('Asset not found', 'error');
            return null;
        }

        // Merge updates into existing asset (spread operator)
        assets[assetIndex] = {
            ...assets[assetIndex],
            ...updates
        };

        // Save updated array
        const jsonString = JSON.stringify(assets);
        localStorage.setItem(STORAGE_KEY, jsonString);

        return assets[assetIndex]; // Return updated asset

    } catch (error) {
        debugLog('Failed to update asset:', error);
        showToast('Failed to update asset. Please try again.', 'error');
        return null;
    }
}

/**
 * Deletes an asset by ID
 *
 * PATTERN: Filter out the item to delete
 *
 * @param {string} id - Unique asset ID
 * @returns {boolean} True if deleted successfully, false otherwise
 */
function deleteAsset(id) {
    try {
        const assets = getAllAssets();

        // Filter out the asset with matching ID
        // This creates a new array without that asset
        const updatedAssets = assets.filter(asset => asset.id !== id);

        // Check if anything was actually deleted
        if (updatedAssets.length === assets.length) {
            debugLog(`Asset with ID ${id} not found`);
            showToast('Asset not found', 'error');
            return false;
        }

        // Save updated array
        const jsonString = JSON.stringify(updatedAssets);
        localStorage.setItem(STORAGE_KEY, jsonString);

        return true; // Success

    } catch (error) {
        debugLog('Failed to delete asset:', error);
        showToast('Failed to delete asset. Please try again.', 'error');
        return false;
    }
}

/**
 * Clears all data from storage
 *
 * USE CASE: Testing, or user wants to start fresh
 * WARNING: This is destructive and cannot be undone
 *
 * @returns {boolean} True if cleared successfully
 */
function clearAllData() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        showToast('All data cleared', 'success');
        return true;
    } catch (error) {
        debugLog('Failed to clear data:', error);
        showToast('Failed to clear data', 'error');
        return false;
    }
}

/**
 * Gets total count of assets
 *
 * PERFORMANCE: Simple wrapper, but avoids loading all data if we only need count
 * Note: Could optimize further by storing count separately, but unnecessary for now
 *
 * @returns {number} Number of assets in storage
 */
function getAssetCount() {
    return getAllAssets().length;
}
