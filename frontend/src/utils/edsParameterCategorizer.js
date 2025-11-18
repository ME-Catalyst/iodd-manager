/**
 * EDS Parameter Categorizer
 *
 * Automatically categorizes EDS parameters into logical groups
 * based on parameter name, description, and usage patterns.
 */

import { Clock, Network, Package, Settings, Plug, Database, Zap, Sliders, FileCode } from 'lucide-react';

/**
 * Parameter category definitions
 */
export const PARAMETER_CATEGORIES = {
  NETWORK_TIMING: {
    id: 'network_timing',
    name: 'Network Timing',
    icon: Clock,
    color: 'blue',
    description: 'RPI, timeouts, watchdog timers',
    priority: 1
  },
  IO_ASSEMBLY: {
    id: 'io_assembly',
    name: 'I/O Assembly',
    icon: Package,
    color: 'green',
    description: 'Input/output data sizes and assembly configuration',
    priority: 2
  },
  CONNECTION_POINTS: {
    id: 'connection_points',
    name: 'Connection Points',
    icon: Plug,
    color: 'purple',
    description: 'Connection endpoints and path configuration',
    priority: 3
  },
  IO_CONFIGURATION: {
    id: 'io_configuration',
    name: 'I/O Configuration',
    icon: Settings,
    color: 'orange',
    description: 'Pin/port layout, channel modes, I/O settings',
    priority: 4
  },
  DEVICE_CONFIG: {
    id: 'device_config',
    name: 'Device Configuration',
    icon: Sliders,
    color: 'cyan',
    description: 'Device-specific settings and features',
    priority: 5
  },
  VARIABLE_DATA: {
    id: 'variable_data',
    name: 'Variable Data',
    icon: Database,
    color: 'yellow',
    description: 'Dynamic data lengths and variable assemblies',
    priority: 6
  },
  DIAGNOSTIC: {
    id: 'diagnostic',
    name: 'Diagnostics',
    icon: Zap,
    color: 'red',
    description: 'Diagnostic and status configuration',
    priority: 7
  },
  OTHER: {
    id: 'other',
    name: 'Other Parameters',
    icon: FileCode,
    color: 'gray',
    description: 'Uncategorized parameters',
    priority: 99
  }
};

/**
 * Categorization rules based on parameter characteristics
 */
const CATEGORIZATION_RULES = [
  // Network Timing
  {
    category: PARAMETER_CATEGORIES.NETWORK_TIMING,
    conditions: [
      param => /\b(rpi|timeout|watchdog|timer|interval|delay|period)\b/i.test(param.param_name || ''),
      param => /\b(rpi|timeout|watchdog|requested packet)\b/i.test(param.help_string_2 || ''),
      param => param.description?.toLowerCase() === 'microsecond',
      param => /packet.*interval/i.test(param.help_string_2 || '')
    ]
  },

  // I/O Assembly
  {
    category: PARAMETER_CATEGORIES.IO_ASSEMBLY,
    conditions: [
      param => /\b(assembly|packet.*size|data.*length|input.*size|output.*size|config.*size)\b/i.test(param.param_name || ''),
      param => /\b(assembly|packet|input data|output data)\b/i.test(param.help_string_2 || ''),
      param => /\bsize\s+\d+\b/i.test(param.param_name || ''),
      param => /describes.*size.*packets?/i.test(param.help_string_2 || '')
    ]
  },

  // Connection Points
  {
    category: PARAMETER_CATEGORIES.CONNECTION_POINTS,
    conditions: [
      param => /\b(connection.*point|_cp\d?|listen.*only|input.*only|exclusive|redundant)\b/i.test(param.param_name || ''),
      param => /connection\s+point/i.test(param.help_string_2 || ''),
      param => /\b(inputonly|listenonly)_cp/i.test(param.param_name || '')
    ]
  },

  // I/O Configuration
  {
    category: PARAMETER_CATEGORIES.IO_CONFIGURATION,
    conditions: [
      param => /\b(pin|port|layout|channel|mode|slot|module|io\s*link)\b/i.test(param.param_name || ''),
      param => /\b(pin.*based|port.*based|layout|channel|io.*layout)\b/i.test(param.help_string_2 || ''),
      param => /\b(digital|analog|input|output).*channel/i.test(param.param_name || '')
    ]
  },

  // Variable Data
  {
    category: PARAMETER_CATEGORIES.VARIABLE_DATA,
    conditions: [
      param => /\bvariable\b/i.test(param.param_name || ''),
      param => /\bdynamic\b/i.test(param.param_name || ''),
      param => /variable.*data/i.test(param.help_string_2 || '')
    ]
  },

  // Diagnostic
  {
    category: PARAMETER_CATEGORIES.DIAGNOSTIC,
    conditions: [
      param => /\b(diag|diagnostic|status|error|fault|alarm)\b/i.test(param.param_name || ''),
      param => /\b(diagnostic|status|error)\b/i.test(param.help_string_2 || '')
    ]
  },

  // Device Configuration (catch-all for config-related params not caught above)
  {
    category: PARAMETER_CATEGORIES.DEVICE_CONFIG,
    conditions: [
      param => /\b(config|setting|enable|disable|feature|option)\b/i.test(param.param_name || ''),
      param => /\b(configuration|setting)\b/i.test(param.help_string_2 || '')
    ]
  }
];

/**
 * Categorize a single parameter
 * @param {Object} param - Parameter object
 * @returns {Object} Category information
 */
export function categorizeParameter(param) {
  if (!param || !param.param_name) {
    return PARAMETER_CATEGORIES.OTHER;
  }

  // Try each categorization rule in order
  for (const rule of CATEGORIZATION_RULES) {
    // Check if any condition matches
    for (const condition of rule.conditions) {
      try {
        if (condition(param)) {
          return rule.category;
        }
      } catch (error) {
        // If condition throws error, skip it
        console.warn('Categorization condition error:', error);
        continue;
      }
    }
  }

  // No match found, return OTHER
  return PARAMETER_CATEGORIES.OTHER;
}

/**
 * Group parameters by category
 * @param {Array} parameters - Array of parameter objects
 * @returns {Object} Object with category IDs as keys and parameter arrays as values
 */
export function groupParametersByCategory(parameters) {
  if (!parameters || !Array.isArray(parameters)) {
    return {};
  }

  const grouped = {};

  // Initialize all categories
  Object.values(PARAMETER_CATEGORIES).forEach(category => {
    grouped[category.id] = {
      category,
      parameters: [],
      count: 0
    };
  });

  // Categorize each parameter
  parameters.forEach(param => {
    const category = categorizeParameter(param);
    grouped[category.id].parameters.push({
      ...param,
      category: category.id
    });
  });

  // Update counts
  Object.keys(grouped).forEach(categoryId => {
    grouped[categoryId].count = grouped[categoryId].parameters.length;
  });

  return grouped;
}

/**
 * Get sorted list of categories with parameters
 * Excludes empty categories by default
 * @param {Object} groupedParameters - Grouped parameters from groupParametersByCategory()
 * @param {boolean} includeEmpty - Include categories with no parameters
 * @returns {Array} Sorted array of category groups
 */
export function getSortedCategories(groupedParameters, includeEmpty = false) {
  return Object.values(groupedParameters)
    .filter(group => includeEmpty || group.count > 0)
    .sort((a, b) => a.category.priority - b.category.priority);
}

/**
 * Get category statistics
 * @param {Array} parameters - Array of parameter objects
 * @returns {Object} Statistics about parameter categorization
 */