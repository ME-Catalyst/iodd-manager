"""
IODD-specific API routes
Handles IODD device data, menu structures, and parameter information
"""
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

import sqlite3

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/iodd", tags=["IODD"])


# Database helper
def get_db():
    """Get database connection"""
    conn = sqlite3.connect("greenstack.db")
    conn.row_factory = lambda cursor, row: dict(zip([col[0] for col in cursor.description], row))
    return conn


class MenuItemResponse(BaseModel):
    """Menu item with resolved text and parameter data"""
    type: str  # 'VariableRef', 'RecordItemRef', 'Button', 'MenuRef'
    variable_id: Optional[str] = None
    record_item_ref: Optional[str] = None
    subindex: Optional[int] = None
    access_right_restriction: Optional[str] = None
    display_format: Optional[str] = None
    unit_code: Optional[str] = None
    gradient: Optional[float] = None
    offset: Optional[float] = None
    button_value: Optional[str] = None
    menu_ref: Optional[str] = None
    # Resolved data
    parameter_name: Optional[str] = None
    parameter_description: Optional[str] = None
    data_type: Optional[str] = None
    default_value: Optional[str] = None
    min_value: Optional[str] = None
    max_value: Optional[str] = None
    unit: Optional[str] = None
    enumeration_values: Optional[Dict[str, str]] = None


class MenuResponse(BaseModel):
    """Menu with items and resolved text"""
    menu_id: str
    name: str  # Resolved from textId
    items: List[MenuItemResponse]

    class Config:
        from_attributes = True


class MenuRoleSetResponse(BaseModel):
    """Role-based menu set"""
    role_type: str  # 'observer', 'maintenance', 'specialist'
    identification_menu: Optional[str] = None
    parameter_menu: Optional[str] = None
    observation_menu: Optional[str] = None
    diagnosis_menu: Optional[str] = None


class DeviceMenusResponse(BaseModel):
    """Complete menu structure for a device"""
    device_id: int
    menus: List[MenuResponse]
    role_sets: List[MenuRoleSetResponse]


@router.get("/{device_id}/menus", response_model=DeviceMenusResponse)
async def get_device_menus(
    device_id: int,
    role: Optional[str] = Query(None, description="Filter by role: observer, maintenance, or specialist")
):
    """
    Get complete menu structure for an IODD device

    This endpoint retrieves all menus, menu items, and role-based menu sets,
    with text IDs resolved to actual text values and parameter metadata included.

    Args:
        device_id: IODD device ID
        role: Optional filter by role type

    Returns:
        Complete menu structure with resolved text and parameter data
    """
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Fetch all menus for this device
        cursor.execute("""
            SELECT id, menu_id, name FROM ui_menus
            WHERE device_id = ?
            ORDER BY menu_id
        """, (device_id,))
        menus_raw = cursor.fetchall()

        if not menus_raw:
            raise HTTPException(status_code=404, detail=f"No menus found for device {device_id}")

        # Helper function to resolve text ID
        def resolve_text_id(text_value: str, lang: str = 'en') -> str:
            """Resolve text ID to actual text value"""
            if not text_value:
                return text_value

            cursor.execute("""
                SELECT text_id FROM iodd_text
                WHERE device_id = ? AND text_value = ? AND language_code = ?
                LIMIT 1
            """, (device_id, text_value, lang))
            result = cursor.fetchone()
            return text_value  # Return original if not found (it's already the text value)

        # Build menus with items
        menus = []
        for menu_raw in menus_raw:
            # Get menu items
            cursor.execute("""
                SELECT * FROM ui_menu_items
                WHERE menu_id = ?
                ORDER BY item_order
            """, (menu_raw['id'],))
            items_raw = cursor.fetchall()

            menu_items = []
            for item in items_raw:
                menu_item = {
                    "access_right_restriction": item.get('access_right_restriction'),
                    "display_format": item.get('display_format'),
                    "unit_code": item.get('unit_code'),
                    "gradient": item.get('gradient'),
                    "offset": item.get('offset')
                }

                # Determine item type and get parameter data
                if item.get('variable_id'):
                    menu_item['type'] = 'VariableRef'
                    menu_item['variable_id'] = item['variable_id']

                    # Look up parameter data
                    # Extract index from variable ID (e.g., V_DeviceStatus -> find by name)
                    cursor.execute("""
                        SELECT name, description, data_type, default_value, min_value, max_value,
                               unit, enumeration_values
                        FROM parameters
                        WHERE device_id = ? AND name LIKE ?
                        LIMIT 1
                    """, (device_id, f"%{item['variable_id'].replace('V_', '')}%"))
                    param = cursor.fetchone()

                    if param:
                        menu_item['parameter_name'] = param['name']
                        menu_item['parameter_description'] = param['description']
                        menu_item['data_type'] = param['data_type']
                        menu_item['default_value'] = param['default_value']
                        menu_item['min_value'] = param['min_value']
                        menu_item['max_value'] = param['max_value']
                        menu_item['unit'] = param['unit']
                        if param['enumeration_values']:
                            import json
                            try:
                                menu_item['enumeration_values'] = json.loads(param['enumeration_values'])
                            except:
                                menu_item['enumeration_values'] = None
                    else:
                        # Fallback: Use variable_id as display name if no parameter found
                        # Standard IO-Link variables (V_VendorName, etc.) won't be in parameters table
                        menu_item['parameter_name'] = item['variable_id']

                elif item.get('record_item_ref'):
                    menu_item['type'] = 'RecordItemRef'
                    menu_item['record_item_ref'] = item['record_item_ref']
                    menu_item['subindex'] = item.get('subindex')

                    # Look up parameter data (similar to above)
                    cursor.execute("""
                        SELECT name, description, data_type
                        FROM parameters
                        WHERE device_id = ? AND name LIKE ?
                        LIMIT 1
                    """, (device_id, f"%{item['record_item_ref'].replace('V_', '')}%"))
                    param = cursor.fetchone()

                    if param:
                        menu_item['parameter_name'] = param['name']
                        menu_item['parameter_description'] = param['description']
                        menu_item['data_type'] = param['data_type']
                    else:
                        # Fallback: Use record_item_ref as display name
                        menu_item['parameter_name'] = item['record_item_ref']

                elif item.get('button_value'):
                    menu_item['type'] = 'Button'
                    menu_item['button_value'] = item['button_value']

                elif item.get('menu_ref'):
                    menu_item['type'] = 'MenuRef'
                    menu_item['menu_ref'] = item['menu_ref']

                else:
                    continue  # Skip unknown item types

                menu_items.append(MenuItemResponse(**menu_item))

            menus.append(MenuResponse(
                menu_id=menu_raw['menu_id'],
                name=menu_raw['name'],
                items=menu_items
            ))

        # Fetch role sets
        cursor.execute("""
            SELECT role_type, menu_type, menu_id FROM ui_menu_roles
            WHERE device_id = ?
            ORDER BY role_type, menu_type
        """, (device_id,))
        roles_raw = cursor.fetchall()

        # Group by role type
        role_sets_dict = {}
        for role_row in roles_raw:
            role_type = role_row['role_type']
            if role_type not in role_sets_dict:
                role_sets_dict[role_type] = {
                    "role_type": role_type,
                    "identification_menu": None,
                    "parameter_menu": None,
                    "observation_menu": None,
                    "diagnosis_menu": None
                }

            menu_type = role_row['menu_type']
            menu_id = role_row['menu_id']

            if menu_type == 'IdentificationMenu':
                role_sets_dict[role_type]['identification_menu'] = menu_id
            elif menu_type == 'ParameterMenu':
                role_sets_dict[role_type]['parameter_menu'] = menu_id
            elif menu_type == 'ObservationMenu':
                role_sets_dict[role_type]['observation_menu'] = menu_id
            elif menu_type == 'DiagnosisMenu':
                role_sets_dict[role_type]['diagnosis_menu'] = menu_id

        role_sets = [MenuRoleSetResponse(**rs) for rs in role_sets_dict.values()]

        # Filter by role if specified
        if role:
            role_sets = [rs for rs in role_sets if rs.role_type == role.lower()]
            if not role_sets:
                raise HTTPException(status_code=404, detail=f"No menu sets found for role '{role}'")

        conn.close()

        return DeviceMenusResponse(
            device_id=device_id,
            menus=menus,
            role_sets=role_sets
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching menus for device {device_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching menu data: {str(e)}")
