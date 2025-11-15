# Web Interface Guide

The IODD Manager web interface provides an intuitive way to manage IODD files, view device information, and generate adapters.

## Accessing the Interface

**Default URL**: http://localhost:3000

The web interface automatically opens when you run:

```bash
python start.py
```

## Dashboard Overview

### Main Components

The dashboard consists of several key areas:

```
┌─────────────────────────────────────────────────────┐
│  IODD Manager                    Search... 🔍 ⚙️   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📊 Statistics Cards                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Devices  │ │ Vendors  │ │ Adapters │           │
│  │   24     │ │    8     │ │    15    │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                      │
│  📋 Devices Table                                   │
│  ┌────────────────────────────────────────────┐    │
│  │ Vendor | Device | Name | Actions...        │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  📁 Upload Section                                  │
│  [ Upload IODD File ]                              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Navigation Tabs

- **Dashboard**: Overview and statistics
- **Devices**: List and manage all devices
- **Adapters**: View and generate adapters
- **Settings**: Configure application

## Uploading IODD Files

### Via Drag & Drop

1. Navigate to the **Dashboard** or **Devices** tab
2. Locate the **Upload** area (dashed border)
3. Drag an IODD file (`.xml` or `.iodd`) from your file manager
4. Drop it in the upload area
5. Wait for upload confirmation

### Via File Picker

1. Click the **"Upload IODD"** button
2. Browse to your IODD file
3. Select the file and click **Open**
4. Wait for upload confirmation

### Upload Validation

The interface validates:

- **File size**: Maximum 10MB
- **File type**: Must be `.xml` or `.iodd`
- **File content**: Must be valid XML with IODD structure
- **Encoding**: Must be UTF-8

**Success Message:**

```
✅ IODD file uploaded successfully!
Device: Example Sensor (Vendor: 12345, Device: 67890)
```

**Error Messages:**

```
❌ File too large (max 10MB)
❌ Invalid file type (must be .xml or .iodd)
❌ Invalid IODD format
❌ Upload failed: [error message]
```

## Viewing Devices

### Devices List

The main devices table shows:

| Column | Description |
|--------|-------------|
| **Vendor ID** | IO-Link vendor identifier |
| **Device ID** | Device identifier |
| **Vendor Name** | Manufacturer name |
| **Device Name** | Product name |
| **Version** | IODD file version |
| **Actions** | View, Generate, Delete |

### Filtering and Search

**Search Bar:**

Type in the search bar to filter by:

- Vendor name
- Device name
- Vendor ID
- Device ID
- Description

**Example searches:**

```
"ifm"           → Shows all ifm electronic devices
"sensor"        → Shows all devices with "sensor" in name
"12345"         → Shows devices with vendor ID 12345
"temperature"   → Shows devices mentioning temperature
```

### Sorting

Click column headers to sort:

- **Vendor ID**: Ascending/Descending
- **Device ID**: Ascending/Descending
- **Name**: Alphabetical
- **Date Added**: Newest/Oldest

### Pagination

Navigate through devices:

- **Items per page**: 10, 25, 50, 100
- **Navigation**: Previous, Next, specific page
- **Total count**: "Showing 1-25 of 124 devices"

## Device Details View

Click on any device to view detailed information.

### Information Tabs

#### 1. Overview Tab

**Basic Information:**

- Vendor Name and ID
- Device Name and ID
- Product Text (description)
- IODD Version
- Release Date

**Device Capabilities:**

- Supported profiles (Device, Smart Sensor, etc.)
- Communication features
- Process data length
- Parameter count

**Visual Preview:**

- Device icon (if available)
- 3D model (if available)
- Device photo

#### 2. Parameters Tab

View all configuration parameters:

```
┌────────────────────────────────────────────────────┐
│ Parameter: Operating Mode                          │
├────────────────────────────────────────────────────┤
│ Index:        1                                    │
│ Access:       Read/Write                           │
│ Data Type:    UInt8                               │
│ Default:      0                                    │
│ Range:        0-3                                  │
│ Description:  Selects device operating mode        │
│               0: Off                               │
│               1: Normal                            │
│               2: Advanced                          │
│               3: Diagnostic                        │
└────────────────────────────────────────────────────┘
```

**Parameter Properties:**

- Index (parameter number)
- Name
- Access rights (Read-only, Write-only, Read/Write)
- Data type (UInt8, Int16, String, etc.)
- Default value
- Min/Max values (if applicable)
- Unit (mm, °C, bar, etc.)
- Description and enum values

**Actions:**

- 🔍 **View Details**: Expand parameter information
- 📋 **Copy**: Copy parameter definition
- 📥 **Export**: Export all parameters to JSON/CSV

#### 3. Process Data Tab

View input/output process data:

**Process Data In (Input from device):**

```
Bit 0-7:   Temperature Value (Int16)
Bit 8-15:  Pressure Value (UInt8)
Bit 16:    Alarm Flag (Boolean)
Bit 17-23: Reserved
```

**Process Data Out (Output to device):**

```
Bit 0-7:   Setpoint Value (UInt8)
Bit 8:     Enable Flag (Boolean)
Bit 9-15:  Reserved
```

**Visual Representation:**

- Bit layout diagram
- Data type indicators
- Value ranges
- Update rates

#### 4. Events Tab

View device events and diagnostics:

- **Error Events**: Fault codes and descriptions
- **Warning Events**: Non-critical warnings
- **Info Events**: Status notifications

Example:

```
Event 0x8000: Temperature Too High
  Severity: Error
  Description: Measured temperature exceeds maximum threshold
  Recovery: Reduce ambient temperature or check calibration

Event 0x0001: Normal Operation
  Severity: Info
  Description: Device operating normally
```

#### 5. Identification Tab

View device identification:

- Product Name
- Product ID
- Product Text
- Hardware/Software Revision
- Serial Number format
- Application Specific Tag

#### 6. Raw IODD Tab

View the original IODD XML:

- Syntax-highlighted XML
- Collapsible sections
- Search within XML
- Copy to clipboard
- Download original file

## Generating Adapters

### Quick Generation

From the devices list or device details:

1. Click **"Generate Adapter"** button
2. Select target platform:
   - **Node-RED**: JSON flow configuration
   - **Python**: Python class
   - **Custom**: Template-based
3. Click **"Generate"**
4. Download generated file

### Advanced Generation

1. Navigate to **Adapters** tab
2. Click **"New Adapter"**
3. Configure options:

```
┌────────────────────────────────────────────────────┐
│ Generate Adapter                                    │
├────────────────────────────────────────────────────┤
│ Device:         [Select Device ▼]                  │
│ Platform:       [Node-RED ▼]                       │
│                                                     │
│ Options:                                           │
│   ☑ Include all parameters                        │
│   ☑ Include process data handlers                 │
│   ☐ Include event handlers                        │
│   ☐ Add example usage code                        │
│                                                     │
│ Output Format:  [JSON ▼]                           │
│                                                     │
│         [Cancel]  [Generate & Download]            │
└────────────────────────────────────────────────────┘
```

4. Click **"Generate & Download"**

### Adapter Templates

**Node-RED Adapter:**

Generates a complete Node-RED node with:

- Device configuration
- Parameter access functions
- Process data parsing
- Event handling
- UI forms

**Python Adapter:**

Generates a Python class with:

- Device interface
- Type-safe parameter access
- Process data structures
- Event callbacks
- Documentation strings

**Custom Adapter:**

Uses user-defined templates with variables:

- `{{device_name}}`
- `{{vendor_id}}`
- `{{parameters}}`
- `{{process_data}}`

## Settings

### Application Settings

Configure application behavior:

```
┌────────────────────────────────────────────────────┐
│ Settings                                            │
├────────────────────────────────────────────────────┤
│ Appearance:                                        │
│   Theme:          [Light ▼] [Dark] [Auto]         │
│   Language:       [English ▼]                      │
│                                                     │
│ Upload:                                            │
│   Max File Size:  [10 MB ▼]                        │
│   Auto-validate:  [✓]                             │
│                                                     │
│ Display:                                           │
│   Items per page: [25 ▼]                           │
│   Date format:    [YYYY-MM-DD ▼]                   │
│                                                     │
│ Advanced:                                          │
│   Enable debug:   [  ]                            │
│   API endpoint:   [http://localhost:8000/api]     │
│                                                     │
│         [Reset to Defaults]  [Save Changes]        │
└────────────────────────────────────────────────────┘
```

### Theme Customization

Choose between:

- **Light Mode**: Default light theme
- **Dark Mode**: Dark theme for low-light environments
- **Auto**: Matches system preference

### Export Settings

Export configuration:

```bash
# Download settings as JSON
{
  "theme": "dark",
  "itemsPerPage": 25,
  "language": "en",
  "maxUploadSize": 10485760
}
```

Import settings:

1. Click **"Import Settings"**
2. Select settings JSON file
3. Confirm import

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+U` | Upload IODD file |
| `Ctrl+F` | Focus search bar |
| `Ctrl+K` | Open command palette |
| `/` | Focus search (when not in input) |
| `Escape` | Close dialogs |
| `Enter` | Confirm actions |
| `Arrow Up/Down` | Navigate list |
| `Ctrl+Click` | Open in new tab |

## Responsive Design

The interface adapts to different screen sizes:

### Desktop (>1024px)

- Full sidebar navigation
- Multi-column layouts
- Expanded tables
- Side-by-side panels

### Tablet (768px - 1024px)

- Collapsible sidebar
- Two-column layouts
- Scrollable tables
- Stacked panels

### Mobile (<768px)

- Bottom navigation
- Single-column layout
- Card-based views
- Touch-optimized controls

## Accessibility Features

- **Keyboard navigation**: Full keyboard support
- **Screen reader**: ARIA labels and descriptions
- **High contrast**: Enhanced contrast mode
- **Focus indicators**: Clear focus states
- **Text scaling**: Respects browser text size

## Troubleshooting

### Interface Not Loading

**Check API connection:**

1. Open browser console (F12)
2. Look for network errors
3. Verify API is running: http://localhost:8000/api/health

**Solution:**

```bash
# Restart API server
python api.py
```

### Upload Fails

**Check browser console for errors:**

Common issues:

- File too large (>10MB)
- Invalid file format
- CORS error (API not accessible)

**Solution:**

```bash
# Check .env configuration
cat .env | grep CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Slow Performance

**Optimize:**

- Clear browser cache (Ctrl+Shift+Delete)
- Reduce items per page
- Disable debug mode
- Use production build

### Data Not Updating

**Force refresh:**

- Press Ctrl+F5 (hard reload)
- Clear service worker cache
- Check API logs for errors

## Best Practices

### Organizing Devices

- Use consistent naming conventions
- Group devices by vendor or application
- Tag devices with categories (future feature)
- Export device lists regularly

### Adapter Management

- Generate adapters with descriptive names
- Include version numbers
- Document custom modifications
- Store adapters in version control

### Performance Tips

- Limit displayed items on large datasets
- Use search/filter instead of scrolling
- Close unused device detail tabs
- Clear browser cache periodically

## Next Steps

- **[CLI Usage](cli.md)** - Use command-line interface
- **[API Guide](api.md)** - Access via REST API
- **[Adapter Guide](adapters.md)** - Learn about adapter generation
- **[API Reference](../../developer/api/overview.md)** - Complete API documentation
