#!/usr/bin/env python3
"""
Remove unused exports from frontend utility files
Based on PHASE_2_FRONTEND_UNUSED_CODE_REPORT.md analysis
"""

from pathlib import Path
import re

# Define functions to remove from each file
REMOVALS = {
    "frontend/src/utils/iolinkUnits.js": [
        "getUnitsByCategory",
        "getAllCategories"
    ],
    "frontend/src/utils/iolinkConstants.js": [
        "getBitrateInfo",
        "getSIOModeDisplay"
    ],
    "frontend/src/config/themes.js": [
        "createCustomTheme"
    ],
    "frontend/src/utils/edsEnumParser.js": [
        "getEnumLabel",
        "formatEnumDisplay"
    ],
    "frontend/src/utils/edsParameterCategorizer.js": [
        "getCategoryStatistics",
        "filterParameters"
    ],
    "frontend/src/utils/edsDataTypeDecoder.js": [
        "getUniqueDataTypeCategories"
    ]
}

def remove_function(content: str, func_name: str) -> str:
    """Remove an exported function from JavaScript content."""
    # Pattern to match: export function funcName(...) { ... }
    # Handle multi-line function with proper brace counting

    lines = content.split('\n')
    result_lines = []
    skip_mode = False
    brace_count = 0
    in_function = False

    i = 0
    while i < len(lines):
        line = lines[i]

        # Check if this is the start of the function to remove
        if f'export function {func_name}' in line or f'export const {func_name}' in line:
            skip_mode = True
            in_function = True
            brace_count = line.count('{') - line.count('}')

            # If function starts and ends on same line
            if '{' in line and brace_count == 0:
                skip_mode = False
                in_function = False
                i += 1
                # Skip any trailing blank lines
                while i < len(lines) and not lines[i].strip():
                    i += 1
                continue

        if skip_mode:
            # Count braces to find end of function
            if in_function:
                brace_count += line.count('{') - line.count('}')
                if brace_count == 0:
                    skip_mode = False
                    in_function = False
                    i += 1
                    # Skip trailing blank lines after function
                    while i < len(lines) and not lines[i].strip():
                        i += 1
                    continue
        else:
            result_lines.append(line)

        i += 1

    return '\n'.join(result_lines)

def main():
    base_path = Path("/home/user/GreenStack")
    total_removed = 0

    print("Frontend Unused Export Cleanup")
    print("=" * 50)
    print()

    for file_path, functions in REMOVALS.items():
        full_path = base_path / file_path

        if not full_path.exists():
            print(f"⚠️  File not found: {file_path}")
            continue

        print(f"Processing: {file_path}")

        # Read original content
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_lines = len(content.split('\n'))
        modified_content = content

        # Remove each function
        for func_name in functions:
            print(f"  - Removing: {func_name}()")
            modified_content = remove_function(modified_content, func_name)
            total_removed += 1

        # Write back
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(modified_content)

        new_lines = len(modified_content.split('\n'))
        lines_removed = original_lines - new_lines
        print(f"  ✓ Removed {len(functions)} function(s), {lines_removed} lines")
        print()

    print("=" * 50)
    print(f"CLEANUP COMPLETE")
    print(f"Removed {total_removed} unused function exports")
    print()
    print("Next steps:")
    print("1. Run: cd frontend && npm run build")
    print("2. Test the application")
    print("3. Review changes with: git diff")

if __name__ == "__main__":
    main()
