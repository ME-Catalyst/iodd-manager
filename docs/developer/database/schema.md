# Database Schema

Understanding the IODD Manager database structure.

## Overview

IODD Manager uses SQLite for local storage with SQLAlchemy ORM. The schema is managed through Alembic migrations.

**Database File**: `iodd_manager.db` (configurable via `IODD_DATABASE_URL`)

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────────┐
│  devices    │───┬───│  iodd_files      │
│             │   │   │                  │
│ *vendor_id  │   │   │  *id             │
│ *device_id  │   │   │   device_id (FK) │
│  vendor_name│   │   │   file_path      │
│  device_name│   │   │   file_size      │
│  ...        │   │   │   checksum       │
└─────────────┘   │   └──────────────────┘
        │         │
        │         │   ┌──────────────────┐
        │         └───│  parameters      │
        │             │                  │
        │             │  *id             │
        │             │   device_id (FK) │
        │             │   index          │
        │             │   name           │
        │             │   data_type      │
        │             │   ...            │
        │             └──────────────────┘
        │
        │             ┌─────────────────────┐
        └─────────────│generated_adapters   │
                      │                     │
                      │  *id                │
                      │   device_id (FK)    │
                      │   target_platform   │
                      │   file_path         │
                      │   generated_at      │
                      └─────────────────────┘
```

## Tables

### `devices`

Stores device information extracted from IODD files.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique device record ID |
| `vendor_id` | INTEGER | NOT NULL | IO-Link vendor ID |
| `device_id` | INTEGER | NOT NULL | IO-Link device ID |
| `vendor_name` | TEXT | | Manufacturer name |
| `device_name` | TEXT | | Product name |
| `product_text` | TEXT | | Device description |
| `version` | TEXT | | IODD file version |
| `release_date` | TEXT | | Device release date |
| `device_function` | TEXT | | Device function/category |
| `min_cycle_time` | INTEGER | | Minimum cycle time (ms) |
| `imported_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Import timestamp |

**Constraints:**

```sql
UNIQUE(vendor_id, device_id)
```

**Indexes:**

```sql
CREATE INDEX ix_devices_vendor_id ON devices(vendor_id);
CREATE INDEX ix_devices_device_id ON devices(device_id);
CREATE INDEX ix_devices_vendor_name ON devices(vendor_name);
```

**Example:**

```sql
SELECT * FROM devices LIMIT 1;
```

| id | vendor_id | device_id | vendor_name | device_name | version | imported_at |
|----|-----------|-----------|-------------|-------------|---------|-------------|
| 1 | 12345 | 67890 | ifm electronic | Temperature Sensor | 1.1.0 | 2025-01-11 10:00:00 |

### `iodd_files`

Stores metadata about uploaded IODD files.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique file record ID |
| `device_id` | INTEGER | FOREIGN KEY → devices(id) | Reference to device |
| `file_path` | TEXT | UNIQUE, NOT NULL | Filesystem path to IODD file |
| `file_size` | INTEGER | | File size in bytes |
| `checksum` | TEXT | | MD5 checksum for validation |
| `uploaded_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload timestamp |

**Foreign Keys:**

```sql
FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
```

**Example:**

```sql
SELECT * FROM iodd_files LIMIT 1;
```

| id | device_id | file_path | file_size | checksum | uploaded_at |
|----|-----------|-----------|-----------|----------|-------------|
| 1 | 1 | iodd_storage/vendor_12345/device_67890.xml | 45120 | a3f5... | 2025-01-11 10:00:00 |

### `parameters`

Stores device parameters extracted from IODD files.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique parameter record ID |
| `device_id` | INTEGER | FOREIGN KEY → devices(id) | Reference to device |
| `index` | INTEGER | NOT NULL | Parameter index (IO-Link) |
| `name` | TEXT | | Parameter name |
| `access` | TEXT | | Access rights: ro, wo, rw |
| `data_type` | TEXT | | Data type: UInt8, Int16, Float32, etc. |
| `length` | INTEGER | | Data length in bytes |
| `default_value` | TEXT | | Default value (as string) |
| `min_value` | TEXT | | Minimum value |
| `max_value` | TEXT | | Maximum value |
| `unit` | TEXT | | Unit of measurement |
| `description` | TEXT | | Parameter description |

**Foreign Keys:**

```sql
FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
```

**Indexes:**

```sql
CREATE INDEX ix_parameters_device_id ON parameters(device_id);
CREATE INDEX ix_parameters_index ON parameters(device_id, index);
```

**Example:**

```sql
SELECT * FROM parameters WHERE device_id = 1 LIMIT 2;
```

| id | device_id | index | name | access | data_type | default_value | unit | description |
|----|-----------|-------|------|--------|-----------|---------------|------|-------------|
| 1 | 1 | 1 | Operating Mode | rw | UInt8 | 0 | | Device operating mode |
| 2 | 1 | 2 | Measurement Range | ro | Float32 | 150.0 | °C | Temperature range |

### `generated_adapters`

Stores metadata about generated adapter files.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique adapter record ID |
| `device_id` | INTEGER | FOREIGN KEY → devices(id) | Reference to device |
| `target_platform` | TEXT | NOT NULL | Platform: nodered, python, cpp, etc. |
| `file_path` | TEXT | UNIQUE | Filesystem path to adapter file |
| `generated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Generation timestamp |

**Foreign Keys:**

```sql
FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE
```

**Indexes:**

```sql
CREATE INDEX ix_generated_adapters_device_id ON generated_adapters(device_id);
CREATE INDEX ix_generated_adapters_platform ON generated_adapters(target_platform);
```

**Example:**

```sql
SELECT * FROM generated_adapters LIMIT 1;
```

| id | device_id | target_platform | file_path | generated_at |
|----|-----------|-----------------|-----------|--------------|
| 1 | 1 | nodered | generated/nodered_12345_67890.json | 2025-01-11 10:05:00 |

## Common Queries

### Find Device

```sql
SELECT * FROM devices
WHERE vendor_id = 12345 AND device_id = 67890;
```

### List All Devices

```sql
SELECT vendor_id, device_id, vendor_name, device_name, version
FROM devices
ORDER BY vendor_name, device_name;
```

### Get Device with Parameters

```sql
SELECT
    d.vendor_id,
    d.device_id,
    d.device_name,
    p.index,
    p.name AS param_name,
    p.data_type,
    p.access
FROM devices d
LEFT JOIN parameters p ON d.id = p.device_id
WHERE d.vendor_id = 12345 AND d.device_id = 67890
ORDER BY p.index;
```

### Count Devices by Vendor

```sql
SELECT vendor_name, COUNT(*) as device_count
FROM devices
GROUP BY vendor_name
ORDER BY device_count DESC;
```

### Recent Imports

```sql
SELECT vendor_id, device_id, device_name, imported_at
FROM devices
ORDER BY imported_at DESC
LIMIT 10;
```

### Find Parameters by Type

```sql
SELECT d.device_name, p.name, p.data_type, p.unit
FROM parameters p
JOIN devices d ON p.device_id = d.id
WHERE p.data_type = 'Float32'
AND p.unit IS NOT NULL;
```

### Generated Adapters Summary

```sql
SELECT
    d.device_name,
    ga.target_platform,
    ga.generated_at
FROM generated_adapters ga
JOIN devices d ON ga.device_id = d.id
ORDER BY ga.generated_at DESC;
```

## Data Types

### Parameter Data Types

Supported IO-Link data types:

- **Integer**: `UInt8`, `UInt16`, `UInt32`, `Int8`, `Int16`, `Int32`
- **Float**: `Float32`, `Float64`
- **String**: `StringT` (variable length text)
- **Boolean**: `BooleanT`
- **Octet String**: `OctetStringT` (binary data)
- **Record**: Complex structured type

### Access Rights

- `ro`: Read-only
- `wo`: Write-only
- `rw`: Read-write

## Database Maintenance

### Backup Database

```bash
# Create backup
cp iodd_manager.db iodd_manager_backup_$(date +%Y%m%d).db

# Or use SQLite dump
sqlite3 iodd_manager.db .dump > backup.sql
```

### Restore Database

```bash
# From file
cp iodd_manager_backup_20250111.db iodd_manager.db

# From SQL dump
sqlite3 iodd_manager.db < backup.sql
```

### Vacuum Database

```bash
# Reclaim space and defragment
sqlite3 iodd_manager.db "VACUUM;"
```

### Check Integrity

```bash
sqlite3 iodd_manager.db "PRAGMA integrity_check;"
```

## Performance Optimization

### Analyze Query Performance

```sql
EXPLAIN QUERY PLAN
SELECT * FROM devices WHERE vendor_id = 12345;
```

### Index Usage

```sql
-- Check if indexes are being used
EXPLAIN QUERY PLAN
SELECT * FROM parameters WHERE device_id = 1;

-- Should show: SEARCH parameters USING INDEX ix_parameters_device_id
```

### Statistics

```sql
-- Update statistics for query optimizer
ANALYZE;

-- Table statistics
SELECT name, rootpage, sql
FROM sqlite_master
WHERE type = 'table';
```

## Migrations

Database schema is managed through Alembic migrations.

See [Migrations Guide](migrations.md) for details.

## Next Steps

- **[Migrations Guide](migrations.md)** - Database migration management
- **[Architecture](../developer-guide/architecture.md)** - System architecture
- **[API Reference](../api/endpoints.md)** - API endpoints for database access
