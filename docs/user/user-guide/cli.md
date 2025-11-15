# Command-Line Interface (CLI)

Use IODD Manager from the command line for automation, scripting, and headless operations.

## Basic Usage

```bash
# Import IODD file
python iodd_manager.py import device.xml

# List all devices
python iodd_manager.py list

# Generate adapter
python iodd_manager.py generate 12345 67890 nodered
```

## Commands Reference

### `import` - Import IODD File

Import an IODD file into the database.

**Syntax:**

```bash
python iodd_manager.py import <file_path> [options]
```

**Options:**

- `--validate-only`: Validate without importing
- `--force`: Overwrite existing device
- `--quiet`: Suppress output
- `--json`: Output in JSON format

**Examples:**

```bash
# Basic import
python iodd_manager.py import sensor.xml

# Validate without importing
python iodd_manager.py import sensor.xml --validate-only

# Force overwrite existing device
python iodd_manager.py import sensor.xml --force

# JSON output for scripting
python iodd_manager.py import sensor.xml --json
```

**Output:**

```
Importing IODD file: sensor.xml
✓ Validation passed
✓ Extracted device info: ifm electronic Temperature Sensor
✓ Imported device: Vendor 12345, Device 67890
✓ Saved 15 parameters
✓ Import completed successfully
```

**JSON Output:**

```json
{
  "status": "success",
  "device": {
    "vendor_id": 12345,
    "device_id": 67890,
    "vendor_name": "ifm electronic",
    "device_name": "Temperature Sensor",
    "version": "1.1.0"
  },
  "parameters_count": 15,
  "file_path": "iodd_storage/vendor_12345/device_67890.xml"
}
```

### `list` - List Devices

List all imported devices.

**Syntax:**

```bash
python iodd_manager.py list [options]
```

**Options:**

- `--vendor <id>`: Filter by vendor ID
- `--format <table|json|csv>`: Output format
- `--sort <field>`: Sort by field
- `--limit <n>`: Limit results

**Examples:**

```bash
# List all devices
python iodd_manager.py list

# Filter by vendor
python iodd_manager.py list --vendor 12345

# JSON output
python iodd_manager.py list --format json

# CSV export
python iodd_manager.py list --format csv > devices.csv

# Sort by device name
python iodd_manager.py list --sort device_name

# Limit to 10 devices
python iodd_manager.py list --limit 10
```

**Table Output:**

```
┌──────────┬───────────┬──────────────────┬────────────────────────┬─────────┐
│ Vendor   │ Device    │ Vendor Name      │ Device Name            │ Version │
├──────────┼───────────┼──────────────────┼────────────────────────┼─────────┤
│ 12345    │ 67890     │ ifm electronic   │ Temperature Sensor     │ 1.1.0   │
│ 12345    │ 67891     │ ifm electronic   │ Pressure Sensor        │ 1.0.2   │
│ 23456    │ 11111     │ Siemens          │ Proximity Switch       │ 2.0.0   │
└──────────┴───────────┴──────────────────┴────────────────────────┴─────────┘
Total: 3 devices
```

### `show` - Show Device Details

Display detailed information about a specific device.

**Syntax:**

```bash
python iodd_manager.py show <vendor_id> <device_id> [options]
```

**Options:**

- `--parameters`: Show all parameters
- `--process-data`: Show process data layout
- `--events`: Show device events
- `--raw`: Show raw IODD XML
- `--json`: Output in JSON format

**Examples:**

```bash
# Show device overview
python iodd_manager.py show 12345 67890

# Show with parameters
python iodd_manager.py show 12345 67890 --parameters

# Show process data layout
python iodd_manager.py show 12345 67890 --process-data

# JSON output
python iodd_manager.py show 12345 67890 --json
```

**Output:**

```
Device Information:
  Vendor ID:    12345
  Device ID:    67890
  Vendor:       ifm electronic
  Device:       Temperature Sensor
  Version:      1.1.0
  Release Date: 2024-05-15

Capabilities:
  Profile:      Device
  Parameters:   15
  Process Data: 4 bytes in, 2 bytes out
  Events:       8 defined

Description:
  High-precision temperature sensor with IO-Link interface.
  Measuring range: -40°C to +150°C
  Accuracy: ±0.5°C
```

### `generate` - Generate Adapter

Generate platform-specific adapter code.

**Syntax:**

```bash
python iodd_manager.py generate <vendor_id> <device_id> <platform> [options]
```

**Platforms:**

- `nodered`: Node-RED flow
- `python`: Python class
- `cpp`: C++ class
- `custom`: Custom template

**Options:**

- `--output <file>`: Output file path
- `--template <file>`: Custom template file
- `--include-params`: Include parameter definitions
- `--include-events`: Include event handlers
- `--format <json|xml|code>`: Output format

**Examples:**

```bash
# Generate Node-RED adapter
python iodd_manager.py generate 12345 67890 nodered

# Generate with custom output path
python iodd_manager.py generate 12345 67890 python --output sensor_adapter.py

# Generate with all features
python iodd_manager.py generate 12345 67890 nodered --include-params --include-events

# Use custom template
python iodd_manager.py generate 12345 67890 custom --template my_template.j2
```

**Output:**

```
Generating adapter for device 12345/67890...
✓ Loaded device information
✓ Generated Node-RED flow
✓ Saved to: generated/nodered_12345_67890.json
✓ Adapter generation complete

Import into Node-RED:
  Menu → Import → Clipboard → Paste file contents
```

### `search` - Search Devices

Search for devices by various criteria.

**Syntax:**

```bash
python iodd_manager.py search <query> [options]
```

**Options:**

- `--field <field>`: Search specific field (vendor_name, device_name, description)
- `--format <table|json>`: Output format
- `--limit <n>`: Limit results

**Examples:**

```bash
# Search by vendor name
python iodd_manager.py search "ifm"

# Search device names only
python iodd_manager.py search "sensor" --field device_name

# Search with JSON output
python iodd_manager.py search "temperature" --json

# Limit results
python iodd_manager.py search "sensor" --limit 5
```

### `export` - Export Data

Export devices or database to various formats.

**Syntax:**

```bash
python iodd_manager.py export <format> [options]
```

**Formats:**

- `json`: JSON export
- `csv`: CSV export
- `xml`: XML export
- `sql`: SQL dump

**Options:**

- `--output <file>`: Output file path
- `--vendor <id>`: Export specific vendor
- `--include-iodd`: Include original IODD files

**Examples:**

```bash
# Export all devices to JSON
python iodd_manager.py export json --output devices.json

# Export to CSV
python iodd_manager.py export csv --output devices.csv

# Export specific vendor
python iodd_manager.py export json --vendor 12345 --output ifm_devices.json

# SQL dump
python iodd_manager.py export sql --output backup.sql
```

### `delete` - Delete Device

Remove a device from the database.

**Syntax:**

```bash
python iodd_manager.py delete <vendor_id> <device_id> [options]
```

**Options:**

- `--force`: Skip confirmation
- `--keep-files`: Don't delete IODD file
- `--json`: Output in JSON format

**Examples:**

```bash
# Delete device (with confirmation)
python iodd_manager.py delete 12345 67890

# Force delete without confirmation
python iodd_manager.py delete 12345 67890 --force

# Delete but keep IODD file
python iodd_manager.py delete 12345 67890 --keep-files
```

**Output:**

```
⚠ WARNING: This will delete device 12345/67890
  Device: ifm electronic Temperature Sensor
  IODD file: iodd_storage/vendor_12345/device_67890.xml
  Parameters: 15
  Generated adapters: 2

Are you sure? (y/N): y
✓ Deleted device from database
✓ Deleted IODD file
✓ Device deleted successfully
```

### `validate` - Validate IODD File

Validate an IODD file without importing.

**Syntax:**

```bash
python iodd_manager.py validate <file_path> [options]
```

**Options:**

- `--strict`: Enable strict validation
- `--json`: Output in JSON format
- `--verbose`: Show detailed validation info

**Examples:**

```bash
# Basic validation
python iodd_manager.py validate sensor.xml

# Strict validation
python iodd_manager.py validate sensor.xml --strict

# Verbose output
python iodd_manager.py validate sensor.xml --verbose

# JSON output
python iodd_manager.py validate sensor.xml --json
```

**Output:**

```
Validating IODD file: sensor.xml
✓ File exists and is readable
✓ Valid XML structure
✓ Root element is IODevice
✓ Required elements present: DeviceIdentity, ProcessDataCollection
✓ Vendor ID: 12345
✓ Device ID: 67890
✓ Version: 1.1.0

Validation passed: No errors found
```

### `batch` - Batch Import

Import multiple IODD files at once.

**Syntax:**

```bash
python iodd_manager.py batch <directory> [options]
```

**Options:**

- `--recursive`: Include subdirectories
- `--pattern <glob>`: File pattern (default: *.xml)
- `--continue-on-error`: Don't stop on errors
- `--report <file>`: Save import report

**Examples:**

```bash
# Import all XML files in directory
python iodd_manager.py batch iodd_files/

# Recursive import
python iodd_manager.py batch iodd_files/ --recursive

# Custom pattern
python iodd_manager.py batch iodd_files/ --pattern "*.iodd"

# Continue on errors with report
python iodd_manager.py batch iodd_files/ --continue-on-error --report import_report.txt
```

**Output:**

```
Batch import from: iodd_files/
Found 25 IODD files

Importing files...
✓ sensor1.xml (12345/67890)
✓ sensor2.xml (12345/67891)
✗ invalid.xml (Validation failed: Missing DeviceIdentity)
✓ sensor3.xml (23456/11111)
...

Batch import completed:
  Successful: 22
  Failed: 3
  Total: 25

See import_report.txt for details
```

## Scripting Examples

### Automated Import Script

```bash
#!/bin/bash
# import_iodd_files.sh

IODD_DIR="$1"
REPORT_FILE="import_report_$(date +%Y%m%d_%H%M%S).txt"

echo "Starting batch import from $IODD_DIR"

python iodd_manager.py batch "$IODD_DIR" \
  --recursive \
  --continue-on-error \
  --report "$REPORT_FILE" \
  --json > import_results.json

# Check results
if [ $? -eq 0 ]; then
  echo "Import completed successfully"
  echo "Report saved to: $REPORT_FILE"
else
  echo "Import failed"
  exit 1
fi
```

### Device Inventory Script

```python
#!/usr/bin/env python3
# device_inventory.py

import subprocess
import json

# Get all devices
result = subprocess.run(
    ["python", "iodd_manager.py", "list", "--format", "json"],
    capture_output=True,
    text=True
)

devices = json.loads(result.stdout)

# Group by vendor
vendors = {}
for device in devices:
    vendor = device['vendor_name']
    if vendor not in vendors:
        vendors[vendor] = []
    vendors[vendor].append(device)

# Print inventory
print("Device Inventory Report")
print("=" * 60)
for vendor, vendor_devices in vendors.items():
    print(f"\n{vendor}: {len(vendor_devices)} devices")
    for device in vendor_devices:
        print(f"  - {device['device_name']} ({device['device_id']})")
```

### Adapter Generation Script

```bash
#!/bin/bash
# generate_all_adapters.sh

# Get all device IDs
python iodd_manager.py list --format csv | tail -n +2 | while IFS=',' read -r vendor device rest; do
  echo "Generating adapter for $vendor/$device"

  python iodd_manager.py generate "$vendor" "$device" nodered \
    --output "adapters/nodered_${vendor}_${device}.json" \
    --include-params \
    --include-events

  if [ $? -eq 0 ]; then
    echo "✓ Generated adapter for $vendor/$device"
  else
    echo "✗ Failed to generate adapter for $vendor/$device"
  fi
done

echo "Adapter generation complete"
```

## Environment Variables

Configure CLI behavior with environment variables:

```bash
# Database location
export IODD_DATABASE_URL=sqlite:///./iodd_manager.db

# Storage directories
export IODD_STORAGE_DIR=./iodd_storage
export GENERATED_OUTPUT_DIR=./generated

# Output verbosity
export IODD_VERBOSE=1
export IODD_QUIET=0

# Default format
export IODD_OUTPUT_FORMAT=json
```

## Configuration File

Create `.ioddrc` in your home directory:

```ini
[default]
database = ~/.iodd_manager/database.db
storage = ~/.iodd_manager/storage
generated = ~/.iodd_manager/generated

[output]
format = table
color = true
verbose = false

[import]
validate = true
backup = true
overwrite = false
```

## Exit Codes

| Code | Description |
|------|-------------|
| 0    | Success |
| 1    | General error |
| 2    | Invalid arguments |
| 3    | File not found |
| 4    | Validation error |
| 5    | Database error |
| 6    | Import error |
| 7    | Generation error |

**Usage in scripts:**

```bash
python iodd_manager.py import sensor.xml
if [ $? -eq 0 ]; then
  echo "Import successful"
else
  echo "Import failed with code $?"
  exit 1
fi
```

## Best Practices

### Error Handling

```bash
# Check if command succeeded
if ! python iodd_manager.py import sensor.xml; then
  echo "Import failed"
  exit 1
fi

# Capture output
OUTPUT=$(python iodd_manager.py list --json 2>&1)
if [ $? -ne 0 ]; then
  echo "Error: $OUTPUT"
fi
```

### Logging

```bash
# Log to file
python iodd_manager.py batch iodd_files/ 2>&1 | tee import.log

# Timestamp logs
python iodd_manager.py import sensor.xml 2>&1 | ts >> import.log
```

### Parallel Processing

```bash
# Process multiple files in parallel
find iodd_files/ -name "*.xml" | parallel -j4 python iodd_manager.py import {}
```

## Troubleshooting

### Command Not Found

```bash
# Use full path
python /path/to/iodd_manager.py import sensor.xml

# Or add to PATH
export PATH=$PATH:$(pwd)
```

### Permission Denied

```bash
# Make script executable
chmod +x iodd_manager.py

# Run with sudo if needed
sudo python iodd_manager.py import sensor.xml
```

### Database Locked

```bash
# Check for running processes
ps aux | grep iodd_manager

# Kill if needed
pkill -f iodd_manager

# Or use different database
python iodd_manager.py --database /tmp/iodd_test.db import sensor.xml
```

## Next Steps

- **[Web Interface](web-interface.md)** - Use the web UI
- **[API Guide](api.md)** - Use the REST API
- **[Adapter Guide](adapters.md)** - Learn about adapter generation
- **[Developer Guide](../../developer/developer-guide/setup.md)** - Extend CLI functionality
