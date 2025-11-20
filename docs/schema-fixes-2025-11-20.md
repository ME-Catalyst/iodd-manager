# Database Schema Fixes - November 20, 2025

## Issue: Missing Parameters Table Columns

### Problem
IODD file uploads were failing with errors indicating missing columns in the `parameters` table:
- `no such column: dynamic`
- `no such column: excluded_from_data_storage`
- `no such column: modifies_other_variables`
- `no such column: unit_code`
- `no such column: value_range_name`
- `no such column: single_values`

### Root Cause
Migration `012_expand_parameter_schema.py` was supposed to add these columns but they were not present in the database after running migrations from scratch. The Parameter model in `src/models/__init__.py` (lines 87-92) defines these fields but they were never added to the actual database schema.

### Solution
Manually added the missing columns to the `parameters` table:

```python
# Columns added
columns_to_add = [
    ('dynamic', 'INTEGER DEFAULT 0'),
    ('excluded_from_data_storage', 'INTEGER DEFAULT 0'),
    ('modifies_other_variables', 'INTEGER DEFAULT 0'),
    ('unit_code', 'TEXT'),
    ('value_range_name', 'TEXT'),
    ('single_values', 'TEXT')  # JSON array stored as TEXT
]
```

### Schema After Fix
The `parameters` table now has 25 columns total, matching the Parameter model definition:

1. id (INTEGER, PRIMARY KEY)
2. device_id (INTEGER)
3. param_index (INTEGER)
4. name (TEXT)
5. data_type (TEXT)
6. access_rights (TEXT)
7. default_value (TEXT)
8. min_value (TEXT)
9. max_value (TEXT)
10. unit (TEXT)
11. description (TEXT)
12. enumeration_values (TEXT)
13. bit_length (INTEGER)
14. is_array (INTEGER)
15. array_count (INTEGER)
16. array_element_type (TEXT)
17. string_encoding (TEXT)
18. string_fixed_length (INTEGER)
19. subindex_access_supported (INTEGER)
20. dynamic (INTEGER, DEFAULT 0)
21. excluded_from_data_storage (INTEGER, DEFAULT 0)
22. modifies_other_variables (INTEGER, DEFAULT 0)
23. unit_code (TEXT)
24. value_range_name (TEXT)
25. single_values (TEXT)

### Next Steps
- IODD uploads should now work correctly
- Consider creating a new migration to add these columns properly for future database resets
- Review other table schemas to ensure all model fields are represented

### Files Modified
- `greenstack.db` - Added 6 missing columns to parameters table
