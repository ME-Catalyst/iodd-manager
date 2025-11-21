"""Add RecordItemInfo attribute columns

Revision ID: 036
Revises: 035
Create Date: 2024-11-21

Adds excludedFromDataStorage and modifiesOtherVariables columns to
variable_record_item_info table for accurate IODD reconstruction.
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '036'
down_revision = '035'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add attribute columns to variable_record_item_info table"""
    op.add_column('variable_record_item_info',
        sa.Column('excluded_from_data_storage', sa.Integer(), nullable=True, default=0))

    op.add_column('variable_record_item_info',
        sa.Column('modifies_other_variables', sa.Integer(), nullable=True, default=0))


def downgrade() -> None:
    """Remove attribute columns"""
    op.drop_column('variable_record_item_info', 'modifies_other_variables')
    op.drop_column('variable_record_item_info', 'excluded_from_data_storage')
