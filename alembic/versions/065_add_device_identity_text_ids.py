"""Add DeviceIdentity textId columns for PQA reconstruction

Revision ID: 065
Revises: 064
Create Date: 2025-11-22

PQA Fix #24: Store original textIds for VendorText, VendorUrl, DeviceFamily
to enable accurate reconstruction (141 issues across 47 devices).
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '065'
down_revision = '064'
branch_labels = None
depends_on = None


def upgrade():
    """Add DeviceIdentity textId columns to devices table"""
    # Add vendor_text_text_id column
    try:
        op.add_column('devices', sa.Column('vendor_text_text_id', sa.String(255), nullable=True))
    except Exception:
        pass  # Column may already exist

    # Add vendor_url_text_id column
    try:
        op.add_column('devices', sa.Column('vendor_url_text_id', sa.String(255), nullable=True))
    except Exception:
        pass  # Column may already exist

    # Add device_family_text_id column
    try:
        op.add_column('devices', sa.Column('device_family_text_id', sa.String(255), nullable=True))
    except Exception:
        pass  # Column may already exist


def downgrade():
    """Remove DeviceIdentity textId columns"""
    try:
        op.drop_column('devices', 'vendor_text_text_id')
    except Exception:
        pass
    try:
        op.drop_column('devices', 'vendor_url_text_id')
    except Exception:
        pass
    try:
        op.drop_column('devices', 'device_family_text_id')
    except Exception:
        pass
