"""Add xml_order column to parameters table

Revision ID: 049
Revises: 048
Create Date: 2025-01-21

Adds xml_order column to parameters for preserving original XML document order
during PQA reconstruction.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '049'
down_revision = '048'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('parameters',
                  sa.Column('xml_order', sa.INTEGER, nullable=True))


def downgrade():
    op.drop_column('parameters', 'xml_order')
