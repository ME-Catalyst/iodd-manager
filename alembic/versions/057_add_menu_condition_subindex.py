"""Add condition_subindex column to ui_menu_items for MenuRef/Condition@subindex

Revision ID: 057
Revises: 056
Create Date: 2025-11-21
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '057'
down_revision = '056'
branch_labels = None
depends_on = None

def upgrade():
    # Add condition_subindex column for MenuRef Condition subindex attribute
    op.add_column('ui_menu_items', sa.Column('condition_subindex', sa.VARCHAR(50), nullable=True))


def downgrade():
    op.drop_column('ui_menu_items', 'condition_subindex')
