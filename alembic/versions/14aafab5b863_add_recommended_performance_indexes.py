"""add_recommended_performance_indexes

Revision ID: 14aafab5b863
Revises: 017
Create Date: 2025-11-17 15:02:18.336910

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '14aafab5b863'
down_revision = '017'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add recommended performance indexes
    # These indexes improve query performance for common lookups
    # Using IF NOT EXISTS to handle cases where indexes already exist

    # Index on devices.vendor_id for faster vendor-based queries
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_devices_vendor_id
        ON devices (vendor_id)
    """)

    # Index on iodd_files.device_id for faster IODD-device joins
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_iodd_files_device_id
        ON iodd_files (device_id)
    """)

    # Index on parameters.device_id for faster parameter lookups
    # Note: This is for IODD parameters, not EDS parameters (they have their own table)
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_parameters_device_id
        ON parameters (device_id)
    """)


def downgrade() -> None:
    # Remove the performance indexes
    op.drop_index('ix_parameters_device_id', table_name='parameters')
    op.drop_index('ix_iodd_files_device_id', table_name='iodd_files')
    op.drop_index('ix_devices_vendor_id', table_name='devices')
