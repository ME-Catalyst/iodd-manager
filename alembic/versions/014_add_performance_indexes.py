"""
Add performance indexes to improve query speed

Revision ID: 014
Revises: 013
Create Date: 2025-01-14
"""

from alembic import op
from sqlalchemy import text

# revision identifiers
revision = '014'
down_revision = '013'
branch_labels = None
depends_on = None


def upgrade():
    """Add indexes for improved query performance."""
    conn = op.get_bind()

    indexes = [
        # IODD Device indexes
        'CREATE INDEX IF NOT EXISTS idx_devices_vendor_id ON devices(vendor_id)',
        'CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id)',
        'CREATE INDEX IF NOT EXISTS idx_devices_product_name ON devices(product_name)',
        'CREATE INDEX IF NOT EXISTS idx_devices_manufacturer ON devices(manufacturer)',

        # IODD Files indexes
        'CREATE INDEX IF NOT EXISTS idx_iodd_files_device_id ON iodd_files(device_id)',

        # Parameters indexes (most queried table)
        'CREATE INDEX IF NOT EXISTS idx_parameters_device_id ON parameters(device_id)',
        'CREATE INDEX IF NOT EXISTS idx_parameters_name ON parameters(name)',
        'CREATE INDEX IF NOT EXISTS idx_parameters_param_index ON parameters(param_index)',
        'CREATE INDEX IF NOT EXISTS idx_parameters_data_type ON parameters(data_type)',
        'CREATE INDEX IF NOT EXISTS idx_parameters_access_rights ON parameters(access_rights)',

        # Process Data indexes
        'CREATE INDEX IF NOT EXISTS idx_process_data_device_id ON process_data(device_id)',
        'CREATE INDEX IF NOT EXISTS idx_process_data_direction ON process_data(direction)',
        'CREATE INDEX IF NOT EXISTS idx_process_data_record_items_process_data_id ON process_data_record_items(process_data_id)',

        # Error Types and Events indexes
        'CREATE INDEX IF NOT EXISTS idx_error_types_device_id ON error_types(device_id)',
        'CREATE INDEX IF NOT EXISTS idx_error_types_code ON error_types(code)',
        'CREATE INDEX IF NOT EXISTS idx_events_device_id ON events(device_id)',
        'CREATE INDEX IF NOT EXISTS idx_events_code ON events(code)',

        # UI Menus indexes
        'CREATE INDEX IF NOT EXISTS idx_ui_menus_device_id ON ui_menus(device_id)',
        'CREATE INDEX IF NOT EXISTS idx_ui_menu_items_menu_id ON ui_menu_items(menu_id)',
        'CREATE INDEX IF NOT EXISTS idx_ui_menu_roles_device_id ON ui_menu_roles(device_id)',

        # EDS Files indexes
        'CREATE INDEX IF NOT EXISTS idx_eds_files_vendor_name ON eds_files(vendor_name)',
        'CREATE INDEX IF NOT EXISTS idx_eds_files_product_name ON eds_files(product_name)',
        'CREATE INDEX IF NOT EXISTS idx_eds_files_vendor_code ON eds_files(vendor_code)',
        'CREATE INDEX IF NOT EXISTS idx_eds_files_product_code ON eds_files(product_code)',
        'CREATE INDEX IF NOT EXISTS idx_eds_files_package_id ON eds_files(eds_package_id)',

        # EDS Parameters indexes
        'CREATE INDEX IF NOT EXISTS idx_eds_parameters_eds_file_id ON eds_parameters(eds_file_id)',
        'CREATE INDEX IF NOT EXISTS idx_eds_parameters_param_name ON eds_parameters(param_name)',
        'CREATE INDEX IF NOT EXISTS idx_eds_parameters_param_number ON eds_parameters(param_number)',
        'CREATE INDEX IF NOT EXISTS idx_eds_parameters_data_type ON eds_parameters(data_type)',

        # EDS Assemblies indexes
        'CREATE INDEX IF NOT EXISTS idx_eds_assemblies_eds_file_id ON eds_assemblies(eds_file_id)',
        'CREATE INDEX IF NOT EXISTS idx_eds_assemblies_assembly_number ON eds_assemblies(assembly_number)',
        'CREATE INDEX IF NOT EXISTS idx_eds_assemblies_assembly_name ON eds_assemblies(assembly_name)',

        # EDS Connections indexes
        'CREATE INDEX IF NOT EXISTS idx_eds_connections_eds_file_id ON eds_connections(eds_file_id)',
        'CREATE INDEX IF NOT EXISTS idx_eds_connections_connection_number ON eds_connections(connection_number)',
        'CREATE INDEX IF NOT EXISTS idx_eds_connections_connection_type ON eds_connections(connection_type)',

        # EDS Modules indexes
        'CREATE INDEX IF NOT EXISTS idx_eds_modules_eds_file_id ON eds_modules(eds_file_id)',

        # EDS Groups indexes
        'CREATE INDEX IF NOT EXISTS idx_eds_groups_eds_file_id ON eds_groups(eds_file_id)',

        # EDS Ports indexes
        'CREATE INDEX IF NOT EXISTS idx_eds_ports_eds_file_id ON eds_ports(eds_file_id)',

        # EDS Diagnostics indexes
        'CREATE INDEX IF NOT EXISTS idx_eds_diagnostics_eds_file_id ON eds_diagnostics(eds_file_id)',
        'CREATE INDEX IF NOT EXISTS idx_eds_diagnostics_severity ON eds_diagnostics(severity)',

        # EDS Capacity indexes
        'CREATE INDEX IF NOT EXISTS idx_eds_capacity_eds_file_id ON eds_capacity(eds_file_id)',

        # Ticket System indexes
        'CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_device_type ON tickets(device_type)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at)',
        'CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id)',
        'CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id)',

        # Composite indexes for common query patterns
        'CREATE INDEX IF NOT EXISTS idx_parameters_device_id_name ON parameters(device_id, name)',
        'CREATE INDEX IF NOT EXISTS idx_eds_parameters_eds_file_id_param_number ON eds_parameters(eds_file_id, param_number)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_status_priority ON tickets(status, priority)',
        'CREATE INDEX IF NOT EXISTS idx_tickets_device_type_device_id ON tickets(device_type, device_id)',
    ]

    for idx in indexes:
        try:
            conn.execute(text(idx))
        except Exception as e:
            # Table might not exist, skip this index
            print(f"Skipping index (table may not exist): {e}")
            pass

    conn.commit()
    print("Added performance indexes successfully")


def downgrade():
    """Remove performance indexes."""
    conn = op.get_bind()

    # Drop all indexes
    indexes = [
        # IODD indexes
        'idx_devices_vendor_id', 'idx_devices_device_id', 'idx_devices_product_name',
        'idx_devices_manufacturer', 'idx_iodd_files_device_id',
        'idx_parameters_device_id', 'idx_parameters_name', 'idx_parameters_param_index',
        'idx_parameters_data_type', 'idx_parameters_access_rights',
        'idx_process_data_device_id', 'idx_process_data_direction',
        'idx_process_data_record_items_process_data_id',
        'idx_error_types_device_id', 'idx_error_types_code',
        'idx_events_device_id', 'idx_events_code',
        'idx_ui_menus_device_id', 'idx_ui_menu_items_menu_id',
        'idx_ui_menu_roles_device_id',

        # EDS indexes
        'idx_eds_files_vendor_name', 'idx_eds_files_product_name',
        'idx_eds_files_vendor_code', 'idx_eds_files_product_code',
        'idx_eds_files_package_id',
        'idx_eds_parameters_eds_file_id', 'idx_eds_parameters_param_name',
        'idx_eds_parameters_param_number', 'idx_eds_parameters_data_type',
        'idx_eds_assemblies_eds_file_id', 'idx_eds_assemblies_assembly_number',
        'idx_eds_assemblies_assembly_name',
        'idx_eds_connections_eds_file_id', 'idx_eds_connections_connection_number',
        'idx_eds_connections_connection_type',
        'idx_eds_modules_eds_file_id', 'idx_eds_groups_eds_file_id',
        'idx_eds_ports_eds_file_id',
        'idx_eds_diagnostics_eds_file_id', 'idx_eds_diagnostics_severity',
        'idx_eds_capacity_eds_file_id',

        # Ticket indexes
        'idx_tickets_status', 'idx_tickets_priority', 'idx_tickets_device_type',
        'idx_tickets_category', 'idx_tickets_created_at',
        'idx_ticket_comments_ticket_id', 'idx_ticket_attachments_ticket_id',

        # Composite indexes
        'idx_parameters_device_id_name',
        'idx_eds_parameters_eds_file_id_param_number',
        'idx_tickets_status_priority',
        'idx_tickets_device_type_device_id'
    ]

    for idx in indexes:
        try:
            conn.execute(text(f'DROP INDEX IF EXISTS {idx}'))
        except:
            pass  # Index might not exist

    conn.commit()
    print("Removed performance indexes")
