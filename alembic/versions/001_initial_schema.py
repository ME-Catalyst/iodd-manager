"""Initial schema

Revision ID: 001
Revises:
Create Date: 2025-11-11

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial database schema."""

    # Create devices table
    op.create_table(
        'devices',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('vendor_id', sa.Integer(), nullable=True),
        sa.Column('device_id', sa.Integer(), nullable=True),
        sa.Column('product_name', sa.Text(), nullable=True),
        sa.Column('manufacturer', sa.Text(), nullable=True),
        sa.Column('iodd_version', sa.Text(), nullable=True),
        sa.Column('import_date', sa.DateTime(), nullable=True),
        sa.Column('checksum', sa.Text(), nullable=True),
        sa.UniqueConstraint('checksum', name='uq_devices_checksum')
    )

    # Create iodd_files table
    op.create_table(
        'iodd_files',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('device_id', sa.Integer(), nullable=True),
        sa.Column('file_name', sa.Text(), nullable=True),
        sa.Column('xml_content', sa.Text(), nullable=True),
        sa.Column('schema_version', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['device_id'], ['devices.id'], name='fk_iodd_files_device_id')
    )

    # Create parameters table
    op.create_table(
        'parameters',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('device_id', sa.Integer(), nullable=True),
        sa.Column('param_index', sa.Integer(), nullable=True),
        sa.Column('name', sa.Text(), nullable=True),
        sa.Column('data_type', sa.Text(), nullable=True),
        sa.Column('access_rights', sa.Text(), nullable=True),
        sa.Column('default_value', sa.Text(), nullable=True),
        sa.Column('min_value', sa.Text(), nullable=True),
        sa.Column('max_value', sa.Text(), nullable=True),
        sa.Column('unit', sa.Text(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['device_id'], ['devices.id'], name='fk_parameters_device_id')
    )

    # Create generated_adapters table
    op.create_table(
        'generated_adapters',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('device_id', sa.Integer(), nullable=True),
        sa.Column('target_platform', sa.Text(), nullable=True),
        sa.Column('version', sa.Text(), nullable=True),
        sa.Column('generated_date', sa.DateTime(), nullable=True),
        sa.Column('code_content', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['device_id'], ['devices.id'], name='fk_generated_adapters_device_id')
    )

    # Create indexes for better query performance
    op.create_index('ix_devices_vendor_id', 'devices', ['vendor_id'])
    op.create_index('ix_devices_device_id', 'devices', ['device_id'])
    op.create_index('ix_parameters_device_id', 'parameters', ['device_id'])
    op.create_index('ix_generated_adapters_device_id', 'generated_adapters', ['device_id'])
    op.create_index('ix_generated_adapters_platform', 'generated_adapters', ['target_platform'])


def downgrade() -> None:
    """Drop all tables."""

    # Drop indexes
    op.drop_index('ix_generated_adapters_platform', table_name='generated_adapters')
    op.drop_index('ix_generated_adapters_device_id', table_name='generated_adapters')
    op.drop_index('ix_parameters_device_id', table_name='parameters')
    op.drop_index('ix_devices_device_id', table_name='devices')
    op.drop_index('ix_devices_vendor_id', table_name='devices')

    # Drop tables
    op.drop_table('generated_adapters')
    op.drop_table('parameters')
    op.drop_table('iodd_files')
    op.drop_table('devices')
