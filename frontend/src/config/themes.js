/**
 * Greenstack Centralized Theme Configuration
 *
 * This file is the single source of truth for all theming in the application.
 * It defines the immutable brand color and all theme presets.
 */

// ===========================
// IMMUTABLE BRAND COLOR
// ===========================
// This color represents the Greenstack brand identity and MUST NEVER be changed.
// It is locked across all themes and cannot be customized by users.
export const BRAND_GREEN = '#3DB60F';

// ===========================
// COLOR UTILITY FUNCTIONS
// ===========================

/**
 * Generates a color scale from a base color (50-950 shades)
 * Used for creating consistent color palettes
 */
function generateColorScale(baseColor) {
  // For now, return the base color for all shades
  // In future, could use color manipulation library to generate actual scales
  return {
    50: lighten(baseColor, 0.95),
    100: lighten(baseColor, 0.85),
    200: lighten(baseColor, 0.65),
    300: lighten(baseColor, 0.45),
    400: lighten(baseColor, 0.25),
    500: baseColor,
    600: darken(baseColor, 0.15),
    700: darken(baseColor, 0.30),
    800: darken(baseColor, 0.45),
    900: darken(baseColor, 0.60),
    950: darken(baseColor, 0.75),
  };
}

function lighten(color, amount) {
  // Simple lightening - in production, use a proper color library
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * amount));
  const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amount));
  const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function darken(color, amount) {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
  const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
  const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// ===========================
// THEME PRESETS
// ===========================

export const THEME_PRESETS = {
  greenstack: {
    id: 'greenstack',
    name: 'Greenstack',
    description: 'The official Greenstack brand theme',
    locked: true, // Cannot be modified or deleted
    mode: 'dark',
    colors: {
      // Brand color (immutable across all themes)
      brand: BRAND_GREEN,

      // Primary brand green for interactive elements
      primary: BRAND_GREEN,
      primaryHover: '#32a00c',
      primaryActive: '#2b8a0a',

      // Secondary colors (complementary green shades)
      secondary: '#2d5016',
      secondaryHover: '#3a6a1c',
      secondaryActive: '#1f3a0f',

      // Accent color (lighter green for highlights)
      accent: '#51cf66',
      accentHover: '#70d682',
      accentActive: '#32b84d',

      // State colors
      success: '#51cf66',
      warning: '#ffd43b',
      error: '#ff6b6b',
      info: '#00d4ff',

      // Dark mode surface colors
      background: '#0a0e27',
      backgroundSecondary: '#151935',
      surface: '#1a1f3a',
      surfaceHover: '#2a3050',
      surfaceActive: '#3a4060',

      // Border colors
      border: '#2a3050',
      borderSubtle: '#1f2640',
      borderStrong: '#3a4060',

      // Text colors
      foreground: '#e5e7eb',
      foregroundSecondary: '#9ca3af',
      foregroundMuted: '#6b7280',
      foregroundInverse: '#0a0e27',

      // Overlay colors
      overlay: 'rgba(10, 14, 39, 0.8)',
      overlayLight: 'rgba(10, 14, 39, 0.5)',
    }
  },

  forest: {
    id: 'forest',
    name: 'Forest Green',
    description: 'Deep forest theme with rich green tones',
    locked: false,
    mode: 'dark',
    colors: {
      brand: BRAND_GREEN, // Always locked

      primary: '#2d5016',
      primaryHover: '#3a6a1c',
      primaryActive: '#1f3a0f',

      secondary: '#1f3a0f',
      secondaryHover: '#2d5016',
      secondaryActive: '#152a0a',

      accent: '#4a7c30',
      accentHover: '#5a9c40',
      accentActive: '#3a6c20',

      success: '#4a7c30',
      warning: '#d4a843',
      error: '#c45555',
      info: '#4a7c9c',

      background: '#0d1a0a',
      backgroundSecondary: '#152a0f',
      surface: '#1f3a15',
      surfaceHover: '#2d5020',
      surfaceActive: '#3a6a2a',

      border: '#2d5020',
      borderSubtle: '#1f3a15',
      borderStrong: '#3a6a2a',

      foreground: '#d4e5ca',
      foregroundSecondary: '#a3c490',
      foregroundMuted: '#7a9c60',
      foregroundInverse: '#0d1a0a',

      overlay: 'rgba(13, 26, 10, 0.8)',
      overlayLight: 'rgba(13, 26, 10, 0.5)',
    }
  },

  midnight: {
    id: 'midnight',
    name: 'Midnight Green',
    description: 'Dark teal theme with deep green accents',
    locked: false,
    mode: 'dark',
    colors: {
      brand: BRAND_GREEN, // Always locked

      primary: '#0a3d2c',
      primaryHover: '#0e5240',
      primaryActive: '#072920',

      secondary: '#072920',
      secondaryHover: '#0a3d2c',
      secondaryActive: '#051d18',

      accent: '#1a6d50',
      accentHover: '#248d68',
      accentActive: '#135d40',

      success: '#1a6d50',
      warning: '#c4a843',
      error: '#c45555',
      info: '#1a6d9c',

      background: '#051d18',
      backgroundSecondary: '#072920',
      surface: '#0a3d2c',
      surfaceHover: '#0e5240',
      surfaceActive: '#126750',

      border: '#0e5240',
      borderSubtle: '#0a3d2c',
      borderStrong: '#126750',

      foreground: '#c4e5d8',
      foregroundSecondary: '#90c4b0',
      foregroundMuted: '#609c88',
      foregroundInverse: '#051d18',

      overlay: 'rgba(5, 29, 24, 0.8)',
      overlayLight: 'rgba(5, 29, 24, 0.5)',
    }
  },

  light: {
    id: 'light',
    name: 'Light Green',
    description: 'Clean light theme with green accents',
    locked: false,
    mode: 'light',
    colors: {
      brand: BRAND_GREEN, // Always locked

      primary: BRAND_GREEN,
      primaryHover: '#32a00c',
      primaryActive: '#2b8a0a',

      secondary: '#51cf66',
      secondaryHover: '#70d682',
      secondaryActive: '#32b84d',

      accent: '#2d5016',
      accentHover: '#3a6a1c',
      accentActive: '#1f3a0f',

      success: '#51cf66',
      warning: '#ffac30',
      error: '#ff4757',
      info: '#0099cc',

      background: '#ffffff',
      backgroundSecondary: '#f9fafb',
      surface: '#f3f4f6',
      surfaceHover: '#e5e7eb',
      surfaceActive: '#d1d5db',

      border: '#d1d5db',
      borderSubtle: '#e5e7eb',
      borderStrong: '#9ca3af',

      foreground: '#111827',
      foregroundSecondary: '#4b5563',
      foregroundMuted: '#6b7280',
      foregroundInverse: '#ffffff',

      overlay: 'rgba(255, 255, 255, 0.9)',
      overlayLight: 'rgba(255, 255, 255, 0.7)',
    }
  }
};

// ===========================
// THEME MANAGEMENT
// ===========================

/**
 * Get a theme preset by ID
 */
export function getThemePreset(presetId) {
  return THEME_PRESETS[presetId] || THEME_PRESETS.greenstack;
}

/**
 * Get all available theme presets
 */
export function getAllThemePresets() {
  return Object.values(THEME_PRESETS);
}

/**
 * Validate a custom theme to ensure it includes the immutable brand color
 */
export function validateTheme(theme) {
  const errors = [];

  // Ensure brand color is always BRAND_GREEN
  if (!theme.colors || theme.colors.brand !== BRAND_GREEN) {
    errors.push('Brand color must be #3DB60F and cannot be changed');
  }

  // Ensure required color properties exist
  const requiredColors = [
    'brand', 'primary', 'secondary', 'accent',
    'success', 'warning', 'error', 'info',
    'background', 'surface', 'border', 'foreground'
  ];

  for (const colorKey of requiredColors) {
    if (!theme.colors || !theme.colors[colorKey]) {
      errors.push(`Missing required color: ${colorKey}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create a custom theme based on a preset
 */
export function createCustomTheme(basePresetId, customColors = {}) {
  const baseTheme = getThemePreset(basePresetId);

  const customTheme = {
    ...baseTheme,
    id: `custom-${Date.now()}`,
    name: `Custom ${baseTheme.name}`,
    locked: false,
    colors: {
      ...baseTheme.colors,
      ...customColors,
      // Always enforce brand color
      brand: BRAND_GREEN
    }
  };

  const validation = validateTheme(customTheme);
  if (!validation.valid) {
    throw new Error(`Invalid theme: ${validation.errors.join(', ')}`);
  }

  return customTheme;
}

// ===========================
// CSS VARIABLE GENERATION
// ===========================

/**
 * Convert hex color to RGB values for CSS variables
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
    : '0 0 0';
}

/**
 * Generate CSS variables from a theme
 */
export function generateCSSVariables(theme) {
  const colors = theme.colors;

  return {
    // Brand color (immutable)
    '--brand-green': colors.brand,
    '--brand-green-rgb': hexToRgb(colors.brand),

    // Primary colors
    '--primary': colors.primary,
    '--primary-hover': colors.primaryHover,
    '--primary-active': colors.primaryActive,

    // Secondary colors
    '--secondary': colors.secondary,
    '--secondary-hover': colors.secondaryHover,
    '--secondary-active': colors.secondaryActive,

    // Accent colors
    '--accent': colors.accent,
    '--accent-hover': colors.accentHover,
    '--accent-active': colors.accentActive,

    // State colors
    '--success': colors.success,
    '--warning': colors.warning,
    '--error': colors.error,
    '--info': colors.info,

    // Surface colors
    '--background': colors.background,
    '--background-secondary': colors.backgroundSecondary,
    '--surface': colors.surface,
    '--surface-hover': colors.surfaceHover,
    '--surface-active': colors.surfaceActive,

    // Border colors
    '--border': colors.border,
    '--border-subtle': colors.borderSubtle,
    '--border-strong': colors.borderStrong,

    // Text colors
    '--foreground': colors.foreground,
    '--foreground-secondary': colors.foregroundSecondary,
    '--foreground-muted': colors.foregroundMuted,
    '--foreground-inverse': colors.foregroundInverse,

    // Overlay
    '--overlay': colors.overlay,
    '--overlay-light': colors.overlayLight,
  };
}

/**
 * Apply theme CSS variables to the document
 */
export function applyTheme(theme) {
  const root = document.documentElement;

  console.log('[applyTheme] Applying theme:', theme.name, 'mode:', theme.mode);
  console.log('[applyTheme] Before - classList:', root.className);

  // CSS structure: :root has dark mode, .light class has light mode
  // So for dark mode, remove .light class; for light mode, add .light class
  if (theme.mode === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.remove('light');
    root.classList.remove('dark');
  }

  console.log('[applyTheme] After - classList:', root.className);
}

export default {
  BRAND_GREEN,
  THEME_PRESETS,
  getThemePreset,
  getAllThemePresets,
  validateTheme,
  createCustomTheme,
  generateCSSVariables,
  applyTheme,
};
