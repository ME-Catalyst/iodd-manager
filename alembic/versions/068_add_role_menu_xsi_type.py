"""Add has_xsi_type column to ui_menu_roles for PQA reconstruction

Revision ID: 068
Revises: 067
Create Date: 2025-11-22

PQA Fix #27: Track which role menu items have xsi:type="UIMenuRefT"
to enable accurate reconstruction (78 issues across 13 devices).
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '068'
down_revision = '067'
branch_labels = None
depends_on = None


def upgrade():
    """Add has_xsi_type column to ui_menu_roles table"""
    try:
        op.add_column('ui_menu_roles', sa.Column('has_xsi_type', sa.Integer(), nullable=True, default=0))
    except Exception:
        pass  # Column may already exist


def downgrade():
    """Remove has_xsi_type column"""
    try:
        op.drop_column('ui_menu_roles', 'has_xsi_type')
    except Exception:
        pass
