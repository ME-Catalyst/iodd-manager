"""
Complete re-upload of Device 27 with ALL sections
Uses the same insertion logic as eds_routes.py
"""

import sqlite3
import sys
import json
import logging
from datetime import datetime
from src.parsers.eds_parser import parse_eds_file, EDSParser
from src.parsers.eds_advanced_sections import EDSAdvancedSectionsParser
from src.parsers.eds_diagnostics import Severity
from src.database import get_db_path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def complete_reupload():
    conn = sqlite3.connect(get_db_path())
    cursor = conn.cursor()

    print("="*80)
    print("Complete Re-upload of Device 27 (55514.eds)")
    print("="*80)

    # Get Device 27's EDS content from archive
    cursor.execute('''
        SELECT file_content
        FROM pqa_file_archive
        WHERE device_id = 27 AND file_type = 'EDS'
        ORDER BY id DESC LIMIT 1
    ''')
    row = cursor.fetchone()

    if not row:
        print("[ERROR] Could not find Device 27")
        conn.close()
        return False

    eds_content = row[0].decode('utf-8', errors='ignore')
    print(f"\n[1] Retrieved EDS file ({len(eds_content)} bytes)")

    # Parse the file
    print(f"\n[2] Parsing EDS file with diagnostics...")
    parsed_data, diagnostics = parse_eds_file(eds_content, file_path="55514.eds")

    device_info = parsed_data['device']
    file_info = parsed_data['file_info']
    device_classification = parsed_data['device_classification']
    checksum = parsed_data['checksum']

    print(f"    - Device: {device_info.get('product_name')}")
    print(f"    - Vendor: {device_info.get('vendor_name')}")
    print(f"    - Parameters: {len(parsed_data.get('parameters', []))}")
    print(f"    - Connections: {len(parsed_data.get('connections', []))}")
    print(f"    - Assemblies: {len(parsed_data.get('assemblies', {}).get('fixed', []))}")
    print(f"    - Groups: {len(parsed_data.get('groups', []))}")
    print(f"    - Capacity data: {bool(parsed_data.get('capacity'))}")

    # Delete old entry
    print(f"\n[3] Cleaning up old database entry...")
    cursor.execute('SELECT id FROM eds_files WHERE product_code = 55514')
    old_entry = cursor.fetchone()

    if old_entry:
        old_id = old_entry[0]
        print(f"    - Deleting old eds_file_id: {old_id}")

        # Delete related records in correct order (respect foreign keys)
        cursor.execute('DELETE FROM eds_enum_values WHERE parameter_id IN (SELECT id FROM eds_parameters WHERE eds_file_id = ?)', (old_id,))
        cursor.execute('DELETE FROM eds_parameters WHERE eds_file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_diagnostics WHERE eds_file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_variable_assemblies WHERE eds_file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_assemblies WHERE eds_file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_connections WHERE eds_file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_ports WHERE eds_file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_groups WHERE eds_file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_modules WHERE eds_file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_tspecs WHERE eds_file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_capacity WHERE eds_file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_dlr_config WHERE file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_tcpip_interface WHERE file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_ethernet_link WHERE file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_qos_config WHERE file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_lldp_management WHERE file_id = ?', (old_id,))
        cursor.execute('DELETE FROM eds_files WHERE id = ?', (old_id,))
        print(f"    - Cleanup complete")

    # Insert new EDS file (copied from eds_routes.py)
    print(f"\n[4] Inserting EDS file record...")
    cursor.execute("""
        INSERT INTO eds_files (
            vendor_code, vendor_name, product_code, product_type,
            product_type_str, product_name, catalog_number,
            major_revision, minor_revision, description,
            icon_filename, icon_data, eds_content, home_url,
            import_date, file_checksum,
            create_date, create_time, mod_date, mod_time, file_revision,
            class1, class2, class3, class4
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        device_info.get('vendor_code'),
        device_info.get('vendor_name'),
        device_info.get('product_code'),
        device_info.get('product_type'),
        device_info.get('product_type_str'),
        device_info.get('product_name'),
        device_info.get('catalog_number'),
        device_info.get('major_revision'),
        device_info.get('minor_revision'),
        file_info.get('description'),
        device_info.get('icon_filename'),
        device_info.get('icon_data'),
        eds_content,
        file_info.get('home_url'),
        datetime.now(),
        checksum,
        file_info.get('create_date'),
        file_info.get('create_time'),
        file_info.get('mod_date'),
        file_info.get('mod_time'),
        file_info.get('revision'),
        device_classification.get('class1'),
        device_classification.get('class2'),
        device_classification.get('class3'),
        device_classification.get('class4')
    ))

    eds_id = cursor.lastrowid
    print(f"    - New eds_file_id: {eds_id}")

    # Store diagnostics
    diag_counts = {
        'info': sum(1 for d in diagnostics.diagnostics if d.severity == Severity.INFO),
        'warn': sum(1 for d in diagnostics.diagnostics if d.severity == Severity.WARN),
        'error': sum(1 for d in diagnostics.diagnostics if d.severity == Severity.ERROR),
        'fatal': sum(1 for d in diagnostics.diagnostics if d.severity == Severity.FATAL)
    }
    has_issues = diagnostics.has_errors() or diag_counts['warn'] > 0

    cursor.execute("""
        UPDATE eds_files
        SET diagnostic_info_count = ?,
            diagnostic_warn_count = ?,
            diagnostic_error_count = ?,
            diagnostic_fatal_count = ?,
            has_parsing_issues = ?
        WHERE id = ?
    """, (
        diag_counts['info'],
        diag_counts['warn'],
        diag_counts['error'],
        diag_counts['fatal'],
        has_issues,
        eds_id
    ))

    # Insert diagnostics
    for diag in diagnostics.diagnostics:
        cursor.execute("""
            INSERT INTO eds_diagnostics (
                eds_file_id, severity, code, message,
                section, line, column, context, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            eds_id,
            diag.severity.value,
            diag.code,
            diag.message,
            diag.location.section if diag.location else None,
            diag.location.line if diag.location else None,
            diag.location.column if diag.location else None,
            diag.context,
            datetime.now().isoformat()
        ))

    # Insert parameters with enums
    print(f"\n[5] Inserting {len(parsed_data.get('parameters', []))} parameters...")
    enum_values_inserted = 0

    for param in parsed_data.get('parameters', []):
        cursor.execute("""
            INSERT INTO eds_parameters (
                eds_file_id, param_number, param_name, data_type,
                data_size, default_value, min_value, max_value,
                description, link_path_size, link_path, descriptor,
                help_string_1, help_string_2, help_string_3, enum_values,
                units, scaling_multiplier, scaling_divisor, scaling_base, scaling_offset,
                link_scaling_multiplier, link_scaling_divisor, link_scaling_base, link_scaling_offset,
                decimal_places
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            param.get('enum_values'),
            param.get('units'),
            param.get('scaling_multiplier'),
            param.get('scaling_divisor'),
            param.get('scaling_base'),
            param.get('scaling_offset'),
            param.get('link_scaling_multiplier'),
            param.get('link_scaling_divisor'),
            param.get('link_scaling_base'),
            param.get('link_scaling_offset'),
            param.get('decimal_places')
        ))

        parameter_id = cursor.lastrowid

        # Insert enum values
        enum_values_json = param.get('enum_values')
        if enum_values_json:
            try:
                enum_values = json.loads(enum_values_json)
                for enum_entry in enum_values:
                    cursor.execute("""
                        INSERT INTO eds_enum_values (
                            parameter_id, enum_name, enum_value, enum_display, is_default
                        ) VALUES (?, ?, ?, ?, ?)
                    """, (
                        parameter_id,
                        f"Enum{param.get('param_number')}",
                        enum_entry.get('value'),
                        enum_entry.get('label'),
                        1 if enum_entry.get('is_default') else 0
                    ))
                    enum_values_inserted += 1
            except (json.JSONDecodeError, TypeError) as e:
                logger.warning(f"Failed to parse enum values for param {param.get('param_number')}: {e}")

    print(f"    - Inserted {enum_values_inserted} enum values")

    # Insert connections
    print(f"\n[6] Inserting {len(parsed_data.get('connections', []))} connections...")
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
            eds_id, conn_info.get('connection_number'), conn_info.get('connection_name'),
            conn_info.get('trigger_transport'), conn_info.get('connection_params'),
            conn_info.get('o_to_t_params'), conn_info.get('t_to_o_params'),
            conn_info.get('help_string'), conn_info.get('o_to_t_params'),
            conn_info.get('t_to_o_params'), conn_info.get('config_part1'),
            conn_info.get('config_part2'), conn_info.get('path'),
            conn_info.get('trigger_transport_comment'), conn_info.get('connection_params_comment')
        ))

    # Insert assemblies
    assemblies = parsed_data.get('assemblies', {})
    print(f"\n[7] Inserting {len(assemblies.get('fixed', []))} assemblies...")
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
            False
        ))

    # Insert variable assemblies
    for var_assembly in assemblies.get('variable', []):
        cursor.execute("""
            INSERT INTO eds_variable_assemblies (
                eds_file_id, assembly_number, assembly_name,
                unknown_value1, max_size, description
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            eds_id,
            var_assembly.get('assembly_number'),
            var_assembly.get('assembly_name'),
            var_assembly.get('unknown_value1'),
            var_assembly.get('max_size'),
            var_assembly.get('description')
        ))

    # Insert ports
    print(f"\n[8] Inserting {len(parsed_data.get('ports', []))} ports...")
    for port in parsed_data.get('ports', []):
        cursor.execute("""
            INSERT INTO eds_ports (
                eds_file_id, port_number, port_type, port_name, port_path, link_number
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            eds_id, port.get('port_number'), port.get('port_type'),
            port.get('port_name'), port.get('port_path'), port.get('link_number')
        ))

    # Insert groups
    print(f"\n[9] Inserting {len(parsed_data.get('groups', []))} groups...")
    for group in parsed_data.get('groups', []):
        cursor.execute("""
            INSERT INTO eds_groups (
                eds_file_id, group_number, group_name,
                parameter_count, parameter_list
            ) VALUES (?, ?, ?, ?, ?)
        """, (
            eds_id, group.get('group_number'), group.get('group_name'),
            group.get('parameter_count'), group.get('parameter_list')
        ))

    # Insert modules
    print(f"\n[10] Inserting {len(parsed_data.get('modules', []))} modules...")
    for module in parsed_data.get('modules', []):
        cursor.execute("""
            INSERT INTO eds_modules (
                eds_file_id, module_number, module_name, device_type,
                catalog_number, major_revision, minor_revision,
                config_size, input_size, output_size,
                module_description, slot_number, module_class,
                vendor_code, product_code, config_data, raw_definition
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            eds_id, module.get('module_number'), module.get('module_name'),
            module.get('device_type'), module.get('catalog_number'),
            module.get('major_revision'), module.get('minor_revision'),
            module.get('config_size'), module.get('input_size'), module.get('output_size'),
            module.get('module_description'), module.get('slot_number'),
            module.get('module_class'), module.get('vendor_code'),
            module.get('product_code'), module.get('config_data'),
            module.get('raw_definition')
        ))

    # Insert capacity
    capacity = parsed_data.get('capacity')
    if capacity:
        print(f"\n[11] Inserting capacity data...")
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

    # Insert advanced sections (DLR, TCP/IP, Ethernet, QoS, LLDP)
    print(f"\n[12] Parsing and inserting advanced sections...")
    try:
        # Create EDSParser instance to get sections
        eds_parser_instance = EDSParser(eds_content)
        advanced_parser = EDSAdvancedSectionsParser(eds_parser_instance.sections)
        advanced_data = advanced_parser.parse_all_advanced_sections()

        # Store DLR configuration
        if advanced_data.get('dlr_config'):
            dlr = advanced_data['dlr_config']
            cursor.execute("""
                INSERT INTO eds_dlr_config (
                    file_id, revision, object_name, object_class_code,
                    network_topology, enable_switch, beacon_interval,
                    beacon_timeout, vlan_id, max_inst, num_static_instances,
                    max_dynamic_instances, additional_attributes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                eds_id,
                dlr.get('revision'),
                dlr.get('object_name'),
                dlr.get('object_class_code'),
                dlr.get('network_topology'),
                dlr.get('enable_switch'),
                dlr.get('beacon_interval'),
                dlr.get('beacon_timeout'),
                dlr.get('vlan_id'),
                dlr.get('max_inst'),
                dlr.get('num_static_instances'),
                dlr.get('max_dynamic_instances'),
                json.dumps(dlr.get('additional_attributes')) if dlr.get('additional_attributes') else None
            ))
            print(f"      - Inserted DLR config")

        # Store TCP/IP Interface
        if advanced_data.get('tcpip_interface'):
            tcpip = advanced_data['tcpip_interface']
            cursor.execute("""
                INSERT INTO eds_tcpip_interface (
                    file_id, revision, object_name, object_class_code,
                    interface_config, host_name, ttl_value,
                    mcast_config, select_acd, encap_timeout,
                    max_inst, num_static_instances, max_dynamic_instances,
                    additional_attributes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                eds_id,
                tcpip.get('revision'),
                tcpip.get('object_name'),
                tcpip.get('object_class_code'),
                tcpip.get('interface_config'),
                tcpip.get('host_name'),
                tcpip.get('ttl_value'),
                tcpip.get('mcast_config'),
                tcpip.get('select_acd'),
                tcpip.get('encap_timeout'),
                tcpip.get('max_inst'),
                tcpip.get('num_static_instances'),
                tcpip.get('max_dynamic_instances'),
                json.dumps(tcpip.get('additional_attributes')) if tcpip.get('additional_attributes') else None
            ))
            print(f"      - Inserted TCP/IP interface")

        # Store Ethernet Link
        if advanced_data.get('ethernet_link'):
            eth = advanced_data['ethernet_link']
            cursor.execute("""
                INSERT INTO eds_ethernet_link (
                    file_id, revision, object_name, object_class_code,
                    interface_speed, interface_flags, physical_address,
                    interface_label, interface_labels, max_inst,
                    num_static_instances, max_dynamic_instances,
                    additional_attributes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                eds_id,
                eth.get('revision'),
                eth.get('object_name'),
                eth.get('object_class_code'),
                eth.get('interface_speed'),
                eth.get('interface_flags'),
                eth.get('physical_address'),
                eth.get('interface_label'),
                json.dumps(eth.get('interface_labels')) if eth.get('interface_labels') else None,
                eth.get('max_inst'),
                eth.get('num_static_instances'),
                eth.get('max_dynamic_instances'),
                json.dumps(eth.get('additional_attributes')) if eth.get('additional_attributes') else None
            ))
            print(f"      - Inserted Ethernet Link")

        # Store QoS configuration
        if advanced_data.get('qos_config'):
            qos = advanced_data['qos_config']
            cursor.execute("""
                INSERT INTO eds_qos_config (
                    file_id, revision, object_name, object_class_code,
                    qos_tag_enable, dscp_urgent, dscp_scheduled,
                    dscp_high, dscp_low, dscp_explicit, max_inst,
                    num_static_instances, max_dynamic_instances,
                    additional_attributes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                eds_id,
                qos.get('revision'),
                qos.get('object_name'),
                qos.get('object_class_code'),
                qos.get('qos_tag_enable'),
                qos.get('dscp_urgent'),
                qos.get('dscp_scheduled'),
                qos.get('dscp_high'),
                qos.get('dscp_low'),
                qos.get('dscp_explicit'),
                qos.get('max_inst'),
                qos.get('num_static_instances'),
                qos.get('max_dynamic_instances'),
                json.dumps(qos.get('additional_attributes')) if qos.get('additional_attributes') else None
            ))
            print(f"      - Inserted QoS config")

        # Store LLDP Management
        if advanced_data.get('lldp_management'):
            lldp = advanced_data['lldp_management']
            cursor.execute("""
                INSERT INTO eds_lldp_management (
                    file_id, revision, object_name, object_class_code,
                    msg_tx_interval, msg_tx_hold,
                    chassis_id_subtype, chassis_id, port_id_subtype, port_id,
                    max_inst, num_static_instances, max_dynamic_instances,
                    additional_attributes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                eds_id,
                lldp.get('revision'),
                lldp.get('object_name'),
                lldp.get('object_class_code'),
                lldp.get('msg_tx_interval'),
                lldp.get('msg_tx_hold'),
                lldp.get('chassis_id_subtype'),
                lldp.get('chassis_id'),
                lldp.get('port_id_subtype'),
                lldp.get('port_id'),
                lldp.get('max_inst'),
                lldp.get('num_static_instances'),
                lldp.get('max_dynamic_instances'),
                json.dumps(lldp.get('additional_attributes')) if lldp.get('additional_attributes') else None
            ))
            print(f"      - Inserted LLDP management")

    except Exception as e:
        logger.warning(f"Failed to parse/store advanced sections: {e}")
        import traceback
        traceback.print_exc()

    # Commit all changes
    conn.commit()
    print(f"\n[13] Database updated successfully!")
    print(f"{'='*80}")
    print(f"[SUCCESS] Complete re-upload with advanced sections finished!")
    print(f"{'='*80}")

    conn.close()
    return True

if __name__ == '__main__':
    success = complete_reupload()
    sys.exit(0 if success else 1)
