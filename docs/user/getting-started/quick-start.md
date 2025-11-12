# Quick Start Guide

Get up and running with IODD Manager in 5 minutes!

## Prerequisites Check

Before starting, verify you have the required tools:

```bash
python --version  # Should be 3.10+
node --version    # Should be 18+
git --version     # Should be 2.0+
```

## Quick Installation

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/ME-Catalyst/iodd-manager.git
cd iodd-manager

# Copy configuration
cp .env.example .env

# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..

# Run database migrations
alembic upgrade head
```

### 2. Start the Application

```bash
python start.py
```

The application will automatically:

- Start the API server on http://localhost:8000
- Start the frontend on http://localhost:3000
- Open your browser

## Your First IODD Import

### Step 1: Download Sample IODD File

For testing, you can use the sample IODD file from the test fixtures:

```bash
cp tests/fixtures/sample_device.xml ~/sample.xml
```

Or download an IODD file from [IO-Link Community](https://io-link.com/en/IODDfinder/IODDfinder.php).

### Step 2: Import via Web Interface

1. Open http://localhost:3000 in your browser
2. Click **"Upload IODD"** button
3. Select your IODD file (`sample.xml`)
4. Click **"Import"**

You should see a success message and the device appear in the dashboard!

### Step 3: Import via API

Alternatively, use the REST API:

```bash
curl -X POST http://localhost:8000/api/iodd/upload \
  -F "file=@sample.xml"
```

**Expected Response:**

```json
{
  "status": "success",
  "message": "IODD file imported successfully",
  "device": {
    "vendor_id": 12345,
    "device_id": 67890,
    "vendor_name": "Example Vendor",
    "device_name": "Example Device"
  }
}
```

## Basic Usage Workflows

### View All Devices

**Web Interface:**

1. Open http://localhost:3000
2. View the **Devices** tab
3. Click on any device to see details

**API:**

```bash
curl http://localhost:8000/api/devices
```

### Search for a Device

**Web Interface:**

1. Use the search bar at the top
2. Enter vendor name, device ID, or description
3. Results update in real-time

**API:**

```bash
# Search by vendor name
curl "http://localhost:8000/api/devices/search?vendor_name=Example"

# Search by device ID
curl "http://localhost:8000/api/devices/search?device_id=67890"
```

### Generate Node-RED Adapter

**Web Interface:**

1. Navigate to a device detail page
2. Select **"Node-RED"** as target platform
3. Click **"Generate Adapter"**
4. Download the generated JSON file

**API:**

```bash
curl -X POST http://localhost:8000/api/adapters/generate \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": 67890,
    "vendor_id": 12345,
    "target_platform": "nodered"
  }' \
  -o adapter.json
```

### View Device Parameters

**Web Interface:**

1. Click on a device
2. Navigate to the **"Parameters"** tab
3. View all configuration parameters with descriptions

**API:**

```bash
curl "http://localhost:8000/api/devices/12345/67890/parameters"
```

**Response:**

```json
{
  "parameters": [
    {
      "index": 1,
      "name": "Operating Mode",
      "access": "rw",
      "data_type": "UInt8",
      "default_value": "0",
      "description": "Device operating mode"
    }
  ]
}
```

## Next Steps

Now that you have IODD Manager running:

### Explore Features

- **[Web Interface Guide](../user-guide/web-interface.md)** - Learn all web UI features
- **[API Documentation](../api/overview.md)** - Explore REST API capabilities
- **[Adapter Generation](../user-guide/adapters.md)** - Generate adapters for different platforms

### Customize Configuration

- **[Configuration Guide](configuration.md)** - Customize ports, storage, logging
- **[Environment Variables](../deployment/environment.md)** - Production configuration

### Development Setup

- **[Developer Setup](../developer-guide/setup.md)** - Set up development environment
- **[Architecture Overview](../developer-guide/architecture.md)** - Understand the codebase
- **[Contributing Guide](../developer-guide/contributing.md)** - Contribute to the project

## Common Tasks

### Change Default Ports

Edit `.env` file:

```bash
API_PORT=9000
FRONTEND_PORT=4000
```

Restart the application:

```bash
python start.py
```

### Enable Debug Logging

Edit `.env` file:

```bash
DEBUG=true
LOG_LEVEL=DEBUG
```

### Export Database

```bash
# SQLite database location
cp iodd_manager.db iodd_manager_backup.db
```

### Clear All Data

```bash
# Delete database
rm iodd_manager.db

# Run migrations to recreate
alembic upgrade head
```

## Troubleshooting Quick Fixes

### Port Already in Use

```bash
# Kill processes on ports 8000 and 3000
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Database Locked Error

```bash
# Close all connections and restart
pkill -f "python api.py"
python start.py
```

### Frontend Not Loading

```bash
# Rebuild frontend
cd frontend
rm -rf node_modules dist
npm install
npm run build
cd ..
python start.py
```

### Import Validation Errors

Check that your IODD file:

- Is valid XML (use `xmllint --noout sample.xml` to validate)
- Has `.xml` or `.iodd` extension
- Is under 10MB in size
- Uses UTF-8 encoding

## Getting Help

- **[Full Documentation](../user-guide/web-interface.md)** - Comprehensive guides
- **[API Reference](../api/endpoints.md)** - Complete API documentation
- **[GitHub Issues](https://github.com/ME-Catalyst/iodd-manager/issues)** - Report bugs
- **[Contributing](../about/contributing.md)** - Get involved

## What's Next?

You're now ready to use IODD Manager! Here are some recommended next steps:

1. **Import your own IODD files** - Try with real device files
2. **Explore the API** - Visit http://localhost:8000/docs for interactive API docs
3. **Generate adapters** - Create Node-RED or custom platform adapters
4. **Customize configuration** - Adjust settings in `.env` for your needs
5. **Set up for production** - See [Deployment Guide](../deployment/production.md)

Happy IODD managing! 🚀
