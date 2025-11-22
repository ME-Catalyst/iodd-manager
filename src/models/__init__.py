"""
Data models for IODD Management System

This module contains all the dataclasses and enums used throughout the system.
"""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional


class IODDDataType(Enum):
    """IODD standard data types"""
    BOOLEAN = "BooleanT"
    INTEGER = "IntegerT"
    UNSIGNED_INTEGER = "UIntegerT"
    FLOAT = "Float32T"
    STRING = "StringT"
    OCTET_STRING = "OctetStringT"
    TIME = "TimeT"
    RECORD = "RecordT"
    ARRAY = "ArrayT"


class AccessRights(Enum):
    """Parameter access rights"""
    READ_ONLY = "ro"
    WRITE_ONLY = "wo"
    READ_WRITE = "rw"


@dataclass
class VendorInfo:
    """Vendor information from IODD"""
    id: int
    name: str
    text: str
    url: Optional[str] = None


@dataclass
class DeviceInfo:
    """Device identification information"""
    vendor_id: int
    device_id: int
    product_name: str
    product_id: Optional[str] = None
    product_text: Optional[str] = None
    hardware_revision: Optional[str] = None
    firmware_revision: Optional[str] = None
    software_revision: Optional[str] = None


@dataclass
class Constraint:
    """Parameter constraint definition"""
    type: str  # min, max, enum
    value: Any


@dataclass
class SingleValue:
    """Single value enumeration for parameters/process data"""
    value: str
    name: str
    description: Optional[str] = None
    text_id: Optional[str] = None  # Original textId from IODD for PQA reconstruction
    xsi_type: Optional[str] = None  # xsi:type attribute (e.g., BooleanValueT) for PQA


@dataclass
class Parameter:
    """Device parameter definition"""
    id: str
    index: int
    subindex: Optional[int]
    name: str
    data_type: IODDDataType
    access_rights: AccessRights
    default_value: Optional[Any] = None
    min_value: Optional[Any] = None
    max_value: Optional[Any] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    constraints: List[Constraint] = field(default_factory=list)
    enumeration_values: Dict[str, str] = field(default_factory=dict)  # value -> label mapping
    bit_length: Optional[int] = None
    # These attributes are Optional[bool] to distinguish between:
    # - None: attribute was not present in original IODD (don't output in reconstruction)
    # - True/False: attribute was explicitly set in original IODD (output in reconstruction)
    dynamic: Optional[bool] = None
    excluded_from_data_storage: Optional[bool] = None
    modifies_other_variables: Optional[bool] = None
    unit_code: Optional[str] = None
    value_range_name: Optional[str] = None
    single_values: List[SingleValue] = field(default_factory=list)
    record_items: List['RecordItem'] = field(default_factory=list)  # For RecordT datatypes
    # ArrayT specific fields
    array_count: Optional[int] = None  # ArrayT count attribute
    array_element_type: Optional[str] = None  # SimpleDatatype xsi:type (e.g., UIntegerT)
    array_element_bit_length: Optional[int] = None  # SimpleDatatype bitLength
    array_element_fixed_length: Optional[int] = None  # OctetStringT/StringT fixedLength
    subindex_access_supported: Optional[bool] = None  # ArrayT/RecordT subindexAccessSupported
    # PQA reconstruction fields
    name_text_id: Optional[str] = None  # Original textId for Name element
    description_text_id: Optional[str] = None  # Original textId for Description element
    datatype_ref: Optional[str] = None  # DatatypeRef datatypeId (e.g., D_Colors) for PQA reconstruction
    value_range_xsi_type: Optional[str] = None  # ValueRange xsi:type (e.g., UIntegerValueRangeT)
    value_range_name_text_id: Optional[str] = None  # ValueRange Name textId
    xml_order: Optional[int] = None  # Original order in XML document (for PQA reconstruction)


@dataclass
class RecordItem:
    """Record item within process data"""
    subindex: int
    name: str
    bit_offset: int
    bit_length: Optional[int]  # None when not explicitly in original IODD (PQA)
    data_type: str
    default_value: Optional[str] = None
    single_values: List[SingleValue] = field(default_factory=list)
    name_text_id: Optional[str] = None  # Original textId for Name element (PQA)
    description: Optional[str] = None  # Description text (PQA)
    description_text_id: Optional[str] = None  # Original textId for Description element (PQA)
    # ValueRange inside SimpleDatatype (PQA reconstruction)
    min_value: Optional[str] = None
    max_value: Optional[str] = None
    value_range_xsi_type: Optional[str] = None
    access_right_restriction: Optional[str] = None  # RecordItem@accessRightRestriction (PQA)
    # SimpleDatatype attributes (PQA reconstruction)
    fixed_length: Optional[int] = None  # SimpleDatatype@fixedLength
    encoding: Optional[str] = None  # SimpleDatatype@encoding
    datatype_id: Optional[str] = None  # SimpleDatatype@id


@dataclass
class ProcessDataCondition:
    """Conditional process data definition"""
    variable_id: str
    value: str
    subindex: Optional[str] = None  # PQA: Condition element can have subindex attribute


@dataclass
class ProcessData:
    """Process data definition"""
    id: str
    name: str
    bit_length: int
    data_type: str
    record_items: List[RecordItem] = field(default_factory=list)
    description: Optional[str] = None
    # Phase 2: Conditional process data
    condition: Optional[ProcessDataCondition] = None
    # PQA: Store original textId for accurate reconstruction
    name_text_id: Optional[str] = None
    # PQA: Store subindexAccessSupported attribute from Datatype
    subindex_access_supported: Optional[bool] = None


@dataclass
class ProcessDataCollection:
    """Collection of process data inputs and outputs"""
    inputs: List[ProcessData] = field(default_factory=list)
    outputs: List[ProcessData] = field(default_factory=list)
    total_input_bits: int = 0
    total_output_bits: int = 0


@dataclass
class ErrorType:
    """Device error type definition"""
    code: int
    additional_code: int
    name: Optional[str] = None
    description: Optional[str] = None
    # PQA: Track whether code attribute was in original and element order
    has_code_attr: bool = True  # Most have code, so default True
    xml_order: Optional[int] = None


@dataclass
class Event:
    """Device event definition"""
    code: int
    name: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None  # Notification, Warning, Error
    # PQA: Store original textIds for accurate reconstruction
    name_text_id: Optional[str] = None
    description_text_id: Optional[str] = None
    order_index: Optional[int] = None  # Preserve original order in IODD


@dataclass
class DocumentInfo:
    """IODD document metadata"""
    copyright: Optional[str] = None
    release_date: Optional[str] = None
    version: Optional[str] = None


@dataclass
class DeviceFeatures:
    """Device capabilities and features"""
    block_parameter: bool = False
    data_storage: bool = False
    profile_characteristic: Optional[str] = None
    access_locks_data_storage: bool = False
    access_locks_local_parameterization: bool = False
    access_locks_local_user_interface: bool = False
    access_locks_parameter: bool = False
    # Track whether SupportedAccessLocks element was present in original IODD
    has_supported_access_locks: bool = False


@dataclass
class CommunicationProfile:
    """IO-Link communication network profile"""
    iolink_revision: Optional[str] = None
    compatible_with: Optional[str] = None
    bitrate: Optional[str] = None
    min_cycle_time: Optional[int] = None  # microseconds
    msequence_capability: Optional[int] = None
    sio_supported: bool = False
    connection_type: Optional[str] = None
    wire_config: Dict[str, str] = field(default_factory=dict)


@dataclass
class MenuButton:
    """UI menu button configuration"""
    button_value: str
    description: Optional[str] = None
    action_started_message: Optional[str] = None
    # PQA reconstruction fields
    description_text_id: Optional[str] = None  # Original textId for Description element
    action_started_message_text_id: Optional[str] = None  # Original textId for ActionStartedMessage


@dataclass
class MenuItem:
    """User interface menu item reference"""
    variable_id: Optional[str] = None
    record_item_ref: Optional[str] = None
    subindex: Optional[int] = None
    access_right_restriction: Optional[str] = None
    display_format: Optional[str] = None
    unit_code: Optional[str] = None
    button_value: Optional[str] = None
    menu_ref: Optional[str] = None
    # Phase 1: UI rendering metadata
    gradient: Optional[float] = None
    offset: Optional[float] = None
    # PQA: Store original string format for exact reconstruction
    gradient_str: Optional[str] = None
    offset_str: Optional[str] = None
    # Phase 3: Button configuration
    buttons: List[MenuButton] = field(default_factory=list)
    # PQA: MenuRef Condition support
    condition_variable_id: Optional[str] = None
    condition_value: Optional[str] = None
    condition_subindex: Optional[str] = None  # PQA: MenuRef Condition@subindex


@dataclass
class Menu:
    """User interface menu definition"""
    id: str
    name: str
    items: List[MenuItem] = field(default_factory=list)
    sub_menus: List[str] = field(default_factory=list)
    # PQA reconstruction field
    name_text_id: Optional[str] = None  # Original textId for Name element


@dataclass
class UserInterfaceMenus:
    """Complete user interface menu structure"""
    menus: List[Menu] = field(default_factory=list)
    observer_role_menus: Dict[str, str] = field(default_factory=dict)
    maintenance_role_menus: Dict[str, str] = field(default_factory=dict)
    specialist_role_menus: Dict[str, str] = field(default_factory=dict)


@dataclass
class ProcessDataUIInfo:
    """UI rendering metadata for process data record items"""
    process_data_id: str
    subindex: int
    gradient: Optional[float] = None
    offset: Optional[float] = None
    unit_code: Optional[str] = None
    display_format: Optional[str] = None


@dataclass
class DeviceVariant:
    """Device variant information"""
    product_id: str
    device_symbol: Optional[str] = None
    device_icon: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    name_text_id: Optional[str] = None  # Original textId for Name element (PQA)
    description_text_id: Optional[str] = None  # Original textId for Description element (PQA)


@dataclass
class WireConfiguration:
    """Wire connection configuration"""
    connection_type: str
    wire_number: int
    wire_color: Optional[str] = None
    wire_function: Optional[str] = None
    wire_description: Optional[str] = None


@dataclass
class TestEventTrigger:
    """Test event trigger configuration"""
    appear_value: str
    disappear_value: str


@dataclass
class DeviceTestConfig:
    """Device test configuration"""
    config_type: str
    param_index: int
    test_value: str
    event_triggers: List[TestEventTrigger] = field(default_factory=list)


@dataclass
class CustomDatatype:
    """Custom datatype definition"""
    datatype_id: str
    datatype_xsi_type: str
    bit_length: Optional[int] = None
    subindex_access_supported: bool = False
    single_values: List[SingleValue] = field(default_factory=list)
    record_items: List[RecordItem] = field(default_factory=list)


@dataclass
class StdVariableRefSingleValue:
    """SingleValue or StdSingleValueRef child of StdVariableRef"""
    value: str  # The value attribute
    name_text_id: Optional[str] = None  # textId for Name element (SingleValue only)
    is_std_ref: bool = False  # True for StdSingleValueRef, False for SingleValue
    order_index: int = 0  # Original order


@dataclass
class StdRecordItemRef:
    """StdRecordItemRef child of StdVariableRef - specifies default values for record items"""
    subindex: int
    default_value: Optional[str] = None


@dataclass
class StdVariableRef:
    """Standard variable reference from VariableCollection"""
    variable_id: str  # e.g., V_VendorName, V_ProductName
    default_value: Optional[str] = None
    fixed_length_restriction: Optional[int] = None
    excluded_from_data_storage: Optional[bool] = None
    order_index: int = 0  # Original order in IODD
    single_values: List['StdVariableRefSingleValue'] = field(default_factory=list)  # Child elements
    record_item_refs: List['StdRecordItemRef'] = field(default_factory=list)  # StdRecordItemRef children


@dataclass
class DeviceProfile:
    """Complete device profile from IODD"""
    vendor_info: VendorInfo
    device_info: DeviceInfo
    parameters: List[Parameter]
    process_data: ProcessDataCollection
    error_types: List[ErrorType] = field(default_factory=list)
    events: List[Event] = field(default_factory=list)
    document_info: Optional[DocumentInfo] = None
    device_features: Optional[DeviceFeatures] = None
    communication_profile: Optional[CommunicationProfile] = None
    ui_menus: Optional[UserInterfaceMenus] = None
    iodd_version: str = ""
    schema_version: str = ""
    import_date: datetime = field(default_factory=datetime.now)
    raw_xml: Optional[str] = None
    all_text_data: Dict[str, Dict[str, str]] = field(default_factory=dict)  # Multi-language text data
    text_xml_order: Dict[str, Dict[str, int]] = field(default_factory=dict)  # PQA: Original XML order of Text elements per language
    language_order: Dict[str, int] = field(default_factory=dict)  # PQA: Order of Language elements

    # Phase 1: UI Rendering metadata
    process_data_ui_info: List[ProcessDataUIInfo] = field(default_factory=list)
    menu_item_ui_attrs: Dict[str, Dict[str, Any]] = field(default_factory=dict)  # Store gradient/offset for menu items

    # Phase 2: Device Variants and Conditions
    device_variants: List[DeviceVariant] = field(default_factory=list)
    process_data_conditions: Dict[str, ProcessDataCondition] = field(default_factory=dict)  # pd_id -> condition

    # Phase 3: Button Configurations
    menu_buttons: Dict[str, List[MenuButton]] = field(default_factory=dict)  # menu_item_id -> buttons

    # Phase 4: Wiring and Testing
    wire_configurations: List[WireConfiguration] = field(default_factory=list)
    test_configurations: List[DeviceTestConfig] = field(default_factory=list)

    # Phase 5: Custom Datatypes
    custom_datatypes: List[CustomDatatype] = field(default_factory=list)
    vendor_logo_filename: Optional[str] = None
    stamp_crc: Optional[str] = None
    checker_name: Optional[str] = None
    checker_version: Optional[str] = None

    # PQA: StdVariableRef preservation
    std_variable_refs: List[StdVariableRef] = field(default_factory=list)


# Export all models
__all__ = [
    'IODDDataType',
    'AccessRights',
    'VendorInfo',
    'DeviceInfo',
    'Constraint',
    'Parameter',
    'RecordItem',
    'ProcessData',
    'ProcessDataCollection',
    'ErrorType',
    'Event',
    'DocumentInfo',
    'DeviceFeatures',
    'CommunicationProfile',
    'MenuItem',
    'Menu',
    'UserInterfaceMenus',
    'SingleValue',
    'ProcessDataUIInfo',
    'DeviceVariant',
    'ProcessDataCondition',
    'MenuButton',
    'WireConfiguration',
    'TestEventTrigger',
    'DeviceTestConfig',
    'CustomDatatype',
    'StdVariableRef',
    'StdVariableRefSingleValue',
    'StdRecordItemRef',
    'DeviceProfile',
]
