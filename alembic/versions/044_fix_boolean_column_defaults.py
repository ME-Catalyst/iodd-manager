"""Fix boolean column defaults to allow NULL

The dynamic, excluded_from_data_storage, and modifies_other_variables columns
were incorrectly created with DEFAULT 0. This causes NULL values to be
converted to 0, preventing us from distinguishing between:
- NULL: attribute not present in original IODD (don't output in reconstruction)
- 0: attribute explicitly set to false in original IODD (output in reconstruction)
- 1: attribute explicitly set to true in original IODD (output in reconstruction)

SQLite doesn't support ALTER COLUMN to change defaults, so we need to recreate
the columns by creating new columns, copying data, dropping old, and renaming.

Revision ID: 044
Revises: 043
Create Date: 2025-01-21
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '044'
down_revision = '043'
branch_labels = None
depends_on = None


def upgrade():
    """Remove DEFAULT 0 from boolean columns to allow proper NULL handling."""

    # Use batch mode for SQLite compatibility
    with op.batch_alter_table('parameters') as batch_op:
        # Add new columns without defaults
        batch_op.add_column(sa.Column('dynamic_new', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('excluded_from_data_storage_new', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('modifies_other_variables_new', sa.Integer(), nullable=True))

    # Copy data from old columns to new columns
    # Only copy non-zero values (0 was the default, could be either explicit or missing)
    # We'll set everything to NULL and let the next import populate correctly
    # This is safe because we're about to re-import anyway
    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE parameters
        SET dynamic_new = CASE WHEN dynamic = 1 THEN 1 ELSE NULL END,
            excluded_from_data_storage_new = CASE WHEN excluded_from_data_storage = 1 THEN 1 ELSE NULL END,
            modifies_other_variables_new = CASE WHEN modifies_other_variables = 1 THEN 1 ELSE NULL END
    """))

    # Drop old columns and rename new ones
    with op.batch_alter_table('parameters') as batch_op:
        batch_op.drop_column('dynamic')
        batch_op.drop_column('excluded_from_data_storage')
        batch_op.drop_column('modifies_other_variables')
        batch_op.alter_column('dynamic_new', new_column_name='dynamic')
        batch_op.alter_column('excluded_from_data_storage_new', new_column_name='excluded_from_data_storage')
        batch_op.alter_column('modifies_other_variables_new', new_column_name='modifies_other_variables')

    # Also fix variable_record_item_info table which has the same issue
    with op.batch_alter_table('variable_record_item_info') as batch_op:
        batch_op.add_column(sa.Column('excluded_from_data_storage_new', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('modifies_other_variables_new', sa.Integer(), nullable=True))

    connection.execute(sa.text("""
        UPDATE variable_record_item_info
        SET excluded_from_data_storage_new = CASE WHEN excluded_from_data_storage = 1 THEN 1 ELSE NULL END,
            modifies_other_variables_new = CASE WHEN modifies_other_variables = 1 THEN 1 ELSE NULL END
    """))

    with op.batch_alter_table('variable_record_item_info') as batch_op:
        batch_op.drop_column('excluded_from_data_storage')
        batch_op.drop_column('modifies_other_variables')
        batch_op.alter_column('excluded_from_data_storage_new', new_column_name='excluded_from_data_storage')
        batch_op.alter_column('modifies_other_variables_new', new_column_name='modifies_other_variables')


def downgrade():
    """Restore DEFAULT 0 on boolean columns."""

    # Restore parameters table columns with defaults
    with op.batch_alter_table('parameters') as batch_op:
        batch_op.add_column(sa.Column('dynamic_old', sa.Integer(), nullable=True, server_default='0'))
        batch_op.add_column(sa.Column('excluded_from_data_storage_old', sa.Integer(), nullable=True, server_default='0'))
        batch_op.add_column(sa.Column('modifies_other_variables_old', sa.Integer(), nullable=True, server_default='0'))

    connection = op.get_bind()
    connection.execute(sa.text("""
        UPDATE parameters
        SET dynamic_old = COALESCE(dynamic, 0),
            excluded_from_data_storage_old = COALESCE(excluded_from_data_storage, 0),
            modifies_other_variables_old = COALESCE(modifies_other_variables, 0)
    """))

    with op.batch_alter_table('parameters') as batch_op:
        batch_op.drop_column('dynamic')
        batch_op.drop_column('excluded_from_data_storage')
        batch_op.drop_column('modifies_other_variables')
        batch_op.alter_column('dynamic_old', new_column_name='dynamic')
        batch_op.alter_column('excluded_from_data_storage_old', new_column_name='excluded_from_data_storage')
        batch_op.alter_column('modifies_other_variables_old', new_column_name='modifies_other_variables')

    # Restore variable_record_item_info table columns
    with op.batch_alter_table('variable_record_item_info') as batch_op:
        batch_op.add_column(sa.Column('excluded_from_data_storage_old', sa.Integer(), nullable=True, server_default='0'))
        batch_op.add_column(sa.Column('modifies_other_variables_old', sa.Integer(), nullable=True, server_default='0'))

    connection.execute(sa.text("""
        UPDATE variable_record_item_info
        SET excluded_from_data_storage_old = COALESCE(excluded_from_data_storage, 0),
            modifies_other_variables_old = COALESCE(modifies_other_variables, 0)
    """))

    with op.batch_alter_table('variable_record_item_info') as batch_op:
        batch_op.drop_column('excluded_from_data_storage')
        batch_op.drop_column('modifies_other_variables')
        batch_op.alter_column('excluded_from_data_storage_old', new_column_name='excluded_from_data_storage')
        batch_op.alter_column('modifies_other_variables_old', new_column_name='modifies_other_variables')
