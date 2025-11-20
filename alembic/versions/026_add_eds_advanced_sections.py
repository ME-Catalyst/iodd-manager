"""Add EDS advanced sections support

Revision ID: 026
Revises: 025
Create Date: 2025-01-20

Adds database tables and columns to support all 13 EDS sections:
- Network configuration tables (DLR, TCP/IP, Ethernet, QoS, LLDP)
- Enum values table for parameter enumerations
- File metadata table for HomeURL, Revision, License, Icons
- Object metadata table for CIP object information
- Updates to eds_files table for missing columns
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '026'
down_revision = '025'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add tables and columns for complete EDS support."""

    # ============================================================================
    # 1. DLR (Device Level Ring) Configuration
    # ============================================================================
    op.create_table(
        'eds_dlr_config',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('file_id', sa.Integer(), nullable=False),
        sa.Column('revision', sa.Integer(), nullable=True),
        sa.Column('object_name', sa.Text(), nullable=True),
        sa.Column('object_class_code', sa.Integer(), nullable=True),
        sa.Column('network_topology', sa.Integer(), nullable=True),  # 0=Linear, 1=Ring
        sa.Column('enable_switch', sa.Boolean(), nullable=True),
        sa.Column('beacon_interval', sa.Integer(), nullable=True),
        sa.Column('beacon_timeout', sa.Integer(), nullable=True),
        sa.Column('vlan_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.Text(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['file_id'], ['eds_files.id'], ondelete='CASCADE')
    )
    op.create_index('idx_dlr_file', 'eds_dlr_config', ['file_id'])

    # ============================================================================
    # 2. TCP/IP Interface Class
    # ============================================================================
    op.create_table(
        'eds_tcpip_interface',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('file_id', sa.Integer(), nullable=False),
        sa.Column('revision', sa.Integer(), nullable=True),
        sa.Column('object_name', sa.Text(), nullable=True),
        sa.Column('object_class_code', sa.Integer(), nullable=True),
        sa.Column('interface_config', sa.Integer(), nullable=True),  # 1=DHCP, 2=Static
        sa.Column('host_name', sa.Text(), nullable=True),
        sa.Column('ttl_value', sa.Integer(), nullable=True),
        sa.Column('mcast_config', sa.Integer(), nullable=True),
        sa.Column('select_acd', sa.Boolean(), nullable=True),
        sa.Column('encap_timeout', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.Text(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['file_id'], ['eds_files.id'], ondelete='CASCADE')
    )
    op.create_index('idx_tcpip_file', 'eds_tcpip_interface', ['file_id'])

    # ============================================================================
    # 3. Ethernet Link Class
    # ============================================================================
    op.create_table(
        'eds_ethernet_link',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('file_id', sa.Integer(), nullable=False),
        sa.Column('revision', sa.Integer(), nullable=True),
        sa.Column('object_name', sa.Text(), nullable=True),
        sa.Column('object_class_code', sa.Integer(), nullable=True),
        sa.Column('interface_speed', sa.Integer(), nullable=True),
        sa.Column('interface_flags', sa.Integer(), nullable=True),
        sa.Column('physical_address', sa.Text(), nullable=True),  # MAC address
        sa.Column('interface_label', sa.Text(), nullable=True),
        sa.Column('created_at', sa.Text(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['file_id'], ['eds_files.id'], ondelete='CASCADE')
    )
    op.create_index('idx_ethernet_file', 'eds_ethernet_link', ['file_id'])

    # ============================================================================
    # 4. QoS (Quality of Service) Class
    # ============================================================================
    op.create_table(
        'eds_qos_config',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('file_id', sa.Integer(), nullable=False),
        sa.Column('revision', sa.Integer(), nullable=True),
        sa.Column('object_name', sa.Text(), nullable=True),
        sa.Column('object_class_code', sa.Integer(), nullable=True),
        sa.Column('qos_tag_enable', sa.Boolean(), nullable=True),
        sa.Column('dscp_urgent', sa.Integer(), nullable=True),
        sa.Column('dscp_scheduled', sa.Integer(), nullable=True),
        sa.Column('dscp_high', sa.Integer(), nullable=True),
        sa.Column('dscp_low', sa.Integer(), nullable=True),
        sa.Column('dscp_explicit', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.Text(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['file_id'], ['eds_files.id'], ondelete='CASCADE')
    )
    op.create_index('idx_qos_file', 'eds_qos_config', ['file_id'])

    # ============================================================================
    # 5. LLDP Management Class
    # ============================================================================
    op.create_table(
        'eds_lldp_management',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('file_id', sa.Integer(), nullable=False),
        sa.Column('revision', sa.Integer(), nullable=True),
        sa.Column('object_name', sa.Text(), nullable=True),
        sa.Column('object_class_code', sa.Integer(), nullable=True),
        sa.Column('msg_tx_interval', sa.Integer(), nullable=True),
        sa.Column('msg_tx_hold', sa.Integer(), nullable=True),
        sa.Column('chassis_id_subtype', sa.Integer(), nullable=True),
        sa.Column('chassis_id', sa.Text(), nullable=True),
        sa.Column('port_id_subtype', sa.Integer(), nullable=True),
        sa.Column('port_id', sa.Text(), nullable=True),
        sa.Column('created_at', sa.Text(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['file_id'], ['eds_files.id'], ondelete='CASCADE')
    )
    op.create_index('idx_lldp_file', 'eds_lldp_management', ['file_id'])

    # ============================================================================
    # 6. Enum Values (for parameter enumerations)
    # ============================================================================
    op.create_table(
        'eds_enum_values',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('parameter_id', sa.Integer(), nullable=False),
        sa.Column('enum_name', sa.Text(), nullable=False),  # e.g., "Enum4", "Enum12"
        sa.Column('enum_value', sa.Integer(), nullable=True),
        sa.Column('enum_display', sa.Text(), nullable=True),  # e.g., "0 = Disabled"
        sa.Column('is_default', sa.Boolean(), server_default=sa.text('0')),
        sa.Column('created_at', sa.Text(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['parameter_id'], ['eds_parameters.id'], ondelete='CASCADE')
    )
    op.create_index('idx_enum_param', 'eds_enum_values', ['parameter_id'])
    op.create_index('idx_enum_name', 'eds_enum_values', ['enum_name'])

    # ============================================================================
    # 7. File Metadata (HomeURL, Revision, License, etc.)
    # ============================================================================
    op.create_table(
        'eds_file_metadata',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('file_id', sa.Integer(), nullable=False),
        sa.Column('home_url', sa.Text(), nullable=True),
        sa.Column('revision', sa.Text(), nullable=True),
        sa.Column('license_key', sa.Text(), nullable=True),
        sa.Column('icon_contents', sa.Text(), nullable=True),  # Base64 encoded icon
        sa.Column('file_format', sa.Integer(), nullable=True),
        sa.Column('file_revision', sa.Text(), nullable=True),
        sa.Column('created_at', sa.Text(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['file_id'], ['eds_files.id'], ondelete='CASCADE')
    )
    op.create_index('idx_file_meta', 'eds_file_metadata', ['file_id'], unique=True)

    # ============================================================================
    # 8. Object Metadata (CIP object information)
    # ============================================================================
    op.create_table(
        'eds_object_metadata',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('file_id', sa.Integer(), nullable=False),
        sa.Column('section_name', sa.Text(), nullable=False),  # "Assembly", "Connection Manager"
        sa.Column('object_name', sa.Text(), nullable=True),
        sa.Column('object_class_code', sa.Integer(), nullable=True),
        sa.Column('revision', sa.Integer(), nullable=True),
        sa.Column('additional_data', sa.Text(), nullable=True),  # JSON for flexible extra fields
        sa.Column('created_at', sa.Text(), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['file_id'], ['eds_files.id'], ondelete='CASCADE')
    )
    op.create_index('idx_obj_meta_file', 'eds_object_metadata', ['file_id'])
    op.create_index('idx_obj_meta_section', 'eds_object_metadata', ['section_name'])

    # ============================================================================
    # 9. Update eds_files table with missing columns
    # ============================================================================
    # Note: SQLite doesn't support adding NOT NULL columns without defaults
    # We'll add nullable columns and populate them later
    op.add_column('eds_files', sa.Column('icon', sa.Text(), nullable=True))
    op.add_column('eds_files', sa.Column('icon_contents_ref', sa.Integer(), nullable=True))

    # ============================================================================
    # 10. Add columns to eds_assemblies for missing metadata
    # ============================================================================
    op.add_column('eds_assemblies', sa.Column('object_name', sa.Text(), nullable=True))
    op.add_column('eds_assemblies', sa.Column('object_class_code', sa.Integer(), nullable=True))
    op.add_column('eds_assemblies', sa.Column('revision', sa.Integer(), nullable=True))
    op.add_column('eds_assemblies', sa.Column('max_instance', sa.Integer(), nullable=True))

    # ============================================================================
    # 11. Add columns to eds_connections for missing metadata
    # ============================================================================
    op.add_column('eds_connections', sa.Column('object_name', sa.Text(), nullable=True))
    op.add_column('eds_connections', sa.Column('object_class_code', sa.Integer(), nullable=True))
    op.add_column('eds_connections', sa.Column('revision', sa.Integer(), nullable=True))


def downgrade() -> None:
    """Remove EDS advanced sections support."""

    # Drop new tables in reverse order
    op.drop_table('eds_object_metadata')
    op.drop_table('eds_file_metadata')
    op.drop_table('eds_enum_values')
    op.drop_table('eds_lldp_management')
    op.drop_table('eds_qos_config')
    op.drop_table('eds_ethernet_link')
    op.drop_table('eds_tcpip_interface')
    op.drop_table('eds_dlr_config')

    # Drop added columns from existing tables
    # Note: SQLite has limited ALTER TABLE support, may need to recreate tables
    with op.batch_alter_table('eds_connections') as batch_op:
        batch_op.drop_column('revision')
        batch_op.drop_column('object_class_code')
        batch_op.drop_column('object_name')

    with op.batch_alter_table('eds_assemblies') as batch_op:
        batch_op.drop_column('max_instance')
        batch_op.drop_column('revision')
        batch_op.drop_column('object_class_code')
        batch_op.drop_column('object_name')

    with op.batch_alter_table('eds_files') as batch_op:
        batch_op.drop_column('icon_contents_ref')
        batch_op.drop_column('icon')
