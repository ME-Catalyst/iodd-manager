import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  BRAND_GREEN,
  THEME_PRESETS,
  getThemePreset,
  getAllThemePresets,
  applyTheme,
  validateTheme,
} from '../config/themes';

const ThemeContext = createContext({
  // Current theme mode (for backward compatibility)
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: (theme) => {},

  // New theme system
  currentTheme: null,
  themePreset: 'greenstack',
  setThemePreset: (presetId) => {},
  customTheme: null,
  setCustomTheme: (theme) => {},
  clearCustomTheme: () => {},
  brandGreen: BRAND_GREEN,
  availablePresets: [],
  applyTheme: (theme) => {},
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Get initial theme mode and preset from localStorage
  const getInitialMode = () => {
    const savedMode = localStorage.getItem('greenstack-theme-mode');
    if (savedMode) {
      return savedMode;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }

    return 'dark';
  };

  const getInitialPreset = () => {
    const savedPreset = localStorage.getItem('greenstack-theme-preset');
    return savedPreset || 'greenstack';
  };

  const getInitialCustomTheme = () => {
    const savedCustomTheme = localStorage.getItem('greenstack-custom-theme');
    if (savedCustomTheme) {
      try {
        const parsed = JSON.parse(savedCustomTheme);
        const validation = validateTheme(parsed);
        if (validation.valid) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse custom theme:', e);
      }
    }
    return null;
  };

  // State management
  const [theme, setThemeState] = useState(getInitialMode); // For backward compatibility
  const [themePreset, setThemePresetState] = useState(getInitialPreset);
  const [customTheme, setCustomThemeState] = useState(getInitialCustomTheme);
  const [currentTheme, setCurrentTheme] = useState(null);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const themeToApply = customTheme || getThemePreset(themePreset);
    console.log('[ThemeContext useEffect] Preset:', themePreset, 'Theme to apply:', themeToApply.name, 'Mode:', themeToApply.mode);
    setCurrentTheme(themeToApply);
    applyTheme(themeToApply);

    // Also set the mode for backward compatibility
    setThemeState(themeToApply.mode || 'dark');

    // Save to localStorage
    localStorage.setItem('greenstack-theme-mode', themeToApply.mode || 'dark');
    localStorage.setItem('greenstack-theme-preset', themePreset);
  }, [themePreset, customTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      const savedPreset = localStorage.getItem('greenstack-theme-preset');
      const savedCustom = localStorage.getItem('greenstack-custom-theme');

      // Only update if user hasn't manually set a theme
      if (!savedPreset && !savedCustom) {
        const newMode = e.matches ? 'dark' : 'light';
        const newPreset = newMode === 'dark' ? 'greenstack' : 'light';
        setThemePresetState(newPreset);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Theme management functions
  const setTheme = (newTheme) => {
    // For backward compatibility with simple mode switching
    if (newTheme === 'light' || newTheme === 'dark') {
      const newPreset = newTheme === 'light' ? 'light' : 'greenstack';
      setThemePresetState(newPreset);
      setCustomThemeState(null); // Clear custom theme
    }
  };

  const toggleTheme = () => {
    // Toggle between dark and light modes
    // Check current theme's mode, not the preset name
    const currentMode = currentTheme?.mode || 'dark';
    const newPreset = currentMode === 'light' ? 'greenstack' : 'light';
    console.log('[toggleTheme] Current mode:', currentMode, '-> New preset:', newPreset);
    console.log('[toggleTheme] Current theme:', currentTheme);
    setThemePresetState(newPreset);
    setCustomThemeState(null); // Clear custom theme
  };

  const setThemePreset = (presetId) => {
    if (THEME_PRESETS[presetId]) {
      setThemePresetState(presetId);
      setCustomThemeState(null); // Clear custom theme when setting preset
    } else {
      console.warn(`Theme preset "${presetId}" not found`);
    }
  };

  const setCustomTheme = (theme) => {
    const validation = validateTheme(theme);
    if (validation.valid) {
      setCustomThemeState(theme);
      localStorage.setItem('greenstack-custom-theme', JSON.stringify(theme));
    } else {
      console.error('Invalid theme:', validation.errors);
      throw new Error(`Invalid theme: ${validation.errors.join(', ')}`);
    }
  };

  const clearCustomTheme = () => {
    setCustomThemeState(null);
    localStorage.removeItem('greenstack-custom-theme');
  };

  const value = {
    // Legacy API (for backward compatibility)
    theme,
    toggleTheme,
    setTheme,

    // New theme system API
    currentTheme,
    themePreset,
    setThemePreset,
    customTheme,
    setCustomTheme,
    clearCustomTheme,
    brandGreen: BRAND_GREEN,
    availablePresets: getAllThemePresets(),
    applyTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
