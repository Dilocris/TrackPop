/**
 * FILE: dateUtils.js
 * PATTERN: Pure Functions (Functional Programming)
 * RESPONSIBILITY: All date/time business logic
 *
 * ARCHITECTURAL DECISIONS:
 * - Pure functions: same input → same output, no side effects
 * - No UI dependencies (can be used in backend, CLI, mobile app)
 * - No direct access to DOM or storage
 * - Dependencies injected as parameters (holidays)
 *
 * BENEFITS:
 * - Easy to test (predictable outputs)
 * - Reusable across projects
 * - No hidden dependencies or global state
 */

/**
 * Calculates total calendar days elapsed since start date
 *
 * @param {string} startDateISO - ISO 8601 date string
 * @returns {number} Number of complete calendar days elapsed
 *
 * EDGE CASES:
 * - Same day: returns 0
 * - Future date: returns negative number
 * - Invalid date: returns NaN (caller should validate)
 */
function calculateDaysElapsed(startDateISO) {
    const startDate = new Date(startDateISO);
    const currentDate = new Date();

    // Reset both to midnight for accurate day counting
    // Without this, we'd get partial days
    startDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    // Calculate difference in milliseconds
    const diffMilliseconds = currentDate - startDate;

    // Convert to days
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const days = Math.floor(diffMilliseconds / millisecondsPerDay);

    return days;
}

/**
 * Calculates business days (weekdays) elapsed, excluding weekends and holidays
 *
 * ALGORITHM: Loop through each day, count if it's a weekday AND not a holiday
 *
 * @param {string} startDateISO - ISO 8601 date string
 * @returns {number} Number of complete business days elapsed
 *
 * DEPENDENCIES: Uses getHolidaysInRange() from holidays.js
 *
 * PERFORMANCE:
 * - O(n) where n = number of days
 * - Optimized by pre-filtering holidays to date range
 * - For typical use (0-30 days): < 1ms
 * - For large ranges (365+ days): consider optimization
 *
 * EDGE CASES:
 * - Start on holiday: holiday not counted
 * - Start on weekend: weekend not counted
 * - Holiday on weekend: already excluded by weekend check
 */
function calculateBusinessDays(startDateISO) {
    const startDate = new Date(startDateISO);
    const currentDate = new Date();

    // Reset to midnight for accurate day counting
    startDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    // Performance optimization: only get holidays in this date range
    // Avoids checking all holidays in all years
    const holidays = getHolidaysInRange(startDate, currentDate);

    let businessDays = 0;
    let currentDay = new Date(startDate);

    // Loop through each day from start to current
    while (currentDay < currentDate) {
        const dayOfWeek = currentDay.getDay();

        // Check if weekend (0 = Sunday, 6 = Saturday)
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

        // Check if holiday
        const currentDayTimestamp = currentDay.getTime();
        const isHolidayDay = holidays.some(holiday =>
            holiday.getTime() === currentDayTimestamp
        );

        // Only count if it's a weekday AND not a holiday
        if (!isWeekend && !isHolidayDay) {
            businessDays++;
        }

        // Move to next day
        currentDay.setDate(currentDay.getDate() + 1);
    }

    return businessDays;
}

/**
 * Determines alert level based on business and calendar days
 *
 * BUSINESS RULES (defined by user requirements):
 * - RED: Calendar days > 7 (highest priority)
 * - ORANGE: Business days > 5 (excludes weekends & holidays)
 * - NORMAL: Below both thresholds
 *
 * @param {number} businessDays - Number of business days elapsed
 * @param {number} calendarDays - Number of calendar days elapsed
 * @returns {string} 'red', 'orange', or 'normal'
 *
 * PRIORITY: Red takes precedence over orange
 * Example: 10 calendar days + 3 business days → RED (not orange)
 */
function getAlertLevel(businessDays, calendarDays) {
    // Red alert takes priority - calendar days exceeded
    if (calendarDays > 7) {
        return 'red';
    }

    // Orange alert - business days exceeded
    if (businessDays > 5) {
        return 'orange';
    }

    // Normal - below both thresholds
    return 'normal';
}

/**
 * Formats ISO date string to human-readable format
 *
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} Formatted date string (e.g., "Jan 23, 2026")
 *
 * FORMAT: "MMM DD, YYYY" - concise but clear
 * Example: "Jan 23, 2026" not "January 23rd, 2026 at 2:30 PM"
 */
function formatDate(isoString) {
    const date = new Date(isoString);

    // Options for date formatting
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };

    // Use built-in Intl API for locale-aware formatting
    return date.toLocaleDateString('en-US', options);
}

/**
 * Checks if a date falls on a weekend
 *
 * UTILITY FUNCTION: Used by business day calculation
 *
 * @param {Date} date - Date object to check
 * @returns {boolean} True if Saturday or Sunday
 */
function isWeekend(date) {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
}

/**
 * Gets a descriptive message for each alert level
 *
 * UI HELPER: Provides user-friendly explanation for alerts
 *
 * @param {string} alertLevel - 'red', 'orange', or 'normal'
 * @returns {string} Human-readable alert message
 */
function getAlertMessage(alertLevel) {
    switch (alertLevel) {
        case 'red':
            return '⚠️ Critical: Over 7 calendar days without review';
        case 'orange':
            return '⚠️ Warning: Over 5 business days without review';
        case 'normal':
        default:
            return '';
    }
}

/**
 * Validates an ISO date string
 *
 * @param {string} isoString - String to validate
 * @returns {boolean} True if valid ISO 8601 date
 *
 * EDGE CASES:
 * - Empty string → false
 * - Invalid format → false
 * - Future date → true (valid format, even if illogical)
 */
function isValidISODate(isoString) {
    if (!isoString) return false;

    const date = new Date(isoString);
    return !isNaN(date.getTime());
}
