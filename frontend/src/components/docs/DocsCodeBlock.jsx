import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * DocsCodeBlock - Syntax-highlighted code block with copy functionality
 *
 * Features:
 * - Syntax highlighting (basic for now, can be enhanced with Prism.js later)
 * - One-click copy to clipboard
 * - Language badge
 * - Line numbers (optional)
 * - Theme-aware styling
 *
 * @param {Object} props
 * @param {string} props.children - Code content
 * @param {string} props.language - Programming language for syntax highlighting
 * @param {boolean} props.copy - Show copy button (default: true)
 * @param {boolean} props.lineNumbers - Show line numbers (default: false)
 * @param {string} props.title - Optional code block title
 * @param {string} props.className - Additional CSS classes
 */
const DocsCodeBlock = ({
  children,
  language = 'text',
  copy = true,
  lineNumbers = false,
  title,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lines = children.split('\n');

  return (
    <div className={`docs-code-block mb-6 ${className}`}>
      {/* Header with language badge and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border border-border rounded-t-lg">
        <div className="flex items-center gap-2">
          {title && (
            <span className="text-sm font-medium text-foreground">{title}</span>
          )}
          <span className="px-2 py-0.5 text-xs font-mono bg-brand-green/10 text-brand-green rounded border border-brand-green/20">
            {language}
          </span>
        </div>
        {copy && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-surface-hover"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-brand-green" />
                <span className="text-brand-green">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Code content */}
      <div className="relative overflow-x-auto bg-surface/50 border-x border-b border-border rounded-b-lg">
        <pre className="p-4 m-0 font-mono text-sm leading-relaxed">
          <code className="text-foreground">
            {lineNumbers ? (
              <table className="border-collapse w-full">
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td className="pr-4 text-right text-muted-foreground select-none border-r border-border/50">
                        {index + 1}
                      </td>
                      <td className="pl-4">
                        {line || '\n'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              children
            )}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default DocsCodeBlock;
