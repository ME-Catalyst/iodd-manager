import { useEffect, useCallback } from 'react';

/**
 * Keyboard Shortcuts Hook
 *
 * Provides a centralized system for managing keyboard shortcuts across the app.
 * Supports modifier keys (Ctrl, Shift, Alt, Meta) and special keys.
 */

export const useKeyboardShortcuts = (shortcuts, enabled = true) => {
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    // Don't trigger shortcuts when user is typing in an input/textarea
    const target = event.target;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    // Find matching shortcut
    for (const shortcut of shortcuts) {
      const { key, ctrl, shift, alt, meta, callback, allowInInput } = shortcut;

      // Skip if typing in input and shortcut doesn't allow it
      if (isInput && !allowInInput) continue;

      // Check if key matches
      const keyMatches = key.toLowerCase() === event.key.toLowerCase();

      // Check modifiers
      const ctrlMatches = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const shiftMatches = shift ? event.shiftKey : !event.shiftKey;
      const altMatches = alt ? event.altKey : !event.altKey;
      const metaMatches = meta ? event.metaKey : !event.metaKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        event.preventDefault();
        callback(event);
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
};

/**
 * Format shortcut for display
 * @param {object} shortcut - Shortcut configuration
 * @returns {string} Formatted shortcut string
 */
export const formatShortcut = (shortcut) => {
  const parts = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.meta) parts.push('⌘');

  // Capitalize key for display
  const keyDisplay = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  parts.push(keyDisplay);

  return parts.join(' + ');
};

/**
 * Predefined shortcut configurations for the app
 */
export const KEYBOARD_SHORTCUTS = {
  // Navigation
  GOTO_OVERVIEW: {
    key: 'h',
    ctrl: false,
    description: 'Go to Overview',
    category: 'Navigation',
  },
  GOTO_DEVICES: {
    key: 'd',
    ctrl: false,
    description: 'Go to Devices',
    category: 'Navigation',
  },
  GOTO_SEARCH: {
    key: 's',
    ctrl: false,
    description: 'Go to Search',
    category: 'Navigation',
  },
  GOTO_COMPARE: {
    key: 'c',
    ctrl: false,
    description: 'Go to Compare',
    category: 'Navigation',
  },
  GOTO_ANALYTICS: {
    key: 'a',
    ctrl: false,
    description: 'Go to Analytics',
    category: 'Navigation',
  },

  // Actions
  UPLOAD_FILE: {
    key: 'u',
    ctrl: true,
    description: 'Upload File',
    category: 'Actions',
  },
  TOGGLE_THEME: {
    key: 't',
    ctrl: true,
    shift: true,
    description: 'Toggle Theme',
    category: 'Actions',
  },
  REFRESH: {
    key: 'r',
    ctrl: true,
    description: 'Refresh Data',
    category: 'Actions',
  },

  // Search
  FOCUS_SEARCH: {
    key: '/',
    ctrl: false,
    allowInInput: false,
    description: 'Focus Search',
    category: 'Search',
  },
  CLEAR_SEARCH: {
    key: 'Escape',
    ctrl: false,
    allowInInput: true,
    description: 'Clear Search',
    category: 'Search',
  },

  // Help
  SHOW_HELP: {
    key: '?',
    ctrl: false,
    shift: true,
    description: 'Show Keyboard Shortcuts',
    category: 'Help',
  },
};

export default useKeyboardShortcuts;
