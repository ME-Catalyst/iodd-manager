"""Add access_right_restriction column to record item tables

Revision ID: 050
Revises: 049
Create Date: 2025-01-21

Adds access_right_restriction column to:
- parameter_record_items
- process_data_record_items
- custom_datatype_record_items

For PQA reconstruction of RecordItem@accessRightRestriction attribute.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '050'
down_revision = '049'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('parameter_record_items',
                  sa.Column('access_right_restriction', sa.VARCHAR(50), nullable=True))
    op.add_column('process_data_record_items',
                  sa.Column('access_right_restriction', sa.VARCHAR(50), nullable=True))
    op.add_column('custom_datatype_record_items',
                  sa.Column('access_right_restriction', sa.VARCHAR(50), nullable=True))


def downgrade():
    op.drop_column('parameter_record_items', 'access_right_restriction')
    op.drop_column('process_data_record_items', 'access_right_restriction')
    op.drop_column('custom_datatype_record_items', 'access_right_restriction')
