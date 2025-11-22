"""
UI Menu storage handler

Manages UI menus, menu items, buttons, and role menu mappings.
"""

import logging
from .base import BaseSaver

logger = logging.getLogger(__name__)


class MenuSaver(BaseSaver):
    """Handles UI menu and menu item storage"""

    def save(self, device_id: int, ui_menus) -> None:
        """
        Save all UI menus and menu items for a device

        Args:
            device_id: Database ID of the device
            ui_menus: UIMenus object with menus and role mappings
        """
        if not ui_menus or not hasattr(ui_menus, 'menus'):
            logger.debug(f"No UI menus to save for device {device_id}")
            return

        # Delete existing menus and related data (only tables with device_id)
        self._delete_existing('ui_menus', device_id)
        self._delete_existing('ui_menu_roles', device_id)
        # Note: Child tables (ui_menu_items, ui_menu_buttons) will be recreated

        # Save each menu
        for menu in ui_menus.menus:
            menu_db_id = self._save_menu(device_id, menu)
            if menu_db_id:
                self._save_menu_items(menu_db_id, menu.items)

        # Save role menu mappings
        self._save_role_mappings(device_id, ui_menus)

        logger.info(f"Saved {len(ui_menus.menus)} UI menus for device {device_id}")

    def _save_menu(self, device_id: int, menu) -> int:
        """Save main menu entry"""
        query = """
            INSERT INTO ui_menus (device_id, menu_id, name, name_text_id)
            VALUES (?, ?, ?, ?)
        """
        params = (
            device_id,
            getattr(menu, 'id', None),
            getattr(menu, 'name', None),
            getattr(menu, 'name_text_id', None),  # PQA reconstruction
        )
        self._execute(query, params)
        return self._get_lastrowid()

    def _save_menu_items(self, menu_db_id: int, items: list):
        """Save menu items for a menu"""
        if not items:
            return

        query = """
            INSERT INTO ui_menu_items (
                menu_id, variable_id, record_item_ref, subindex,
                access_right_restriction, display_format, unit_code,
                button_value, menu_ref, item_order, gradient, offset,
                condition_variable_id, condition_value,
                gradient_str, offset_str, condition_subindex
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        for idx, item in enumerate(items):
            params = (
                menu_db_id,
                getattr(item, 'variable_id', None),
                getattr(item, 'record_item_ref', None),
                getattr(item, 'subindex', None),
                getattr(item, 'access_right_restriction', None),
                getattr(item, 'display_format', None),
                getattr(item, 'unit_code', None),
                getattr(item, 'button_value', None),
                getattr(item, 'menu_ref', None),
                idx,
                getattr(item, 'gradient', None),
                getattr(item, 'offset', None),
                getattr(item, 'condition_variable_id', None),  # PQA: MenuRef Condition
                getattr(item, 'condition_value', None),  # PQA: MenuRef Condition
                getattr(item, 'gradient_str', None),  # PQA: original string format
                getattr(item, 'offset_str', None),  # PQA: original string format
                getattr(item, 'condition_subindex', None),  # PQA: MenuRef Condition@subindex
            )
            self._execute(query, params)
            menu_item_db_id = self._get_lastrowid()

            # Save buttons for this menu item
            if hasattr(item, 'buttons') and item.buttons:
                self._save_menu_buttons(menu_item_db_id, item.buttons)

    def _save_menu_buttons(self, menu_item_db_id: int, buttons: list):
        """Save button configurations for a menu item"""
        query = """
            INSERT INTO ui_menu_buttons (
                menu_item_id, button_value, description, action_started_message,
                description_text_id, action_started_message_text_id
            ) VALUES (?, ?, ?, ?, ?, ?)
        """

        params_list = []
        for button in buttons:
            params_list.append((
                menu_item_db_id,
                getattr(button, 'button_value', None),
                getattr(button, 'description', None),
                getattr(button, 'action_started_message', None),
                getattr(button, 'description_text_id', None),  # PQA reconstruction
                getattr(button, 'action_started_message_text_id', None),  # PQA reconstruction
            ))

        if params_list:
            self._execute_many(query, params_list)

    def _save_role_mappings(self, device_id: int, ui_menus):
        """Save role menu mappings (observer, maintenance, specialist)"""
        query = """
            INSERT INTO ui_menu_roles (device_id, role_type, menu_type, menu_id)
            VALUES (?, ?, ?, ?)
        """

        params_list = []

        # Observer role menus
        if hasattr(ui_menus, 'observer_role_menus'):
            for menu_type, menu_id in ui_menus.observer_role_menus.items():
                params_list.append((device_id, 'observer', menu_type, menu_id))

        # Maintenance role menus
        if hasattr(ui_menus, 'maintenance_role_menus'):
            for menu_type, menu_id in ui_menus.maintenance_role_menus.items():
                params_list.append((device_id, 'maintenance', menu_type, menu_id))

        # Specialist role menus
        if hasattr(ui_menus, 'specialist_role_menus'):
            for menu_type, menu_id in ui_menus.specialist_role_menus.items():
                params_list.append((device_id, 'specialist', menu_type, menu_id))

        if params_list:
            self._execute_many(query, params_list)
