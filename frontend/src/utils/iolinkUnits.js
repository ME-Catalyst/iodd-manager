/**
 * IO-Link Unit Code Translation Utility
 *
 * Translates IO-Link unit codes to human-readable symbols and names
 * Based on IO-Link specification IEC 61131-9
 */

// Complete IO-Link unit code mappings
export const IOLINK_UNIT_CODES = {
  // Dimensionless
  0: { symbol: '', name: 'No unit', category: 'Dimensionless' },

  // Length units (1000-1099)
  1001: { symbol: '°C', name: 'Degree Celsius', category: 'Temperature' },
  1002: { symbol: 'K', name: 'Kelvin', category: 'Temperature' },
  1003: { symbol: '°F', name: 'Degree Fahrenheit', category: 'Temperature' },

  1010: { symbol: 'mm', name: 'Millimeter', category: 'Length' },
  1011: { symbol: 'cm', name: 'Centimeter', category: 'Length' },
  1012: { symbol: 'dm', name: 'Decimeter', category: 'Length' },
  1013: { symbol: 'mm', name: 'Millimeter', category: 'Length' },
  1014: { symbol: 'm', name: 'Meter', category: 'Length' },
  1015: { symbol: 'km', name: 'Kilometer', category: 'Length' },
  1016: { symbol: 'in', name: 'Inch', category: 'Length' },
  1017: { symbol: 'ft', name: 'Foot', category: 'Length' },
  1018: { symbol: 'yd', name: 'Yard', category: 'Length' },
  1019: { symbol: 'mi', name: 'Mile', category: 'Length' },

  // Area units (1100-1199)
  1100: { symbol: 'mm²', name: 'Square millimeter', category: 'Area' },
  1101: { symbol: 'cm²', name: 'Square centimeter', category: 'Area' },
  1102: { symbol: 'm²', name: 'Square meter', category: 'Area' },
  1103: { symbol: 'in²', name: 'Square inch', category: 'Area' },
  1104: { symbol: 'ft²', name: 'Square foot', category: 'Area' },

  // Volume units (1200-1299)
  1200: { symbol: 'mm³', name: 'Cubic millimeter', category: 'Volume' },
  1201: { symbol: 'cm³', name: 'Cubic centimeter', category: 'Volume' },
  1202: { symbol: 'ml', name: 'Milliliter', category: 'Volume' },
  1203: { symbol: 'l', name: 'Liter', category: 'Volume' },
  1204: { symbol: 'm³', name: 'Cubic meter', category: 'Volume' },
  1205: { symbol: 'in³', name: 'Cubic inch', category: 'Volume' },
  1206: { symbol: 'ft³', name: 'Cubic foot', category: 'Volume' },
  1207: { symbol: 'gal', name: 'Gallon (US)', category: 'Volume' },
  1208: { symbol: 'gal', name: 'Gallon (UK)', category: 'Volume' },

  // Electrical units (1220-1299)
  1220: { symbol: 'V', name: 'Volt', category: 'Electrical' },
  1221: { symbol: 'mV', name: 'Millivolt', category: 'Electrical' },
  1222: { symbol: 'kV', name: 'Kilovolt', category: 'Electrical' },
  1230: { symbol: 'A', name: 'Ampere', category: 'Electrical' },
  1231: { symbol: 'mA', name: 'Milliampere', category: 'Electrical' },
  1232: { symbol: 'kA', name: 'Kiloampere', category: 'Electrical' },
  1240: { symbol: 'V', name: 'Volt', category: 'Electrical' },
  1241: { symbol: 'W', name: 'Watt', category: 'Electrical' },
  1242: { symbol: 'kW', name: 'Kilowatt', category: 'Electrical' },
  1243: { symbol: 'MW', name: 'Megawatt', category: 'Electrical' },
  1250: { symbol: 'Ω', name: 'Ohm', category: 'Electrical' },
  1251: { symbol: 'kΩ', name: 'Kiloohm', category: 'Electrical' },
  1252: { symbol: 'MΩ', name: 'Megaohm', category: 'Electrical' },
  1260: { symbol: 'Hz', name: 'Hertz', category: 'Frequency' },
  1261: { symbol: 'kHz', name: 'Kilohertz', category: 'Frequency' },
  1262: { symbol: 'MHz', name: 'Megahertz', category: 'Frequency' },
  1263: { symbol: 'GHz', name: 'Gigahertz', category: 'Frequency' },

  // Percentages (1300-1399)
  1342: { symbol: '%', name: 'Percent', category: 'Dimensionless' },
  1343: { symbol: '‰', name: 'Per mille', category: 'Dimensionless' },
  1344: { symbol: 'ppm', name: 'Parts per million', category: 'Dimensionless' },
  1345: { symbol: 'ppb', name: 'Parts per billion', category: 'Dimensionless' },

  // Mass units (1400-1499)
  1400: { symbol: 'mg', name: 'Milligram', category: 'Mass' },
  1401: { symbol: 'g', name: 'Gram', category: 'Mass' },
  1402: { symbol: 'kg', name: 'Kilogram', category: 'Mass' },
  1403: { symbol: 't', name: 'Metric ton', category: 'Mass' },
  1404: { symbol: 'oz', name: 'Ounce', category: 'Mass' },
  1405: { symbol: 'lb', name: 'Pound', category: 'Mass' },

  // Force units (1500-1599)
  1500: { symbol: 'N', name: 'Newton', category: 'Force' },
  1501: { symbol: 'kN', name: 'Kilonewton', category: 'Force' },
  1502: { symbol: 'lbf', name: 'Pound-force', category: 'Force' },

  // Pressure units (1600-1699)
  1600: { symbol: 'Pa', name: 'Pascal', category: 'Pressure' },
  1601: { symbol: 'hPa', name: 'Hectopascal', category: 'Pressure' },
  1602: { symbol: 'kPa', name: 'Kilopascal', category: 'Pressure' },
  1603: { symbol: 'MPa', name: 'Megapascal', category: 'Pressure' },
  1604: { symbol: 'bar', name: 'Bar', category: 'Pressure' },
  1605: { symbol: 'mbar', name: 'Millibar', category: 'Pressure' },
  1606: { symbol: 'psi', name: 'Pounds per square inch', category: 'Pressure' },
  1607: { symbol: 'atm', name: 'Atmosphere', category: 'Pressure' },
  1608: { symbol: 'mmHg', name: 'Millimeter of mercury', category: 'Pressure' },
  1609: { symbol: 'inH₂O', name: 'Inch of water', category: 'Pressure' },

  // Time units (1000-1099)
  1050: { symbol: 'µs', name: 'Microsecond', category: 'Time' },
  1051: { symbol: 'ms', name: 'Millisecond', category: 'Time' },
  1052: { symbol: 's', name: 'Second', category: 'Time' },
  1053: { symbol: 'min', name: 'Minute', category: 'Time' },
  1054: { symbol: 'h', name: 'Hour', category: 'Time' },
  1055: { symbol: 'd', name: 'Day', category: 'Time' },
  1056: { symbol: 'ms', name: 'Millisecond', category: 'Time' },

  // Velocity units (1700-1799)
  1700: { symbol: 'm/s', name: 'Meter per second', category: 'Velocity' },
  1701: { symbol: 'km/h', name: 'Kilometer per hour', category: 'Velocity' },
  1702: { symbol: 'ft/s', name: 'Foot per second', category: 'Velocity' },
  1703: { symbol: 'mph', name: 'Miles per hour', category: 'Velocity' },
  1704: { symbol: 'mm/s', name: 'Millimeter per second', category: 'Velocity' },

  // Flow rate units (1800-1899)
  1800: { symbol: 'l/s', name: 'Liter per second', category: 'Flow' },
  1801: { symbol: 'l/min', name: 'Liter per minute', category: 'Flow' },
  1802: { symbol: 'l/h', name: 'Liter per hour', category: 'Flow' },
  1803: { symbol: 'm³/s', name: 'Cubic meter per second', category: 'Flow' },
  1804: { symbol: 'm³/min', name: 'Cubic meter per minute', category: 'Flow' },
  1805: { symbol: 'm³/h', name: 'Cubic meter per hour', category: 'Flow' },
  1806: { symbol: 'gal/s', name: 'Gallon per second', category: 'Flow' },
  1807: { symbol: 'gal/min', name: 'Gallon per minute', category: 'Flow' },
  1808: { symbol: 'gal/h', name: 'Gallon per hour', category: 'Flow' },

  // Acceleration units (1900-1999)
  1900: { symbol: 'm/s²', name: 'Meter per second squared', category: 'Acceleration' },
  1901: { symbol: 'g', name: 'Standard gravity', category: 'Acceleration' },

  // Angular units (2000-2099)
  2000: { symbol: '°', name: 'Degree', category: 'Angle' },
  2001: { symbol: 'rad', name: 'Radian', category: 'Angle' },
  2002: { symbol: "'", name: 'Arc minute', category: 'Angle' },
  2003: { symbol: '"', name: 'Arc second', category: 'Angle' },
  2010: { symbol: 'rpm', name: 'Revolutions per minute', category: 'Angular Velocity' },
  2011: { symbol: 'rad/s', name: 'Radians per second', category: 'Angular Velocity' },

  // Energy units (2100-2199)
  2100: { symbol: 'J', name: 'Joule', category: 'Energy' },
  2101: { symbol: 'kJ', name: 'Kilojoule', category: 'Energy' },
  2102: { symbol: 'MJ', name: 'Megajoule', category: 'Energy' },
  2103: { symbol: 'Wh', name: 'Watt-hour', category: 'Energy' },
  2104: { symbol: 'kWh', name: 'Kilowatt-hour', category: 'Energy' },
  2105: { symbol: 'cal', name: 'Calorie', category: 'Energy' },
  2106: { symbol: 'kcal', name: 'Kilocalorie', category: 'Energy' },

  // Light units (2200-2299)
  2200: { symbol: 'lx', name: 'Lux', category: 'Illuminance' },
  2201: { symbol: 'lm', name: 'Lumen', category: 'Luminous Flux' },
  2202: { symbol: 'cd', name: 'Candela', category: 'Luminous Intensity' },

  // Concentration units (2300-2399)
  2300: { symbol: 'mol/m³', name: 'Mole per cubic meter', category: 'Concentration' },
  2301: { symbol: 'mg/l', name: 'Milligram per liter', category: 'Concentration' },
  2302: { symbol: 'g/l', name: 'Gram per liter', category: 'Concentration' },

  // pH and special (2400-2499)
  2400: { symbol: 'pH', name: 'pH value', category: 'Acidity' },
  2401: { symbol: 'dB', name: 'Decibel', category: 'Sound' },
  2402: { symbol: 'dBA', name: 'A-weighted decibel', category: 'Sound' },
};

/**
 * Get unit symbol from IO-Link unit code
 * @param {number} unitCode - IO-Link unit code
 * @returns {string} Unit symbol or empty string if not found
 */
export function getUnitSymbol(unitCode) {
  if (!unitCode || unitCode === 0) return '';
  const unit = IOLINK_UNIT_CODES[unitCode];
  return unit ? unit.symbol : `[${unitCode}]`;
}

/**
 * Get full unit name from IO-Link unit code
 * @param {number} unitCode - IO-Link unit code
 * @returns {string} Unit name or 'Unknown unit' if not found
 */
export function getUnitName(unitCode) {
  if (!unitCode || unitCode === 0) return 'No unit';
  const unit = IOLINK_UNIT_CODES[unitCode];
  return unit ? unit.name : `Unknown unit (${unitCode})`;
}

/**
 * Get unit category from IO-Link unit code
 * @param {number} unitCode - IO-Link unit code
 * @returns {string} Unit category
 */
export function getUnitCategory(unitCode) {
  if (!unitCode || unitCode === 0) return 'Dimensionless';
  const unit = IOLINK_UNIT_CODES[unitCode];
  return unit ? unit.category : 'Unknown';
}

/**
 * Get complete unit information
 * @param {number} unitCode - IO-Link unit code
 * @returns {object} Unit information object
 */
export function getUnitInfo(unitCode) {
  if (!unitCode || unitCode === 0) {
    return { symbol: '', name: 'No unit', category: 'Dimensionless', code: 0 };
  }

  const unit = IOLINK_UNIT_CODES[unitCode];
  if (unit) {
    return { ...unit, code: unitCode };
  }

  return {
    symbol: `[${unitCode}]`,
    name: `Unknown unit (${unitCode})`,
    category: 'Unknown',
    code: unitCode
  };
}

/**
 * Format value with unit
 * @param {number} value - Numeric value
 * @param {number} unitCode - IO-Link unit code
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted value with unit symbol
 */
export function formatValueWithUnit(value, unitCode, decimals = 2) {
  if (value === null || value === undefined) return 'N/A';

  const formattedValue = typeof value === 'number'
    ? value.toFixed(decimals).replace(/\.?0+$/, '')
    : value;

  const symbol = getUnitSymbol(unitCode);
  return symbol ? `${formattedValue} ${symbol}` : formattedValue;
}

/**
 * Get all units in a specific category
 * @param {string} category - Category name
 * @returns {array} Array of unit objects in that category
 */