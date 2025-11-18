# GreenStack Code Quality Analysis Report

**Analysis Date**: 2025-11-18 00:54:29

## Summary Statistics

- **Total Files Analyzed**: 24
- **Total Functions**: 348
- **Functions with Type Hints**: 230 (66.1%)
- **Functions with Docstrings**: 330 (94.8%)
- **Functions with Return Type**: 177 (50.9%)
- **High Complexity Functions (>10)**: 36
- **Long Functions (>100 lines)**: 25
- **Security Issues Found**: 3

## Priority Issues

### Critical Issues

- **/home/user/GreenStack/src/routes/eds_routes.py:1016** - SQL Injection Risk: SQL query uses f-string formatting
- **/home/user/GreenStack/src/routes/admin_routes.py:352** - SQL Injection Risk: SQL query uses f-string formatting
- **/home/user/GreenStack/src/routes/admin_routes.py:451** - SQL Injection Risk: SQL query uses f-string formatting

### High Priority Issues

- **/home/user/GreenStack/src/api.py:363** - Very high complexity in upload_iodd() - complexity 26
- **/home/user/GreenStack/src/api.py:713** - Very high complexity in get_device_document_info() - complexity 53
- **/home/user/GreenStack/src/greenstack.py:800** - Very high complexity in _extract_process_data() - complexity 40
- **/home/user/GreenStack/src/greenstack.py:800** - Very long function _extract_process_data() - 226 lines
- **/home/user/GreenStack/src/greenstack.py:1315** - Very high complexity in _extract_ui_menus() - complexity 21
- **/home/user/GreenStack/src/greenstack.py:1578** - Very high complexity in _extract_custom_datatypes() - complexity 20
- **/home/user/GreenStack/src/greenstack.py:1801** - Very high complexity in _ingest_package() - complexity 18
- **/home/user/GreenStack/src/greenstack.py:1918** - Very long function _init_database() - 216 lines
- **/home/user/GreenStack/src/greenstack.py:2135** - Very high complexity in save_device() - complexity 46
- **/home/user/GreenStack/src/greenstack.py:2135** - Very long function save_device() - 483 lines
- **/home/user/GreenStack/src/routes/eds_routes.py:33** - Very high complexity in upload_eds_file() - complexity 21
- **/home/user/GreenStack/src/routes/eds_routes.py:33** - Very long function upload_eds_file() - 359 lines
- **/home/user/GreenStack/src/routes/eds_routes.py:575** - Very long function get_eds_file() - 176 lines
- **/home/user/GreenStack/src/routes/eds_routes.py:754** - Very high complexity in get_eds_diagnostics() - complexity 19
- **/home/user/GreenStack/src/routes/eds_routes.py:1035** - Very high complexity in upload_eds_package() - complexity 33
- **/home/user/GreenStack/src/routes/eds_routes.py:1035** - Very long function upload_eds_package() - 340 lines
- **/home/user/GreenStack/src/routes/eds_routes.py:1482** - Very high complexity in get_eds_assemblies() - complexity 29
- **/home/user/GreenStack/src/routes/admin_routes.py:27** - Very high complexity in get_system_overview() - complexity 18
- **/home/user/GreenStack/src/routes/admin_routes.py:196** - Very high complexity in get_database_health() - complexity 20
- **/home/user/GreenStack/src/routes/admin_routes.py:196** - Very long function get_database_health() - 189 lines
- **/home/user/GreenStack/src/routes/search_routes.py:17** - Very high complexity in global_search() - complexity 26
- **/home/user/GreenStack/src/routes/search_routes.py:17** - Very long function global_search() - 209 lines
- **/home/user/GreenStack/src/routes/pqa_routes.py:193** - Very high complexity in get_latest_metrics() - complexity 22
- **/home/user/GreenStack/src/routes/pqa_routes.py:244** - Very high complexity in get_metrics_history() - complexity 20
- **/home/user/GreenStack/src/parsers/eds_parser.py:311** - Very high complexity in get_assemblies() - complexity 19
- **/home/user/GreenStack/src/parsers/eds_diagnostics.py:186** - Very high complexity in validate_eds_data() - complexity 19
- **/home/user/GreenStack/src/parsers/eds_package_parser.py:63** - Very high complexity in parse_package() - complexity 29
- **/home/user/GreenStack/src/parsers/eds_package_parser.py:63** - Very long function parse_package() - 170 lines
- **/home/user/GreenStack/src/utils/pqa_diff_analyzer.py:158** - Very high complexity in _find_differences() - complexity 24
- **/home/user/GreenStack/src/utils/pqa_diff_analyzer.py:158** - Very long function _find_differences() - 153 lines
- ... and 2 more

### Medium Priority Issues

*Total: 47 issues (showing first 20)*

- **/home/user/GreenStack/src/api.py:363** - Long function upload_iodd() - 135 lines
- **/home/user/GreenStack/src/api.py:713** - Long function get_device_document_info() - 102 lines
- **/home/user/GreenStack/src/api.py:991** - High complexity in get_device_config_schema() - complexity 12
- **/home/user/GreenStack/src/api.py:991** - Long function get_device_config_schema() - 137 lines
- **/home/user/GreenStack/src/api.py:1338** - High complexity in export_iodd() - complexity 13
- **/home/user/GreenStack/src/greenstack.py:332** - Missing docstring in __init__()
- **/home/user/GreenStack/src/greenstack.py:616** - Long function _parse_std_variable_ref() - 104 lines
- **/home/user/GreenStack/src/greenstack.py:721** - High complexity in _parse_variable_datatype() - complexity 13
- **/home/user/GreenStack/src/greenstack.py:1315** - Long function _extract_ui_menus() - 121 lines
- **/home/user/GreenStack/src/greenstack.py:1531** - High complexity in _extract_test_configurations() - complexity 13
- **/home/user/GreenStack/src/greenstack.py:1677** - Missing docstring in __init__()
- **/home/user/GreenStack/src/greenstack.py:1735** - High complexity in ingest_nested_package() - complexity 11
- **/home/user/GreenStack/src/greenstack.py:1914** - Missing docstring in __init__()
- **/home/user/GreenStack/src/greenstack.py:2763** - Missing docstring in platform_name()
- **/home/user/GreenStack/src/greenstack.py:3067** - Missing docstring in __init__()
- **/home/user/GreenStack/src/routes/ticket_routes.py:270** - High complexity in update_ticket() - complexity 11
- **/home/user/GreenStack/src/routes/ticket_routes.py:680** - Long function export_tickets_with_attachments() - 119 lines
- **/home/user/GreenStack/src/routes/service_routes.py:182** - High complexity in get_services_status() - complexity 12
- **/home/user/GreenStack/src/routes/service_routes.py:238** - High complexity in get_port_conflicts() - complexity 11
- **/home/user/GreenStack/src/routes/eds_routes.py:854** - High complexity in export_eds_zip() - complexity 12

## File-by-File Analysis

### /home/user/GreenStack/src/api.py

**Lines**: 2283 | **Functions**: 43 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 28/43 (65%)
- Docstring coverage: 43/43 (100%)
- Return type hints: 0/43 (0%)

**Complex Functions:**
- Line 713: `get_device_document_info()` - complexity 53, 102 lines
- Line 363: `upload_iodd()` - complexity 26, 135 lines
- Line 1338: `export_iodd()` - complexity 13, 79 lines
- Line 991: `get_device_config_schema()` - complexity 12, 137 lines
- Line 896: `get_device_ui_menus()` - complexity 10, 92 lines

**Functions with Issues:**
- Line 261: `add_request_id()` - Missing type hints on parameters, Missing return type hint
- Line 341: `root()` - Missing return type hint
- Line 363: `upload_iodd()` - Missing return type hint, High complexity (26), Long function (135 lines)
- Line 502: `list_devices()` - Missing return type hint
- Line 521: `get_device_details()` - Missing return type hint
- Line 533: `get_device_parameters()` - Missing return type hint
- Line 567: `get_device_errors()` - Missing return type hint
- Line 601: `get_device_events()` - Missing return type hint
- Line 635: `get_device_process_data()` - Missing return type hint
- Line 713: `get_device_document_info()` - Missing return type hint, High complexity (53), Long function (102 lines)
- ... and 33 more

---

### /home/user/GreenStack/src/greenstack.py

**Lines**: 3220 | **Functions**: 68 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 36/68 (53%)
- Docstring coverage: 63/68 (93%)
- Return type hints: 61/68 (90%)

**Complex Functions:**
- Line 2135: `save_device()` - complexity 46, 483 lines
- Line 800: `_extract_process_data()` - complexity 40, 226 lines
- Line 1315: `_extract_ui_menus()` - complexity 21, 121 lines
- Line 1578: `_extract_custom_datatypes()` - complexity 20, 70 lines
- Line 1801: `_ingest_package()` - complexity 18, 73 lines

**Functions with Issues:**
- Line 332: `__init__()` - Missing docstring
- Line 338: `_build_text_lookup()` - Missing type hints on parameters
- Line 351: `_build_all_text_data()` - Missing type hints on parameters
- Line 395: `_build_datatype_lookup()` - Missing type hints on parameters
- Line 434: `parse()` - Missing type hints on parameters
- Line 474: `_extract_vendor_info()` - Missing type hints on parameters
- Line 496: `_extract_device_info()` - Missing type hints on parameters
- Line 529: `_extract_parameters()` - Missing type hints on parameters
- Line 555: `_parse_variable_element()` - Missing type hints on parameters
- Line 616: `_parse_std_variable_ref()` - Long function (104 lines)
- ... and 31 more

---

### /home/user/GreenStack/src/parsers/__init__.py

**Lines**: 18 | **Functions**: 0 | **Security Issues**: 0

---

### /home/user/GreenStack/src/parsers/eds_diagnostics.py

**Lines**: 274 | **Functions**: 14 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 8/14 (57%)
- Docstring coverage: 13/14 (93%)
- Return type hints: 5/14 (36%)

**Complex Functions:**
- Line 186: `validate_eds_data()` - complexity 19, 88 lines
- Line 141: `generate_report()` - complexity 9, 43 lines

**Functions with Issues:**
- Line 38: `to_dict()` - Missing type hints on parameters, Missing return type hint
- Line 57: `__init__()` - Missing docstring, Missing type hints on parameters
- Line 61: `set_file_path()` - Missing return type hint
- Line 65: `info()` - Missing return type hint
- Line 74: `warn()` - Missing return type hint
- Line 87: `error()` - Missing return type hint
- Line 100: `fatal()` - Missing return type hint
- Line 113: `add()` - Missing return type hint
- Line 117: `has_errors()` - Missing type hints on parameters
- Line 122: `has_warnings()` - Missing type hints on parameters
- ... and 3 more

---

### /home/user/GreenStack/src/parsers/eds_package_parser.py

**Lines**: 278 | **Functions**: 7 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 5/7 (71%)
- Docstring coverage: 7/7 (100%)
- Return type hints: 6/7 (86%)

**Complex Functions:**
- Line 63: `parse_package()` - complexity 29, 170 lines
- Line 234: `determine_latest_version()` - complexity 6, 30 lines

**Functions with Issues:**
- Line 41: `calculate_checksum()` - Missing type hints on parameters
- Line 63: `parse_package()` - Missing type hints on parameters, High complexity (29), Long function (170 lines)

---

### /home/user/GreenStack/src/parsers/eds_parser.py

**Lines**: 831 | **Functions**: 21 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 6/21 (29%)
- Docstring coverage: 20/21 (95%)
- Return type hints: 18/21 (86%)

**Complex Functions:**
- Line 311: `get_assemblies()` - complexity 19, 88 lines
- Line 57: `_parse_key_value()` - complexity 15, 47 lines
- Line 509: `get_modules()` - complexity 10, 74 lines
- Line 243: `get_enums()` - complexity 9, 67 lines
- Line 584: `get_groups()` - complexity 9, 71 lines

**Functions with Issues:**
- Line 30: `_parse_sections()` - Missing type hints on parameters, Missing return type hint
- Line 57: `_parse_key_value()` - High complexity (15)
- Line 105: `get_file_info()` - Missing type hints on parameters
- Line 121: `get_device_info()` - Missing type hints on parameters
- Line 154: `get_device_classification()` - Missing type hints on parameters
- Line 167: `get_parameters()` - Missing type hints on parameters
- Line 243: `get_enums()` - Missing type hints on parameters
- Line 311: `get_assemblies()` - Missing type hints on parameters, High complexity (19)
- Line 400: `get_connections()` - Missing type hints on parameters
- Line 447: `clean_value()` - Missing docstring, Missing type hints on parameters, Missing return type hint
- ... and 6 more

---

### /home/user/GreenStack/src/routes/__init__.py

**Lines**: 26 | **Functions**: 0 | **Security Issues**: 0

---

### /home/user/GreenStack/src/routes/admin_routes.py

**Lines**: 1032 | **Functions**: 15 | **Security Issues**: 2

**Statistics:**
- Type hints coverage: 0/15 (0%)
- Docstring coverage: 15/15 (100%)
- Return type hints: 0/15 (0%)

**Complex Functions:**
- Line 196: `get_database_health()` - complexity 20, 189 lines
- Line 27: `get_system_overview()` - complexity 18, 132 lines
- Line 976: `delete_temp_data()` - complexity 11, 57 lines
- Line 632: `get_iodd_diagnostics_summary()` - complexity 9, 69 lines
- Line 414: `clean_fk_violations()` - complexity 6, 60 lines

**Functions with Issues:**
- Line 27: `get_system_overview()` - Missing return type hint, High complexity (18), Long function (132 lines)
- Line 162: `get_devices_by_vendor()` - Missing return type hint
- Line 196: `get_database_health()` - Missing return type hint, High complexity (20), Long function (189 lines)
- Line 388: `vacuum_database()` - Missing return type hint
- Line 414: `clean_fk_violations()` - Missing return type hint
- Line 477: `backup_database()` - Missing return type hint
- Line 504: `download_backup()` - Missing return type hint
- Line 527: `get_eds_diagnostics_summary()` - Missing return type hint, Long function (102 lines)
- Line 632: `get_iodd_diagnostics_summary()` - Missing return type hint
- Line 704: `get_system_info()` - Missing return type hint
- ... and 5 more

**Security Issues:**
- Line 352: SQL Injection Risk - SQL query uses f-string formatting
- Line 451: SQL Injection Risk - SQL query uses f-string formatting

---

### /home/user/GreenStack/src/routes/config_export_routes.py

**Lines**: 445 | **Functions**: 5 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 5/5 (100%)
- Docstring coverage: 5/5 (100%)
- Return type hints: 0/5 (0%)

**Complex Functions:**
- Line 333: `export_batch_configs_json()` - complexity 10, 112 lines

**Functions with Issues:**
- Line 23: `export_iodd_config_json()` - Missing return type hint
- Line 123: `export_iodd_config_csv()` - Missing return type hint
- Line 175: `export_eds_config_json()` - Missing return type hint, Long function (103 lines)
- Line 281: `export_eds_config_csv()` - Missing return type hint
- Line 333: `export_batch_configs_json()` - Missing return type hint, Long function (112 lines)

---

### /home/user/GreenStack/src/routes/eds_routes.py

**Lines**: 1847 | **Functions**: 17 | **Security Issues**: 1

**Statistics:**
- Type hints coverage: 14/17 (82%)
- Docstring coverage: 17/17 (100%)
- Return type hints: 0/17 (0%)

**Complex Functions:**
- Line 1035: `upload_eds_package()` - complexity 33, 340 lines
- Line 1482: `get_eds_assemblies()` - complexity 29, 137 lines
- Line 33: `upload_eds_file()` - complexity 21, 359 lines
- Line 754: `get_eds_diagnostics()` - complexity 19, 71 lines
- Line 854: `export_eds_zip()` - complexity 12, 69 lines

**Functions with Issues:**
- Line 33: `upload_eds_file()` - Missing return type hint, High complexity (21), Long function (359 lines)
- Line 395: `list_eds_files()` - Missing return type hint
- Line 448: `list_eds_files_grouped()` - Missing return type hint
- Line 523: `get_device_revisions()` - Missing return type hint
- Line 575: `get_eds_file()` - Missing return type hint, Long function (176 lines)
- Line 754: `get_eds_diagnostics()` - Missing return type hint, High complexity (19)
- Line 828: `get_eds_icon()` - Missing return type hint
- Line 854: `export_eds_zip()` - Missing return type hint, High complexity (12)
- Line 926: `delete_eds_file()` - Missing return type hint
- Line 970: `bulk_delete_eds_files()` - Missing return type hint
- ... and 7 more

**Security Issues:**
- Line 1016: SQL Injection Risk - SQL query uses f-string formatting

---

### /home/user/GreenStack/src/routes/mqtt_routes.py

**Lines**: 412 | **Functions**: 15 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 5/15 (33%)
- Docstring coverage: 13/15 (87%)
- Return type hints: 0/15 (0%)

**Complex Functions:**
- Line 55: `setup_mqtt_client()` - complexity 9, 62 lines
- Line 161: `publish_message()` - complexity 7, 40 lines
- Line 231: `unsubscribe_topic()` - complexity 7, 22 lines
- Line 295: `websocket_endpoint()` - complexity 7, 23 lines
- Line 320: `connect_mqtt()` - complexity 7, 28 lines

**Functions with Issues:**
- Line 55: `setup_mqtt_client()` - Missing return type hint
- Line 70: `on_connect()` - Missing docstring, Missing type hints on parameters, Missing return type hint
- Line 79: `on_disconnect()` - Missing docstring, Missing type hints on parameters, Missing return type hint
- Line 84: `on_message()` - Missing type hints on parameters, Missing return type hint
- Line 118: `broadcast_message()` - Missing return type hint
- Line 134: `get_broker_status()` - Missing return type hint
- Line 161: `publish_message()` - Missing return type hint
- Line 203: `subscribe_topic()` - Missing return type hint
- Line 231: `unsubscribe_topic()` - Missing return type hint
- Line 255: `get_connected_clients()` - Missing return type hint
- ... and 5 more

---

### /home/user/GreenStack/src/routes/pqa_routes.py

**Lines**: 671 | **Functions**: 14 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 10/14 (71%)
- Docstring coverage: 13/14 (93%)
- Return type hints: 0/14 (0%)

**Complex Functions:**
- Line 193: `get_latest_metrics()` - complexity 22, 48 lines
- Line 244: `get_metrics_history()` - complexity 20, 50 lines
- Line 102: `run_pqa_analysis()` - complexity 9, 88 lines

**Functions with Issues:**
- Line 90: `get_db()` - Missing return type hint
- Line 102: `run_pqa_analysis()` - Missing return type hint
- Line 164: `run_analysis()` - Missing docstring, Missing return type hint
- Line 193: `get_latest_metrics()` - Missing return type hint, High complexity (22)
- Line 244: `get_metrics_history()` - Missing return type hint, High complexity (20)
- Line 297: `get_diff_details()` - Missing return type hint
- Line 343: `get_reconstructed_file()` - Missing return type hint
- Line 368: `get_archived_file()` - Missing return type hint
- Line 411: `get_thresholds()` - Missing return type hint
- Line 440: `create_threshold()` - Missing return type hint
- ... and 4 more

---

### /home/user/GreenStack/src/routes/search_routes.py

**Lines**: 286 | **Functions**: 2 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 2/2 (100%)
- Docstring coverage: 2/2 (100%)
- Return type hints: 0/2 (0%)

**Complex Functions:**
- Line 17: `global_search()` - complexity 26, 209 lines
- Line 229: `search_suggestions()` - complexity 14, 57 lines

**Functions with Issues:**
- Line 17: `global_search()` - Missing return type hint, High complexity (26), Long function (209 lines)
- Line 229: `search_suggestions()` - Missing return type hint, High complexity (14)

---

### /home/user/GreenStack/src/routes/service_routes.py

**Lines**: 427 | **Functions**: 12 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 8/12 (67%)
- Docstring coverage: 12/12 (100%)
- Return type hints: 4/12 (33%)

**Complex Functions:**
- Line 182: `get_services_status()` - complexity 12, 54 lines
- Line 238: `get_port_conflicts()` - complexity 11, 27 lines
- Line 97: `load_service_config()` - complexity 8, 20 lines
- Line 267: `start_service()` - complexity 8, 67 lines
- Line 149: `find_process_by_name()` - complexity 6, 24 lines

**Functions with Issues:**
- Line 118: `save_service_config()` - Missing return type hint
- Line 182: `get_services_status()` - Missing return type hint, High complexity (12)
- Line 238: `get_port_conflicts()` - Missing return type hint, High complexity (11)
- Line 267: `start_service()` - Missing return type hint
- Line 336: `stop_service()` - Missing return type hint
- Line 363: `restart_service()` - Missing return type hint
- Line 371: `update_service_config()` - Missing return type hint
- Line 408: `services_health_check()` - Missing return type hint

---

### /home/user/GreenStack/src/routes/theme_routes.py

**Lines**: 524 | **Functions**: 10 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 5/10 (50%)
- Docstring coverage: 10/10 (100%)
- Return type hints: 1/10 (10%)

**Complex Functions:**
- Line 393: `update_theme()` - complexity 7, 47 lines

**Functions with Issues:**
- Line 239: `init_theme_table()` - Missing return type hint
- Line 271: `get_db_connection()` - Missing return type hint
- Line 281: `get_theme_presets()` - Missing return type hint
- Line 289: `list_themes()` - Missing return type hint
- Line 324: `get_active_theme()` - Missing return type hint
- Line 354: `create_custom_theme()` - Missing return type hint
- Line 393: `update_theme()` - Missing return type hint
- Line 442: `delete_theme()` - Missing return type hint
- Line 474: `activate_theme()` - Missing return type hint

---

### /home/user/GreenStack/src/routes/ticket_routes.py

**Lines**: 799 | **Functions**: 14 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 13/14 (93%)
- Docstring coverage: 14/14 (100%)
- Return type hints: 0/14 (0%)

**Complex Functions:**
- Line 270: `update_ticket()` - complexity 11, 66 lines
- Line 680: `export_tickets_with_attachments()` - complexity 9, 119 lines
- Line 339: `delete_ticket()` - complexity 8, 64 lines

**Functions with Issues:**
- Line 61: `generate_ticket_number()` - Missing type hints on parameters, Missing return type hint
- Line 69: `get_ticket_with_details()` - Missing return type hint
- Line 146: `list_tickets()` - Missing return type hint
- Line 213: `get_ticket()` - Missing return type hint
- Line 228: `create_ticket()` - Missing return type hint
- Line 270: `update_ticket()` - Missing return type hint, High complexity (11)
- Line 339: `delete_ticket()` - Missing return type hint
- Line 406: `add_comment()` - Missing return type hint
- Line 437: `export_tickets_csv()` - Missing return type hint
- Line 528: `upload_attachment()` - Missing return type hint
- ... and 4 more

---

### /home/user/GreenStack/src/utils/__init__.py

**Lines**: 12 | **Functions**: 0 | **Security Issues**: 0

---

### /home/user/GreenStack/src/utils/eds_diff_analyzer.py

**Lines**: 452 | **Functions**: 10 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 10/10 (100%)
- Docstring coverage: 9/10 (90%)
- Return type hints: 9/10 (90%)

**Complex Functions:**
- Line 210: `_compare_section()` - complexity 6, 57 lines
- Line 367: `format_diff_report()` - complexity 6, 68 lines

**Functions with Issues:**
- Line 102: `__init__()` - Missing docstring

---

### /home/user/GreenStack/src/utils/eds_reconstruction.py

**Lines**: 577 | **Functions**: 17 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 16/17 (94%)
- Docstring coverage: 16/17 (94%)
- Return type hints: 16/17 (94%)

**Complex Functions:**
- Line 205: `_create_params_section()` - complexity 22, 83 lines
- Line 152: `_create_device_section()` - complexity 12, 34 lines
- Line 395: `_create_connection_manager_section()` - complexity 10, 46 lines
- Line 530: `_create_module_sections()` - complexity 10, 32 lines
- Line 40: `reconstruct_eds()` - complexity 9, 81 lines

**Functions with Issues:**
- Line 31: `__init__()` - Missing docstring
- Line 34: `get_connection()` - Missing type hints on parameters
- Line 152: `_create_device_section()` - High complexity (12)
- Line 205: `_create_params_section()` - High complexity (22)

---

### /home/user/GreenStack/src/utils/forensic_reconstruction.py

**Lines**: 614 | **Functions**: 24 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 23/24 (96%)
- Docstring coverage: 23/24 (96%)
- Return type hints: 23/24 (96%)

**Complex Functions:**
- Line 215: `_reconstruct_process_data_collection()` - complexity 9, 48 lines
- Line 119: `_reconstruct_device_identity()` - complexity 8, 36 lines
- Line 156: `_reconstruct_device_function()` - complexity 8, 40 lines
- Line 264: `_add_ui_rendering()` - complexity 7, 23 lines
- Line 472: `_reconstruct_datatype_collection()` - complexity 7, 34 lines

**Functions with Issues:**
- Line 23: `__init__()` - Missing docstring
- Line 26: `get_connection()` - Missing type hints on parameters

---

### /home/user/GreenStack/src/utils/forensic_reconstruction_v2.py

**Lines**: 374 | **Functions**: 16 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 15/16 (94%)
- Docstring coverage: 15/16 (94%)
- Return type hints: 15/16 (94%)

**Complex Functions:**
- Line 148: `_create_process_data_collection()` - complexity 7, 41 lines
- Line 87: `_create_profile_body()` - complexity 6, 42 lines
- Line 190: `_add_ui_info()` - complexity 6, 22 lines
- Line 267: `_add_record_items()` - complexity 6, 29 lines
- Line 320: `_create_text_collection()` - complexity 6, 33 lines

**Functions with Issues:**
- Line 25: `__init__()` - Missing docstring
- Line 28: `get_connection()` - Missing type hints on parameters

---

### /home/user/GreenStack/src/utils/parsing_quality.py

**Lines**: 303 | **Functions**: 4 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 1/4 (25%)
- Docstring coverage: 3/4 (75%)
- Return type hints: 2/4 (50%)

**Complex Functions:**
- Line 162: `analyze_iodd_quality()` - complexity 11, 129 lines
- Line 27: `analyze_eds_quality()` - complexity 8, 134 lines

**Functions with Issues:**
- Line 20: `__init__()` - Missing docstring
- Line 23: `get_connection()` - Missing type hints on parameters, Missing return type hint
- Line 27: `analyze_eds_quality()` - Missing type hints on parameters, Long function (134 lines)
- Line 162: `analyze_iodd_quality()` - Missing type hints on parameters, High complexity (11), Long function (129 lines)

---

### /home/user/GreenStack/src/utils/pqa_diff_analyzer.py

**Lines**: 498 | **Functions**: 9 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 9/9 (100%)
- Docstring coverage: 7/9 (78%)
- Return type hints: 7/9 (78%)

**Complex Functions:**
- Line 158: `_find_differences()` - complexity 24, 153 lines
- Line 412: `format_diff_report()` - complexity 6, 68 lines

**Functions with Issues:**
- Line 97: `__init__()` - Missing docstring
- Line 144: `traverse()` - Missing docstring, Missing return type hint
- Line 158: `_find_differences()` - High complexity (24), Long function (153 lines)

---

### /home/user/GreenStack/src/utils/pqa_orchestrator.py

**Lines**: 452 | **Functions**: 11 | **Security Issues**: 0

**Statistics:**
- Type hints coverage: 11/11 (100%)
- Docstring coverage: 10/11 (91%)
- Return type hints: 10/11 (91%)

**Complex Functions:**
- Line 291: `_determine_phase()` - complexity 22, 29 lines
- Line 321: `_should_generate_ticket()` - complexity 7, 26 lines
- Line 188: `_save_quality_metrics()` - complexity 6, 102 lines
- Line 348: `_generate_quality_ticket()` - complexity 6, 89 lines

**Functions with Issues:**
- Line 48: `__init__()` - Missing docstring
- Line 188: `_save_quality_metrics()` - Long function (102 lines)
- Line 291: `_determine_phase()` - High complexity (22)

---

## Recommendations

### Immediate Actions (Critical)

1. **Address all security issues** - Review SQL injection risks and code injection vulnerabilities
2. **Fix functions with complexity >15** - These are maintenance nightmares
3. **Break down functions >150 lines** - Extract sub-functions for better maintainability

### Short-term Improvements (High Priority)

1. **Add type hints to all public APIs** - Start with route handlers and parser functions
2. **Document all public functions** - Add docstrings explaining parameters and return values
3. **Refactor complex functions** - Target complexity >10 for simplification
4. **Add error handling** - Many functions lack try/except blocks

### Long-term Improvements (Medium Priority)

1. **Standardize logging** - Ensure consistent logging patterns across all files
2. **Clean up unused imports** - Remove dead code
3. **Add unit tests** - Focus on complex functions first
4. **Consider using linters** - Integrate pylint, mypy, and bandit into CI/CD
