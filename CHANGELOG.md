# Changelog

All notable changes to the Asset Review Tracker will be documented in this file.

## [1.1.0] - 2026-01-29

### Added
- **Editable Last Review Date**: New date picker field in the form allows setting a custom last review date when creating or editing assets. Defaults to today if left empty.
- **Notes Field**: New textarea for adding custom notes to each asset entry. Notes are displayed on cards and included in search.
- **Settings Menu**: New settings panel accessible via the gear button to configure alert thresholds.
- **Configurable Alert Thresholds**: Both orange and red alert thresholds can now be customized via the settings menu.

### Changed
- **Prominent Business Days Counter**: The business days count is now displayed prominently in the center of each card with a large 42px font. Calendar days shown as secondary information below.
- **Both Alerts Now Use Business Days**:
  - Orange alert: Triggers when business days exceed the orange threshold (default: 5)
  - Red alert: Triggers when business days exceed the red threshold (default: 7)
  - Previously, red alert used calendar days; now both use business days for consistency.
- **Orange Highlight for Editing**: Cards being edited now display an orange outline instead of blue for better visibility. The form section also shows an orange indicator when in edit mode.
- **Settings Panel UX**:
  - "Save Settings" button changed to "Save & Close" - automatically closes the panel after saving.
  - Added "Cancel" button that reverts any unsaved changes and closes the panel.
- **Form Layout**: Form now displays 4 columns on tablet/desktop to accommodate the new date field.

### Fixed
- Storage validation updated to handle the optional `notes` field for backward compatibility with existing data.
- Search functionality now includes notes in search results.

---

## [1.0.0] - Initial Release

### Features
- Track animation assets with name, vendor, and fix release version
- Automatic business day and calendar day counting
- Alert system with orange (5+ business days) and red (7+ calendar days) levels
- Search and filter assets
- Sort by urgency, name, vendor, fix release, or days elapsed
- CSV import functionality
- Review button to reset the day counter
- Dark mode UI with Audi-inspired design
