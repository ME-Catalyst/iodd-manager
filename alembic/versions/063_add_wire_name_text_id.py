"""Add wire_configurations name_text_id column

Revision ID: 063
Revises: 062
Create Date: 2025-01-21

PQA Fix #22: Store Wire/Name@textId to reconstruct Name element
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '063'
down_revision = '062'
branch_labels = None
depends_on = None


def upgrade():
    """Add name_text_id column to wire_configurations"""
    op.add_column('wire_configurations', sa.Column('name_text_id', sa.String(255), nullable=True))


def downgrade():
    """Remove name_text_id column from wire_configurations"""
    op.drop_column('wire_configurations', 'name_text_id')
