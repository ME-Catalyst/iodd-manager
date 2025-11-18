/**
 * EDS Data Type Decoder
 *
 * Decodes CIP (Common Industrial Protocol) data type codes used in EDS files
 * into human-readable type names and metadata.
 *
 * Based on ODVA CIP Specification - Data Types Volume 1, Appendix C
 */

export const CIP_DATA_TYPES = {
  // Boolean
  0xC1: {
    code: 0xC1,
    name: 'BOOL',
    displayName: 'Boolean',
    description: 'Boolean value (True/False)',
    size: '1 bit',
    sizeBytes: 0.125,
    category: 'Boolean',
    color: 'purple'
  },

  // Signed Integers
  0xC2: {
    code: 0xC2,
    name: 'SINT',
    displayName: 'Signed 8-bit Integer',
    description: 'Signed 8-bit integer (-128 to 127)',
    size: '1 byte',
    sizeBytes: 1,
    category: 'Integer',
    color: 'blue'
  },
  0xC3: {
    code: 0xC3,
    name: 'INT',
    displayName: 'Signed 16-bit Integer',
    description: 'Signed 16-bit integer (-32,768 to 32,767)',
    size: '2 bytes',
    sizeBytes: 2,
    category: 'Integer',
    color: 'blue'
  },
  0xC4: {
    code: 0xC4,
    name: 'DINT',
    displayName: 'Signed 32-bit Integer',
    description: 'Signed 32-bit integer',
    size: '4 bytes',
    sizeBytes: 4,
    category: 'Integer',
    color: 'blue'
  },
  0xC5: {
    code: 0xC5,
    name: 'LINT',
    displayName: 'Signed 64-bit Integer',
    description: 'Signed 64-bit integer',
    size: '8 bytes',
    sizeBytes: 8,
    category: 'Integer',
    color: 'blue'
  },

  // Unsigned Integers
  0xC6: {
    code: 0xC6,
    name: 'USINT',
    displayName: 'Unsigned 8-bit Integer',
    description: 'Unsigned 8-bit integer (0 to 255)',
    size: '1 byte',
    sizeBytes: 1,
    category: 'Integer',
    color: 'cyan'
  },
  0xC7: {
    code: 0xC7,
    name: 'UINT',
    displayName: 'Unsigned 16-bit Integer',
    description: 'Unsigned 16-bit integer (0 to 65,535)',
    size: '2 bytes',
    sizeBytes: 2,
    category: 'Integer',
    color: 'cyan'
  },
  0xC8: {
    code: 0xC8,
    name: 'UDINT',
    displayName: 'Unsigned 32-bit Integer',
    description: 'Unsigned 32-bit integer (0 to 4,294,967,295)',
    size: '4 bytes',
    sizeBytes: 4,
    category: 'Integer',
    color: 'cyan'
  },
  0xC9: {
    code: 0xC9,
    name: 'ULINT',
    displayName: 'Unsigned 64-bit Integer',
    description: 'Unsigned 64-bit integer',
    size: '8 bytes',
    sizeBytes: 8,
    category: 'Integer',
    color: 'cyan'
  },

  // Floating Point
  0xCA: {
    code: 0xCA,
    name: 'REAL',
    displayName: '32-bit Float',
    description: 'IEEE 754 single precision floating point',
    size: '4 bytes',
    sizeBytes: 4,
    category: 'Float',
    color: 'green'
  },
  0xCB: {
    code: 0xCB,
    name: 'LREAL',
    displayName: '64-bit Float',
    description: 'IEEE 754 double precision floating point',
    size: '8 bytes',
    sizeBytes: 8,
    category: 'Float',
    color: 'green'
  },

  // Bit Strings
  0xD1: {
    code: 0xD1,
    name: 'BYTE',
    displayName: 'Byte',
    description: 'Bit string - 8 bits',
    size: '1 byte',
    sizeBytes: 1,
    category: 'BitString',
    color: 'orange'
  },
  0xD2: {
    code: 0xD2,
    name: 'WORD',
    displayName: 'Word',
    description: 'Bit string - 16 bits',
    size: '2 bytes',
    sizeBytes: 2,
    category: 'BitString',
    color: 'orange'
  },
  0xD3: {
    code: 0xD3,
    name: 'DWORD',
    displayName: 'Double Word',
    description: 'Bit string - 32 bits',
    size: '4 bytes',
    sizeBytes: 4,
    category: 'BitString',
    color: 'orange'
  },
  0xD4: {
    code: 0xD4,
    name: 'LWORD',
    displayName: 'Long Word',
    description: 'Bit string - 64 bits',
    size: '8 bytes',
    sizeBytes: 8,
    category: 'BitString',
    color: 'orange'
  },

  // Strings
  0xD0: {
    code: 0xD0,
    name: 'STRING',
    displayName: 'String',
    description: 'Character string (1-byte chars)',
    size: 'Variable',
    sizeBytes: null,
    category: 'String',
    color: 'yellow'
  },
  0xD5: {
    code: 0xD5,
    name: 'STRING2',
    displayName: 'String (2-byte)',
    description: 'Character string (2-byte chars)',
    size: 'Variable',
    sizeBytes: null,
    category: 'String',
    color: 'yellow'
  },

  // Structured Types
  0xA0: {
    code: 0xA0,
    name: 'STRUCT',
    displayName: 'Structure',
    description: 'Structured type',
    size: 'Variable',
    sizeBytes: null,
    category: 'Structured',
    color: 'pink'
  },
  0xA2: {
    code: 0xA2,
    name: 'ABBREV_STRUCT',
    displayName: 'Abbreviated Structure',
    description: 'Abbreviated structured type',
    size: 'Variable',
    sizeBytes: null,
    category: 'Structured',
    color: 'pink'
  },

  // Time Types
  0xDB: {
    code: 0xDB,
    name: 'FTIME',
    displayName: 'High-res Duration',
    description: 'High-resolution duration (nanoseconds)',
    size: '8 bytes',
    sizeBytes: 8,
    category: 'Time',
    color: 'indigo'
  },
  0xDC: {
    code: 0xDC,
    name: 'LTIME',
    displayName: 'Long Duration',
    description: 'Long duration (microseconds)',
    size: '8 bytes',
    sizeBytes: 8,
    category: 'Time',
    color: 'indigo'
  },

  // Abbreviated types (common shortcuts in EDS files)
  1: {
    code: 1,
    name: 'USINT',
    displayName: 'Unsigned 8-bit Integer',
    description: 'Unsigned 8-bit integer (0 to 255)',
    size: '1 byte',
    sizeBytes: 1,
    category: 'Integer',
    color: 'cyan'
  },
  2: {
    code: 2,
    name: 'UINT',
    displayName: 'Unsigned 16-bit Integer',
    description: 'Unsigned 16-bit integer (0 to 65,535)',
    size: '2 bytes',
    sizeBytes: 2,
    category: 'Integer',
    color: 'cyan'
  },
  3: {
    code: 3,
    name: 'UDINT',
    displayName: 'Unsigned 32-bit Integer',
    description: 'Unsigned 32-bit integer (0 to 4,294,967,295)',
    size: '4 bytes',
    sizeBytes: 4,
    category: 'Integer',
    color: 'cyan'
  },
  4: {
    code: 4,
    name: 'UDINT',
    displayName: 'Unsigned 32-bit Integer',
    description: 'Unsigned 32-bit integer (0 to 4,294,967,295)',
    size: '4 bytes',
    sizeBytes: 4,
    category: 'Integer',
    color: 'cyan'
  }
};

/**
 * Get data type information from a CIP data type code
 * @param {number|string} dataTypeCode - The CIP data type code (can be decimal, hex, or string)
 * @returns {Object} Data type information object
 */
export function getDataTypeInfo(dataTypeCode) {
  // Handle null/undefined
  if (dataTypeCode === null || dataTypeCode === undefined) {
    return {
      code: null,
      name: 'Unknown',
      displayName: 'Unknown Type',
      description: 'Data type not specified',
      size: 'Unknown',
      sizeBytes: null,
      category: 'Unknown',
      color: 'gray'
    };
  }

  // Convert to number if string
  const code = typeof dataTypeCode === 'number'
    ? dataTypeCode
    : parseInt(dataTypeCode, 10);

  // Try direct lookup first
  if (CIP_DATA_TYPES[code]) {
    return CIP_DATA_TYPES[code];
  }

  // Try hex conversion if it looks like a decimal representation of hex
  if (code >= 193 && code <= 255) {
    const hexCode = code;
    if (CIP_DATA_TYPES[hexCode]) {
      return CIP_DATA_TYPES[hexCode];
    }
  }

  // Unknown type
  return {
    code: code,
    name: `Type${code}`,
    displayName: `Unknown Type (${code})`,
    description: `Unrecognized data type code: ${code}`,
    size: 'Unknown',
    sizeBytes: null,
    category: 'Unknown',
    color: 'gray'
  };
}

/**
 * Get a badge color class for a data type category
 * @param {string} category - The data type category
 * @returns {string} Tailwind CSS color classes for badge
 */
export function getDataTypeBadgeColor(category) {
  const colorMap = {
    'Boolean': 'bg-secondary/20 text-secondary border-secondary',
    'Integer': 'bg-info/20 text-info border-info',
    'Float': 'bg-success/20 text-success border-success',
    'BitString': 'bg-warning/20 text-warning border-warning',
    'String': 'bg-warning/20 text-warning border-warning',
    'Structured': 'bg-pink-900/50 text-pink-300 border-pink-700',
    'Time': 'bg-indigo-900/50 text-indigo-300 border-indigo-700',
    'Unknown': 'bg-muted/20 text-muted-foreground border-border'
  };

  return colorMap[category] || colorMap['Unknown'];
}

/**
 * Format a value according to its data type
 * @param {any} value - The value to format
 * @param {Object} dataTypeInfo - Data type information from getDataTypeInfo()
 * @param {string} units - Optional units to append
 * @returns {string} Formatted value string
 */
export function formatValueByType(value, dataTypeInfo, units = '') {
  if (value === null || value === undefined || value === 'N/A') {
    return 'N/A';
  }

  const val = typeof value === 'string' ? value : String(value);

  // Add thousand separators for large numbers
  if (dataTypeInfo.category === 'Integer' && !isNaN(val)) {
    const num = parseInt(val, 10);
    const formatted = num.toLocaleString();
    return units ? `${formatted} ${units}` : formatted;
  }

  // Format floats with appropriate precision
  if (dataTypeInfo.category === 'Float' && !isNaN(val)) {
    const num = parseFloat(val);
    const formatted = num.toLocaleString(undefined, { maximumFractionDigits: 6 });
    return units ? `${formatted} ${units}` : formatted;
  }

  // Boolean values
  if (dataTypeInfo.category === 'Boolean') {
    if (val === '0' || val.toLowerCase() === 'false') return 'False';
    if (val === '1' || val.toLowerCase() === 'true') return 'True';
  }

  // Default: just return value with units
  return units ? `${val} ${units}` : val;
}

/**
 * Get all unique data type categories from a list of parameters
 * @param {Array} parameters - Array of parameter objects
 * @returns {Array} Array of unique category names
 */