"""Add record_item_single_values table

Revision ID: 035
Revises: 034
Create Date: 2024-11-21

Stores SingleValue elements that appear inside RecordItem/SimpleDatatype
for accurate IODD reconstruction.
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '035'
down_revision = '034'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add record_item_single_values table"""
    op.create_table(
        'record_item_single_values',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('record_item_id', sa.Integer(), nullable=False),
        sa.Column('value', sa.String(255), nullable=False),
        sa.Column('name', sa.Text(), nullable=True),
        sa.Column('name_text_id', sa.String(255), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['record_item_id'], ['parameter_record_items.id'], ondelete='CASCADE'),
    )

    op.create_index('ix_ri_sv_record_item_id', 'record_item_single_values', ['record_item_id'])


def downgrade() -> None:
    """Remove record_item_single_values table"""
    op.drop_index('ix_ri_sv_record_item_id', table_name='record_item_single_values')
    op.drop_table('record_item_single_values')
