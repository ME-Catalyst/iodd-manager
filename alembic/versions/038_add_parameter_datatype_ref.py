"""Add datatype_ref column to parameters table

Revision ID: 038_add_parameter_datatype_ref
Revises: 037_add_iodd_build_format
Create Date: 2025-11-21

This migration adds a datatype_ref column to store the custom datatype ID
when a Variable uses DatatypeRef instead of inline Datatype.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = '038_add_parameter_datatype_ref'
down_revision = '037_add_iodd_build_format'
branch_labels = None
depends_on = None


def upgrade():
    # Add datatype_ref column to parameters table
    # This stores the datatypeId when a Variable uses DatatypeRef (e.g., D_Colors)
    # instead of inline Datatype element
    op.add_column('parameters', sa.Column('datatype_ref', sa.String(100), nullable=True))


def downgrade():
    op.drop_column('parameters', 'datatype_ref')
