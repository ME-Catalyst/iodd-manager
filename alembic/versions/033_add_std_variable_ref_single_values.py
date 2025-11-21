"""Add std_variable_ref_single_values table for PQA reconstruction

Revision ID: 033
Revises: 032
Create Date: 2024-11-21

Stores the SingleValue and StdSingleValueRef children of StdVariableRef elements
for accurate IODD reconstruction.
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '033'
down_revision = '032'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add std_variable_ref_single_values table"""
    op.create_table(
        'std_variable_ref_single_values',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('std_variable_ref_id', sa.Integer(), nullable=False),
        sa.Column('value', sa.String(255), nullable=False),  # The value attribute
        sa.Column('name_text_id', sa.String(255), nullable=True),  # textId for Name element
        sa.Column('is_std_ref', sa.Boolean(), nullable=False, default=False),  # True for StdSingleValueRef
        sa.Column('order_index', sa.Integer(), nullable=False),  # Original order
        sa.ForeignKeyConstraint(['std_variable_ref_id'], ['std_variable_refs.id'], ondelete='CASCADE'),
    )

    # Create index for faster lookups
    op.create_index('ix_std_var_ref_sv_ref_id', 'std_variable_ref_single_values', ['std_variable_ref_id'])


def downgrade() -> None:
    """Remove std_variable_ref_single_values table"""
    op.drop_index('ix_std_var_ref_sv_ref_id', table_name='std_variable_ref_single_values')
    op.drop_table('std_variable_ref_single_values')
