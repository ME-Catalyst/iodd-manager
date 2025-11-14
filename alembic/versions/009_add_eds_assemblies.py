"""Add EDS assembly tables

Revision ID: 009
Revises: 008
Create Date: 2025-01-14

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '009'
down_revision = '008'
branch_labels = None
depends_on = None


def upgrade():
    # Create eds_assemblies table for fixed assemblies
    op.create_table(
        'eds_assemblies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('eds_file_id', sa.Integer(), nullable=False),
        sa.Column('assembly_number', sa.Integer(), nullable=False),
        sa.Column('assembly_name', sa.Text(), nullable=True),
        sa.Column('assembly_type', sa.Integer(), nullable=True),  # 0x64, 0x77, etc.
        sa.Column('unknown_field1', sa.Integer(), nullable=True),
        sa.Column('size', sa.Integer(), nullable=True),
        sa.Column('unknown_field2', sa.Integer(), nullable=True),  # 0x0000
        sa.Column('path', sa.Text(), nullable=True),
        sa.Column('help_string', sa.Text(), nullable=True),
        sa.Column('is_variable', sa.Boolean(), nullable=False, server_default='0'),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['eds_file_id'], ['eds_files.id'], ondelete='CASCADE')
    )

    # Create eds_variable_assemblies table for variable-length assemblies
    op.create_table(
        'eds_variable_assemblies',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('eds_file_id', sa.Integer(), nullable=False),
        sa.Column('assembly_name', sa.Text(), nullable=False),  # "AssemExa134"
        sa.Column('assembly_number', sa.Integer(), nullable=False),  # 134
        sa.Column('unknown_value1', sa.Integer(), nullable=True),  # 34
        sa.Column('max_size', sa.Integer(), nullable=True),  # 32
        sa.Column('description', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['eds_file_id'], ['eds_files.id'], ondelete='CASCADE')
    )

    # Create indexes for faster queries
    op.create_index('idx_eds_assemblies_eds_file_id', 'eds_assemblies', ['eds_file_id'])
    op.create_index('idx_eds_assemblies_number', 'eds_assemblies', ['assembly_number'])
    op.create_index('idx_eds_variable_assemblies_eds_file_id', 'eds_variable_assemblies', ['eds_file_id'])
    op.create_index('idx_eds_variable_assemblies_number', 'eds_variable_assemblies', ['assembly_number'])


def downgrade():
    # Drop indexes
    op.drop_index('idx_eds_variable_assemblies_number')
    op.drop_index('idx_eds_variable_assemblies_eds_file_id')
    op.drop_index('idx_eds_assemblies_number')
    op.drop_index('idx_eds_assemblies_eds_file_id')

    # Drop tables
    op.drop_table('eds_variable_assemblies')
    op.drop_table('eds_assemblies')
