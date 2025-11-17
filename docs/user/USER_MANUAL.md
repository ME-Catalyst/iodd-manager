# Greenstack User Manual

## Table of Contents
1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Configuration](#configuration)
4. [Using the Web Interface](#using-the-web-interface)
5. [Device Management](#device-management)
6. [Advanced Features](#advanced-features)

---

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+ (for frontend)
- npm or yarn

### Quick Installation

**Windows:**
```bash
setup.bat
```

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ME-Catalyst/greenstack.git
   cd greenstack
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Initialize the database:**
   ```bash
   python start.py --init-db
   ```

---

## Quick Start

### Starting the Application

**Option 1: All-in-one launcher (Recommended)**
```bash
python start.py
```

**Option 2: Separate processes**

Terminal 1 (Backend):
```bash
python api.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Access the Application
- **Web Interface:** http://localhost:5173
- **API Documentation:** http://localhost:8000/docs

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=sqlite:///./greenstack.db

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true

# Frontend
VITE_API_URL=http://localhost:8000

# Storage
IODD_STORAGE_PATH=./iodd_storage
MAX_UPLOAD_SIZE_MB=100

# Security (optional)
API_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Database Configuration

**SQLite (Default):**
```python
DATABASE_URL=sqlite:///./greenstack.db
```

**PostgreSQL:**
```python
DATABASE_URL=postgresql://user:password@localhost/greenstack
```

For detailed configuration options, see `CONFIGURATION.md`.

---

## Using the Web Interface

### Dashboard
- View device statistics
- Recent device imports
- Quick access to device library

### Device Library
- Browse all imported devices
- Search by name, manufacturer, or device ID
- Filter by vendor

### Importing Devices

**Single File Import:**
1. Click "Import Device"
2. Select an IODD or ZIP file
3. Wait for processing
4. View the imported device

**Multi-File Import:**
1. Click "Import Device"
2. Select multiple files
3. Files are processed sequentially
4. Progress displayed for each file

**Nested ZIP Import:**
- Supports ZIP files containing multiple device ZIPs
- Automatically extracts up to 1 level deep
- All devices imported in one operation

### Device Details Page

**Overview Tab:**
- Device identification
- Vendor information
- Hardware/firmware versions
- Device image gallery

**Parameters Tab:**
- All device parameters
- Search and filter
- Parameter details (type, range, default values)
- Export to CSV/JSON

**Menus Tab:**
- Interactive configuration interface
- Menu structure from IODD
- Parameter controls (dropdowns, sliders, text inputs)
- Read-only parameter indicators
- Configuration export

**Process Data Tab:**
- Input/output process data structures
- Record items and subindices
- Bit offsets and lengths

**Errors & Events Tabs:**
- Device error codes and descriptions
- Event definitions
- Diagnostic information

**XML Source Tab:**
- View raw IODD XML
- Copy to clipboard
- Syntax highlighting

### Device Management

**Delete Single Device:**
1. Open device details
2. Click "Delete Device"
3. Confirm deletion

**Bulk Delete:**
1. Select multiple devices (checkboxes)
2. Click "Delete Selected"
3. Confirm bulk deletion

**Reset Database:**
- Settings → Reset Database
- Removes all devices and data
- Cannot be undone

---

## Advanced Features

### Configuration Export
1. Open device Menus tab
2. Adjust parameter values
3. Name your configuration
4. Click "Export"
5. JSON file downloaded with all settings

### Asset Management
- Automatic image extraction from IODD
- High-resolution device photos
- Technical diagrams
- Icon assets
- Lightbox gallery view

### Search & Filter
- Full-text search across device names
- Filter by manufacturer
- Filter by device ID range
- Filter by IODD version

---

For troubleshooting and common issues, see [TROUBLESHOOTING.md](../troubleshooting/TROUBLESHOOTING.md).

For developer information, see [DEVELOPER_REFERENCE.md](../developer/DEVELOPER_REFERENCE.md).
