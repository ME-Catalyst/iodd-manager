# Database Migrations with Alembic

This directory contains Alembic database migration scripts for Greenstack.

## Overview

Alembic is a lightweight database migration tool for SQLAlchemy. It allows you to:

- Track database schema changes over time
- Apply migrations to upgrade the database
- Rollback migrations if needed
- Generate migrations automatically (with some limitations)

## Directory Structure

```
alembic/
├── README.md              # This file
├── env.py                 # Migration environment configuration
├── script.py.mako         # Template for new migration scripts
└── versions/              # Migration scripts
    └── 001_initial_schema.py  # Initial database schema
```

## Configuration

Migration settings are in `alembic.ini` at the project root.

### Database URL

The database URL is configured in `alembic.ini`:

```ini
sqlalchemy.url = sqlite:///greenstack.db
```

You can override this with an environment variable:

```bash
export IODD_DATABASE_URL=sqlite:///path/to/custom.db
```

## Common Commands

### Check Current Version

```bash
alembic current
```

### View Migration History

```bash
alembic history --verbose
```

### Upgrade to Latest Version

```bash
# Upgrade to the latest migration
alembic upgrade head

# Upgrade one version at a time
alembic upgrade +1

# Upgrade to a specific version
alembic upgrade 001
```

### Downgrade Database

```bash
# Downgrade one version
alembic downgrade -1

# Downgrade to a specific version
alembic downgrade 001

# Downgrade to the beginning (empty database)
alembic downgrade base
```

### Create a New Migration

```bash
# Create a blank migration
alembic revision -m "add_user_table"

# Auto-generate migration from schema changes (requires SQLAlchemy models)
alembic revision --autogenerate -m "add_user_table"
```

## Migration Workflow

### 1. Making Schema Changes

When you need to change the database schema:

1. **Write the migration script** manually or use autogenerate
2. **Review the migration** to ensure it's correct
3. **Test the migration** on a development database
4. **Apply to production** after testing

### 2. Example: Adding a New Column

Create a new migration:

```bash
alembic revision -m "add_description_to_devices"
```

Edit the generated file in `alembic/versions/`:

```python
def upgrade() -> None:
    op.add_column('devices', sa.Column('description', sa.Text(), nullable=True))

def downgrade() -> None:
    op.drop_column('devices', 'description')
```

Apply the migration:

```bash
alembic upgrade head
```

### 3. Example: Creating a New Table

```python
def upgrade() -> None:
    op.create_table(
        'device_logs',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('device_id', sa.Integer(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['device_id'], ['devices.id'])
    )
    op.create_index('ix_device_logs_device_id', 'device_logs', ['device_id'])

def downgrade() -> None:
    op.drop_index('ix_device_logs_device_id', table_name='device_logs')
    op.drop_table('device_logs')
```

## Initial Setup

For a new installation:

```bash
# Apply all migrations to create the database schema
alembic upgrade head
```

For an existing database created without Alembic:

```bash
# Mark the current state as migrated (skip running migrations)
alembic stamp head
```

## Migration Best Practices

### 1. Always Test Migrations

```bash
# Create a backup before migrating
cp greenstack.db greenstack.db.backup

# Test upgrade
alembic upgrade head

# Test downgrade
alembic downgrade -1

# Restore if needed
mv greenstack.db.backup greenstack.db
```

### 2. Make Migrations Reversible

Every `upgrade()` should have a corresponding `downgrade()`:

```python
# Good - reversible
def upgrade():
    op.add_column('devices', sa.Column('status', sa.String(50)))

def downgrade():
    op.drop_column('devices', 'status')

# Bad - not reversible
def downgrade():
    pass  # Don't do this!
```

### 3. Handle Data Migrations Carefully

When modifying existing data, use raw SQL:

```python
from alembic import op

def upgrade():
    # Add new column
    op.add_column('devices', sa.Column('is_active', sa.Boolean(), default=True))

    # Update existing rows
    op.execute("UPDATE devices SET is_active = 1")

def downgrade():
    op.drop_column('devices', 'is_active')
```

### 4. Keep Migrations Small and Focused

- One migration per logical change
- Combine related changes in a single migration
- Don't mix schema changes with data migrations

### 5. Name Migrations Descriptively

```bash
# Good
alembic revision -m "add_device_status_column"
alembic revision -m "create_device_logs_table"
alembic revision -m "add_indexes_for_performance"

# Bad
alembic revision -m "update"
alembic revision -m "fix"
alembic revision -m "changes"
```

## Troubleshooting

### "Can't locate revision identified by 'head'"

The database hasn't been stamped with the current version:

```bash
alembic stamp head
```

### "Target database is not up to date"

Your code expects a newer schema than the database has:

```bash
alembic upgrade head
```

### Migration Fails Halfway

Alembic doesn't use transactions for DDL in SQLite. If a migration fails:

1. Fix the migration script
2. Restore from backup or manually fix the database
3. Run the migration again

### Can't Downgrade

Some operations can't be reversed automatically:

- Dropping columns with data
- Changing column types
- Some data transformations

Document manual steps in the migration docstring if needed.

## Integration with Application

### Option 1: Run Migrations Manually

```bash
# Before starting the application
alembic upgrade head
python start.py
```

### Option 2: Auto-migrate on Startup

Add to `start.py` or `api.py`:

```python
from alembic.config import Config
from alembic import command

def run_migrations():
    """Run database migrations on startup."""
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")

# Call before starting the server
run_migrations()
```

### Option 3: Use StorageManager (Current Approach)

The `StorageManager` currently uses `CREATE TABLE IF NOT EXISTS`, which:

- ✅ Works for initial setup
- ✅ Simple for development
- ❌ Doesn't track schema changes
- ❌ Can't rollback changes
- ❌ No migration history

**Recommendation:** Use Alembic for production deployments.

## Version Control

Always commit migration scripts:

```bash
git add alembic/versions/*.py
git commit -m "Add migration for device status column"
```

## Resources

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)

## Support

For issues with migrations:

1. Check the migration script for errors
2. Review the Alembic documentation
3. Check database logs for error details
4. Open an issue on GitHub with migration details
