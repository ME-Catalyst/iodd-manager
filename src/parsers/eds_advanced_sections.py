"""
EDS Advanced Sections Parser
Handles DLR, TCP/IP, Ethernet Link, QoS, and LLDP Management sections
"""

import logging
import re
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)


class EDSAdvancedSectionsParser:
    """Parser for advanced EtherNet/IP EDS sections"""

    def __init__(self, sections: Dict[str, str]):
        """
        Initialize with parsed sections from EDSParser

        Args:
            sections: Dictionary of section_name -> section_content
        """
        self.sections = sections

    def _parse_key_value(self, content: str) -> Dict[str, str]:
        """Parse key-value pairs from section content"""
        result = {}
        lines = content.split('\n')

        for line in lines:
            line = line.strip()

            # Skip empty lines and comments
            if not line or line.startswith('$'):
                continue

            # Check if line contains a key-value pair
            if '=' in line and not line.startswith('='):
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()

                # Remove inline comments
                if '$' in value:
                    value = value.split('$')[0].strip()

                # Remove trailing semicolon
                if value.endswith(';'):
                    value = value[:-1].strip()

                result[key] = value

        return result

    def _parse_integer(self, value: str) -> Optional[int]:
        """Safely parse integer value (handles hex, decimal)"""
        if not value:
            return None

        value = value.strip()

        try:
            # Handle hex values (0x prefix)
            if value.startswith('0x') or value.startswith('0X'):
                return int(value, 16)
            else:
                return int(value)
        except ValueError:
            logger.warning(f"Could not parse integer from: {value}")
            return None

    def _parse_boolean(self, value: str) -> Optional[bool]:
        """Safely parse boolean value"""
        if not value:
            return None

        value = value.strip().lower()

        if value in ('1', 'true', 'yes', 'on', 'enabled'):
            return True
        elif value in ('0', 'false', 'no', 'off', 'disabled'):
            return False
        else:
            logger.warning(f"Could not parse boolean from: {value}")
            return None

    def _extract_common_cip_attributes(self, kv_pairs: Dict[str, str]) -> Dict[str, Any]:
        """
        Extract common CIP object instance attributes

        Returns dict with: max_inst, num_static_instances, max_dynamic_instances
        """
        return {
            'max_inst': self._parse_integer(kv_pairs.get('MaxInst')),
            'num_static_instances': self._parse_integer(kv_pairs.get('Number_Of_Static_Instances')),
            'max_dynamic_instances': self._parse_integer(kv_pairs.get('Max_Number_Of_Dynamic_Instances')),
        }

    def _extract_numbered_attributes(self, kv_pairs: Dict[str, str], base_name: str) -> List[str]:
        """
        Extract numbered attributes like InterfaceLabel1, InterfaceLabel2, etc.

        Args:
            kv_pairs: Parsed key-value pairs
            base_name: Base attribute name (e.g., 'InterfaceLabel')

        Returns: List of values in order [value1, value2, ...]
        """
        results = []
        index = 1
        while True:
            key = f"{base_name}{index}"
            if key in kv_pairs:
                results.append(kv_pairs[key])
                index += 1
            else:
                break
        return results if results else None

    def _extract_additional_attributes(self, kv_pairs: Dict[str, str], exclude_keys: set) -> Optional[Dict[str, str]]:
        """
        Extract any additional attributes not explicitly handled

        Args:
            kv_pairs: All parsed key-value pairs
            exclude_keys: Set of keys that are already handled

        Returns: Dict of additional attributes or None
        """
        additional = {}
        for key, value in kv_pairs.items():
            if key not in exclude_keys:
                additional[key] = value

        return additional if additional else None

    def parse_dlr_class(self) -> Optional[Dict[str, Any]]:
        """
        Parse [DLR Class] section - Device Level Ring

        Returns dict with:
            revision, object_name, object_class_code, network_topology,
            enable_switch, beacon_interval, beacon_timeout, vlan_id,
            max_inst, num_static_instances, max_dynamic_instances,
            additional_attributes
        """
        section_content = self.sections.get('DLR Class')
        if not section_content:
            return None

        kv_pairs = self._parse_key_value(section_content)

        # Extract common CIP attributes
        cip_attrs = self._extract_common_cip_attributes(kv_pairs)

        # Define handled keys to identify additional attributes
        handled_keys = {
            'Revision', 'Object_Name', 'Object_Class_Code',
            'Network_Topology', 'Enable_Switch', 'Beacon_Interval',
            'Beacon_Timeout', 'VLAN_ID', 'MaxInst',
            'Number_Of_Static_Instances', 'Max_Number_Of_Dynamic_Instances'
        }

        result = {
            'revision': self._parse_integer(kv_pairs.get('Revision')),
            'object_name': kv_pairs.get('Object_Name'),
            'object_class_code': self._parse_integer(kv_pairs.get('Object_Class_Code')),
            'network_topology': self._parse_integer(kv_pairs.get('Network_Topology')),
            'enable_switch': self._parse_boolean(kv_pairs.get('Enable_Switch')),
            'beacon_interval': self._parse_integer(kv_pairs.get('Beacon_Interval')),
            'beacon_timeout': self._parse_integer(kv_pairs.get('Beacon_Timeout')),
            'vlan_id': self._parse_integer(kv_pairs.get('VLAN_ID')),
        }

        # Add CIP common attributes
        result.update(cip_attrs)

        # Add any additional unhandled attributes
        result['additional_attributes'] = self._extract_additional_attributes(kv_pairs, handled_keys)

        return result

    def parse_tcpip_interface(self) -> Optional[Dict[str, Any]]:
        """
        Parse [TCP/IP Interface Class] section

        Returns dict with:
            revision, object_name, object_class_code, interface_config,
            host_name, ttl_value, mcast_config, select_acd, encap_timeout,
            max_inst, num_static_instances, max_dynamic_instances,
            additional_attributes
        """
        section_content = self.sections.get('TCP/IP Interface Class')
        if not section_content:
            return None

        kv_pairs = self._parse_key_value(section_content)
        cip_attrs = self._extract_common_cip_attributes(kv_pairs)

        handled_keys = {
            'Revision', 'Object_Name', 'Object_Class_Code',
            'InterfaceConfig', 'HostName', 'TTL_Value', 'Mcast_Config',
            'Select_ACD', 'Encap_Timeout', 'MaxInst',
            'Number_Of_Static_Instances', 'Max_Number_Of_Dynamic_Instances'
        }

        result = {
            'revision': self._parse_integer(kv_pairs.get('Revision')),
            'object_name': kv_pairs.get('Object_Name'),
            'object_class_code': self._parse_integer(kv_pairs.get('Object_Class_Code')),
            'interface_config': self._parse_integer(kv_pairs.get('InterfaceConfig')),
            'host_name': kv_pairs.get('HostName'),
            'ttl_value': self._parse_integer(kv_pairs.get('TTL_Value')),
            'mcast_config': self._parse_integer(kv_pairs.get('Mcast_Config')),
            'select_acd': self._parse_boolean(kv_pairs.get('Select_ACD')),
            'encap_timeout': self._parse_integer(kv_pairs.get('Encap_Timeout')),
        }

        result.update(cip_attrs)
        result['additional_attributes'] = self._extract_additional_attributes(kv_pairs, handled_keys)

        return result

    def parse_ethernet_link(self) -> Optional[Dict[str, Any]]:
        """
        Parse [Ethernet Link Class] section

        Returns dict with:
            revision, object_name, object_class_code, interface_speed,
            interface_flags, physical_address, interface_label, interface_labels,
            max_inst, num_static_instances, max_dynamic_instances,
            additional_attributes
        """
        section_content = self.sections.get('Ethernet Link Class')
        if not section_content:
            return None

        kv_pairs = self._parse_key_value(section_content)
        cip_attrs = self._extract_common_cip_attributes(kv_pairs)

        # Extract numbered interface labels (InterfaceLabel1, InterfaceLabel2, etc.)
        interface_labels = self._extract_numbered_attributes(kv_pairs, 'InterfaceLabel')

        handled_keys = {
            'Revision', 'Object_Name', 'Object_Class_Code',
            'InterfaceSpeed', 'InterfaceFlags', 'PhysAddress',
            'InterfaceLabel', 'MaxInst',
            'Number_Of_Static_Instances', 'Max_Number_Of_Dynamic_Instances'
        }
        # Add numbered interface labels to handled keys
        if interface_labels:
            for i in range(1, len(interface_labels) + 1):
                handled_keys.add(f'InterfaceLabel{i}')

        result = {
            'revision': self._parse_integer(kv_pairs.get('Revision')),
            'object_name': kv_pairs.get('Object_Name'),
            'object_class_code': self._parse_integer(kv_pairs.get('Object_Class_Code')),
            'interface_speed': self._parse_integer(kv_pairs.get('InterfaceSpeed')),
            'interface_flags': self._parse_integer(kv_pairs.get('InterfaceFlags')),
            'physical_address': kv_pairs.get('PhysAddress'),
            'interface_label': kv_pairs.get('InterfaceLabel'),
            'interface_labels': interface_labels,  # JSON array of labels
        }

        result.update(cip_attrs)
        result['additional_attributes'] = self._extract_additional_attributes(kv_pairs, handled_keys)

        return result

    def parse_qos_class(self) -> Optional[Dict[str, Any]]:
        """
        Parse [QoS Class] section - Quality of Service

        Returns dict with:
            revision, object_name, object_class_code, qos_tag_enable,
            dscp_urgent, dscp_scheduled, dscp_high, dscp_low, dscp_explicit,
            max_inst, num_static_instances, max_dynamic_instances,
            additional_attributes
        """
        section_content = self.sections.get('QoS Class')
        if not section_content:
            return None

        kv_pairs = self._parse_key_value(section_content)
        cip_attrs = self._extract_common_cip_attributes(kv_pairs)

        handled_keys = {
            'Revision', 'Object_Name', 'Object_Class_Code',
            'Q_Tag_Enable', 'DSCP_Urgent', 'DSCP_Scheduled',
            'DSCP_High', 'DSCP_Low', 'DSCP_Explicit', 'MaxInst',
            'Number_Of_Static_Instances', 'Max_Number_Of_Dynamic_Instances'
        }

        result = {
            'revision': self._parse_integer(kv_pairs.get('Revision')),
            'object_name': kv_pairs.get('Object_Name'),
            'object_class_code': self._parse_integer(kv_pairs.get('Object_Class_Code')),
            'qos_tag_enable': self._parse_boolean(kv_pairs.get('Q_Tag_Enable')),
            'dscp_urgent': self._parse_integer(kv_pairs.get('DSCP_Urgent')),
            'dscp_scheduled': self._parse_integer(kv_pairs.get('DSCP_Scheduled')),
            'dscp_high': self._parse_integer(kv_pairs.get('DSCP_High')),
            'dscp_low': self._parse_integer(kv_pairs.get('DSCP_Low')),
            'dscp_explicit': self._parse_integer(kv_pairs.get('DSCP_Explicit')),
        }

        result.update(cip_attrs)
        result['additional_attributes'] = self._extract_additional_attributes(kv_pairs, handled_keys)

        return result

    def parse_lldp_management(self) -> Optional[Dict[str, Any]]:
        """
        Parse [LLDP Management Class] section - Link Layer Discovery Protocol

        Returns dict with:
            revision, object_name, object_class_code, msg_tx_interval,
            msg_tx_hold, chassis_id_subtype, chassis_id, port_id_subtype, port_id,
            max_inst, num_static_instances, max_dynamic_instances,
            additional_attributes
        """
        section_content = self.sections.get('LLDP Management Class')
        if not section_content:
            return None

        kv_pairs = self._parse_key_value(section_content)
        cip_attrs = self._extract_common_cip_attributes(kv_pairs)

        handled_keys = {
            'Revision', 'Object_Name', 'Object_Class_Code',
            'MsgTxInterval', 'MsgTxHold', 'ChassisIdSubtype', 'ChassisId',
            'PortIdSubtype', 'PortId', 'MaxInst',
            'Number_Of_Static_Instances', 'Max_Number_Of_Dynamic_Instances'
        }

        result = {
            'revision': self._parse_integer(kv_pairs.get('Revision')),
            'object_name': kv_pairs.get('Object_Name'),
            'object_class_code': self._parse_integer(kv_pairs.get('Object_Class_Code')),
            'msg_tx_interval': self._parse_integer(kv_pairs.get('MsgTxInterval')),
            'msg_tx_hold': self._parse_integer(kv_pairs.get('MsgTxHold')),
            'chassis_id_subtype': self._parse_integer(kv_pairs.get('ChassisIdSubtype')),
            'chassis_id': kv_pairs.get('ChassisId'),
            'port_id_subtype': self._parse_integer(kv_pairs.get('PortIdSubtype')),
            'port_id': kv_pairs.get('PortId'),
        }

        result.update(cip_attrs)
        result['additional_attributes'] = self._extract_additional_attributes(kv_pairs, handled_keys)

        return result

    def parse_file_metadata(self) -> Optional[Dict[str, Any]]:
        """
        Extract extended file metadata from [File] section

        Returns dict with:
            home_url, revision, license_key, icon_contents,
            file_format, file_revision
        """
        section_content = self.sections.get('File')
        if not section_content:
            return None

        kv_pairs = self._parse_key_value(section_content)

        return {
            'home_url': kv_pairs.get('HomeURL'),
            'revision': kv_pairs.get('Revision'),
            'license_key': kv_pairs.get('1_IOC_Details_License'),  # Special key with number prefix
            'file_format': self._parse_integer(kv_pairs.get('FileFormat')),
            'file_revision': kv_pairs.get('FileRevision'),
        }

    def parse_device_metadata(self) -> Optional[Dict[str, Any]]:
        """
        Extract extended device metadata from [Device] section

        Returns dict with:
            catalog, icon, icon_contents
        """
        section_content = self.sections.get('Device')
        if not section_content:
            return None

        kv_pairs = self._parse_key_value(section_content)

        # Handle multi-line IconContents
        icon_contents = None
        if 'IconContents' in kv_pairs:
            # IconContents is base64 encoded, potentially multi-line
            icon_contents = kv_pairs.get('IconContents', '').replace('\n', '').replace(' ', '')

        return {
            'catalog': kv_pairs.get('Catalog'),
            'icon': kv_pairs.get('Icon'),
            'icon_contents': icon_contents,
        }

    def parse_object_metadata(self) -> List[Dict[str, Any]]:
        """
        Extract CIP object metadata from multiple sections

        Returns list of dicts with:
            section_name, object_name, object_class_code, revision
        """
        metadata_sections = [
            'Assembly',
            'Connection Manager',
            'DLR Class',
            'TCP/IP Interface Class',
            'Ethernet Link Class',
            'QoS Class',
            'LLDP Management Class'
        ]

        results = []

        for section_name in metadata_sections:
            section_content = self.sections.get(section_name)
            if not section_content:
                continue

            kv_pairs = self._parse_key_value(section_content)

            object_name = kv_pairs.get('Object_Name')
            object_class_code = kv_pairs.get('Object_Class_Code')
            revision = kv_pairs.get('Revision')

            if object_name or object_class_code:
                results.append({
                    'section_name': section_name,
                    'object_name': object_name,
                    'object_class_code': self._parse_integer(object_class_code),
                    'revision': self._parse_integer(revision),
                })

        return results

    def parse_all_advanced_sections(self) -> Dict[str, Any]:
        """
        Parse all advanced sections and return comprehensive dictionary

        Returns:
            Dictionary with keys: dlr_config, tcpip_interface, ethernet_link,
            qos_config, lldp_management, file_metadata, device_metadata,
            object_metadata
        """
        return {
            'dlr_config': self.parse_dlr_class(),
            'tcpip_interface': self.parse_tcpip_interface(),
            'ethernet_link': self.parse_ethernet_link(),
            'qos_config': self.parse_qos_class(),
            'lldp_management': self.parse_lldp_management(),
            'file_metadata': self.parse_file_metadata(),
            'device_metadata': self.parse_device_metadata(),
            'object_metadata': self.parse_object_metadata(),
        }
