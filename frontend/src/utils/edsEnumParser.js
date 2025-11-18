/**
 * EDS Enum Value Parser
 *
 * Parses enum/enumerated values from EDS parameter data.
 * Enums are often encoded in default_value and help_string fields.
 *
 * Example formats:
 * - default_value: "1 = Pin based"
 * - help_string_2: "0 = Port based (default)"
 * - help_string_2: "0: Disabled, 1: Enabled"
 */

/**
 * Parse enum values from parameter data
 * @param {Object} param - Parameter object with enum_values or default_value and help_string fields
 * @returns {Object|null} Enum info object or null if not an enum
 */
export function parseEnumValues(param) {
  if (!param) return null;

  // PRIORITY 1: Check if we have pre-parsed enum_values from EDS Enum section
  if (param.enum_values) {
    try {
      const enumValues = typeof param.enum_values === 'string'
        ? JSON.parse(param.enum_values)
        : param.enum_values;

      if (Array.isArray(enumValues) && enumValues.length >= 2) {
        // Find default value
        let defaultEnumValue = null;
        const defaultEntry = enumValues.find(ev => ev.is_default);
        if (defaultEntry) {
          defaultEnumValue = defaultEntry.value;
        }

        // If no explicit default, try to get from default_value field
        if (defaultEnumValue === null && param.default_value) {
          const defaultStr = String(param.default_value);
          const match = defaultStr.match(/^(\d+)/);
          if (match) {
            defaultEnumValue = parseInt(match[1], 10);
          }
        }

        return {
          isEnum: true,
          values: enumValues.map(ev => ({
            value: ev.value,
            label: ev.label,
            isDefault: ev.is_default || ev.value === defaultEnumValue
          })),
          defaultValue: defaultEnumValue,
          count: enumValues.length
        };
      }
    } catch (e) {
      console.warn('Failed to parse enum_values:', e);
      // Fall through to legacy parsing
    }
  }

  // PRIORITY 2: Legacy fallback - parse from help strings
  const enumValues = [];
  let defaultEnumValue = null;

  // Sources to check for enum values
  const sources = [
    param.default_value,
    param.help_string_1,
    param.help_string_2,
    param.help_string_3,
    param.description
  ].filter(Boolean);

  // Patterns to match enum values
  const patterns = [
    // "0 = Port based", "1 = Pin based"
    /(\d+)\s*=\s*([^,;\n]+)/g,
    // "0: Port based", "1: Pin based"
    /(\d+)\s*:\s*([^,;\n]+)/g,
    // "Value 0 - Port based", "Value 1 - Pin based"
    /value\s+(\d+)\s*[-:]\s*([^,;\n]+)/gi
  ];

  // Try to find enum values in all sources
  for (const source of sources) {
    const text = String(source).trim();

    for (const pattern of patterns) {
      const matches = [...text.matchAll(pattern)];

      if (matches.length >= 2) { // At least 2 enum values to be considered an enum
        matches.forEach(match => {
          const value = parseInt(match[1], 10);
          let label = match[2].trim();

          // Remove trailing punctuation
          label = label.replace(/[,;.]$/, '');

          // Check if this is marked as default
          const isDefault = /\(default\)/i.test(label);
          label = label.replace(/\(default\)/gi, '').trim();

          // Add to enum values if not duplicate
          if (!enumValues.find(ev => ev.value === value)) {
            enumValues.push({
              value,
              label,
              isDefault
            });
          }

          if (isDefault) {
            defaultEnumValue = value;
          }
        });
      }

      // If we found enum values, stop searching
      if (enumValues.length >= 2) break;
    }

    if (enumValues.length >= 2) break;
  }

  // No enum values found
  if (enumValues.length < 2) {
    return null;
  }

  // Sort enum values by numeric value
  enumValues.sort((a, b) => a.value - b.value);

  // Try to determine default value if not explicitly marked
  if (defaultEnumValue === null) {
    // Check default_value field
    if (param.default_value) {
      const defaultStr = String(param.default_value);
      const match = defaultStr.match(/^(\d+)/);
      if (match) {
        defaultEnumValue = parseInt(match[1], 10);
      }
    }

    // If still null, check min_value
    if (defaultEnumValue === null && param.min_value !== null) {
      const minVal = parseInt(param.min_value, 10);
      if (!isNaN(minVal)) {
        defaultEnumValue = minVal;
      }
    }
  }

  return {
    isEnum: true,
    values: enumValues,
    defaultValue: defaultEnumValue,
    count: enumValues.length
  };
}

/**
 * Check if a parameter is likely a boolean (2-value enum)
 * @param {Object} param - Parameter object
 * @returns {boolean} True if parameter appears to be boolean
 */
export function isBooleanParameter(param) {
  if (!param) return false;

  // Check data type
  const dataType = param.data_type;
  if (dataType === 0xC1 || dataType === 193) {
    return true; // BOOL type
  }

  // Check if it's a 2-value enum
  const enumInfo = parseEnumValues(param);
  if (enumInfo && enumInfo.count === 2) {
    const values = enumInfo.values.map(v => v.value);
    // Check if values are 0 and 1
    if (values.includes(0) && values.includes(1)) {
      return true;
    }
  }

  // Check min/max range
  if (param.min_value === '0' && param.max_value === '1') {
    return true;
  }

  return false;
}

/**
 * Get enum value label for a specific value
 * @param {Object} enumInfo - Enum info from parseEnumValues()
 * @param {number} value - The numeric value to get label for
 * @returns {string} Label for the value, or the value itself if not found
 */
export function getEnumLabel(enumInfo, value) {
  if (!enumInfo || !enumInfo.values) return String(value);

  const enumValue = enumInfo.values.find(ev => ev.value === value);
  return enumValue ? enumValue.label : String(value);
}

/**
 * Format enum values for display
 * @param {Object} enumInfo - Enum info from parseEnumValues()
 * @param {number} currentValue - Current/default value
 * @returns {string} Formatted enum string for display
 */
export function formatEnumDisplay(enumInfo, currentValue = null) {
  if (!enumInfo || !enumInfo.values) return '';

  const useValue = currentValue !== null ? currentValue : enumInfo.defaultValue;

  return enumInfo.values
    .map(ev => {
      const marker = ev.value === useValue ? '●' : '○';
      const defaultTag = ev.isDefault ? ' (default)' : '';
      return `${marker} ${ev.value}: ${ev.label}${defaultTag}`;
    })
    .join('\n');
}

/**
 * Parse range constraints from parameter
 * @param {Object} param - Parameter object
 * @returns {Object} Range info with min, max, and validation
 */
export function parseRangeConstraints(param) {
  if (!param) return null;

  const min = param.min_value !== null && param.min_value !== undefined
    ? parseFloat(param.min_value)
    : null;

  const max = param.max_value !== null && param.max_value !== undefined
    ? parseFloat(param.max_value)
    : null;

  const defaultVal = param.default_value !== null && param.default_value !== undefined
    ? parseFloat(String(param.default_value).replace(/[^\d.-]/g, ''))
    : null;

  let isDefaultValid = true;
  if (defaultVal !== null && !isNaN(defaultVal)) {
    if (min !== null && !isNaN(min) && defaultVal < min) {
      isDefaultValid = false;
    }
    if (max !== null && !isNaN(max) && defaultVal > max) {
      isDefaultValid = false;
    }
  }

  return {
    min,
    max,
    default: defaultVal,
    hasRange: min !== null || max !== null,
    isDefaultValid,
    rangeSize: (min !== null && max !== null) ? max - min : null
  };
}

/**
 * Extract units from parameter description fields
 * @param {Object} param - Parameter object
 * @returns {string|null} Units string or null if not found
 */
export function extractUnits(param) {
  if (!param) return null;

  if (param.description && param.description.trim()) {
    const desc = param.description.trim();
    const commonUnits = [
      'Microsecond', 'Millisecond', 'Second', 'Minute', 'Hour',
      'Byte', 'Kilobyte', 'Megabyte',
      'Bit', 'Bits',
      'Meter', 'Centimeter', 'Millimeter',
      'Hz', 'kHz', 'MHz',
      'Volt', 'Ampere', 'Watt',
      'Percent', '%',
      'Degree', '°C', '°F'
    ];

    for (const unit of commonUnits) {
      if (desc.toLowerCase().includes(unit.toLowerCase())) {
        return unit;
      }
    }

    if (desc.length < 20 && !/[.!?]/.test(desc)) {
      return desc;
    }
  }

  if (param.help_string_1 && param.help_string_1.trim()) {
    const help1 = param.help_string_1.trim();
    if (help1.length < 20 && !/[.!?]/.test(help1)) {
      return help1;
    }
  }

  const nameMatch = param.param_name?.match(/\(([^)]+)\)/);
  if (nameMatch && nameMatch[1].length < 15) {
    return nameMatch[1];
  }

  return null;
}

/**
 * Get full parameter description from help string fields
 */
export function getParameterDescription(param) {
  if (!param) return '';

  const parts = [
    param.help_string_2,
    param.help_string_3,
    param.help_string_1
  ].filter(Boolean).map(s => s.trim()).filter(s => s.length > 0);

  const unique = [...new Set(parts)];

  return unique.join(' ');
}