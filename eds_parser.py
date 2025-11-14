"""
EDS (Electronic Data Sheet) File Parser
Parses EDS files for EtherNet/IP devices with comprehensive section extraction
"""

import re
import base64
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
import hashlib
from eds_diagnostics import DiagnosticCollector, validate_eds_data


class EDSParser:
    """Comprehensive parser for EDS (Electronic Data Sheet) files."""

    def __init__(self, content: str):
        """Initialize parser with EDS file content."""
        self.content = content
        self.sections = {}
        self._parse_sections()

    def _parse_sections(self):
        """Parse EDS file into sections with full content preservation."""
        current_section = None
        current_content = []

        for line in self.content.split('\n'):
            # Preserve original line for content
            original_line = line
            line = line.strip()

            # Check for section header
            if line.startswith('[') and line.endswith(']'):
                # Save previous section
                if current_section:
                    self.sections[current_section] = '\n'.join(current_content)

                # Start new section
                current_section = line[1:-1]
                current_content = []
            elif current_section:
                # Add all lines to content (including comments and empty lines)
                current_content.append(original_line)

        # Save last section
        if current_section:
            self.sections[current_section] = '\n'.join(current_content)

    def _parse_key_value(self, content: str) -> Dict[str, str]:
        """Parse key-value pairs from section content, handling multi-line values."""
        result = {}
        lines = content.split('\n')
        current_key = None
        current_value = []

        for line in lines:
            line = line.strip()

            # Skip empty lines and comments
            if not line or line.startswith('$'):
                continue

            # Check if line contains a key-value pair
            if '=' in line and not line.startswith('='):
                # Save previous key-value
                if current_key:
                    value = '\n'.join(current_value).strip()
                    # Remove inline comments (starting with $)
                    if '$' in value:
                        value = value.split('$')[0].strip()
                    # Remove trailing semicolon
                    if value.endswith(';'):
                        value = value[:-1].strip()
                    result[current_key] = value

                # Parse new key-value
                key, value = line.split('=', 1)
                current_key = key.strip()
                current_value = [value.strip()]
            elif current_key:
                # Continuation of previous value (multi-line)
                current_value.append(line)

        # Save last key-value
        if current_key:
            value = '\n'.join(current_value).strip()
            # Remove inline comments (starting with $)
            if '$' in value:
                value = value.split('$')[0].strip()
            # Remove trailing semicolon
            if value.endswith(';'):
                value = value[:-1].strip()
            result[current_key] = value

        return result

    def get_file_info(self) -> Dict[str, Optional[str]]:
        """Extract file metadata from [File] section."""
        if 'File' not in self.sections:
            return {}

        data = self._parse_key_value(self.sections['File'])
        return {
            'description': data.get('DescText', '').strip('"'),
            'create_date': data.get('CreateDate'),
            'create_time': data.get('CreateTime'),
            'mod_date': data.get('ModDate'),
            'mod_time': data.get('ModTime'),
            'revision': data.get('Revision'),
            'home_url': data.get('HomeURL', '').strip('"')
        }

    def get_device_info(self) -> Dict[str, Optional[Any]]:
        """Extract device metadata from [Device] section."""
        if 'Device' not in self.sections:
            return {}

        data = self._parse_key_value(self.sections['Device'])

        # Extract icon data if present
        icon_data = None
        icon_filename = data.get('Icon', '').strip('"')

        if 'IconContents' in data:
            # IconContents is base64 encoded, may span multiple lines
            icon_contents = data['IconContents'].replace('"', '').replace('\n', '').replace(' ', '')
            try:
                icon_data = base64.b64decode(icon_contents)
            except Exception as e:
                print(f"Failed to decode icon data: {e}")

        return {
            'vendor_code': self._parse_int(data.get('VendCode')),
            'vendor_name': data.get('VendName', '').strip('"'),
            'product_type': self._parse_int(data.get('ProdType')),
            'product_type_str': data.get('ProdTypeStr', '').strip('"'),
            'product_code': self._parse_int(data.get('ProdCode')),
            'major_revision': self._parse_int(data.get('MajRev')),
            'minor_revision': self._parse_int(data.get('MinRev')),
            'product_name': data.get('ProdName', '').strip('"'),
            'catalog_number': data.get('Catalog', '').strip('"'),
            'icon_filename': icon_filename,
            'icon_data': icon_data
        }

    def get_device_classification(self) -> Dict[str, str]:
        """Extract device classification from [Device Classification] section."""
        if 'Device Classification' not in self.sections:
            return {}

        data = self._parse_key_value(self.sections['Device Classification'])
        return {
            'class1': data.get('Class1', ''),
            'class2': data.get('Class2', ''),
            'class3': data.get('Class3', ''),
            'class4': data.get('Class4', '')
        }

    def get_parameters(self) -> List[Dict[str, Any]]:
        """Extract parameters from [Params] section with full parsing."""
        if 'Params' not in self.sections:
            return []

        params = []
        content = self.sections['Params']

        # Parse individual parameters - they can span multiple lines
        param_pattern = r'Param(\d+)\s*=\s*(.*?);'
        matches = re.finditer(param_pattern, content, re.MULTILINE | re.DOTALL)

        for match in matches:
            param_num = int(match.group(1))
            param_data = match.group(2).strip()

            # Remove comments and extra whitespace
            lines = []
            for line in param_data.split('\n'):
                # Remove inline comments
                if '$' in line:
                    line = line.split('$')[0]
                line = line.strip()
                if line:
                    lines.append(line)

            param_data = ' '.join(lines)

            # Parse comma-separated values
            values = [v.strip().strip('"') for v in param_data.split(',')]

            # EDS Parameter format (correct mapping from actual EDS files):
            # 0: Link path size
            # 1: Link path
            # 2: Descriptor
            # 3: (unknown)
            # 4: (unknown)
            # 5: Data Type (integer value)
            # 6: Param Name (quoted string)
            # 7: Help String 1 (quoted string)
            # 8: Help String 2 (quoted string)
            # 9: Default value
            # 10: Max value
            # 11: Min value

            params.append({
                'param_number': param_num,
                'link_path_size': values[0] if len(values) > 0 else None,
                'link_path': values[1] if len(values) > 1 else None,
                'descriptor': values[2] if len(values) > 2 else None,
                'data_type': self._parse_int(values[5]) if len(values) > 5 else None,  # Index 5
                'data_size': self._parse_int(values[4]) if len(values) > 4 else None,
                'param_name': values[6] if len(values) > 6 else f'Param{param_num}',  # Index 6
                'help_string_1': values[7] if len(values) > 7 else '',  # Index 7
                'help_string_2': values[8] if len(values) > 8 else '',  # Index 8
                'help_string_3': '',  # Not used in this format
                'default_value': values[9] if len(values) > 9 else None,
                'max_value': values[10] if len(values) > 10 else None,
                'min_value': values[11] if len(values) > 11 else None,
            })

        return params

    def get_enums(self) -> Dict[int, List[Dict[str, Any]]]:
        """Extract enum definitions from [Params] section.

        Returns a dictionary mapping param numbers to their enum values.
        Example: {22: [{"value": 0, "label": "Default configuration", "is_default": True}, ...]}
        """
        if 'Params' not in self.sections:
            return {}

        enums = {}
        content = self.sections['Params']

        # Parse Enum definitions - they follow the pattern:
        # Enum22 =
        #     0,"Label for value 0 (default)",
        #     1,"Label for value 1",
        #     2,"Label for value 2";
        enum_pattern = r'Enum(\d+)\s*=\s*(.*?);'
        matches = re.finditer(enum_pattern, content, re.MULTILINE | re.DOTALL)

        for match in matches:
            param_num = int(match.group(1))
            enum_data = match.group(2).strip()

            # Remove comments
            lines = []
            for line in enum_data.split('\n'):
                if '$' in line:
                    line = line.split('$')[0]
                line = line.strip()
                if line:
                    lines.append(line)

            enum_data = ' '.join(lines)

            # Parse comma-separated enum entries
            # Format: value,"label (default)" or value,"label"
            enum_values = []

            # Match pattern: number,"text" or number,"text (default)"
            entry_pattern = r'(\d+)\s*,\s*"([^"]+)"'
            entry_matches = re.finditer(entry_pattern, enum_data)

            for entry_match in entry_matches:
                value = int(entry_match.group(1))
                label = entry_match.group(2).strip()

                # Check if this is marked as default
                is_default = False
                if '(default' in label.lower():
                    is_default = True
                    # Remove the (default) marker from the label
                    label = re.sub(r'\s*\(default[^)]*\)', '', label, flags=re.IGNORECASE).strip()

                # Remove trailing commas and clean up
                label = label.rstrip(',').strip()

                enum_values.append({
                    'value': value,
                    'label': label,
                    'is_default': is_default
                })

            if enum_values:
                enums[param_num] = enum_values

        return enums

    def get_assemblies(self) -> Dict[str, List[Dict[str, Any]]]:
        """Extract assembly definitions from [Assembly] section.

        Returns a dictionary with two keys:
        - 'fixed': List of fixed assemblies (Assem100, Assem119, etc.)
        - 'variable': List of variable assemblies (AssemExa134, AssemExa135, etc.)
        """
        if 'Assembly' not in self.sections:
            return {'fixed': [], 'variable': []}

        fixed_assemblies = []
        variable_assemblies = []
        content = self.sections['Assembly']

        # Pattern 1: Fixed assemblies
        # Assem100 = "Digital Input", 0x64, 0, 1, 0x0000, , "20 04 24 65 30 03", , ;
        fixed_pattern = r'Assem(\d+)\s*=\s*"([^"]+)",\s*(\w+),\s*(\d+),\s*(\d+),\s*(\w+),\s*,\s*"([^"]*)",\s*,\s*;'
        fixed_matches = re.finditer(fixed_pattern, content, re.MULTILINE)

        for match in fixed_matches:
            fixed_assemblies.append({
                'assembly_number': int(match.group(1)),
                'assembly_name': match.group(2),
                'assembly_type': self._parse_int(match.group(3)),  # 0x64
                'unknown_field1': int(match.group(4)),
                'size': int(match.group(5)),
                'unknown_field2': self._parse_int(match.group(6)),  # 0x0000
                'path': match.group(7),
                'help_string': '',
                'is_variable': False
            })

        # Pattern 2: Variable assemblies
        # AssemExa134 = 34, 32, "IO-Link Process Data from IO Device";
        variable_pattern = r'AssemExa(\d+)\s*=\s*(\d+),\s*(\d+),\s*"([^"]+)"\s*;'
        variable_matches = re.finditer(variable_pattern, content, re.MULTILINE)

        for match in variable_matches:
            variable_assemblies.append({
                'assembly_number': int(match.group(1)),
                'assembly_name': f"AssemExa{match.group(1)}",
                'unknown_value1': int(match.group(2)),
                'max_size': int(match.group(3)),
                'description': match.group(4)
            })

        return {
            'fixed': fixed_assemblies,
            'variable': variable_assemblies
        }

    def get_connections(self) -> List[Dict[str, Any]]:
        """Extract connection definitions from [Connection Manager] section."""
        if 'Connection Manager' not in self.sections:
            return []

        connections = []
        content = self.sections['Connection Manager']

        # Parse individual connections
        conn_pattern = r'Connection(\d+)\s*=\s*(.*?);'
        matches = re.finditer(conn_pattern, content, re.MULTILINE | re.DOTALL)

        for match in matches:
            conn_num = int(match.group(1))
            conn_data = match.group(2).strip()

            # Parse connection data, preserving comments for documentation
            lines = []
            line_comments = []

            for line in conn_data.split('\n'):
                original = line
                comment = ''

                # Extract comment if present
                if '$' in line:
                    parts = line.split('$', 1)
                    line = parts[0]
                    comment = parts[1].strip() if len(parts) > 1 else ''

                line = line.strip()
                if line:
                    lines.append(line)
                    line_comments.append(comment)

            # Connection format:
            # 0: Trigger & Transport
            # 1: Connection Parameters
            # 2: O->T RPI, Size, Format
            # 3: T->O RPI, Size, Format
            # 4: Config part 1
            # 5: Config part 2
            # 6: Connection name
            # 7: Help string
            # 8: Path (optional)

            # Helper to clean string values
            def clean_value(value):
                if not value:
                    return value
                return value.strip(',').strip('"').strip()

            connections.append({
                'connection_number': conn_num,
                'trigger_transport': clean_value(lines[0]) if len(lines) > 0 else None,
                'connection_params': clean_value(lines[1]) if len(lines) > 1 else None,
                'o_to_t_params': clean_value(lines[2]) if len(lines) > 2 else None,
                't_to_o_params': clean_value(lines[3]) if len(lines) > 3 else None,
                'config_part1': clean_value(lines[4]) if len(lines) > 4 else None,
                'config_part2': clean_value(lines[5]) if len(lines) > 5 else None,
                'connection_name': clean_value(lines[6]) if len(lines) > 6 else f'Connection{conn_num}',
                'help_string': clean_value(lines[7]) if len(lines) > 7 else '',
                'path': clean_value(lines[8]) if len(lines) > 8 else None,
                'trigger_transport_comment': line_comments[0] if len(line_comments) > 0 else '',
                'connection_params_comment': line_comments[1] if len(line_comments) > 1 else '',
            })

        return connections

    def get_ports(self) -> List[Dict[str, Any]]:
        """Extract port definitions from [Port] section."""
        if 'Port' not in self.sections:
            return []

        ports = []
        content = self.sections['Port']

        # Parse individual ports
        port_pattern = r'Port(\d+)\s*=\s*(.*?);'
        matches = re.finditer(port_pattern, content, re.MULTILINE | re.DOTALL)

        for match in matches:
            port_num = int(match.group(1))
            port_data = match.group(2).strip()

            # Parse port data
            lines = [line.strip() for line in port_data.split('\n')
                    if line.strip() and not line.strip().startswith('$')]

            values = []
            for line in lines:
                values.extend([v.strip().strip('"') for v in line.split(',')])

            # Port format:
            # 0: Port type (TCP, etc)
            # 1: Port name
            # 2: Port path
            # 3: Port number

            ports.append({
                'port_number': port_num,
                'port_type': values[0] if len(values) > 0 else None,
                'port_name': values[1] if len(values) > 1 else f'Port{port_num}',
                'port_path': values[2] if len(values) > 2 else None,
                'link_number': self._parse_int(values[3]) if len(values) > 3 else None,
            })

        return ports

    def get_modules(self) -> List[Dict[str, Any]]:
        """
        Extract module definitions from [Module] section.

        Modules represent physical I/O modules in modular devices like bus couplers.
        This is a best-effort parser that will be refined when we have actual sample data.

        Expected formats (based on research):
        - Module1 = "ModuleName", DeviceType, CatalogNumber, ...
        - ModuleN = <various fields>

        Returns:
            List of module dictionaries with extracted fields
        """
        if 'Module' not in self.sections:
            return []

        modules = []
        content = self.sections['Module']

        # Pattern 1: Try to match Module entries with quoted names
        # Module1 = "Name", DeviceType, CatalogNumber, MajorRev, MinorRev, ConfigSize, InputSize, OutputSize, ...
        module_pattern = r'Module(\d+)\s*=\s*(.+?)(?:;|$)'
        matches = re.finditer(module_pattern, content, re.MULTILINE | re.DOTALL)

        for match in matches:
            module_num = int(match.group(1))
            module_data = match.group(2).strip()

            # Remove comments and clean up
            module_data = re.sub(r'\$.*', '', module_data)

            # Try to parse comma-separated values
            # Handle quoted strings properly
            values = []
            current = []
            in_quotes = False
            for char in module_data:
                if char == '"':
                    in_quotes = not in_quotes
                elif char == ',' and not in_quotes:
                    values.append(''.join(current).strip().strip('"'))
                    current = []
                else:
                    current.append(char)
            if current:
                values.append(''.join(current).strip().strip('"'))

            # Build module dict with flexible field mapping
            module_dict = {
                'module_number': module_num,
                'module_name': values[0] if len(values) > 0 else f'Module{module_num}',
                'device_type': values[1] if len(values) > 1 else None,
                'catalog_number': values[2] if len(values) > 2 else None,
                'major_revision': self._parse_int(values[3]) if len(values) > 3 else None,
                'minor_revision': self._parse_int(values[4]) if len(values) > 4 else None,
                'config_size': self._parse_int(values[5]) if len(values) > 5 else None,
                'input_size': self._parse_int(values[6]) if len(values) > 6 else None,
                'output_size': self._parse_int(values[7]) if len(values) > 7 else None,
                'module_description': values[8] if len(values) > 8 else None,
                'slot_number': self._parse_int(values[9]) if len(values) > 9 else None,
                'module_class': values[10] if len(values) > 10 else None,
                'vendor_code': self._parse_int(values[11]) if len(values) > 11 else None,
                'product_code': self._parse_int(values[12]) if len(values) > 12 else None,
                'raw_definition': module_data,  # Store raw data for later refinement
            }

            # Extract config data if present (might be hex string)
            if len(values) > 13:
                module_dict['config_data'] = values[13]

            modules.append(module_dict)

        return modules

    def get_groups(self) -> List[Dict[str, Any]]:
        """
        Extract parameter group definitions from [Groups] section.

        Groups organize parameters into logical categories for better UI organization.
        Format: GroupN = "Name", count, param1,param2,...;
        """
        if 'Groups' not in self.sections:
            return []

        groups = []
        content = self.sections['Groups']

        # Pattern for Group entries: Group1 = "Name", count, param_numbers;
        group_pattern = r'Group(\d+)\s*=\s*(.+?)(?:;|(?=Group\d+\s*=)|$)'
        matches = re.finditer(group_pattern, content, re.MULTILINE | re.DOTALL)

        for match in matches:
            group_num = int(match.group(1))
            group_data = match.group(2).strip()

            # Remove comments
            group_data = re.sub(r'\$.*', '', group_data)

            # Parse the group definition
            # Format: "Name", count, param1,param2,param3,...

            # Extract the group name (quoted string)
            name_match = re.search(r'"([^"]+)"', group_data)
            if not name_match:
                continue  # Skip malformed groups

            group_name = name_match.group(1)

            # Remove the name from data to parse remaining fields
            remaining_data = group_data[name_match.end():].strip()
            if remaining_data.startswith(','):
                remaining_data = remaining_data[1:].strip()

            # Parse count and parameter list
            # Remove all whitespace and newlines for easier parsing
            remaining_data = re.sub(r'\s+', '', remaining_data)

            # Split by comma to get count and parameters
            parts = [p.strip() for p in remaining_data.split(',') if p.strip()]

            parameter_count = None
            parameter_numbers = []

            if len(parts) > 0:
                # First part is the count
                try:
                    parameter_count = int(parts[0])
                except ValueError:
                    pass

                # Remaining parts are parameter numbers
                for part in parts[1:]:
                    try:
                        parameter_numbers.append(int(part))
                    except ValueError:
                        pass

            groups.append({
                'group_number': group_num,
                'group_name': group_name,
                'parameter_count': parameter_count,
                'parameter_list': ','.join(map(str, parameter_numbers)) if parameter_numbers else None
            })

        return groups

    def get_capacity(self) -> Dict[str, Any]:
        """
        Extract capacity information from [Capacity] section with support for multiple vendor formats.

        Handles various field name conventions:
        - Standard ODVA format: MaxMsgConnections, MaxIOProducers, MaxIOConsumers
        - Allen Bradley/Murrelektronik: MaxIOConnections, MaxMsgConnections
        - Schneider Electric: MaxMsgConnections, MaxIOProducers, MaxIOConsumers
        """
        if 'Capacity' not in self.sections:
            return {
                'max_msg_connections': None,
                'max_io_producers': None,
                'max_io_consumers': None,
                'max_cx_per_config_tool': None,
                'max_io_connections': None,
                'tspecs': [],
                'raw_capacity_data': {},
                'unrecognized_fields': []
            }

        data = self._parse_key_value(self.sections['Capacity'])

        # Known capacity field mappings (multiple variations supported)
        KNOWN_FIELDS = {
            'MaxMsgConnections', 'MaxIOProducers', 'MaxIOConsumers',
            'MaxCxPerConfigTool', 'MaxIOConnections', 'ConnOverhead'
        }

        # Parse TSpec entries separately
        tspecs = []
        unrecognized = []
        for key, value in data.items():
            if key.startswith('TSpec'):
                parts = [p.strip() for p in value.split(',')]
                tspecs.append({
                    'tspec_name': key,
                    'direction': parts[0] if len(parts) > 0 else None,
                    'data_size': self._parse_int(parts[1]) if len(parts) > 1 else None,
                    'rate': self._parse_int(parts[2]) if len(parts) > 2 else None,
                })
            elif key not in KNOWN_FIELDS:
                unrecognized.append(key)

        # Try multiple field name variations
        max_msg_conn = self._parse_int(data.get('MaxMsgConnections'))
        max_io_prod = self._parse_int(data.get('MaxIOProducers'))
        max_io_cons = self._parse_int(data.get('MaxIOConsumers'))
        max_io_conn = self._parse_int(data.get('MaxIOConnections'))

        # If MaxIOConnections is present but not producers/consumers, use it for both
        if max_io_conn is not None and max_io_prod is None and max_io_cons is None:
            max_io_prod = max_io_conn
            max_io_cons = max_io_conn

        result = {
            'max_msg_connections': max_msg_conn,
            'max_io_producers': max_io_prod,
            'max_io_consumers': max_io_cons,
            'max_cx_per_config_tool': self._parse_int(data.get('MaxCxPerConfigTool')),
            'max_io_connections': max_io_conn,  # Store original if present
            'tspecs': tspecs,
            'raw_capacity_data': data,  # Store all raw data for debugging
            'unrecognized_fields': unrecognized  # Track unknown fields
        }

        return result

    def get_all_sections(self) -> Dict[str, str]:
        """Get all parsed sections with their raw content."""
        return self.sections.copy()

    def get_checksum(self) -> str:
        """Calculate checksum for the EDS file content."""
        return hashlib.md5(self.content.encode()).hexdigest()

    @staticmethod
    def _parse_int(value: Optional[str]) -> Optional[int]:
        """Safely parse integer value."""
        if not value:
            return None
        try:
            return int(value)
        except (ValueError, TypeError):
            return None

    @staticmethod
    def _parse_hex(value: Optional[str]) -> Optional[int]:
        """Safely parse hexadecimal value."""
        if not value:
            return None
        try:
            if value.startswith('0x') or value.startswith('0X'):
                return int(value, 16)
            return int(value)
        except (ValueError, TypeError):
            return None


def parse_eds_file(content: str, file_path: str = None, strict_mode: bool = False) -> Tuple[Dict[str, Any], DiagnosticCollector]:
    """
    Parse an EDS file and return all extracted information with diagnostics.

    Args:
        content: The EDS file content as a string
        file_path: Optional file path for diagnostics
        strict_mode: If True, use strict validation

    Returns:
        Tuple of (parsed data dictionary, diagnostic collector)
    """
    parser = EDSParser(content)
    collector = DiagnosticCollector()

    if file_path:
        collector.set_file_path(file_path)

    # Parse all sections
    parameters = parser.get_parameters()
    enums = parser.get_enums()

    # Link enum values to their corresponding parameters
    for param in parameters:
        param_num = param.get('param_number')
        if param_num in enums:
            # Store enum values as JSON string
            param['enum_values'] = json.dumps(enums[param_num])
        else:
            param['enum_values'] = None

    # Extract assemblies
    assemblies = parser.get_assemblies()

    parsed_data = {
        'source': {
            'file_path': file_path,
            'file_hash': hashlib.sha256(content.encode()).hexdigest(),
            'dialect_id': 'CIP_INI',
            'parsed_at': datetime.now().isoformat(),
            'checksum_md5': parser.get_checksum()
        },
        'file_info': parser.get_file_info(),
        'device': parser.get_device_info(),
        'device_classification': parser.get_device_classification(),
        'parameters': parameters,
        'connections': parser.get_connections(),
        'assemblies': assemblies,  # New: assembly definitions
        'ports': parser.get_ports(),
        'modules': parser.get_modules(),  # New: module definitions for modular devices
        'groups': parser.get_groups(),  # New: parameter group organization
        'capacity': parser.get_capacity(),
        'all_sections': parser.get_all_sections(),
        'checksum': parser.get_checksum(),
        'eds_content': content
    }

    # Validate and generate diagnostics
    validate_eds_data(parsed_data, collector, strict_mode)

    return parsed_data, collector


def parse_eds_file_legacy(content: str) -> Dict[str, Any]:
    """
    Legacy function for backward compatibility.
    Returns only parsed data without diagnostics.

    Args:
        content: The EDS file content as a string

    Returns:
        Dictionary containing all parsed EDS data
    """
    parsed_data, _ = parse_eds_file(content)
    return parsed_data
