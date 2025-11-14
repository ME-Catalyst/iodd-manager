"""Add EDS groups table

Revision ID: 011
Revises: 010
Create Date: 2025-01-14

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '011'
down_revision = '010'
branch_labels = None
depends_on = None


def upgrade():
    # Create eds_groups table for parameter grouping
    op.create_table(
        'eds_groups',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('eds_file_id', sa.Integer(), nullable=False),
        sa.Column('group_number', sa.Integer(), nullable=False),
        sa.Column('group_name', sa.Text(), nullable=False),
        sa.Column('parameter_count', sa.Integer(), nullable=True),
        sa.Column('parameter_list', sa.Text(), nullable=True),  # Comma-separated param numbers
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['eds_file_id'], ['eds_files.id'], ondelete='CASCADE')
    )

    # Create index for faster lookups by EDS file
    op.create_index('idx_eds_groups_eds_file_id', 'eds_groups', ['eds_file_id'])


def downgrade():
    op.drop_index('idx_eds_groups_eds_file_id', table_name='eds_groups')
    op.drop_table('eds_groups')
