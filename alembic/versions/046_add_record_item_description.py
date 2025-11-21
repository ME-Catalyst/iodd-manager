"""Add description_text_id columns to record item tables

Revision ID: 046
Revises: 045
Create Date: 2025-01-21

Adds description_text_id column to:
- custom_datatype_record_items
- process_data_record_items

This enables PQA reconstruction of RecordItem/Description elements.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '046'
down_revision = '045'
branch_labels = None
depends_on = None


def upgrade():
    # Add description_text_id to custom_datatype_record_items
    op.add_column('custom_datatype_record_items',
                  sa.Column('description_text_id', sa.VARCHAR(255), nullable=True))

    # Add description_text_id to process_data_record_items
    op.add_column('process_data_record_items',
                  sa.Column('description_text_id', sa.VARCHAR(255), nullable=True))


def downgrade():
    op.drop_column('custom_datatype_record_items', 'description_text_id')
    op.drop_column('process_data_record_items', 'description_text_id')
