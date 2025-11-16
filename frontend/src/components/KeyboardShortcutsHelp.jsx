import React from 'react';
import { X, Keyboard } from 'lucide-react';
import { Button } from './ui';
import { KEYBOARD_SHORTCUTS, formatShortcut } from '../hooks/useKeyboardShortcuts';

const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Group shortcuts by category
  const categories = {};
  Object.values(KEYBOARD_SHORTCUTS).forEach((shortcut) => {
    const category = shortcut.category || 'Other';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(shortcut);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-secondary rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-border">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-foreground">
              Keyboard Shortcuts
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] px-6 py-4">
          {Object.entries(categories).map(([category, shortcuts]) => (
            <div key={category} className="mb-6 last:mb-0">
              <h3 className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-slate-50 dark:hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-slate-700 dark:text-foreground">
                      {shortcut.description}
                    </span>
                    <kbd className="px-3 py-1.5 text-sm font-mono bg-slate-100 dark:bg-muted border border-slate-300 dark:border-border rounded shadow-sm text-slate-800 dark:text-foreground">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-border bg-slate-50 dark:bg-card/50">
          <p className="text-sm text-slate-600 dark:text-muted-foreground text-center">
            Press <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-secondary border border-slate-300 dark:border-border rounded">?</kbd> to show this help
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
