# User Features Guide

## Overview

GreenStack provides a comprehensive set of features for managing IO-Link (IODD) and EtherNet/IP (EDS) device configurations through an intuitive web interface.

## Table of Contents

- [Theme System](#theme-system)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Analytics Dashboard](#analytics-dashboard)
- [Device Management](#device-management)
- [Search & Filtering](#search--filtering)
- [Device Comparison](#device-comparison)
- [File Upload & Import](#file-upload--import)
- [Export Capabilities](#export-capabilities)
- [Ticket System](#ticket-system)
- [IoT Platform Integration](#iot-platform-integration)

---

## Theme System

### Dark/Light Theme Toggle

GreenStack features a sophisticated theme system that adapts to your preferences.

**Features:**
- 🌓 **Automatic Detection** - Detects system preference on first launch
- 💾 **Persistence** - Remembers your choice in browser storage
- 🎨 **Manual Override** - Toggle between light and dark modes anytime
- ⚡ **Instant Switch** - Smooth transitions with no page reload

**How to Use:**

1. **Find the theme toggle button** in the sidebar footer
   - Sun icon = Light mode
   - Moon icon = Dark mode

2. **Click to toggle** between themes

3. **Keyboard shortcut**: Press `Ctrl+Shift+T`

**System Integration:**
- First visit: Automatically matches your OS preference
- Manual change: Overrides system preference
- Stored in browser: Preference persists across sessions

---

## Keyboard Shortcuts

### Quick Navigation & Actions

Boost productivity with comprehensive keyboard shortcuts for all major actions.

**Navigation Shortcuts:**
- `h` - Go to Overview/Home
- `d` - Go to Devices
- `s` - Go to Search
- `c` - Go to Compare
- `a` - Go to Analytics

**Action Shortcuts:**
- `Ctrl+U` - Upload File
- `Ctrl+Shift+T` - Toggle Theme
- `Ctrl+R` - Refresh Data
- `/` - Focus Search (when available)
- `Escape` - Clear Search / Close Modal

**Help:**
- `Shift+?` - Show Keyboard Shortcuts Help

### Keyboard Shortcuts Help Modal

Press `Shift+?` to view all available shortcuts in an interactive modal.

**Features:**
- Categorized by function (Navigation, Actions, Search, Help)
- Visual keyboard key representations
- Dark theme styling
- Quick reference guide

**Usage Notes:**
- Shortcuts are disabled when typing in input fields
- Navigation shortcuts work from any page
- Action shortcuts require appropriate context

---

## Analytics Dashboard

### Data Visualization & Insights

Comprehensive analytics dashboard with rich visualizations powered by Chart.js.

**Access:** Click "Analytics" in the sidebar or press `a`

### Summary Metrics

Four key metric cards at the top:
1. **Total Devices** - Count with trend indicator
2. **Total Parameters** - Across all devices
3. **EDS Files** - Number of imported configurations
4. **Manufacturers** - Unique vendor count

### Chart Tabs

#### 1. Overview Tab
- **I/O Type Distribution** (Doughnut Chart)
  - Digital devices
  - Analog devices
  - Mixed I/O devices
  - Unknown type

- **Parameters per Device** (Bar Chart)
  - 0-10 parameters
  - 11-50 parameters
  - 51-100 parameters
  - 100+ parameters

#### 2. Devices Tab
- **Top Manufacturers** (Bar Chart)
  - Shows top 10 manufacturers
  - Device count per manufacturer
  - Helps identify vendor diversity

#### 3. Parameters Tab
- **Data Type Distribution** (Pie Chart)
  - Top 10 parameter data types
  - Frequency analysis
  - Type diversity visualization

#### 4. EDS Tab
- **EDS Vendors** (Bar Chart)
  - Top 10 EDS file vendors
  - Distribution analysis
  - Multi-vendor support overview

### Time Range Selector

Filter analytics by time period:
- Last 7 days
- Last 30 days
- Last 90 days
- Last year

*Note: Time filtering is prepared for future enhancements with import timestamps*

### Chart Interactions
- **Hover** - View exact values
- **Responsive** - Adapts to screen size
- **Dark Theme** - Optimized colors for both themes

---

## Device Management

### IO-Link (IODD) Devices

#### Device List View

Browse all imported IODD devices:
- **Card View** - Visual grid with device icons
- **List View** - Compact table format
- **Search** - Filter by name, manufacturer, or model
- **Sort** - By name, manufacturer, date added

#### Device Details

Click any device to view:
1. **Overview Tab**
   - Device metadata (manufacturer, product name, version)
   - Technical specifications
   - Device icon/image
   - Recent activity

2. **Parameters Tab**
   - Complete parameter list
   - Data types and access rights
   - Default values
   - Units and ranges
   - Search and filter parameters

3. **Process Data Tab**
   - Input/Output mappings
   - Bit field visualizations
   - Data structure diagrams

4. **Menus Tab**
   - Interactive menu rendering
   - Parameter configuration
   - Value validation

5. **3D View Tab** (if available)
   - Three.js 3D device model
   - Rotate and zoom controls
   - Connection point visualization

### EtherNet/IP (EDS) Files

#### EDS List View

Manage EDS device configurations:
- **Grid Layout** - Device cards with icons
- **Vendor Filter** - Filter by manufacturer
- **Search** - Find by product name or code
- **Bulk Actions** - Multi-select operations

#### EDS Details

View comprehensive EDS information:
1. **Overview Tab**
   - Vendor and product information
   - Revision details
   - Catalog number
   - Device diagnostics

2. **Parameters Tab**
   - Searchable parameter table
   - 284+ parameters displayed
   - Type, access, and default values
   - Real-time search filtering

3. **Connections Tab**
   - Network connection configurations
   - Assembly instances
   - Connection types and paths

4. **Capacity Tab**
   - Visual capacity gauges
   - Network planning metrics
   - I/O point usage
   - Connection limits

5. **Raw Content Tab**
   - Complete EDS file content
   - Copy-to-clipboard functionality
   - Syntax preservation

---

## Search & Filtering

### Universal Search

**Access:** Click "Search" in sidebar or press `s`

#### Search Capabilities

1. **Device Search**
   - Search by manufacturer
   - Search by product name
   - Search by device ID
   - Search by version

2. **EDS File Search**
   - Vendor name search
   - Product code search
   - Catalog number search

3. **Parameter Search**
   - Parameter name matching
   - Data type filtering
   - Value range search

#### Advanced Filters

- **Manufacturer Filter** - Select from available vendors
- **Type Filter** - IODD vs EDS files
- **Date Range** - Filter by import date
- **Status Filter** - Active, archived, etc.

#### Search Results

- **Instant Results** - Real-time as you type
- **Highlighting** - Matched terms highlighted
- **Quick Actions** - View, compare, export from results
- **Result Count** - Shows number of matches

---

## Device Comparison

### Side-by-Side Analysis

**Access:** Click "Compare" in sidebar or press `c`

#### Comparison Features

1. **Select Devices**
   - Choose 2-4 devices to compare
   - Mix IODD and EDS files
   - Visual selection interface

2. **Comparison View**
   - **Specifications Table**
     - Manufacturer
     - Model/Product name
     - Firmware version
     - Physical dimensions

   - **Parameter Comparison**
     - Matching parameters highlighted
     - Differences color-coded
     - Missing parameters shown

   - **I/O Comparison**
     - Input/Output counts
     - Data types
     - Communication specs

3. **Difference Highlighting**
   - 🟢 Green - Matching values
   - 🔴 Red - Different values
   - ⚪ Gray - Missing in one device

4. **Export Comparison**
   - Export as PDF
   - Export as Excel
   - Share comparison link

---

## File Upload & Import

### Supported Formats

#### IODD Files
- `.xml` - Single IODD XML files
- `.zip` - IODD packages with resources
- `.iodd` - IODD archive format

#### EDS Files
- `.eds` - Electronic Data Sheet files
- `.zip` - EDS packages with icons/docs
- Nested ZIP archives supported

### Upload Methods

#### 1. Drag & Drop
- Drag files directly onto the upload area
- Visual feedback during drag
- Batch upload multiple files

#### 2. File Browser
- Click "Upload File" button
- Browse and select files
- Multi-select supported

#### 3. Folder Upload
- Upload entire folder structures
- Preserves directory hierarchy
- Automatic nested ZIP handling

#### 4. Keyboard Shortcut
- Press `Ctrl+U` to open upload dialog

### Upload Process

1. **File Validation**
   - Format check
   - Size validation
   - Duplicate detection

2. **Parsing**
   - XML parsing and validation
   - Resource extraction
   - Metadata indexing

3. **Storage**
   - Database insertion
   - File system storage
   - Index generation

4. **Feedback**
   - Progress indicators
   - Success notifications
   - Error reporting with details

### Bulk Import

Upload multiple files at once:
- Progress tracking per file
- Parallel processing
- Error isolation (one failure doesn't stop others)
- Summary report after completion

---

## Export Capabilities

### Export Formats

#### JSON Export
- Complete device data
- All parameters and metadata
- Human-readable format
- API-friendly structure

#### ZIP Export
- Device configuration
- All related assets (icons, docs)
- Proper filename handling
- Ready for re-import

### Export Options

#### Single Device Export
1. Open device details
2. Click "Export" button
3. Choose format (JSON or ZIP)
4. Download starts automatically

#### Bulk Export
1. Select multiple devices (checkbox)
2. Click "Export Selected"
3. Choose format
4. Downloads as single archive

### Export Features

- **Metadata Preservation** - All information retained
- **Asset Inclusion** - Icons, images, documents included
- **Proper Naming** - Descriptive filenames
- **Cross-Platform** - Works on all operating systems

---

## Ticket System

### Issue Tracking & Support

Built-in ticket system for device-related issues and support requests.

**Access:** Click ticket icon in device details or sidebar

### Creating Tickets

1. **Click "Create Ticket"**
2. **Fill in details:**
   - Title (required)
   - Description (required)
   - Priority (Low, Medium, High, Critical)
   - Category (Bug, Feature, Question, Documentation)
   - Related device (auto-filled if from device view)

3. **Add attachments** (optional)
   - Screenshots
   - Log files
   - Configuration files

4. **Submit**

### Managing Tickets

#### Ticket List
- **Filter by status:** Open, In Progress, Resolved, Closed
- **Filter by priority:** All, Critical, High, Medium, Low
- **Search tickets:** By title, description, or ID
- **Sort options:** Date, priority, status

#### Ticket Details
- **Status tracking** - Visual status badges
- **Comments** - Add notes and updates
- **Attachments** - View uploaded files
- **History** - Complete audit trail
- **Assignment** - Assign to team members

### Ticket Statuses

- 🆕 **Open** - Newly created, awaiting review
- 🔄 **In Progress** - Being worked on
- ✅ **Resolved** - Solution provided
- 🔒 **Closed** - Completed and verified

---

## IoT Platform Integration

### Industrial IoT Stack

GreenStack includes a complete IoT platform stack for future device connectivity.

**Components:**
- 📡 **MQTT Broker** (Eclipse Mosquitto)
- 📈 **Grafana** (Visualization)
- 🔄 **Node-RED** (Automation)
- 💾 **InfluxDB** (Time-series storage)

### Accessing IoT Services

#### MQTT Manager
1. Click "MQTT" in sidebar
2. View broker status
3. Configure topics
4. Monitor connections
5. View message statistics

#### Grafana Dashboards
1. Click "Grafana" in sidebar
2. View pre-configured dashboards
3. Create custom visualizations
4. Set up alerts
5. Export dashboard configurations

#### Node-RED Workflows
1. Click "Node-RED" in sidebar
2. Access visual flow editor
3. Create automation workflows
4. Connect to devices
5. Deploy and monitor flows

#### InfluxDB Storage
1. Click "InfluxDB" in sidebar
2. View database status
3. Query time-series data
4. Manage retention policies
5. Export historical data

### Future Capabilities

These services are **ready and configured** for:
- Real-time device connectivity
- Telemetry data collection
- Automated workflows
- Historical data analysis
- Custom dashboard creation
- Alert and notification systems

*Note: Device connectivity features are planned for future releases*

---

## Tips & Best Practices

### Performance

1. **Use Search** - Don't browse through hundreds of devices manually
2. **Favorites** - Star frequently used devices
3. **Keyboard Shortcuts** - Learn the main shortcuts for speed
4. **Filters** - Narrow results before searching

### Organization

1. **Naming Conventions** - Use consistent naming for custom labels
2. **Tags** - Add tags to devices for easy categorization
3. **Groups** - Organize related devices into groups
4. **Regular Cleanup** - Archive unused devices

### Data Quality

1. **Verify Uploads** - Check device details after import
2. **Update Metadata** - Keep device information current
3. **Document Changes** - Use tickets to track modifications
4. **Backup Exports** - Regularly export critical configurations

### Collaboration

1. **Share Comparisons** - Export comparison results for team review
2. **Use Tickets** - Track issues and feature requests
3. **Comment Liberally** - Add notes for context
4. **Export Reports** - Generate analytics for stakeholders

---

## Keyboard Shortcuts Quick Reference

### Navigation
| Shortcut | Action |
|----------|--------|
| `h` | Overview/Home |
| `d` | Devices |
| `s` | Search |
| `c` | Compare |
| `a` | Analytics |

### Actions
| Shortcut | Action |
|----------|--------|
| `Ctrl+U` | Upload File |
| `Ctrl+Shift+T` | Toggle Theme |
| `Ctrl+R` | Refresh Data |
| `/` | Focus Search |
| `Escape` | Clear/Close |
| `Shift+?` | Show Help |

---

## Getting Help

- **Keyboard Shortcuts:** Press `Shift+?`
- **Documentation:** Visit `/docs` folder
- **Troubleshooting:** See [TROUBLESHOOTING.md](../troubleshooting/TROUBLESHOOTING.md)
- **API Reference:** Available at `/docs` endpoint when running
- **GitHub Issues:** [Report bugs or request features](https://github.com/ME-Catalyst/greenstack/issues)

---

## Version Information

This guide is current as of GreenStack v2.0+

For the latest features and updates, see [CHANGELOG.md](../../CHANGELOG.md)
