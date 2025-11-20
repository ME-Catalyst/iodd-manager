"""expand_network_sections_schema

Revision ID: 9d7556282dff
Revises: 026
Create Date: 2025-11-20 16:54:07.448197

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9d7556282dff'
down_revision = '026'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add common CIP object instance attributes to all network section tables

    # DLR Class - add instance management fields
    op.add_column('eds_dlr_config', sa.Column('max_inst', sa.Integer(), nullable=True))
    op.add_column('eds_dlr_config', sa.Column('num_static_instances', sa.Integer(), nullable=True))
    op.add_column('eds_dlr_config', sa.Column('max_dynamic_instances', sa.Integer(), nullable=True))

    # TCP/IP Interface Class - add instance management fields
    op.add_column('eds_tcpip_interface', sa.Column('max_inst', sa.Integer(), nullable=True))
    op.add_column('eds_tcpip_interface', sa.Column('num_static_instances', sa.Integer(), nullable=True))
    op.add_column('eds_tcpip_interface', sa.Column('max_dynamic_instances', sa.Integer(), nullable=True))

    # Ethernet Link Class - add instance management and multiple interface labels
    op.add_column('eds_ethernet_link', sa.Column('max_inst', sa.Integer(), nullable=True))
    op.add_column('eds_ethernet_link', sa.Column('num_static_instances', sa.Integer(), nullable=True))
    op.add_column('eds_ethernet_link', sa.Column('max_dynamic_instances', sa.Integer(), nullable=True))
    # Store all interface labels as JSON array since there can be multiple (InterfaceLabel1, InterfaceLabel2, etc.)
    op.add_column('eds_ethernet_link', sa.Column('interface_labels', sa.JSON(), nullable=True))

    # QoS Class - add instance management fields
    op.add_column('eds_qos_config', sa.Column('max_inst', sa.Integer(), nullable=True))
    op.add_column('eds_qos_config', sa.Column('num_static_instances', sa.Integer(), nullable=True))
    op.add_column('eds_qos_config', sa.Column('max_dynamic_instances', sa.Integer(), nullable=True))

    # LLDP Management Class - add instance management fields
    op.add_column('eds_lldp_management', sa.Column('max_inst', sa.Integer(), nullable=True))
    op.add_column('eds_lldp_management', sa.Column('num_static_instances', sa.Integer(), nullable=True))
    op.add_column('eds_lldp_management', sa.Column('max_dynamic_instances', sa.Integer(), nullable=True))

    # Add additional_attributes JSON field to all tables for flexibility
    # This allows us to store any other attributes we find without schema changes
    op.add_column('eds_dlr_config', sa.Column('additional_attributes', sa.JSON(), nullable=True))
    op.add_column('eds_tcpip_interface', sa.Column('additional_attributes', sa.JSON(), nullable=True))
    op.add_column('eds_ethernet_link', sa.Column('additional_attributes', sa.JSON(), nullable=True))
    op.add_column('eds_qos_config', sa.Column('additional_attributes', sa.JSON(), nullable=True))
    op.add_column('eds_lldp_management', sa.Column('additional_attributes', sa.JSON(), nullable=True))


def downgrade() -> None:
    # Remove additional_attributes fields
    op.drop_column('eds_lldp_management', 'additional_attributes')
    op.drop_column('eds_qos_config', 'additional_attributes')
    op.drop_column('eds_ethernet_link', 'additional_attributes')
    op.drop_column('eds_tcpip_interface', 'additional_attributes')
    op.drop_column('eds_dlr_config', 'additional_attributes')

    # Remove LLDP instance fields
    op.drop_column('eds_lldp_management', 'max_dynamic_instances')
    op.drop_column('eds_lldp_management', 'num_static_instances')
    op.drop_column('eds_lldp_management', 'max_inst')

    # Remove QoS instance fields
    op.drop_column('eds_qos_config', 'max_dynamic_instances')
    op.drop_column('eds_qos_config', 'num_static_instances')
    op.drop_column('eds_qos_config', 'max_inst')

    # Remove Ethernet Link fields
    op.drop_column('eds_ethernet_link', 'interface_labels')
    op.drop_column('eds_ethernet_link', 'max_dynamic_instances')
    op.drop_column('eds_ethernet_link', 'num_static_instances')
    op.drop_column('eds_ethernet_link', 'max_inst')

    # Remove TCP/IP instance fields
    op.drop_column('eds_tcpip_interface', 'max_dynamic_instances')
    op.drop_column('eds_tcpip_interface', 'num_static_instances')
    op.drop_column('eds_tcpip_interface', 'max_inst')

    # Remove DLR instance fields
    op.drop_column('eds_dlr_config', 'max_dynamic_instances')
    op.drop_column('eds_dlr_config', 'num_static_instances')
    op.drop_column('eds_dlr_config', 'max_inst')
