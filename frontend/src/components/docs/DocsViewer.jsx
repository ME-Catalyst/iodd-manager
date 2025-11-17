import React, { useState, useEffect } from 'react';
import { Book, Search, Menu, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DocsNavigation from './DocsNavigation';
import DocsContent from './DocsContent';
import DocsTableOfContents from './DocsTableOfContents';
import DocsSearch from './DocsSearch';
import DocsBreadcrumb from './DocsBreadcrumb';
import { docsRegistry } from '../../content/docs/index';

/**
 * DocsViewer - Main Documentation Viewer Component
 *
 * Features:
 * - Three-column layout: Navigation | Content | Table of Contents
 * - Responsive design (collapse sidebars on mobile)
 * - Integrated search (Ctrl+K)
 * - Smooth page transitions
 * - Breadcrumb navigation
 * - Theme-aware styling
 */
const DocsViewer = ({ onClose }) => {
  const [activePage, setActivePage] = useState('getting-started/quick-start');
  const [showSearch, setShowSearch] = useState(false);
  const [showNav, setShowNav] = useState(false); // Mobile nav toggle
  const [showToc, setShowToc] = useState(true); // Desktop TOC toggle
  const [searchQuery, setSearchQuery] = useState('');

  // Get current page data
  const currentPage = docsRegistry[activePage];

  // Handle keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle page navigation
  const handleNavigate = (pageId) => {
    setActivePage(pageId);
    setShowNav(false); // Close mobile nav after selection
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search result selection
  const handleSearchSelect = (pageId) => {
    handleNavigate(pageId);
    setShowSearch(false);
    setSearchQuery('');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-hover rounded-lg text-muted-foreground"
              title="Back to app"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Book className="w-5 h-5 text-brand-green" />
          <span className="font-semibold text-foreground">Documentation</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 hover:bg-surface-hover rounded-lg text-muted-foreground"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowNav(!showNav)}
            className="p-2 hover:bg-surface-hover rounded-lg text-muted-foreground"
          >
            {showNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Left Sidebar - Navigation */}
      <AnimatePresence>
        {(showNav || window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed lg:relative top-16 lg:top-0 left-0 w-72 h-[calc(100vh-4rem)] lg:h-screen bg-surface border-r border-border z-30 overflow-hidden"
          >
            <DocsNavigation
              activePage={activePage}
              onNavigate={handleNavigate}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        {/* Breadcrumb */}
        <div className="hidden lg:block border-b border-border bg-surface">
          <div className="max-w-5xl mx-auto px-8 py-3 flex items-center gap-4">
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-hover rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                title="Back to app"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </button>
            )}
            <DocsBreadcrumb activePage={activePage} />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DocsContent
                  page={currentPage}
                  activePage={activePage}
                  onNavigate={handleNavigate}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Table of Contents */}
      {showToc && (
        <aside className="hidden xl:block w-64 h-screen bg-surface border-l border-border overflow-hidden">
          <DocsTableOfContents
            page={currentPage}
            activePage={activePage}
          />
        </aside>
      )}

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <DocsSearch
            isOpen={showSearch}
            onClose={() => setShowSearch(false)}
            onSelect={handleSearchSelect}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      {showNav && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-20 top-16"
          onClick={() => setShowNav(false)}
        />
      )}
    </div>
  );
};

export default DocsViewer;
