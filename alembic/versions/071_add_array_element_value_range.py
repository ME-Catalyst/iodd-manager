"""Add ArrayT SimpleDatatype ValueRange columns to parameters

Revision ID: 071
Revises: 070
Create Date: 2025-11-22

PQA Fix #30c: ArrayT Variables can have SimpleDatatype child elements
with ValueRange. Store lowerValue, upperValue, xsi:type, and Name@textId.
This affects 30 issues.
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '071'
down_revision = '070'
branch_labels = None
depends_on = None


def upgrade():
    """Add ArrayT SimpleDatatype ValueRange columns to parameters"""
    try:
        op.add_column('parameters',
                      sa.Column('array_element_min_value', sa.Text(), nullable=True))
    except Exception:
        pass  # Column may already exist
    try:
        op.add_column('parameters',
                      sa.Column('array_element_max_value', sa.Text(), nullable=True))
    except Exception:
        pass
    try:
        op.add_column('parameters',
                      sa.Column('array_element_value_range_xsi_type', sa.Text(), nullable=True))
    except Exception:
        pass
    try:
        op.add_column('parameters',
                      sa.Column('array_element_value_range_name_text_id', sa.Text(), nullable=True))
    except Exception:
        pass


def downgrade():
    """Remove ArrayT ValueRange columns"""
    try:
        op.drop_column('parameters', 'array_element_min_value')
    except Exception:
        pass
    try:
        op.drop_column('parameters', 'array_element_max_value')
    except Exception:
        pass
    try:
        op.drop_column('parameters', 'array_element_value_range_xsi_type')
    except Exception:
        pass
    try:
        op.drop_column('parameters', 'array_element_value_range_name_text_id')
    except Exception:
        pass
