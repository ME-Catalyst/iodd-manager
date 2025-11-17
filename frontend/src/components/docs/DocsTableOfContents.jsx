import React, { useState, useEffect } from 'react';
import { List, ExternalLink } from 'lucide-react';
import { ScrollArea } from '../ui';

/**
 * DocsTableOfContents - Right Sidebar TOC
 *
 * Features:
 * - Auto-generated from page headings
 * - Active section highlighting
 * - Smooth scroll to sections
 * - Nested heading levels
 */

const DocsTableOfContents = ({ page, activePage }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  // Extract headings from rendered content
  useEffect(() => {
    const extractHeadings = () => {
      const elements = document.querySelectorAll('.docs-content h2, .docs-content h3');
      const extracted = Array.from(elements).map(el => ({
        id: el.id || el.textContent.toLowerCase().replace(/\s+/g, '-'),
        text: el.textContent,
        level: parseInt(el.tagName[1])
      }));
      setHeadings(extracted);
    };

    // Small delay to ensure content is rendered
    const timeout = setTimeout(extractHeadings, 100);
    return () => clearTimeout(timeout);
  }, [activePage]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings.map(h => {
        const el = document.getElementById(h.id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return { id: h.id, top: rect.top };
      }).filter(Boolean);

      // Find the heading closest to the top of the viewport
      const active = headingElements.find(h => h.top >= 0 && h.top <= 200) ||
                     headingElements[headingElements.length - 1];

      if (active) {
        setActiveId(active.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headings]);

  // Scroll to heading
  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for fixed header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <List className="w-4 h-4 text-brand-green" />
          <h3 className="font-semibold text-sm text-foreground">On This Page</h3>
        </div>
      </div>

      {/* TOC List */}
      <ScrollArea className="flex-1 p-4">
        <nav className="space-y-2">
          {headings.map(heading => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={`block w-full text-left text-sm transition-colors ${
                activeId === heading.id
                  ? 'text-brand-green font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              } ${heading.level === 3 ? 'pl-4' : ''}`}
            >
              {heading.text}
            </button>
          ))}
        </nav>
      </ScrollArea>

      {/* Related Links */}
      {page?.metadata?.relatedLinks && page.metadata.relatedLinks.length > 0 && (
        <div className="p-4 border-t border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
            Related Pages
          </h4>
          <div className="space-y-1">
            {page.metadata.relatedLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="flex items-center gap-1 text-sm text-brand-green hover:underline"
              >
                <span>{link.title}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocsTableOfContents;
