"""Add enumeration_values to parameters

Revision ID: 003
Revises: 002
Create Date: 2025-11-11 18:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    """Add enumeration_values and bit_length columns to parameters table"""
    # Use raw SQLite connection since Alembic's ALTER is limited
    conn = op.get_bind()

    # Add new columns (wrapped in text() for SQLAlchemy 2.0+)
    conn.execute(text('ALTER TABLE parameters ADD COLUMN enumeration_values TEXT'))
    conn.execute(text('ALTER TABLE parameters ADD COLUMN bit_length INTEGER'))


def downgrade():
    """Remove enumeration_values and bit_length columns"""
    # SQLite doesn't support DROP COLUMN easily, would need to recreate table
    pass
