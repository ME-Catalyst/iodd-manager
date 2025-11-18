"""
EDS File Forensic Reconstruction Engine

Reconstructs EDS (Electronic Data Sheet) files from database tables for Parser Quality Assurance.
EDS files use INI-style format for EtherNet/IP devices per ODVA specifications.
"""

import logging
import sqlite3
from typing import List, Optional

logger = logging.getLogger(__name__)


class EDSReconstructor:
    """
    Reconstructs EDS files from GreenStack database

    EDS files are INI-format configuration files with sections:
    - [File] - File metadata
    - [Device] - Device identification
    - [Params] - Parameter definitions
    - [Assembly] - I/O assembly definitions
    - [Connection Manager] - Connection configurations
    - [Port] - Port definitions
    - [Capacity] - Device capacity limits
    - And more...
    """

    def __init__(self, db_path: str = "greenstack.db"):
        self.db_path = db_path

    def get_connection(self) -> sqlite3.Connection:
        """Get database connection with Row factory"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def reconstruct_eds(self, eds_file_id: int) -> str:
        """
        Forensically reconstruct EDS file from database

        Args:
            eds_file_id: ID of EDS file to reconstruct

        Returns:
            Reconstructed EDS file as string (INI format)

        Raises:
            ValueError: If EDS file not found
        """
        conn = self.get_connection()
        try:
            # Verify EDS file exists
            eds_file = self._get_eds_file(conn, eds_file_id)
            if not eds_file:
                raise ValueError(f"EDS file {eds_file_id} not found")

            # Build EDS sections
            sections = []

            # [File] section
            sections.append(self._create_file_section(eds_file))

            # [Device] section
            sections.append(self._create_device_section(eds_file))

            # [Device Classification] section
            device_class = self._create_device_classification_section(eds_file)
            if device_class:
                sections.append(device_class)

            # [Params] section header
            params_section = self._create_params_section(conn, eds_file_id)
            if params_section:
                sections.append(params_section)

            # [EnumPar] sections for enum parameters
            enum_sections = self._create_enum_sections(conn, eds_file_id)
            sections.extend(enum_sections)

            # [Group] sections
            group_sections = self._create_group_sections(conn, eds_file_id)
            sections.extend(group_sections)

            # [Assembly] section
            assembly_section = self._create_assembly_section(conn, eds_file_id)
            if assembly_section:
                sections.append(assembly_section)

            # [Connection Manager] section
            connection_section = self._create_connection_manager_section(conn, eds_file_id)
            if connection_section:
                sections.append(connection_section)

            # [Port] section
            port_section = self._create_port_section(conn, eds_file_id)
            if port_section:
                sections.append(port_section)

            # [Capacity] section
            capacity_section = self._create_capacity_section(conn, eds_file_id)
            if capacity_section:
                sections.append(capacity_section)

            # [TSpecs] section
            tspec_section = self._create_tspec_section(conn, eds_file_id)
            if tspec_section:
                sections.append(tspec_section)

            # [Modules] section (if applicable)
            module_sections = self._create_module_sections(conn, eds_file_id)
            sections.extend(module_sections)

            # Join all sections
            return "\n\n".join(sections)

        finally:
            conn.close()

    def _get_eds_file(self, conn: sqlite3.Connection, eds_file_id: int) -> Optional[sqlite3.Row]:
        """Get EDS file record"""
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM eds_files WHERE id = ?", (eds_file_id,))
        return cursor.fetchone()

    def _create_file_section(self, eds_file: sqlite3.Row) -> str:
        """Create [File] section"""
        lines = ["[File]"]

        if eds_file['description']:
            lines.append(f"DescText = \"{eds_file['description']}\"")

        if eds_file['create_date']:
            lines.append(f"CreateDate = {eds_file['create_date']}")
        if eds_file['create_time']:
            lines.append(f"CreateTime = {eds_file['create_time']}")
        if eds_file['mod_date']:
            lines.append(f"ModDate = {eds_file['mod_date']}")
        if eds_file['mod_time']:
            lines.append(f"ModTime = {eds_file['mod_time']}")

        if eds_file['file_revision']:
            lines.append(f"FileRevision = {eds_file['file_revision']}")

        lines.append(f"FileFormat = 1")
        lines.append(f"Version = 1.0")

        return "\n".join(lines)

    def _create_device_section(self, eds_file: sqlite3.Row) -> str:
        """Create [Device] section"""
        lines = ["[Device]"]

        if eds_file['vendor_code']:
            lines.append(f"VendCode = {eds_file['vendor_code']}")
        if eds_file['vendor_name']:
            lines.append(f"VendName = \"{eds_file['vendor_name']}\"")

        if eds_file['product_code']:
            lines.append(f"ProdCode = {eds_file['product_code']}")
        if eds_file['product_name']:
            lines.append(f"ProdName = \"{eds_file['product_name']}\"")

        if eds_file['catalog_number']:
            lines.append(f"CatalogNumber = \"{eds_file['catalog_number']}\"")

        if eds_file['product_type']:
            lines.append(f"ProdType = {eds_file['product_type']}")
        if eds_file['product_type_str']:
            lines.append(f"ProdTypeStr = \"{eds_file['product_type_str']}\"")

        if eds_file['major_revision'] is not None:
            lines.append(f"MajRev = {eds_file['major_revision']}")
        if eds_file['minor_revision'] is not None:
            lines.append(f"MinRev = {eds_file['minor_revision']}")

        if eds_file['icon_filename']:
            lines.append(f"Icon = \"{eds_file['icon_filename']}\"")

        if eds_file['home_url']:
            lines.append(f"HomePage = \"{eds_file['home_url']}\"")

        return "\n".join(lines)

    def _create_device_classification_section(self, eds_file: sqlite3.Row) -> Optional[str]:
        """Create [Device Classification] section"""
        class_lines = []

        if eds_file['class1']:
            class_lines.append(f"Class1 = {eds_file['class1']}")
        if eds_file['class2']:
            class_lines.append(f"Class2 = {eds_file['class2']}")
        if eds_file['class3']:
            class_lines.append(f"Class3 = {eds_file['class3']}")
        if eds_file['class4']:
            class_lines.append(f"Class4 = {eds_file['class4']}")

        if not class_lines:
            return None

        return "[Device Classification]\n" + "\n".join(class_lines)

    def _create_params_section(self, conn: sqlite3.Connection, eds_file_id: int) -> Optional[str]:
        """Create [Params] section"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM eds_parameters WHERE eds_file_id = ? ORDER BY param_number
        """, (eds_file_id,))
        params = cursor.fetchall()

        if not params:
            return None

        lines = ["[Params]"]
        lines.append(f"Num_Params = {len(params)}")

        for param in params:
            lines.append(f"Param{param['param_number']} =")
            lines.append(f"  {param['param_number']},")  # Parameter number

            # Link path
            if param['link_path']:
                lines.append(f"  \"{param['link_path']}\",")
            else:
                lines.append(f"  ,")

            # Descriptor
            if param['descriptor']:
                lines.append(f"  {param['descriptor']},")
            else:
                lines.append(f"  0,")

            # Data type and size
            if param['data_type'] is not None:
                lines.append(f"  {param['data_type']},")
            else:
                lines.append(f"  ,")

            if param['data_size'] is not None:
                lines.append(f"  {param['data_size']},")
            else:
                lines.append(f"  ,")

            # Parameter name
            if param['param_name']:
                lines.append(f"  \"{param['param_name']}\",")
            else:
                lines.append(f"  ,")

            # Units
            if param['units']:
                lines.append(f"  \"{param['units']}\",")
            else:
                lines.append(f"  ,")

            # Help strings
            help_str = param['help_string_1'] or param['description'] or ""
            if help_str:
                lines.append(f"  \"{help_str}\",")
            else:
                lines.append(f"  ,")

            # Min/Max/Default values
            min_val = param['min_value'] or ""
            max_val = param['max_value'] or ""
            default_val = param['default_value'] or ""

            lines.append(f"  {min_val},")
            lines.append(f"  {max_val},")
            lines.append(f"  {default_val},")

            # Scaling
            if param['scaling_multiplier']:
                lines.append(f"  {param['scaling_multiplier']},")
            if param['scaling_divisor']:
                lines.append(f"  {param['scaling_divisor']},")
            if param['scaling_base']:
                lines.append(f"  {param['scaling_base']},")
            if param['scaling_offset']:
                lines.append(f"  {param['scaling_offset']};")
            else:
                # Remove trailing comma from last line
                lines[-1] = lines[-1].rstrip(',') + ';'

        return "\n".join(lines)

    def _create_enum_sections(self, conn: sqlite3.Connection, eds_file_id: int) -> List[str]:
        """Create [EnumPar] sections for enumerated parameters"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM eds_parameters
            WHERE eds_file_id = ? AND enum_values IS NOT NULL
            ORDER BY param_number
        """, (eds_file_id,))
        enum_params = cursor.fetchall()

        sections = []
        for param in enum_params:
            if not param['enum_values']:
                continue

            section_lines = [f"[EnumPar{param['param_number']}]"]

            # Parse enum values (stored as comma-separated or JSON)
            try:
                # Try to parse as comma-separated "value=text" pairs
                enum_items = param['enum_values'].split(',')
                section_lines.append(f"EnumList = {len(enum_items)}")

                for i, item in enumerate(enum_items):
                    if '=' in item:
                        value, text = item.split('=', 1)
                        section_lines.append(f"Value{i} = {value}, \"{text.strip()}\"")
                    else:
                        section_lines.append(f"Value{i} = {i}, \"{item.strip()}\"")

                sections.append("\n".join(section_lines))
            except Exception as e:
                logger.warning(f"Failed to parse enum values for param {param['param_number']}: {e}")

        return sections

    def _create_group_sections(self, conn: sqlite3.Connection, eds_file_id: int) -> List[str]:
        """Create [Group] sections"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM eds_groups WHERE eds_file_id = ? ORDER BY group_number
        """, (eds_file_id,))
        groups = cursor.fetchall()

        sections = []
        for group in groups:
            section_lines = [f"[Group{group['group_number']}]"]

            if group['group_name']:
                section_lines.append(f"GroupName = \"{group['group_name']}\"")

            if group['parameter_count']:
                section_lines.append(f"ParamCount = {group['parameter_count']}")

            if group['parameter_list']:
                section_lines.append(f"ParamList = {group['parameter_list']}")

            sections.append("\n".join(section_lines))

        return sections

    def _create_assembly_section(self, conn: sqlite3.Connection, eds_file_id: int) -> Optional[str]:
        """Create [Assembly] section"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM eds_assemblies WHERE eds_file_id = ? ORDER BY assembly_number
        """, (eds_file_id,))
        assemblies = cursor.fetchall()

        if not assemblies:
            return None

        lines = ["[Assembly]"]
        lines.append(f"Num_Assemblies = {len(assemblies)}")

        for asm in assemblies:
            lines.append(f"Assem{asm['assembly_number']} =")
            lines.append(f"  {asm['assembly_number']},")  # Assembly number

            if asm['assembly_type'] is not None:
                lines.append(f"  {asm['assembly_type']},")  # Type
            else:
                lines.append(f"  ,")

            if asm['size'] is not None:
                lines.append(f"  {asm['size']},")  # Size
            else:
                lines.append(f"  ,")

            if asm['path']:
                lines.append(f"  \"{asm['path']}\",")  # Path
            else:
                lines.append(f"  ,")

            if asm['assembly_name']:
                lines.append(f"  \"{asm['assembly_name']}\",")  # Name
            else:
                lines.append(f"  ,")

            if asm['help_string']:
                lines.append(f"  \"{asm['help_string']}\";")  # Help
            else:
                lines[-1] = lines[-1].rstrip(',') + ';'

        return "\n".join(lines)

    def _create_connection_manager_section(self, conn: sqlite3.Connection,
                                           eds_file_id: int) -> Optional[str]:
        """Create [Connection Manager] section"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM eds_connections WHERE eds_file_id = ? ORDER BY connection_number
        """, (eds_file_id,))
        connections = cursor.fetchall()

        if not connections:
            return None

        lines = ["[Connection Manager]"]
        lines.append(f"Num_Connections = {len(connections)}")

        for conn_row in connections:
            lines.append(f"Connection{conn_row['connection_number']} =")

            if conn_row['trigger_transport']:
                lines.append(f"  {conn_row['trigger_transport']},")

            if conn_row['connection_params']:
                lines.append(f"  {conn_row['connection_params']},")

            if conn_row['output_assembly']:
                lines.append(f"  {conn_row['output_assembly']},")
            else:
                lines.append(f"  ,")

            if conn_row['input_assembly']:
                lines.append(f"  {conn_row['input_assembly']},")
            else:
                lines.append(f"  ,")

            if conn_row['config_part1']:
                lines.append(f"  {conn_row['config_part1']},")

            if conn_row['connection_name']:
                lines.append(f"  \"{conn_row['connection_name']}\",")

            if conn_row['help_string']:
                lines.append(f"  \"{conn_row['help_string']}\";")
            else:
                lines[-1] = lines[-1].rstrip(',') + ';'

        return "\n".join(lines)

    def _create_port_section(self, conn: sqlite3.Connection, eds_file_id: int) -> Optional[str]:
        """Create [Port] section"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM eds_ports WHERE eds_file_id = ? ORDER BY port_number
        """, (eds_file_id,))
        ports = cursor.fetchall()

        if not ports:
            return None

        lines = ["[Port]"]
        lines.append(f"Num_Ports = {len(ports)}")

        for port in ports:
            lines.append(f"Port{port['port_number']} =")

            if port['port_type']:
                lines.append(f"  {port['port_type']},")

            if port['port_name']:
                lines.append(f"  \"{port['port_name']}\",")

            if port['port_path']:
                lines.append(f"  \"{port['port_path']}\",")

            if port['link_number'] is not None:
                lines.append(f"  {port['link_number']};")
            else:
                lines[-1] = lines[-1].rstrip(',') + ';'

        return "\n".join(lines)

    def _create_capacity_section(self, conn: sqlite3.Connection, eds_file_id: int) -> Optional[str]:
        """Create [Capacity] section"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM eds_capacity WHERE eds_file_id = ?
        """, (eds_file_id,))
        capacity = cursor.fetchone()

        if not capacity:
            return None

        lines = ["[Capacity]"]

        if capacity['max_msg_connections'] is not None:
            lines.append(f"MaxMsgConnections = {capacity['max_msg_connections']}")
        if capacity['max_io_producers'] is not None:
            lines.append(f"MaxIOProducers = {capacity['max_io_producers']}")
        if capacity['max_io_consumers'] is not None:
            lines.append(f"MaxIOConsumers = {capacity['max_io_consumers']}")
        if capacity['max_cx_per_config_tool'] is not None:
            lines.append(f"MaxCxPerConfigTool = {capacity['max_cx_per_config_tool']}")

        return "\n".join(lines)

    def _create_tspec_section(self, conn: sqlite3.Connection, eds_file_id: int) -> Optional[str]:
        """Create [TSpecs] section"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM eds_tspecs WHERE eds_file_id = ?
        """, (eds_file_id,))
        tspecs = cursor.fetchall()

        if not tspecs:
            return None

        lines = ["[TSpecs]"]
        lines.append(f"Num_TSpecs = {len(tspecs)}")

        for i, tspec in enumerate(tspecs, 1):
            if tspec['tspec_name']:
                lines.append(f"TSpec{i} = \"{tspec['tspec_name']}\",")

            if tspec['direction']:
                lines.append(f"  {tspec['direction']},")

            if tspec['data_size'] is not None:
                lines.append(f"  {tspec['data_size']},")

            if tspec['rate'] is not None:
                lines.append(f"  {tspec['rate']};")
            else:
                lines[-1] = lines[-1].rstrip(',') + ';'

        return "\n".join(lines)

    def _create_module_sections(self, conn: sqlite3.Connection, eds_file_id: int) -> List[str]:
        """Create [Module] sections for modular devices"""
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM eds_modules WHERE eds_file_id = ? ORDER BY module_number
        """, (eds_file_id,))
        modules = cursor.fetchall()

        sections = []
        for module in modules:
            section_lines = [f"[Module{module['module_number']}]"]

            if module['module_name']:
                section_lines.append(f"ModuleName = \"{module['module_name']}\"")
            if module['catalog_number']:
                section_lines.append(f"CatalogNumber = \"{module['catalog_number']}\"")
            if module['device_type']:
                section_lines.append(f"DeviceType = {module['device_type']}")
            if module['major_revision'] is not None:
                section_lines.append(f"MajorRevision = {module['major_revision']}")
            if module['minor_revision'] is not None:
                section_lines.append(f"MinorRevision = {module['minor_revision']}")
            if module['input_size'] is not None:
                section_lines.append(f"InputSize = {module['input_size']}")
            if module['output_size'] is not None:
                section_lines.append(f"OutputSize = {module['output_size']}")
            if module['config_size'] is not None:
                section_lines.append(f"ConfigSize = {module['config_size']}")

            sections.append("\n".join(section_lines))

        return sections


def reconstruct_eds_file(eds_file_id: int, db_path: str = "greenstack.db") -> str:
    """
    Reconstruct EDS file from database

    Args:
        eds_file_id: ID of EDS file to reconstruct
        db_path: Path to database file

    Returns:
        Reconstructed EDS file content (INI format)
    """
    reconstructor = EDSReconstructor(db_path)
    return reconstructor.reconstruct_eds(eds_file_id)
