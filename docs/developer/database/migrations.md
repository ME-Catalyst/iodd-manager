# Database Migrations

Managing database schema changes with Alembic.

## Overview

Greenstack uses [Alembic](https://alembic.sqlalchemy.org/) for database migrations.

**Benefits:**

- Version-controlled schema changes
- Reversible migrations (upgrade/downgrade)
- Automatic migration generation
- Production-safe schema updates

## Getting Started

### Initialize Database

For new installations:

```bash
# Run all migrations
alembic upgrade head
```

This creates the database and applies all migrations.

### Check Current Version

```bash
# Show current migration version
alembic current

# Output: 001_initial_schema (head)
```

### View Migration History

```bash
# Show all migrations
alembic history --verbose
```

Output:

```
Rev: 001_initial_schema (head)
Parent: <base>
Path: alembic/versions/001_initial_schema.py
Branch names: default

    Initial database schema

    - Create devices table
    - Create iodd_files table
    - Create parameters table
    - Create generated_adapters table
    - Add indexes and foreign keys

    Revision ID: 001_initial_schema
    Create Date: 2025-01-11 10:00:00
```

## Creating Migrations

### Auto-Generate Migration

Alembic can automatically detect schema changes:

```bash
# Make changes to your SQLAlchemy models
# Then generate migration
alembic revision --autogenerate -m "Add device_category column"
```

This creates a new migration file in `alembic/versions/`.

**Review the generated file** before applying! Auto-generation may miss:

- Data migrations
- Column renames (appears as drop + add)
- Complex constraints

### Manual Migration

For complex changes, create an empty migration:

```bash
# Create empty migration
alembic revision -m "Migrate legacy data format"
```

Edit the generated file:

```python
"""Migrate legacy data format

Revision ID: 002_migrate_data
Revises: 001_initial_schema
Create Date: 2025-01-11 12:00:00
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '002_migrate_data'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add new column
    op.add_column('devices', sa.Column('device_category', sa.String(50)))

    # Migrate data
    connection = op.get_bind()
    connection.execute(
        sa.text("UPDATE devices SET device_category = 'sensor' WHERE device_function LIKE '%sensor%'")
    )

def downgrade() -> None:
    op.drop_column('devices', 'device_category')
```

## Applying Migrations

### Upgrade Database

```bash
# Upgrade to latest version
alembic upgrade head

# Upgrade to specific revision
alembic upgrade 002_migrate_data

# Upgrade one step
alembic upgrade +1
```

### Downgrade Database

```bash
# Downgrade one step
alembic downgrade -1

# Downgrade to specific revision
alembic downgrade 001_initial_schema

# Downgrade to base (empty database)
alembic downgrade base
```

### Show SQL Without Applying

```bash
# Preview SQL for upgrade
alembic upgrade head --sql

# Preview SQL for downgrade
alembic downgrade -1 --sql
```

## Migration Examples

### Example 1: Add Column

```python
"""Add device serial number field

Revision ID: 003_add_serial_number
"""

def upgrade() -> None:
    op.add_column('devices',
        sa.Column('serial_number', sa.String(100), nullable=True)
    )

def downgrade() -> None:
    op.drop_column('devices', 'serial_number')
```

### Example 2: Add Index

```python
"""Add index on device_name

Revision ID: 004_add_device_name_index
"""

def upgrade() -> None:
    op.create_index(
        'ix_devices_device_name',
        'devices',
        ['device_name']
    )

def downgrade() -> None:
    op.drop_index('ix_devices_device_name', 'devices')
```

### Example 3: Modify Column

```python
"""Change vendor_name length

Revision ID: 005_modify_vendor_name
"""

def upgrade() -> None:
    # SQLite doesn't support ALTER COLUMN, so recreate table
    with op.batch_alter_table('devices') as batch_op:
        batch_op.alter_column('vendor_name',
            existing_type=sa.String(100),
            type_=sa.String(200),
            existing_nullable=True
        )

def downgrade() -> None:
    with op.batch_alter_table('devices') as batch_op:
        batch_op.alter_column('vendor_name',
            existing_type=sa.String(200),
            type_=sa.String(100),
            existing_nullable=True
        )
```

### Example 4: Data Migration

```python
"""Populate device categories

Revision ID: 006_populate_categories
"""

def upgrade() -> None:
    connection = op.get_bind()

    # Categorize devices based on device_function
    categories = {
        'sensor': ['temperature', 'pressure', 'flow'],
        'actuator': ['valve', 'motor', 'pump'],
        'controller': ['plc', 'controller', 'gateway']
    }

    for category, keywords in categories.items():
        for keyword in keywords:
            connection.execute(
                sa.text(f"""
                    UPDATE devices
                    SET device_category = '{category}'
                    WHERE LOWER(device_function) LIKE '%{keyword}%'
                    AND device_category IS NULL
                """)
            )

def downgrade() -> None:
    connection = op.get_bind()
    connection.execute(sa.text("UPDATE devices SET device_category = NULL"))
```

### Example 5: Add Foreign Key

```python
"""Add foreign key constraint

Revision ID: 007_add_fk_constraint
"""

def upgrade() -> None:
    op.create_foreign_key(
        'fk_iodd_files_device',
        'iodd_files',
        'devices',
        ['device_id'],
        ['id'],
        ondelete='CASCADE'
    )

def downgrade() -> None:
    op.drop_constraint('fk_iodd_files_device', 'iodd_files', type_='foreignkey')
```

## Branching and Merging

### Create Branch

For parallel development:

```bash
# Create branch point
alembic revision -m "Branch for feature X" --head=001_initial_schema

# Create migration on branch
alembic revision -m "Feature X changes" --head=branch_feature_x
```

### Merge Branches

```bash
# Merge two branches
alembic merge -m "Merge feature branches" rev1 rev2
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] Test migrations on copy of production data
- [ ] Review all migration files
- [ ] Check for data loss risks
- [ ] Ensure downgrade path exists
- [ ] Backup production database
- [ ] Schedule maintenance window if needed

### Deployment Process

```bash
# 1. Backup database
cp greenstack.db greenstack_backup_$(date +%Y%m%d_%H%M%S).db

# 2. Check current version
alembic current

# 3. Preview migration SQL
alembic upgrade head --sql > migration_preview.sql
# Review migration_preview.sql

# 4. Apply migration
alembic upgrade head

# 5. Verify success
alembic current
# Should show latest revision

# 6. Test application
python -c "from greenstack import IODDManager; IODDManager('greenstack.db')"
```

### Rollback on Failure

If migration fails:

```bash
# Restore backup
mv greenstack.db greenstack_failed.db
cp greenstack_backup_20250111_100000.db greenstack.db

# Or downgrade (if database still usable)
alembic downgrade -1
```

## Alembic Configuration

### `alembic.ini`

Main configuration file:

```ini
[alembic]
script_location = alembic
prepend_sys_path = .
version_path_separator = os

# SQLite database URL
sqlalchemy.url = sqlite:///./greenstack.db

# Output formatting
truncate_slug_length = 40
output_encoding = utf-8

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic
```

### `alembic/env.py`

Environment configuration:

```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os

# Load configuration
config = context.config

# Support environment variable override
database_url = os.getenv('IODD_DATABASE_URL')
if database_url:
    config.set_main_option('sqlalchemy.url', database_url)

# Run migrations
def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix='sqlalchemy.',
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()
```

## Troubleshooting

### Migration Fails Midway

```bash
# Check current version
alembic current

# Database may be in inconsistent state
# Manually fix or restore backup

# Mark specific version without running migration
alembic stamp 002_migrate_data
```

### Conflicting Migrations

```bash
# Error: Multiple head revisions
alembic heads

# Merge heads
alembic merge -m "Merge conflicting migrations" head1 head2
```

### Reset Migration History

```bash
# ⚠️ WARNING: Only for development!

# Delete all tables
rm greenstack.db

# Remove migration history
rm alembic/versions/*.py

# Recreate initial migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head
```

## Best Practices

### 1. Always Review Auto-Generated Migrations

```bash
alembic revision --autogenerate -m "Description"

# Review generated file before applying
cat alembic/versions/XXX_description.py
```

### 2. Test Migrations Both Ways

```bash
# Test upgrade
alembic upgrade head

# Test downgrade
alembic downgrade -1

# Test upgrade again
alembic upgrade head
```

### 3. Keep Migrations Small

- One logical change per migration
- Easier to review and debug
- Simpler rollback if needed

### 4. Write Safe Data Migrations

```python
# Good - safe data migration
def upgrade():
    # Add column with default
    op.add_column('devices', sa.Column('status', sa.String(20), server_default='active'))

    # Then update specific rows
    connection = op.get_bind()
    connection.execute(sa.text("UPDATE devices SET status = 'inactive' WHERE imported_at < '2024-01-01'"))

# Bad - could fail on large tables
def upgrade():
    # Add column without default
    op.add_column('devices', sa.Column('status', sa.String(20), nullable=False))
    # This fails if table has existing rows!
```

### 5. Document Complex Migrations

```python
"""Add device categorization system

This migration:
1. Adds device_category column
2. Creates category_mappings table
3. Migrates existing data based on device_function
4. Adds validation constraints

Revision ID: 008_device_categories
Revises: 007_add_fk_constraint
"""
```

## Migration Testing

### Test Script

```python
#!/usr/bin/env python3
"""Test all migrations"""

import subprocess
import sys

def run_command(cmd):
    """Run shell command and return success"""
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(f"Error: {result.stderr}", file=sys.stderr)
        return False
    return True

def test_migrations():
    """Test upgrade and downgrade"""
    print("Testing migrations...")

    # Downgrade to base
    if not run_command("alembic downgrade base"):
        return False

    # Upgrade to head
    if not run_command("alembic upgrade head"):
        return False

    # Downgrade one step
    if not run_command("alembic downgrade -1"):
        return False

    # Upgrade to head again
    if not run_command("alembic upgrade head"):
        return False

    print("✓ All migration tests passed!")
    return True

if __name__ == "__main__":
    sys.exit(0 if test_migrations() else 1)
```

## Next Steps

- **[Database Schema](schema.md)** - Schema documentation
- **[Architecture](../developer-guide/architecture.md)** - System architecture
- **[Deployment](../deployment/production.md)** - Production deployment
