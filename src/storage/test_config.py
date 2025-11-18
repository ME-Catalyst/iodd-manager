"""
Test Configuration storage handler

Manages device test configurations and event triggers.
"""

import logging
from .base import BaseSaver

logger = logging.getLogger(__name__)


class TestConfigSaver(BaseSaver):
    """Handles test configuration storage"""

    def save(self, device_id: int, test_configurations: list) -> None:
        """
        Save all test configurations for a device

        Args:
            device_id: Database ID of the device
            test_configurations: List of TestConfiguration objects
        """
        if not test_configurations:
            logger.debug(f"No test configurations to save for device {device_id}")
            return

        # Delete existing
        self._delete_existing('device_test_event_triggers', device_id)
        self._delete_existing('device_test_config', device_id)

        # Save each test configuration
        for test_config in test_configurations:
            test_config_db_id = self._save_test_config(device_id, test_config)
            if test_config_db_id:
                self._save_event_triggers(test_config_db_id, test_config)

        logger.info(f"Saved {len(test_configurations)} test configurations for device {device_id}")

    def _save_test_config(self, device_id: int, test_config) -> int:
        """Save main test configuration entry"""
        query = """
            INSERT INTO device_test_config (
                device_id, config_type, param_index, test_value
            ) VALUES (?, ?, ?, ?)
        """

        params = (
            device_id,
            getattr(test_config, 'config_type', None),
            getattr(test_config, 'param_index', None),
            getattr(test_config, 'test_value', None),
        )

        self._execute(query, params)
        return self._get_lastrowid()

    def _save_event_triggers(self, test_config_db_id: int, test_config):
        """Save event triggers for a test configuration"""
        if not hasattr(test_config, 'event_triggers') or not test_config.event_triggers:
            return

        query = """
            INSERT INTO device_test_event_triggers (
                test_config_id, appear_value, disappear_value
            ) VALUES (?, ?, ?)
        """

        params_list = []
        for trigger in test_config.event_triggers:
            params_list.append((
                test_config_db_id,
                getattr(trigger, 'appear_value', None),
                getattr(trigger, 'disappear_value', None),
            ))

        if params_list:
            self._execute_many(query, params_list)
