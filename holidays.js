/**
 * FILE: holidays.js
 * PATTERN: Data-Driven Configuration
 * RESPONSIBILITY: Centralized holiday data for business day calculations
 *
 * ARCHITECTURAL DECISIONS:
 * - Pure data file - no logic, just configuration
 * - Separate from calculation logic (dateUtils.js)
 * - Non-developers can update this file annually
 *
 * BENEFITS:
 * - Single Source of Truth for holidays
 * - Easy to add more years or countries
 * - Can be swapped out for API call later
 *
 * MAINTENANCE:
 * - Update annually before January 1st
 * - Add new year, keep old years for historical accuracy
 */

/**
 * US Federal Holidays by year
 *
 * INCLUDED HOLIDAYS:
 * - New Year's Day (Jan 1)
 * - Martin Luther King Jr. Day (3rd Monday of Jan)
 * - Presidents Day (3rd Monday of Feb)
 * - Memorial Day (Last Monday of May)
 * - Independence Day (July 4)
 * - Labor Day (1st Monday of Sep)
 * - Columbus Day (2nd Monday of Oct)
 * - Veterans Day (Nov 11)
 * - Thanksgiving (4th Thursday of Nov)
 * - Christmas (Dec 25)
 *
 * NOTE: Dates are stored at midnight local time
 * Observed dates (when holiday falls on weekend) are NOT included
 * - Business day calculation already excludes weekends
 */
const US_FEDERAL_HOLIDAYS = {
    2024: [
        new Date('2024-01-01T00:00:00'), // New Year's Day
        new Date('2024-01-15T00:00:00'), // MLK Day (3rd Mon)
        new Date('2024-02-19T00:00:00'), // Presidents Day (3rd Mon)
        new Date('2024-05-27T00:00:00'), // Memorial Day (Last Mon)
        new Date('2024-07-04T00:00:00'), // Independence Day
        new Date('2024-09-02T00:00:00'), // Labor Day (1st Mon)
        new Date('2024-10-14T00:00:00'), // Columbus Day (2nd Mon)
        new Date('2024-11-11T00:00:00'), // Veterans Day
        new Date('2024-11-28T00:00:00'), // Thanksgiving (4th Thu)
        new Date('2024-12-25T00:00:00')  // Christmas
    ],
    2025: [
        new Date('2025-01-01T00:00:00'), // New Year's Day
        new Date('2025-01-20T00:00:00'), // MLK Day (3rd Mon)
        new Date('2025-02-17T00:00:00'), // Presidents Day (3rd Mon)
        new Date('2025-05-26T00:00:00'), // Memorial Day (Last Mon)
        new Date('2025-07-04T00:00:00'), // Independence Day
        new Date('2025-09-01T00:00:00'), // Labor Day (1st Mon)
        new Date('2025-10-13T00:00:00'), // Columbus Day (2nd Mon)
        new Date('2025-11-11T00:00:00'), // Veterans Day
        new Date('2025-11-27T00:00:00'), // Thanksgiving (4th Thu)
        new Date('2025-12-25T00:00:00')  // Christmas
    ],
    2026: [
        new Date('2026-01-01T00:00:00'), // New Year's Day
        new Date('2026-01-19T00:00:00'), // MLK Day (3rd Mon)
        new Date('2026-02-16T00:00:00'), // Presidents Day (3rd Mon)
        new Date('2026-05-25T00:00:00'), // Memorial Day (Last Mon)
        new Date('2026-07-04T00:00:00'), // Independence Day (Saturday)
        new Date('2026-09-07T00:00:00'), // Labor Day (1st Mon)
        new Date('2026-10-12T00:00:00'), // Columbus Day (2nd Mon)
        new Date('2026-11-11T00:00:00'), // Veterans Day
        new Date('2026-11-26T00:00:00'), // Thanksgiving (4th Thu)
        new Date('2026-12-25T00:00:00')  // Christmas
    ],
    2027: [
        new Date('2027-01-01T00:00:00'), // New Year's Day
        new Date('2027-01-18T00:00:00'), // MLK Day (3rd Mon)
        new Date('2027-02-15T00:00:00'), // Presidents Day (3rd Mon)
        new Date('2027-05-31T00:00:00'), // Memorial Day (Last Mon)
        new Date('2027-07-04T00:00:00'), // Independence Day (Sunday)
        new Date('2027-09-06T00:00:00'), // Labor Day (1st Mon)
        new Date('2027-10-11T00:00:00'), // Columbus Day (2nd Mon)
        new Date('2027-11-11T00:00:00'), // Veterans Day
        new Date('2027-11-25T00:00:00'), // Thanksgiving (4th Thu)
        new Date('2027-12-25T00:00:00')  // Christmas (Saturday)
    ],
    2028: [
        new Date('2028-01-01T00:00:00'), // New Year's Day (Saturday)
        new Date('2028-01-17T00:00:00'), // MLK Day (3rd Mon)
        new Date('2028-02-21T00:00:00'), // Presidents Day (3rd Mon)
        new Date('2028-05-29T00:00:00'), // Memorial Day (Last Mon)
        new Date('2028-07-04T00:00:00'), // Independence Day
        new Date('2028-09-04T00:00:00'), // Labor Day (1st Mon)
        new Date('2028-10-09T00:00:00'), // Columbus Day (2nd Mon)
        new Date('2028-11-11T00:00:00'), // Veterans Day (Saturday)
        new Date('2028-11-23T00:00:00'), // Thanksgiving (4th Thu)
        new Date('2028-12-25T00:00:00')  // Christmas
    ],
    2029: [
        new Date('2029-01-01T00:00:00'), // New Year's Day
        new Date('2029-01-15T00:00:00'), // MLK Day (3rd Mon)
        new Date('2029-02-19T00:00:00'), // Presidents Day (3rd Mon)
        new Date('2029-05-28T00:00:00'), // Memorial Day (Last Mon)
        new Date('2029-07-04T00:00:00'), // Independence Day
        new Date('2029-09-03T00:00:00'), // Labor Day (1st Mon)
        new Date('2029-10-08T00:00:00'), // Columbus Day (2nd Mon)
        new Date('2029-11-11T00:00:00'), // Veterans Day (Sunday)
        new Date('2029-11-22T00:00:00'), // Thanksgiving (4th Thu)
        new Date('2029-12-25T00:00:00')  // Christmas
    ],
    2030: [
        new Date('2030-01-01T00:00:00'), // New Year's Day
        new Date('2030-01-21T00:00:00'), // MLK Day (3rd Mon)
        new Date('2030-02-18T00:00:00'), // Presidents Day (3rd Mon)
        new Date('2030-05-27T00:00:00'), // Memorial Day (Last Mon)
        new Date('2030-07-04T00:00:00'), // Independence Day
        new Date('2030-09-02T00:00:00'), // Labor Day (1st Mon)
        new Date('2030-10-14T00:00:00'), // Columbus Day (2nd Mon)
        new Date('2030-11-11T00:00:00'), // Veterans Day
        new Date('2030-11-28T00:00:00'), // Thanksgiving (4th Thu)
        new Date('2030-12-25T00:00:00')  // Christmas
    ]
};

/**
 * Retrieves holidays for a specific year
 *
 * @param {number} year - The year (e.g., 2024)
 * @returns {Array<Date>} Array of Date objects, empty array if year not found
 *
 * EDGE CASE: If year not in database, returns empty array (graceful degradation)
 */
function getHolidaysForYear(year) {
    return US_FEDERAL_HOLIDAYS[year] || [];
}

/**
 * Retrieves all holidays falling within a date range
 *
 * PERFORMANCE OPTIMIZATION: Pre-filters holidays to relevant years only
 * - Avoids checking every holiday in every year
 * - Especially important when database grows (2024-2050)
 *
 * @param {Date} startDate - Start of date range
 * @param {Date} endDate - End of date range
 * @returns {Array<Date>} Array of holiday Date objects in range
 *
 * EXAMPLE:
 * getHolidaysInRange(new Date('2024-12-01'), new Date('2025-01-15'))
 * Returns: [Christmas 2024, New Year 2025, MLK Day 2025]
 */
function getHolidaysInRange(startDate, endDate) {
    const holidays = [];

    // Get the years we need to check
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    // Loop through each year in the range
    for (let year = startYear; year <= endYear; year++) {
        const yearHolidays = getHolidaysForYear(year);

        // Filter holidays that fall within our date range
        const relevantHolidays = yearHolidays.filter(holiday => {
            return holiday >= startDate && holiday <= endDate;
        });

        // Add to results
        holidays.push(...relevantHolidays);
    }

    return holidays;
}

/**
 * Checks if a specific date is a holiday
 *
 * @param {Date} date - The date to check
 * @param {Array<Date>} holidays - Array of holiday dates
 * @returns {boolean} True if date is a holiday
 *
 * NOTE: Compares timestamps for exact matching
 */
function isHoliday(date, holidays) {
    const dateTimestamp = date.getTime();
    return holidays.some(holiday => holiday.getTime() === dateTimestamp);
}
