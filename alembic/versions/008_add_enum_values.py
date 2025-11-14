"""Add enum_values field to eds_parameters

Revision ID: 008
Revises: 007
Create Date: 2025-01-14

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '008'
down_revision = '007'
branch_labels = None
depends_on = None


def upgrade():
    # Add enum_values column to eds_parameters table
    # This will store JSON array of enum value objects: [{"value": 0, "label": "Disabled", "is_default": true}, ...]
    with op.batch_alter_table('eds_parameters', schema=None) as batch_op:
        batch_op.add_column(sa.Column('enum_values', sa.TEXT(), nullable=True))


def downgrade():
    # Remove enum_values column
    with op.batch_alter_table('eds_parameters', schema=None) as batch_op:
        batch_op.drop_column('enum_values')
