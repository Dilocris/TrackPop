# 🎬 Asset Review Tracker

A production-ready web application for tracking animation asset reviews from vendors. Monitor review times with visual alerts when assets exceed business day thresholds.

## 🎯 Features

- **Track Multiple Assets**: Monitor unlimited animation assets with vendor information
- **Business Day Calculations**: Automatically excludes weekends and US federal holidays
- **Visual Alerts**:
  - 🟠 Orange warning after 5 business days
  - 🔴 Red alert after 7 calendar days
- **Real-Time Search**: Filter assets by name, vendor, or fix release number
- **Dark Mode Design**: Eye-friendly interface for long production days
- **Persistent Data**: All data saved locally in your browser
- **Responsive Layout**: Works on desktop, tablet, and mobile

## 🚀 Getting Started

### Installation

1. **Download** all files to a local folder
2. **Open** `index.html` in your web browser
3. **Start tracking** your assets!

No server, no build process, no dependencies. Just open and use.

### Basic Usage

1. **Add an Asset**:
   - Enter asset name (required)
   - Enter vendor name (optional)
   - Enter fix release number with 2 decimals (e.g., 10.30)
   - Click "Add Asset"

2. **Search Assets**:
   - Type in the search bar to filter by name, vendor, or release number
   - Results update instantly as you type

3. **Reset Counter**:
   - Click "🔄 Reset Counter" on any asset card
   - Resets the day counter to 0 (when vendor sends new version)

4. **Delete Asset**:
   - Click ❌ on any asset card
   - Confirm deletion (cannot be undone)

## 📁 Project Structure

```
TrackPop/
├── index.html       # Main HTML structure and layout
├── styles.css       # Dark mode styling and design system
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
│  BUSINESS LOGIC LAYER                   │
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
  id: "1737642600000",              // Unique ID
  name: "Character_WalkCycle_v2",   // Asset name
  vendor: "Studio XYZ",             // Vendor/studio name
  fixRelease: "10.30",              // Fix release (2 decimals)
  startDate: "2026-01-23T14:30:00", // When tracking began
  lastReset: "2026-01-23T14:30:00", // Last counter reset
  createdAt: "2026-01-23T14:30:00"  // Original creation
}
```

Data is stored in **browser localStorage** under the key `"assetTracker"`.

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

## 📚 Learning Resources

This project demonstrates professional software architecture patterns:

- **Repository Pattern** (storage.js): Abstracts data access
- **Pure Functions** (dateUtils.js): Testable, predictable logic
- **Controller Pattern** (app.js): Coordinates between layers
- **CSS Custom Properties**: Centralized design system
- **Mobile-First Design**: Responsive from smallest screen up
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

## 🚀 Future Enhancements

Potential features for future versions:

- **Export to CSV**: Download asset data as spreadsheet
- **Custom Alert Thresholds**: Different SLAs per vendor
- **Categories/Tags**: Group assets by project or department
- **Notes Field**: Add comments per asset
- **History Log**: Track all resets with timestamps
- **Email Notifications**: Proactive alerts
- **Multi-Country Holidays**: Support international teams
- **Analytics Dashboard**: Visualize trends and metrics

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
