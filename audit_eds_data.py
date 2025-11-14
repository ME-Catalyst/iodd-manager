"""Audit EDS data quality by comparing database to source file."""

import sqlite3
import zipfile
import tempfile
from pathlib import Path
from eds_parser import parse_eds_file

def audit_eds(eds_id):
    """Audit a specific EDS file's data quality."""

    print(f"\n{'='*80}")
    print(f"EDS DATA QUALITY AUDIT - ID: {eds_id}")
    print('='*80)

    conn = sqlite3.connect('iodd_manager.db')
    cursor = conn.cursor()

    # Get EDS file info from database
    cursor.execute("""
        SELECT id, product_name, vendor_name, catalog_number, package_id,
               file_path_in_package, variant_type, version_folder
        FROM eds_files
        WHERE id = ?
    """, (eds_id,))

    eds_row = cursor.fetchone()
    if not eds_row:
        print(f"ERROR: EDS ID {eds_id} not found")
        return

    eds_db_id, product_name, vendor_name, catalog, package_id, file_path, variant, version = eds_row

    print(f"\nDatabase Record:")
    print(f"  Product: {product_name}")
    print(f"  Vendor: {vendor_name}")
    print(f"  Catalog: {catalog}")
    print(f"  Package ID: {package_id}")
    print(f"  File Path: {file_path}")
    print(f"  Variant: {variant}")
    print(f"  Version: {version}")

    # Get package info
    cursor.execute("SELECT package_name FROM eds_packages WHERE id = ?", (package_id,))
    package_row = cursor.fetchone()
    if not package_row:
        print(f"ERROR: Package ID {package_id} not found")
        return

    package_name = package_row[0]
    package_file = f"test-data/eds-packages/{package_name}.zip"

    print(f"  Package: {package_name}.zip")

    # Extract and parse source EDS file
    print(f"\n{'='*80}")
    print("PARSING SOURCE FILE")
    print('='*80)

    try:
        with zipfile.ZipFile(package_file, 'r') as zf:
            # Find the EDS file
            eds_content = zf.read(file_path).decode('utf-8', errors='ignore')

            # Parse it
            parsed_data, diagnostics = parse_eds_file(eds_content, file_path)

            print(f"\nParsed Data Summary:")
            print(f"  Device Fields: {len(parsed_data.get('device', {}))}")
            print(f"  Parameters: {len(parsed_data.get('parameters', []))}")
            print(f"  Connections: {len(parsed_data.get('connections', []))}")
            print(f"  Ports: {len(parsed_data.get('ports', []))}")

            capacity = parsed_data.get('capacity', {})
            print(f"  Capacity:")
            print(f"    MaxMsgConnections: {capacity.get('max_msg_connections')}")
            print(f"    MaxIOProducers: {capacity.get('max_io_producers')}")
            print(f"    MaxIOConsumers: {capacity.get('max_io_consumers')}")
            print(f"    TSpecs: {len(capacity.get('tspecs', []))}")

    except Exception as e:
        print(f"ERROR parsing source: {e}")
        import traceback
        traceback.print_exc()
        return

    # Compare to database
    print(f"\n{'='*80}")
    print("DATABASE vs SOURCE COMPARISON")
    print('='*80)

    issues = []

    # Check device info
    cursor.execute("""
        SELECT vendor_code, vendor_name, product_code, product_name,
               catalog_number, major_revision, minor_revision
        FROM eds_files WHERE id = ?
    """, (eds_id,))

    db_device = cursor.fetchone()
    src_device = parsed_data.get('device', {})

    print(f"\n[Device Info]")
    device_fields = [
        ('vendor_code', db_device[0], src_device.get('vendor_code')),
        ('vendor_name', db_device[1], src_device.get('vendor_name')),
        ('product_code', db_device[2], src_device.get('product_code')),
        ('product_name', db_device[3], src_device.get('product_name')),
        ('catalog_number', db_device[4], src_device.get('catalog_number')),
        ('major_revision', db_device[5], src_device.get('major_revision')),
        ('minor_revision', db_device[6], src_device.get('minor_revision')),
    ]

    for field_name, db_val, src_val in device_fields:
        match = "✓" if db_val == src_val else "✗"
        print(f"  {match} {field_name:20s}: DB={db_val} | SRC={src_val}")
        if db_val != src_val:
            issues.append(f"Device.{field_name} mismatch: DB={db_val}, SRC={src_val}")

    # Check parameters
    cursor.execute("SELECT COUNT(*) FROM eds_parameters WHERE eds_file_id = ?", (eds_id,))
    db_param_count = cursor.fetchone()[0]
    src_param_count = len(parsed_data.get('parameters', []))

    print(f"\n[Parameters]")
    match = "✓" if db_param_count == src_param_count else "✗"
    print(f"  {match} Count: DB={db_param_count} | SRC={src_param_count}")
    if db_param_count != src_param_count:
        issues.append(f"Parameter count mismatch: DB={db_param_count}, SRC={src_param_count}")

    # Check connections
    cursor.execute("SELECT COUNT(*) FROM eds_connections WHERE eds_file_id = ?", (eds_id,))
    db_conn_count = cursor.fetchone()[0]
    src_conn_count = len(parsed_data.get('connections', []))

    print(f"\n[Connections]")
    match = "✓" if db_conn_count == src_conn_count else "✗"
    print(f"  {match} Count: DB={db_conn_count} | SRC={src_conn_count}")
    if db_conn_count != src_conn_count:
        issues.append(f"Connection count mismatch: DB={db_conn_count}, SRC={src_conn_count}")

    # Check ports
    cursor.execute("SELECT COUNT(*) FROM eds_ports WHERE eds_file_id = ?", (eds_id,))
    db_port_count = cursor.fetchone()[0]
    src_port_count = len(parsed_data.get('ports', []))

    print(f"\n[Ports]")
    match = "✓" if db_port_count == src_port_count else "✗"
    print(f"  {match} Count: DB={db_port_count} | SRC={src_port_count}")
    if db_port_count != src_port_count:
        issues.append(f"Port count mismatch: DB={db_port_count}, SRC={src_port_count}")

    # Check capacity
    cursor.execute("""
        SELECT max_msg_connections, max_io_producers, max_io_consumers, max_cx_per_config_tool
        FROM eds_capacity WHERE eds_file_id = ?
    """, (eds_id,))

    db_capacity = cursor.fetchone()
    src_capacity = parsed_data.get('capacity', {})

    print(f"\n[Capacity]")
    if db_capacity:
        capacity_fields = [
            ('max_msg_connections', db_capacity[0], src_capacity.get('max_msg_connections')),
            ('max_io_producers', db_capacity[1], src_capacity.get('max_io_producers')),
            ('max_io_consumers', db_capacity[2], src_capacity.get('max_io_consumers')),
            ('max_cx_per_config_tool', db_capacity[3], src_capacity.get('max_cx_per_config_tool')),
        ]

        for field_name, db_val, src_val in capacity_fields:
            match = "✓" if db_val == src_val else "✗"
            print(f"  {match} {field_name:25s}: DB={db_val} | SRC={src_val}")
            if db_val != src_val:
                issues.append(f"Capacity.{field_name} mismatch: DB={db_val}, SRC={src_val}")
    else:
        print(f"  ✗ No capacity data in database!")
        issues.append("Capacity data missing from database")

    # Check TSpecs
    cursor.execute("SELECT COUNT(*) FROM eds_tspecs WHERE eds_file_id = ?", (eds_id,))
    db_tspec_count = cursor.fetchone()[0]
    src_tspec_count = len(src_capacity.get('tspecs', []))

    print(f"\n[TSpecs]")
    match = "✓" if db_tspec_count == src_tspec_count else "✗"
    print(f"  {match} Count: DB={db_tspec_count} | SRC={src_tspec_count}")
    if db_tspec_count != src_tspec_count:
        issues.append(f"TSpec count mismatch: DB={db_tspec_count}, SRC={src_tspec_count}")

    # Summary
    print(f"\n{'='*80}")
    print("AUDIT SUMMARY")
    print('='*80)

    if issues:
        print(f"\n[ISSUES FOUND] {len(issues)} problems detected:")
        for i, issue in enumerate(issues, 1):
            print(f"  {i}. {issue}")
    else:
        print(f"\n✓ NO ISSUES FOUND - Data quality is perfect!")

    conn.close()

if __name__ == '__main__':
    audit_eds(1)
