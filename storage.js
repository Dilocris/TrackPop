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
 * Retrieves all assets from localStorage
 *
 * PATTERN: Try-catch for graceful error handling
 *
 * @returns {Array<Object>} Array of asset objects, empty array if none exist
 *
 * EDGE CASES:
 * - No data stored yet → returns []
 * - Corrupted JSON → logs error, returns []
 * - localStorage disabled → logs error, returns []
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
        return assets;

    } catch (error) {
        console.error('Failed to load assets from localStorage:', error);
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
        console.error('Failed to save asset:', error);

        // Check if storage quota exceeded
        if (error.name === 'QuotaExceededError') {
            alert('Storage is full! Try deleting some old assets.');
        } else {
            alert('Failed to save asset. Please try again.');
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
            console.warn(`Asset with ID ${id} not found`);
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
        console.error('Failed to update asset:', error);
        alert('Failed to update asset. Please try again.');
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
            console.warn(`Asset with ID ${id} not found`);
            return false;
        }

        // Save updated array
        const jsonString = JSON.stringify(updatedAssets);
        localStorage.setItem(STORAGE_KEY, jsonString);

        return true; // Success

    } catch (error) {
        console.error('Failed to delete asset:', error);
        alert('Failed to delete asset. Please try again.');
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
        return true;
    } catch (error) {
        console.error('Failed to clear data:', error);
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
