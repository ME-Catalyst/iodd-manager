#!/usr/bin/env python3
"""
Automated Import Cleanup Script for GreenStack
Removes safe-to-remove unused imports from Python files.
"""

import json
import sys
from pathlib import Path

# Safe imports to remove (from analysis)
CLEANUP_ACTIONS = {
    "/home/user/GreenStack/alembic/versions/003_add_enumeration_values.py": [
        (9, "import sqlalchemy as sa")
    ],
    "/home/user/GreenStack/alembic/versions/14aafab5b863_add_recommended_performance_indexes.py": [
        (9, "import sqlalchemy as sa")
    ],
    "/home/user/GreenStack/src/api.py": [
        (29, "from src.greenstack import AccessRights"),
        (29, "from src.greenstack import IODDDataType"),
        (29, "from src.greenstack import Parameter"),
        (30, "from src.parsers.eds_parser import parse_eds_file")
    ],
    "/home/user/GreenStack/src/greenstack.py": [
        (20, "from jinja2 import Environment"),
        (20, "from jinja2 import FileSystemLoader")
    ],
    "/home/user/GreenStack/src/parsers/eds_diagnostics.py": [
        (7, "from datetime import datetime")
    ],
    "/home/user/GreenStack/src/parsers/eds_package_parser.py": [
        (13, "from typing import Tuple")
    ],
    "/home/user/GreenStack/src/routes/admin_routes.py": [
        (6, "import json"),
        (18, "from src.database import get_connection")
    ],
    "/home/user/GreenStack/src/routes/config_export_routes.py": [
        (11, "from pathlib import Path"),
        (12, "from typing import Optional")
    ],
    "/home/user/GreenStack/src/routes/eds_routes.py": [
        (15, "from typing import List"),
        (20, "from src.database import get_connection"),
        (23, "from src.parsers.eds_parser import parse_eds_file_legacy")
    ],
    "/home/user/GreenStack/src/routes/mqtt_routes.py": [
        (10, "from typing import Optional")
    ],
    "/home/user/GreenStack/src/routes/pqa_routes.py": [
        (10, "from datetime import datetime"),
        (14, "from utils.pqa_orchestrator import analyze_iodd_quality"),
        (14, "from utils.pqa_orchestrator import analyze_eds_quality")
    ],
    "/home/user/GreenStack/src/routes/search_routes.py": [
        (7, "from typing import List")
    ],
    "/home/user/GreenStack/src/routes/theme_routes.py": [
        (10, "from typing import List")
    ],
    "/home/user/GreenStack/src/routes/ticket_routes.py": [
        (15, "from typing import List")
    ],
    "/home/user/GreenStack/src/utils/eds_diff_analyzer.py": [
        (10, "from io import StringIO")
    ],
    "/home/user/GreenStack/src/utils/eds_reconstruction.py": [
        (10, "from typing import Dict"),
        (10, "from typing import Tuple"),
        (11, "from datetime import datetime")
    ],
    "/home/user/GreenStack/src/utils/forensic_reconstruction.py": [
        (11, "from typing import Dict"),
        (11, "from typing import List")
    ],
    "/home/user/GreenStack/src/utils/forensic_reconstruction_v2.py": [
        (10, "from typing import Dict"),
        (10, "from typing import List"),
        (10, "from typing import Tuple")
    ],
    "/home/user/GreenStack/src/utils/parsing_quality.py": [
        (9, "from pathlib import Path"),
        (10, "from typing import List"),
        (10, "from typing import Optional")
    ],
    "/home/user/GreenStack/src/utils/pqa_diff_analyzer.py": [
        (9, "import hashlib"),
        (10, "import sqlite3")
    ],
    "/home/user/GreenStack/src/utils/pqa_orchestrator.py": [
        (11, "from typing import Dict")
    ],
    "/home/user/GreenStack/tests/conftest.py": [
        (8, "import os")
    ],
    "/home/user/GreenStack/tests/test_api.py": [
        (9, "from fastapi.testclient import TestClient"),
        (10, "from io import BytesIO"),
        (12, "from api import app")
    ],
    "/home/user/GreenStack/tests/test_parser.py": [
        (9, "from pathlib import Path"),
        (11, "from src.greenstack import IODDDataType"),
        (11, "from src.greenstack import AccessRights")
    ],
    "/home/user/GreenStack/tests/test_storage.py": [
        (9, "from pathlib import Path")
    ]
}


def remove_import_from_line(line_content, import_to_remove):
    """
    Remove a specific import from a line, handling multiple imports.
    Returns the modified line or None if the entire line should be removed.
    """
    line = line_content.rstrip()

    # Check if this is a "from X import Y, Z" style import
    if "from " in line and " import " in line:
        # Split to get the import list
        parts = line.split(" import ", 1)
        if len(parts) == 2:
            prefix = parts[0]
            imports = parts[1]

            # Parse the imports
            import_list = [i.strip() for i in imports.split(",")]

            # Determine what to remove
            if "import " in import_to_remove:
                to_remove = import_to_remove.split(" import ", 1)[1].strip()
            else:
                to_remove = import_to_remove.strip()

            # Remove the specific import
            import_list = [i for i in import_list if i != to_remove]

            # If no imports left, remove the entire line
            if not import_list:
                return None

            # Reconstruct the line
            return f"{prefix} import {', '.join(import_list)}\n"

    # For simple "import X" or exact matches
    if line.strip() == import_to_remove.strip():
        return None

    return line_content


def cleanup_file(filepath, imports_to_remove):
    """Clean up a single file by removing specified imports."""
    print(f"\nProcessing: {filepath}")

    # Read the file
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Group imports by line number
    imports_by_line = {}
    for line_no, import_stmt in imports_to_remove:
        if line_no not in imports_by_line:
            imports_by_line[line_no] = []
        imports_by_line[line_no].append(import_stmt)

    # Process the file
    new_lines = []
    removed_count = 0

    for i, line in enumerate(lines, 1):
        if i in imports_by_line:
            # This line has imports to remove
            modified_line = line
            for import_to_remove in imports_by_line[i]:
                result = remove_import_from_line(modified_line, import_to_remove)
                if result is None:
                    # Entire line should be removed
                    print(f"  Line {i}: Removed '{line.strip()}'")
                    removed_count += 1
                    modified_line = None
                    break
                else:
                    modified_line = result

            if modified_line is not None:
                new_lines.append(modified_line)
        else:
            new_lines.append(line)

    # Write the file back
    if removed_count > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"  ✓ Removed {removed_count} import(s)")
        return removed_count
    else:
        print(f"  - No changes made")
        return 0


def main():
    """Main cleanup function."""
    print("GreenStack Import Cleanup Script")
    print("=" * 50)
    print(f"\nThis script will remove {sum(len(v) for v in CLEANUP_ACTIONS.values())} unused imports")
    print(f"from {len(CLEANUP_ACTIONS)} files.\n")

    if len(sys.argv) > 1 and sys.argv[1] == "--dry-run":
        print("DRY RUN MODE - No files will be modified\n")
        dry_run = True
    else:
        dry_run = False

    total_removed = 0
    files_modified = 0

    for filepath, imports in CLEANUP_ACTIONS.items():
        if not Path(filepath).exists():
            print(f"\nWARNING: File not found: {filepath}")
            continue

        if dry_run:
            print(f"\nWould process: {filepath}")
            for line_no, import_stmt in imports:
                print(f"  Line {line_no}: Would remove '{import_stmt}'")
        else:
            removed = cleanup_file(filepath, imports)
            if removed > 0:
                total_removed += removed
                files_modified += 1

    print("\n" + "=" * 50)
    if dry_run:
        print(f"DRY RUN COMPLETE")
        print(f"Would remove imports from {len(CLEANUP_ACTIONS)} files")
    else:
        print(f"CLEANUP COMPLETE")
        print(f"Modified {files_modified} files")
        print(f"Removed {total_removed} import statements")
        print("\nNext steps:")
        print("1. Run: pytest tests/")
        print("2. Run: python -m py_compile <modified_file>")
        print("3. Review changes with: git diff")


if __name__ == '__main__':
    main()
