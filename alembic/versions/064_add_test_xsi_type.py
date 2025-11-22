"""Add test_xsi_type column to communication_profile

Revision ID: 064
Revises: 063
Create Date: 2025-01-21

PQA Fix #23: Store Test@xsi:type to conditionally output it
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '064'
down_revision = '063'
branch_labels = None
depends_on = None


def upgrade():
    """Add test_xsi_type column to communication_profile"""
    op.add_column('communication_profile', sa.Column('test_xsi_type', sa.String(100), nullable=True))


def downgrade():
    """Remove test_xsi_type column from communication_profile"""
    op.drop_column('communication_profile', 'test_xsi_type')
