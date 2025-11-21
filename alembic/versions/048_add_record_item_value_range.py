"""Add ValueRange columns to record item tables

Revision ID: 048
Revises: 047
Create Date: 2025-01-21

Adds min_value, max_value, and value_range_xsi_type columns to:
- parameter_record_items
- process_data_record_items
- custom_datatype_record_items

For PQA reconstruction of ValueRange elements inside RecordItem/SimpleDatatype.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '048'
down_revision = '047'
branch_labels = None
depends_on = None


def upgrade():
    # Add columns to parameter_record_items
    op.add_column('parameter_record_items',
                  sa.Column('min_value', sa.VARCHAR(255), nullable=True))
    op.add_column('parameter_record_items',
                  sa.Column('max_value', sa.VARCHAR(255), nullable=True))
    op.add_column('parameter_record_items',
                  sa.Column('value_range_xsi_type', sa.VARCHAR(255), nullable=True))

    # Add columns to process_data_record_items
    op.add_column('process_data_record_items',
                  sa.Column('min_value', sa.VARCHAR(255), nullable=True))
    op.add_column('process_data_record_items',
                  sa.Column('max_value', sa.VARCHAR(255), nullable=True))
    op.add_column('process_data_record_items',
                  sa.Column('value_range_xsi_type', sa.VARCHAR(255), nullable=True))

    # Add columns to custom_datatype_record_items
    op.add_column('custom_datatype_record_items',
                  sa.Column('min_value', sa.VARCHAR(255), nullable=True))
    op.add_column('custom_datatype_record_items',
                  sa.Column('max_value', sa.VARCHAR(255), nullable=True))
    op.add_column('custom_datatype_record_items',
                  sa.Column('value_range_xsi_type', sa.VARCHAR(255), nullable=True))


def downgrade():
    op.drop_column('parameter_record_items', 'min_value')
    op.drop_column('parameter_record_items', 'max_value')
    op.drop_column('parameter_record_items', 'value_range_xsi_type')

    op.drop_column('process_data_record_items', 'min_value')
    op.drop_column('process_data_record_items', 'max_value')
    op.drop_column('process_data_record_items', 'value_range_xsi_type')

    op.drop_column('custom_datatype_record_items', 'min_value')
    op.drop_column('custom_datatype_record_items', 'max_value')
    op.drop_column('custom_datatype_record_items', 'value_range_xsi_type')
