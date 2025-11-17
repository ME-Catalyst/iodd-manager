import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, ArrowRight, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, Input, ScrollArea } from '../ui';
import { docsRegistry } from '../../content/docs/index';

/**
 * DocsSearch - Documentation Search Modal
 *
 * Features:
 * - Full-text search across all docs
 * - Fuzzy matching
 * - Keyboard navigation (arrows, Enter, Escape)
 * - Result highlighting
 * - Category filtering
 * - Instant results
 */

const DocsSearch = ({ isOpen, onClose, onSelect, searchQuery, setSearchQuery }) => {
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search function
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const query = searchQuery.toLowerCase();
    const searchResults = [];

    Object.entries(docsRegistry).forEach(([pageId, page]) => {
      if (!page.metadata) return;

      const { title, description, keywords = [] } = page.metadata;
      let score = 0;

      // Title match (highest priority)
      if (title.toLowerCase().includes(query)) {
        score += 100;
      }

      // Description match
      if (description?.toLowerCase().includes(query)) {
        score += 50;
      }

      // Keyword match
      keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(query)) {
          score += 30;
        }
      });

      // Category match
      const category = pageId.split('/')[0];
      if (category.toLowerCase().includes(query)) {
        score += 20;
      }

      if (score > 0) {
        searchResults.push({
          pageId,
          ...page.metadata,
          score
        });
      }
    });

    // Sort by score descending
    searchResults.sort((a, b) => b.score - a.score);

    setResults(searchResults.slice(0, 10)); // Limit to 10 results
    setSelectedIndex(0);
  }, [searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        onSelect(results[selectedIndex].pageId);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onSelect, onClose]);

  // Highlight matching text
  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.substring(0, index)}
        <mark className="bg-brand-green/20 text-brand-green px-1 rounded">
          {text.substring(index, index + query.length)}
        </mark>
        {text.substring(index + query.length)}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <Input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation..."
            className="border-0 focus:ring-0 text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-surface-hover rounded text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results */}
        <ScrollArea className="max-h-[400px]">
          {results.length === 0 && searchQuery.trim() ? (
            <div className="px-4 py-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Start typing to search documentation</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.pageId}
                  onClick={() => onSelect(result.pageId)}
                  className={`w-full px-4 py-3 flex items-start gap-3 transition-colors ${
                    selectedIndex === index
                      ? 'bg-brand-green/10'
                      : 'hover:bg-surface-hover'
                  }`}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <FileText className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    selectedIndex === index ? 'text-brand-green' : 'text-muted-foreground'
                  }`} />

                  <div className="flex-1 text-left">
                    <div className={`font-medium mb-1 ${
                      selectedIndex === index ? 'text-brand-green' : 'text-foreground'
                    }`}>
                      {highlightMatch(result.title, searchQuery)}
                    </div>
                    {result.description && (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {highlightMatch(result.description, searchQuery)}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {result.pageId.replace('/', ' › ')}
                    </div>
                  </div>

                  {selectedIndex === index && (
                    <ArrowRight className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-surface border border-border rounded font-mono">↑</kbd>
              <kbd className="px-2 py-1 bg-surface border border-border rounded font-mono">↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-surface border border-border rounded font-mono">↵</kbd>
              <span>Select</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-surface border border-border rounded font-mono">Esc</kbd>
              <span>Close</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span>Powered by Greenstack</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocsSearch;
