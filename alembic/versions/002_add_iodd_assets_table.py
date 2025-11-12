"""Add iodd_assets table

Revision ID: 002
Revises: 001
Create Date: 2025-11-11

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create iodd_assets table for storing IODD package assets."""

    # Create iodd_assets table
    op.create_table(
        'iodd_assets',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('device_id', sa.Integer(), nullable=False),
        sa.Column('file_name', sa.Text(), nullable=False),
        sa.Column('file_type', sa.Text(), nullable=True),
        sa.Column('file_content', sa.LargeBinary(), nullable=False),
        sa.Column('file_path', sa.Text(), nullable=True),
        sa.Column('image_purpose', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['device_id'], ['devices.id'], name='fk_iodd_assets_device_id')
    )

    # Create indexes for better query performance
    op.create_index('ix_iodd_assets_device_id', 'iodd_assets', ['device_id'])
    op.create_index('ix_iodd_assets_file_type', 'iodd_assets', ['file_type'])
    op.create_index('ix_iodd_assets_image_purpose', 'iodd_assets', ['image_purpose'])


def downgrade() -> None:
    """Drop iodd_assets table."""

    # Drop indexes
    op.drop_index('ix_iodd_assets_image_purpose', table_name='iodd_assets')
    op.drop_index('ix_iodd_assets_file_type', table_name='iodd_assets')
    op.drop_index('ix_iodd_assets_device_id', table_name='iodd_assets')

    # Drop table
    op.drop_table('iodd_assets')
