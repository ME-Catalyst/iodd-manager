"""Add PQA columns to parameters table

Revision ID: 034
Revises: 033
Create Date: 2024-11-21

Adds columns for accurate IODD reconstruction:
- array_element_bit_length: For ArrayT SimpleDatatype bitLength
- array_element_fixed_length: For ArrayT SimpleDatatype fixedLength (OctetStringT/StringT)
- name_text_id: Original textId for Name element
- description_text_id: Original textId for Description element
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '034'
down_revision = '033'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add PQA reconstruction columns to parameters table"""
    # Add array element bitLength (separate from main bitLength)
    op.add_column('parameters',
        sa.Column('array_element_bit_length', sa.Integer(), nullable=True))

    # Add array element fixedLength for OctetStringT/StringT
    op.add_column('parameters',
        sa.Column('array_element_fixed_length', sa.Integer(), nullable=True))

    # Add Name textId for PQA reconstruction
    op.add_column('parameters',
        sa.Column('name_text_id', sa.String(255), nullable=True))

    # Add Description textId for PQA reconstruction
    op.add_column('parameters',
        sa.Column('description_text_id', sa.String(255), nullable=True))


def downgrade() -> None:
    """Remove PQA reconstruction columns"""
    op.drop_column('parameters', 'description_text_id')
    op.drop_column('parameters', 'name_text_id')
    op.drop_column('parameters', 'array_element_fixed_length')
    op.drop_column('parameters', 'array_element_bit_length')
