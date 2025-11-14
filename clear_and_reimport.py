"""Clear all EDS data and re-import with fixed parser."""

import sqlite3
import os
import sys
from pathlib import Path
from eds_package_parser import parse_eds_package
from datetime import datetime

def clear_eds_data():
    """Clear all EDS-related data from database."""
    print("="*80)
    print("CLEARING EDS DATA FROM DATABASE")
    print("="*80)

    conn = sqlite3.connect('iodd_manager.db')
    cursor = conn.cursor()

    # Get counts before deletion
    tables = [
        'eds_files',
        'eds_parameters',
        'eds_connections',
        'eds_ports',
        'eds_capacity',
        'eds_tspecs',
        'eds_packages',
        'eds_package_metadata',
        'eds_diagnostics'
    ]

    print("\nCurrent record counts:")
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"  {table:25s}: {count:5d} records")

    # Delete in correct order (respecting foreign keys)
    print("\nDeleting data...")

    cursor.execute("DELETE FROM eds_diagnostics")
    print("  [OK] Deleted diagnostics")

    cursor.execute("DELETE FROM eds_tspecs")
    print("  [OK] Deleted TSpecs")

    cursor.execute("DELETE FROM eds_capacity")
    print("  [OK] Deleted capacity data")

    cursor.execute("DELETE FROM eds_ports")
    print("  [OK] Deleted ports")

    cursor.execute("DELETE FROM eds_connections")
    print("  [OK] Deleted connections")

    cursor.execute("DELETE FROM eds_parameters")
    print("  [OK] Deleted parameters")

    cursor.execute("DELETE FROM eds_package_metadata")
    print("  [OK] Deleted package metadata")

    cursor.execute("DELETE FROM eds_files")
    print("  [OK] Deleted EDS files")

    cursor.execute("DELETE FROM eds_packages")
    print("  [OK] Deleted packages")

    conn.commit()

    # Verify deletion
    print("\nVerifying deletion:")
    all_clear = True
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        status = "[OK]" if count == 0 else "[ERROR]"
        print(f"  {status} {table:25s}: {count:5d} records")
        if count > 0:
            all_clear = False

    conn.close()

    if all_clear:
        print("\n[SUCCESS] All EDS data cleared!")
        return True
    else:
        print("\n[ERROR] Some data remains!")
        return False

def import_package(package_path):
    """Import a single EDS package."""
    package_name = Path(package_path).stem

    print(f"\n{'='*80}")
    print(f"Importing: {package_name}")
    print('='*80)

    # Parse package
    try:
        package_data = parse_eds_package(package_path)
    except Exception as e:
        print(f"[ERROR] Failed to parse package: {e}")
        return False

    eds_files = package_data.get('eds_files', [])
    print(f"  Found {len(eds_files)} EDS files in package")

    if len(eds_files) == 0:
        print(f"  [WARN] No EDS files found in package")
        return True

    conn = sqlite3.connect('iodd_manager.db')
    cursor = conn.cursor()

    # Insert package record
    cursor.execute("""
        INSERT INTO eds_packages (
            package_name, upload_date, package_checksum, vendor_name,
            total_eds_files, total_versions
        ) VALUES (?, ?, ?, ?, ?, ?)
    """, (
        package_name,
        datetime.now(),
        package_data.get('checksum'),
        package_data.get('vendor_name'),
        len(eds_files),
        len(package_data.get('versions', []))
    ))

    package_id = cursor.lastrowid
    print(f"  [OK] Created package record (ID={package_id})")

    # Import each EDS file
    imported_count = 0
    skipped_count = 0
    for idx, eds_info in enumerate(eds_files, 1):
        parsed_data = eds_info.get('parsed_data', {})
        device = parsed_data.get('device', {})
        file_info = parsed_data.get('file_info', {})
        device_classification = parsed_data.get('device_classification', {})

        # Check if EDS with this checksum already exists
        checksum = parsed_data.get('source', {}).get('file_hash')
        cursor.execute("SELECT id FROM eds_files WHERE file_checksum = ?", (checksum,))
        existing = cursor.fetchone()

        if existing:
            skipped_count += 1
            continue  # Skip duplicate

        # Insert EDS file
        try:
            cursor.execute("""
                INSERT INTO eds_files (
                    vendor_code, vendor_name, product_code, product_type,
                    product_type_str, product_name, catalog_number,
                    major_revision, minor_revision, description,
                    icon_filename, icon_data, eds_content, home_url,
                    import_date, file_checksum,
                    create_date, create_time, mod_date, mod_time, file_revision,
                    class1, class2, class3, class4,
                    package_id, variant_type, version_folder, file_path_in_package
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                device.get('vendor_code'),
                device.get('vendor_name'),
                device.get('product_code'),
                device.get('product_type'),
                device.get('product_type_str'),
                device.get('product_name'),
                device.get('catalog_number'),
                device.get('major_revision'),
                device.get('minor_revision'),
                file_info.get('description'),
                eds_info.get('icon_filename'),
                eds_info.get('icon_data'),
                parsed_data.get('eds_content'),
                file_info.get('home_url'),
                datetime.now(),
                parsed_data.get('source', {}).get('file_hash'),
                file_info.get('create_date'),
                file_info.get('create_time'),
                file_info.get('mod_date'),
                file_info.get('mod_time'),
                file_info.get('revision'),
                device_classification.get('class1'),
                device_classification.get('class2'),
                device_classification.get('class3'),
                device_classification.get('class4'),
                package_id,
                eds_info.get('variant_type'),
                eds_info.get('version_folder'),
                eds_info.get('file_path')
            ))

            eds_id = cursor.lastrowid

            # Insert parameters with enum_values
            for param in parsed_data.get('parameters', []):
                cursor.execute("""
                    INSERT INTO eds_parameters (
                    eds_file_id, param_number, param_name, data_type,
                    data_size, default_value, min_value, max_value,
                    description, link_path_size, link_path, descriptor,
                    help_string_1, help_string_2, help_string_3, enum_values
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                eds_id,
                param.get('param_number'),
                param.get('param_name'),
                param.get('data_type'),
                param.get('data_size'),
                param.get('default_value'),
                param.get('min_value'),
                param.get('max_value'),
                param.get('help_string_1', ''),
                param.get('link_path_size'),
                param.get('link_path'),
                param.get('descriptor'),
                param.get('help_string_1'),
                param.get('help_string_2'),
                param.get('help_string_3'),
                param.get('enum_values')  # JSON string or None
            ))

            # Insert connections
            for conn_info in parsed_data.get('connections', []):
                cursor.execute("""
                    INSERT INTO eds_connections (
                        eds_file_id, connection_number, connection_name,
                        trigger_transport, connection_params,
                        output_assembly, input_assembly, help_string,
                        o_to_t_params, t_to_o_params, config_part1, config_part2,
                        path, trigger_transport_comment, connection_params_comment
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    eds_id,
                    conn_info.get('connection_number'),
                    conn_info.get('connection_name'),
                    conn_info.get('trigger_transport'),
                    conn_info.get('connection_params'),
                    conn_info.get('o_to_t_params'),
                    conn_info.get('t_to_o_params'),
                    conn_info.get('help_string'),
                    conn_info.get('o_to_t_params'),
                    conn_info.get('t_to_o_params'),
                    conn_info.get('config_part1'),
                    conn_info.get('config_part2'),
                    conn_info.get('path'),
                    conn_info.get('trigger_transport_comment'),
                    conn_info.get('connection_params_comment')
                ))

            # Insert assemblies
            assemblies = parsed_data.get('assemblies', {})

            # Insert fixed assemblies
            for assembly in assemblies.get('fixed', []):
                cursor.execute("""
                    INSERT INTO eds_assemblies (
                        eds_file_id, assembly_number, assembly_name, assembly_type,
                        unknown_field1, size, unknown_field2, path,
                        help_string, is_variable
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    eds_id,
                    assembly.get('assembly_number'),
                    assembly.get('assembly_name'),
                    assembly.get('assembly_type'),
                    assembly.get('unknown_field1'),
                    assembly.get('size'),
                    assembly.get('unknown_field2'),
                    assembly.get('path'),
                    assembly.get('help_string'),
                    assembly.get('is_variable', False)
                ))

            # Insert variable assemblies
            for var_assembly in assemblies.get('variable', []):
                cursor.execute("""
                    INSERT INTO eds_variable_assemblies (
                        eds_file_id, assembly_name, assembly_number,
                        unknown_value1, max_size, description
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    eds_id,
                    var_assembly.get('assembly_name'),
                    var_assembly.get('assembly_number'),
                    var_assembly.get('unknown_value1'),
                    var_assembly.get('max_size'),
                    var_assembly.get('description')
                ))

            # Insert ports
            for port in parsed_data.get('ports', []):
                cursor.execute("""
                    INSERT INTO eds_ports (
                        eds_file_id, port_number, port_type, port_name,
                        port_path, link_number
                    ) VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    eds_id,
                    port.get('port_number'),
                    port.get('port_type'),
                    port.get('port_name'),
                    port.get('port_path'),
                    port.get('link_number')
                ))

            # Insert capacity
            capacity = parsed_data.get('capacity', {})
            if capacity:
                cursor.execute("""
                    INSERT INTO eds_capacity (
                        eds_file_id, max_msg_connections, max_io_producers,
                        max_io_consumers, max_cx_per_config_tool
                    ) VALUES (?, ?, ?, ?, ?)
                """, (
                    eds_id,
                    capacity.get('max_msg_connections'),
                    capacity.get('max_io_producers'),
                    capacity.get('max_io_consumers'),
                    capacity.get('max_cx_per_config_tool')
                ))

                # Insert TSpecs
                for tspec in capacity.get('tspecs', []):
                    cursor.execute("""
                        INSERT INTO eds_tspecs (
                            eds_file_id, tspec_name, direction, data_size, rate
                        ) VALUES (?, ?, ?, ?, ?)
                    """, (
                        eds_id,
                        tspec.get('tspec_name'),
                        tspec.get('direction'),
                        tspec.get('data_size'),
                        tspec.get('rate')
                    ))

            imported_count += 1

        except Exception as e:
            print(f"  [ERROR] Failed to import EDS file {idx}: {e}")
            skipped_count += 1
            continue

        # Progress indicator
        if idx % 10 == 0 or idx == len(eds_files):
            print(f"  Progress: {idx}/{len(eds_files)} processed ({imported_count} imported, {skipped_count} skipped)...")

    conn.commit()
    conn.close()

    print(f"  [SUCCESS] Imported {imported_count} EDS files from {package_name} ({skipped_count} duplicates skipped)")
    return True

def reimport_all_packages():
    """Re-import all test packages."""
    packages_dir = Path('test-data/eds-packages')

    if not packages_dir.exists():
        print(f"[ERROR] Directory not found: {packages_dir}")
        return False

    # Get all ZIP files
    packages = sorted(packages_dir.glob('*.zip'))

    if not packages:
        print(f"[ERROR] No ZIP files found in {packages_dir}")
        return False

    print(f"\n{'='*80}")
    print(f"RE-IMPORTING ALL PACKAGES")
    print('='*80)
    print(f"Found {len(packages)} packages to import\n")

    success_count = 0
    fail_count = 0

    for package in packages:
        if import_package(package):
            success_count += 1
        else:
            fail_count += 1

    # Summary
    print(f"\n{'='*80}")
    print("RE-IMPORT SUMMARY")
    print('='*80)
    print(f"  Total Packages: {len(packages)}")
    print(f"  Success: {success_count}")
    print(f"  Failed: {fail_count}")

    return fail_count == 0

def main():
    """Main function."""
    print("\n" + "="*80)
    print("EDS DATABASE CLEAR & RE-IMPORT TOOL")
    print("="*80)

    # Step 1: Clear data
    if not clear_eds_data():
        print("\n[ERROR] Failed to clear data. Aborting.")
        return 1

    # Step 2: Re-import
    if not reimport_all_packages():
        print("\n[ERROR] Some packages failed to import.")
        return 1

    # Step 3: Verify
    print(f"\n{'='*80}")
    print("VERIFICATION")
    print('='*80)

    conn = sqlite3.connect('iodd_manager.db')
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM eds_files")
    eds_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM eds_parameters")
    param_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM eds_capacity WHERE max_msg_connections IS NOT NULL")
    capacity_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM eds_assemblies")
    assembly_count = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM eds_variable_assemblies")
    var_assembly_count = cursor.fetchone()[0]

    print(f"  EDS Files: {eds_count}")
    print(f"  Parameters: {param_count}")
    print(f"  Assemblies (fixed): {assembly_count}")
    print(f"  Assemblies (variable): {var_assembly_count}")
    print(f"  Capacity Records (with data): {capacity_count}")

    conn.close()

    print(f"\n{'='*80}")
    print("[SUCCESS] Database cleared and re-imported successfully!")
    print('='*80)

    return 0

if __name__ == '__main__':
    sys.exit(main())
