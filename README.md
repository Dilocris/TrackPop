# 🎬 Asset Review Tracker

A production-ready web application for tracking animation asset reviews from vendors. Monitor review times with visual alerts when assets exceed business day thresholds.

## 🎯 Features

- **Track Multiple Assets**: Monitor unlimited animation assets with vendor information
- **Edit Assets**: Modify asset details (name, vendor, fix release) after creation
- **Business Day Calculations**: Automatically excludes weekends and US federal holidays
- **Visual Alerts**:
  - 🟠 Orange warning after 5 business days
  - 🔴 Red alert after 7 calendar days
  - Color-blind friendly with emoji indicators (🟠/🔴)
- **Real-Time Search**: Filter assets by name, vendor, or fix release number with clear button
- **Toast Notifications**: Non-intrusive success/error messages
- **Smart Validation**: Input validation with helpful error messages and field highlighting
- **Loading States**: Visual feedback for all user actions
- **Dark Mode Design**: Eye-friendly interface for long production days
- **Persistent Data**: All data saved locally with automatic validation and corruption detection
- **Responsive Layout**: Works on desktop, tablet, and mobile with optimized spacing

## ✨ Recent Updates

**v2.0 - Security & UX Overhaul**:
- ✏️ **Edit Functionality**: Modify assets after creation
- 🔒 **Enhanced Security**: Comprehensive input validation, XSS protection, UUID implementation
- 🎯 **Toast Notifications**: Modern, non-intrusive user feedback
- 🔍 **Improved Search**: Clear button and "no results" messaging
- ♿ **Better Accessibility**: Color-blind friendly alerts with emoji indicators
- 📱 **Improved Mobile UX**: Better spacing and touch-friendly buttons
- 🐛 **Data Validation**: Automatic corruption detection and cleanup
- ⚡ **Loading States**: Visual feedback for all operations
- 🎨 **Enhanced UI**: Better button hierarchy, error highlighting, improved layout

## 🚀 Getting Started

### Installation

1. **Download** all files to a local folder
2. **Open** `index.html` in your web browser
3. **Start tracking** your assets!

No server, no build process, no dependencies. Just open and use.

### Basic Usage

1. **Add an Asset**:
   - Enter asset name (required, max 100 characters)
   - Enter vendor name (optional, max 100 characters)
   - Enter fix release number (required, 0-999.99)
   - Click "➕ Add Asset"
   - Success notification appears

2. **Edit an Asset**:
   - Click "✏️ Edit" on any asset card
   - Form populates with current values
   - Modify fields as needed
   - Click "💾 Update Asset" or "✕ Cancel"
   - Success notification confirms update

3. **Search Assets**:
   - Type in the search bar to filter by name, vendor, or release number
   - Results update instantly as you type (300ms debounce)
   - Click "✕" button to clear search
   - "No results" message when filter returns nothing

4. **Reset Counter**:
   - Click "🔄 Reset" on any asset card
   - Resets the day counter to 0 (when vendor sends new version)
   - Success notification confirms reset

5. **Delete Asset**:
   - Click "🗑️ Delete" on any asset card
   - Confirm deletion in dialog (cannot be undone)
   - Success notification confirms deletion

## 📁 Project Structure

```
TrackPop/
├── index.html       # Main HTML structure and layout
├── styles.css       # Dark mode styling and design system
├── utils.js         # Core utilities (UUID, validation, toasts, debug)
├── app.js           # UI controller and orchestration
├── storage.js       # Data persistence (localStorage)
├── dateUtils.js     # Business day calculations
├── holidays.js      # US Federal Holiday calendar
└── README.md        # This file
```

### Architecture Overview

**Layered Architecture (MVC-Inspired)**:

```
┌─────────────────────────────────────────┐
│  PRESENTATION LAYER                     │
│  ├── index.html (Structure)             │
│  └── styles.css (Visual Design)         │
└─────────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────────┐
│  CONTROLLER LAYER                       │
│  └── app.js (UI Orchestration)          │
└─────────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────────┐
│  UTILITIES & BUSINESS LOGIC LAYER       │
│  ├── utils.js (Validation, UUID, Toast) │
│  └── dateUtils.js (Pure Functions)      │
└─────────────────────────────────────────┘
              ↓ ↑
┌─────────────────────────────────────────┐
│  DATA LAYER                             │
│  ├── storage.js (Repository Pattern)    │
│  └── holidays.js (Configuration Data)   │
└─────────────────────────────────────────┘
```

**Benefits of This Architecture**:
- Each layer has a single, clear responsibility
- Layers can be modified independently
- Business logic is reusable across different UIs
- Easy to test each component in isolation
- Professional-grade code organization

## 🗃️ Data Model

Each asset is stored with the following structure:

```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000", // UUID v4
  name: "Character_WalkCycle_v2",              // Asset name (max 100 chars)
  vendor: "Studio XYZ",                        // Vendor/studio name (or "Not specified")
  fixRelease: "10.30",                         // Fix release (2 decimals, 0-999.99)
  startDate: "2026-01-23T14:30:00",            // When tracking began
  lastReset: "2026-01-23T14:30:00",            // Last counter reset
  createdAt: "2026-01-23T14:30:00"             // Original creation
}
```

**Data Security & Validation**:
- Stored in **browser localStorage** under the key `"assetTracker"`
- Automatic validation on load - corrupted data is filtered out
- Input validation prevents XSS and ensures data integrity
- UUID prevents ID collisions

## 📅 Holiday Calendar Maintenance

### Current Coverage
- **Years**: 2024 through 2030
- **Holidays**: 10 US Federal Holidays per year

### How to Update

**Annual Update Process** (before January 1st):

1. Open `holidays.js` in a text editor
2. Add a new year section (copy existing year format)
3. Calculate floating holiday dates:
   - **MLK Day**: 3rd Monday of January
   - **Presidents Day**: 3rd Monday of February
   - **Memorial Day**: Last Monday of May
   - **Labor Day**: 1st Monday of September
   - **Columbus Day**: 2nd Monday of October
   - **Thanksgiving**: 4th Thursday of November
4. Fixed holidays remain the same (Jan 1, July 4, Nov 11, Dec 25)
5. Save file and refresh browser

**Example** for adding 2031:

```javascript
2031: [
    new Date('2031-01-01T00:00:00'), // New Year's Day
    new Date('2031-01-20T00:00:00'), // MLK Day (3rd Mon)
    new Date('2031-02-17T00:00:00'), // Presidents Day (3rd Mon)
    new Date('2031-05-26T00:00:00'), // Memorial Day (Last Mon)
    new Date('2031-07-04T00:00:00'), // Independence Day
    new Date('2031-09-01T00:00:00'), // Labor Day (1st Mon)
    new Date('2031-10-13T00:00:00'), // Columbus Day (2nd Mon)
    new Date('2031-11-11T00:00:00'), // Veterans Day
    new Date('2031-11-27T00:00:00'), // Thanksgiving (4th Thu)
    new Date('2031-12-25T00:00:00')  // Christmas
]
```

### Adding Custom Holidays

You can add company-specific or regional holidays:

```javascript
// Add to the array for any year
new Date('2024-12-24T00:00:00'), // Christmas Eve (company policy)
new Date('2024-12-31T00:00:00'), // New Year's Eve (company policy)
```

## 🎨 Customization

### Changing Alert Thresholds

Edit `dateUtils.js`, function `getAlertLevel()`:

```javascript
// Current thresholds
if (calendarDays > 7) return 'red';      // Change 7 to your threshold
if (businessDays > 5) return 'orange';   // Change 5 to your threshold
```

### Changing Colors

Edit `styles.css` CSS custom properties:

```css
:root {
    --accent-orange: #FF8C00;  /* Orange alert color */
    --accent-red: #CC0000;     /* Red alert color */
    --accent-blue: #4A90E2;    /* Primary action color */
    /* ... */
}
```

### Adding Light Mode

Create a toggle that swaps CSS variables:

```css
.light-mode {
    --bg-primary: #ffffff;
    --bg-card: #f5f5f5;
    --text-primary: #1a1a1a;
    /* ... */
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] Add asset with all fields → appears in list
- [ ] Add asset with invalid fix release → shows error
- [ ] Refresh page → assets persist
- [ ] Search by asset name → filters correctly
- [ ] Search by vendor → filters correctly
- [ ] Reset asset → counter shows 0 days
- [ ] Delete asset → removes from list after confirmation
- [ ] Test on mobile device → responsive layout works

### Testing Alert System

Use browser DevTools Console (F12):

```javascript
// Get all assets
const assets = JSON.parse(localStorage.getItem('assetTracker'));

// Set asset to 8 days ago (should show RED)
assets[0].lastReset = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();

// Save and reload
localStorage.setItem('assetTracker', JSON.stringify(assets));
location.reload();
```

### Testing Holiday Exclusion

Create an asset that spans a known holiday (e.g., Christmas to New Year's):

```javascript
// In console:
const testAsset = {
    id: Date.now().toString(),
    name: "Holiday Test",
    vendor: "Test Vendor",
    fixRelease: "1.00",
    startDate: "2024-12-23T00:00:00",
    lastReset: "2024-12-23T00:00:00",
    createdAt: "2024-12-23T00:00:00"
};

// Add to storage
const assets = JSON.parse(localStorage.getItem('assetTracker') || '[]');
assets.push(testAsset);
localStorage.setItem('assetTracker', JSON.stringify(assets));
location.reload();
```

Verify that business days exclude Dec 25 (Christmas) and Jan 1 (New Year's).

## 🔧 Troubleshooting

### Assets not saving
- **Check browser localStorage**: DevTools → Application → Local Storage
- **Storage quota exceeded**: Delete old assets or clear data
- **Private browsing**: Some browsers disable localStorage in private mode

### Search not working
- **Check console for errors**: F12 → Console tab
- **Debounce delay**: Search has 300ms delay (intentional)

### Wrong business day count
- **Check holiday calendar**: Ensure current year is in `holidays.js`
- **Weekend handling**: Weekends are automatically excluded
- **Timezone issues**: App uses local time, which is correct for this use case

### Visual issues
- **Hard refresh**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- **Browser compatibility**: Tested on Chrome, Firefox, Safari, Edge
- **Dark mode not showing**: Check `styles.css` loaded correctly

## 💾 Data Management

### Export Data (Manual)

1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Copy the `assetTracker` value
4. Paste into a text file and save

### Import Data (Manual)

1. Open DevTools (F12)
2. Go to Console tab
3. Paste your saved data:
   ```javascript
   localStorage.setItem('assetTracker', 'YOUR_DATA_HERE');
   location.reload();
   ```

### Clear All Data

```javascript
// In console:
localStorage.removeItem('assetTracker');
location.reload();
```

## 🔒 Security & Validation

Production-grade security features:

**Input Validation**:
- Asset name: 1-100 characters, alphanumeric + common symbols
- Vendor name: 0-100 characters, alphanumeric + common symbols
- Fix release: 0-999.99, formatted to 2 decimals
- Real-time validation with field highlighting
- Clear error messages for user guidance

**XSS Protection**:
- All user input is sanitized before display
- HTML escaping prevents script injection
- Secure UUID generation (crypto API when available)

**Data Integrity**:
- Automatic data validation on localStorage load
- Corrupted entries are filtered out and user is notified
- UUID v4 prevents ID collisions (not timestamp-based)
- Graceful error handling with user-friendly messages

**User Experience**:
- Toast notifications instead of browser alerts
- Loading states for all async operations
- Form validation with error highlighting
- Debug mode flag for production deployment

## 📚 Learning Resources

This project demonstrates professional software architecture patterns:

- **Repository Pattern** (storage.js): Abstracts data access
- **Pure Functions** (dateUtils.js): Testable, predictable logic
- **Controller Pattern** (app.js): Coordinates between layers
- **Input Validation** (utils.js): Security-first approach
- **Toast Notifications**: Modern UX feedback pattern
- **CSS Custom Properties**: Centralized design system
- **Mobile-First Design**: Responsive from smallest screen up
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation, color-blind friendly

## 🚀 Future Enhancements

Potential features for future versions:

- **Export/Import**:
  - CSV export for spreadsheet analysis
  - JSON export/import for backups
  - Automatic cloud backup integration
- **Advanced Features**:
  - Custom alert thresholds per vendor/project
  - Categories/tags for grouping assets
  - Notes/comments field per asset
  - History log tracking all resets and edits
  - Email/webhook notifications for alerts
- **Multi-Team Support**:
  - Multi-country holiday calendars
  - Time zone support
  - Team/department filtering
- **Analytics**:
  - Dashboard with trends and metrics
  - Average turnaround time by vendor
  - SLA compliance reporting
- **UI Enhancements**:
  - Light mode theme toggle
  - Drag-and-drop reordering
  - Bulk operations (multi-select)
  - Customizable columns/fields

## 📄 License

This is a production tool. Use, modify, and distribute as needed for your workflow.

## 🤝 Contributing

To improve this tool:

1. **Fix bugs**: Test thoroughly before modifying
2. **Add features**: Follow existing architecture patterns
3. **Update holidays**: Maintain annual calendar
4. **Improve docs**: Keep README.md current

## 📞 Support

For issues or questions:

1. Check this README first
2. Review browser console for errors
3. Verify all files are present and correctly named
4. Test in a different browser to rule out browser-specific issues

---

**Built with professional architecture principles for production use** 🎉
