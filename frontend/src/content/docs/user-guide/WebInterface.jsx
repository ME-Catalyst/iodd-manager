import React from 'react';
import { Monitor, Palette, Zap, Shield, Keyboard, Layout, Globe, Sparkles } from 'lucide-react';
import DocsPage from '../../../components/docs/DocsPage';
import DocsHero from '../../../components/docs/DocsHero';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCallout from '../../../components/docs/DocsCallout';
import { DocsParagraph, DocsList, DocsLink } from '../../../components/docs/DocsText';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import DocsTabs from '../../../components/docs/DocsTabs';
import DocsAccordion from '../../../components/docs/DocsAccordion';
import DocsSteps from '../../../components/docs/DocsSteps';

export const metadata = {
  id: 'user-guide/web-interface',
  title: 'Web Interface Guide',
  description: 'Complete guide to the Greenstack modern web interface with advanced visualizations and real-time updates',
  category: 'user-guide',
  order: 3,
  keywords: ['web interface', 'gui', 'dashboard', 'ui', 'frontend', 'visualization', '3d', 'analytics'],
  lastUpdated: '2025-01-17',
};

export default function WebInterface() {
  return (
    <DocsPage>
      <DocsHero
        title="Web Interface Guide"
        description="Modern, intuitive web interface with advanced visualizations, real-time updates, and powerful device management features"
        icon={<Monitor className="w-12 h-12 text-brand-green" />}
      />

      <DocsSection title="Overview">
        <DocsParagraph>
          Greenstack features a stunning, modern web interface designed for professional industrial IoT device management.
          The interface combines powerful functionality with beautiful design, making complex device operations intuitive and efficient.
        </DocsParagraph>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <div className="border border-border rounded-lg p-4 text-center">
            <Palette className="w-8 h-8 text-brand-green mx-auto mb-3" />
            <h4 className="font-semibold text-foreground mb-1">Modern Design</h4>
            <p className="text-xs text-muted-foreground">
              Dark theme with brand green accents and smooth animations
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 text-center">
            <Zap className="w-8 h-8 text-brand-green mx-auto mb-3" />
            <h4 className="font-semibold text-foreground mb-1">Real-Time Updates</h4>
            <p className="text-xs text-muted-foreground">
              Live metrics and instant feedback on all operations
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 text-center">
            <Layout className="w-8 h-8 text-brand-green mx-auto mb-3" />
            <h4 className="font-semibold text-foreground mb-1">Responsive</h4>
            <p className="text-xs text-muted-foreground">
              Fully responsive design for desktop, tablet, and mobile
            </p>
          </div>

          <div className="border border-border rounded-lg p-4 text-center">
            <Sparkles className="w-8 h-8 text-brand-green mx-auto mb-3" />
            <h4 className="font-semibold text-foreground mb-1">Interactive</h4>
            <p className="text-xs text-muted-foreground">
              Drag & drop uploads, 3D visualizations, and more
            </p>
          </div>
        </div>

        <DocsCallout type="success" title="Two Versions Available">
          <DocsParagraph>
            Greenstack includes both a lightweight Vue.js version (single-file, no build required) and an advanced
            React version with 3D visualizations and interactive charts.
          </DocsParagraph>
        </DocsCallout>
      </DocsSection>

      <DocsSection title="Quick Start">
        <DocsParagraph>
          Launch the complete Greenstack interface with a single command:
        </DocsParagraph>

        <DocsSteps
          steps={[
            {
              title: 'Start the Application',
              description: 'Use the unified startup script to launch both backend and frontend',
              content: (
                <DocsCodeBlock language="bash">
{`# Start everything with one command
python start.py

# The system will:
# 1. Check and install dependencies
# 2. Start the API server (port 8000)
# 3. Start the web server (port 3000)
# 4. Open your browser automatically`}
                </DocsCodeBlock>
              ),
            },
            {
              title: 'Access the Interface',
              description: 'Your browser will automatically open to the dashboard',
              content: (
                <div className="space-y-2">
                  <p className="text-sm text-foreground">The interface will be available at:</p>
                  <DocsCodeBlock language="text">
{`http://localhost:3000`}
                  </DocsCodeBlock>
                  <p className="text-xs text-muted-foreground">
                    If the browser doesn't open automatically, navigate to this URL manually.
                  </p>
                </div>
              ),
            },
            {
              title: 'Start Using',
              description: 'Begin managing your devices immediately',
              content: (
                <DocsParagraph>
                  You'll see the main dashboard with device metrics, quick actions, and analytics.
                  Start by uploading your first IODD file using the prominent upload button.
                </DocsParagraph>
              ),
            },
          ]}
          className="my-6"
        />

        <DocsAccordion
          items={[
            {
              title: 'Advanced Startup Options',
              content: (
                <DocsCodeBlock language="bash">
{`# Create desktop shortcut for easy access
python start.py --create-shortcut

# Don't open browser automatically
python start.py --no-browser

# Start only API server
python start.py --api-only

# Start only frontend
python start.py --frontend-only`}
                </DocsCodeBlock>
              ),
            },
          ]}
          className="my-4"
        />
      </DocsSection>

      <DocsSection title="Interface Features">
        <DocsParagraph>
          Explore the powerful features available in the Greenstack web interface.
        </DocsParagraph>

        <DocsTabs
          tabs={[
            {
              label: 'Dashboard',
              content: (
                <div className="space-y-4">
                  <DocsParagraph>
                    The main dashboard provides an at-a-glance overview of your device ecosystem.
                  </DocsParagraph>

                  <div className="space-y-3">
                    <div className="border border-border rounded-lg p-4">
                      <h5 className="font-semibold text-foreground mb-2">Key Metrics Cards</h5>
                      <DocsList
                        items={[
                          <span><strong>Total Devices</strong>: Live count with trend indicator showing growth or decline</span>,
                          <span><strong>Parameters</strong>: Total parameters across all devices for comprehensive monitoring</span>,
                          <span><strong>Storage Size</strong>: Total storage used by IODD files with visual indicator</span>,
                        ]}
                      />
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h5 className="font-semibold text-foreground mb-2">Visualizations</h5>
                      <DocsList
                        items={[
                          <span><strong>Activity Chart</strong>: Line graph showing device imports over time with trend analysis</span>,
                          <span><strong>Analytics Dashboard</strong>: Comprehensive charts for device distribution and usage patterns</span>,
                          <span><strong>Network Topology</strong>: Visual representation of device connections (React version)</span>,
                        ]}
                      />
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h5 className="font-semibold text-foreground mb-2">Quick Actions Panel</h5>
                      <DocsList
                        items={[
                          'One-click upload button with drag & drop support',
                          'Device browser shortcut for quick navigation',
                          'System refresh control for real-time updates',
                        ]}
                      />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: 'Device Library',
              content: (
                <div className="space-y-4">
                  <DocsParagraph>
                    Browse, search, and manage your complete IODD device library with advanced filtering and sorting.
                  </DocsParagraph>

                  <div className="space-y-3">
                    <div className="border border-border rounded-lg p-4">
                      <h5 className="font-semibold text-foreground mb-2">Search & Filtering</h5>
                      <DocsList
                        items={[
                          'Real-time search across device names, manufacturers, and IDs',
                          'Category-based filtering for quick access',
                          'Sort by import date, name, or device ID',
                          'Fuzzy search with typo tolerance',
                        ]}
                      />
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h5 className="font-semibold text-foreground mb-2">Device Cards</h5>
                      <p className="text-sm text-muted-foreground mb-2">Each device displays:</p>
                      <DocsList
                        items={[
                          'Product name with visual highlighting',
                          'Manufacturer information and logo',
                          'Version badge with status indicator',
                          'Device and Vendor IDs for identification',
                          'Import date and time',
                          'Parameter count for configuration complexity',
                          'Quick action buttons (View, Export, Delete)',
                        ]}
                      />
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h5 className="font-semibold text-foreground mb-2">Device Details Modal</h5>
                      <p className="text-sm text-muted-foreground mb-2">Comprehensive device information in tabbed interface:</p>
                      <DocsList
                        items={[
                          <span><strong>Information Tab</strong>: Complete device specifications and metadata</span>,
                          <span><strong>Parameters Tab</strong>: Interactive table with access rights badges and data types</span>,
                          <span><strong>Menus Tab</strong>: Interactive configuration interface with live parameter controls</span>,
                          <span><strong>Actions Tab</strong>: Export configurations and manage device lifecycle</span>,
                        ]}
                      />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: 'Interactive Menus',
              content: (
                <div className="space-y-4">
                  <DocsParagraph>
                    Powerful configuration interface that renders complete IODD menu structures with type-specific controls.
                  </DocsParagraph>

                  <DocsCallout type="info" title="Live Configuration">
                    <DocsParagraph>
                      The menus interface provides a live, interactive representation of device configuration options
                      exactly as defined in the IODD files.
                    </DocsParagraph>
                  </DocsCallout>

                  <div className="space-y-3 mt-4">
                    <div className="border border-border rounded-lg p-4">
                      <h5 className="font-semibold text-foreground mb-2">Configuration Features</h5>
                      <DocsList
                        items={[
                          'Full IODD menu structure rendering with nested hierarchies',
                          'Type-specific controls: dropdowns, sliders, checkboxes, text inputs',
                          'Real-time validation with inline error display',
                          'Parameter details panel with copy-to-clipboard support',
                          'Configuration export as JSON files',
                          'Access rights visualization (read-only, read-write, write-only)',
                        ]}
                      />
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h5 className="font-semibold text-foreground mb-2">Supported Parameter Types</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><code className="text-brand-green">Integer</code> - Numeric sliders and inputs</div>
                        <div><code className="text-brand-green">Boolean</code> - Toggle switches</div>
                        <div><code className="text-brand-green">String</code> - Text input fields</div>
                        <div><code className="text-brand-green">Enum</code> - Dropdown selectors</div>
                        <div><code className="text-brand-green">Float</code> - Decimal number inputs</div>
                        <div><code className="text-brand-green">Array</code> - List editors</div>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              label: 'Analytics',
              content: (
                <div className="space-y-4">
                  <DocsParagraph>
                    Comprehensive analytics dashboard with interactive charts and visualizations to track device usage
                    and system performance.
                  </DocsParagraph>

                  <div className="space-y-3">
                    <div className="border border-border rounded-lg p-4">
                      <h5 className="font-semibold text-foreground mb-2">Available Charts</h5>
                      <DocsList
                        items={[
                          <span><strong>Device Distribution</strong>: Visual comparison of device types and manufacturers</span>,
                          <span><strong>Time Series</strong>: Historical activity tracking and import patterns</span>,
                          <span><strong>Heat Map</strong>: Parameter distribution across device categories</span>,
                          <span><strong>Network Topology</strong>: Interactive 3D visualization of device connections (React version)</span>,
                        ]}
                      />
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h5 className="font-semibold text-foreground mb-2">Tracked Metrics</h5>
                      <DocsList
                        items={[
                          'Device import frequency and trends',
                          'User activity patterns and peak usage times',
                          'System performance metrics and response times',
                          'Storage utilization and growth projections',
                        ]}
                      />
                    </div>
                  </div>
                </div>
              ),
            },
          ]}
          className="my-6"
        />
      </DocsSection>

      <DocsSection title="Visual Design">
        <DocsParagraph>
          Greenstack features a modern, professional design system with carefully chosen colors and effects.
        </DocsParagraph>

        <div className="my-6 space-y-4">
          <div className="border border-border rounded-lg p-4">
            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Palette className="w-5 h-5 text-brand-green" />
              Color Scheme
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-brand-green border border-border"></div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Brand Green</p>
                  <code className="text-xs text-muted-foreground">#3DB60F</code>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-blue-500 border border-border"></div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Info Blue</p>
                  <code className="text-xs text-muted-foreground">#3b82f6</code>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-green-500 border border-border"></div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Success</p>
                  <code className="text-xs text-muted-foreground">#51cf66</code>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-yellow-500 border border-border"></div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Warning</p>
                  <code className="text-xs text-muted-foreground">#ffd43b</code>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-red-500 border border-border"></div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Danger</p>
                  <code className="text-xs text-muted-foreground">#ff6b6b</code>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-background border border-border"></div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Background</p>
                  <code className="text-xs text-muted-foreground">Theme</code>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4">
            <h5 className="font-semibold text-foreground mb-3">Animations & Effects</h5>
            <DocsList
              items={[
                <span><strong>Smooth Transitions</strong>: All state changes animate smoothly for better UX</span>,
                <span><strong>Hover Effects</strong>: Interactive elements respond to mouse hover with visual feedback</span>,
                <span><strong>Loading States</strong>: Animated spinners and progress bars for async operations</span>,
                <span><strong>Toast Notifications</strong>: Non-intrusive status updates that auto-dismiss</span>,
                <span><strong>Modal Animations</strong>: Smooth fade and scale effects for dialogs</span>,
              ]}
            />
          </div>

          <div className="border border-border rounded-lg p-4">
            <h5 className="font-semibold text-foreground mb-3">Interactive Elements</h5>
            <DocsList
              items={[
                'Drag & drop upload zones with visual feedback',
                'Tooltips providing contextual help on hover',
                'Interactive charts with zoom and pan capabilities',
                'Collapsible sections for information density control',
                'Keyboard navigation support throughout',
              ]}
            />
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Responsive Design">
        <DocsParagraph>
          The interface is fully responsive and optimized for all screen sizes, from mobile phones to large desktop displays.
        </DocsParagraph>

        <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-border rounded-lg p-4">
            <h5 className="font-semibold text-foreground mb-2">Mobile</h5>
            <code className="text-xs text-brand-green">&lt; 768px</code>
            <DocsList
              items={[
                'Single column layout',
                'Touch-friendly buttons',
                'Bottom sheet modals',
                'Collapsible navigation',
              ]}
              className="mt-3 text-sm"
            />
          </div>

          <div className="border border-border rounded-lg p-4">
            <h5 className="font-semibold text-foreground mb-2">Tablet</h5>
            <code className="text-xs text-brand-green">768px - 1024px</code>
            <DocsList
              items={[
                'Two column layout',
                'Adaptive card grids',
                'Side panel modals',
                'Touch optimized',
              ]}
              className="mt-3 text-sm"
            />
          </div>

          <div className="border border-border rounded-lg p-4">
            <h5 className="font-semibold text-foreground mb-2">Desktop</h5>
            <code className="text-xs text-brand-green">&gt; 1024px</code>
            <DocsList
              items={[
                'Multi-column layout',
                'Full feature set',
                'Large visualizations',
                'Keyboard shortcuts',
              ]}
              className="mt-3 text-sm"
            />
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Keyboard Shortcuts">
        <DocsParagraph>
          Power users can navigate and control the interface using keyboard shortcuts.
        </DocsParagraph>

        <div className="my-6 border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-surface/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Shortcut</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-surface-hover transition-colors">
                <td className="py-3 px-4">
                  <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs font-mono">
                    Ctrl/Cmd + U
                  </kbd>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Upload new IODD file</td>
              </tr>
              <tr className="hover:bg-surface-hover transition-colors">
                <td className="py-3 px-4">
                  <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs font-mono">
                    Ctrl/Cmd + D
                  </kbd>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">View devices library</td>
              </tr>
              <tr className="hover:bg-surface-hover transition-colors">
                <td className="py-3 px-4">
                  <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs font-mono">
                    Ctrl/Cmd + /
                  </kbd>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Focus search bar</td>
              </tr>
              <tr className="hover:bg-surface-hover transition-colors">
                <td className="py-3 px-4">
                  <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs font-mono">
                    Esc
                  </kbd>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">Close modals and dialogs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocsSection>

      <DocsSection title="Performance Features">
        <DocsParagraph>
          The interface is optimized for performance even with large device libraries.
        </DocsParagraph>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="border border-border rounded-lg p-4">
            <Zap className="w-8 h-8 text-brand-green mb-3" />
            <h5 className="font-semibold text-foreground mb-2">Optimizations</h5>
            <DocsList
              items={[
                'Lazy loading for components',
                'Virtual scrolling for large lists',
                'Debounced search queries',
                'Code splitting for faster loads',
              ]}
              className="text-sm"
            />
          </div>

          <div className="border border-border rounded-lg p-4">
            <Shield className="w-8 h-8 text-brand-green mb-3" />
            <h5 className="font-semibold text-foreground mb-2">Security</h5>
            <DocsList
              items={[
                'Input sanitization on all forms',
                'File type validation',
                'Size limits enforced',
                'CORS properly configured',
              ]}
              className="text-sm"
            />
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Browser Support">
        <DocsParagraph>
          Greenstack is tested and fully supported on all modern browsers.
        </DocsParagraph>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Globe className="w-6 h-6 text-brand-green" />
            <div>
              <p className="font-semibold text-sm text-foreground">Chrome / Edge</p>
              <p className="text-xs text-brand-green">Full support (Recommended)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Globe className="w-6 h-6 text-brand-green" />
            <div>
              <p className="font-semibold text-sm text-foreground">Firefox</p>
              <p className="text-xs text-brand-green">Full support</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Globe className="w-6 h-6 text-brand-green" />
            <div>
              <p className="font-semibold text-sm text-foreground">Safari</p>
              <p className="text-xs text-brand-green">Full support (WebGL enabled)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
            <Globe className="w-6 h-6 text-brand-green" />
            <div>
              <p className="font-semibold text-sm text-foreground">Mobile Browsers</p>
              <p className="text-xs text-brand-green">Optimized for touch</p>
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Troubleshooting">
        <DocsAccordion
          items={[
            {
              title: 'Blank Page or Loading Forever',
              content: (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Problem: Interface won't load or shows blank page</p>
                  <DocsCallout type="warning" title="Common Causes">
                    <DocsList
                      items={[
                        'API server not running - check http://localhost:8000/health',
                        'CORS configuration blocking requests',
                        'Browser console showing JavaScript errors',
                        'Network firewall blocking connections',
                      ]}
                    />
                  </DocsCallout>
                  <DocsCallout type="success" title="Solutions">
                    <DocsCodeBlock language="bash">
{`# 1. Verify API is running
curl http://localhost:8000/health

# 2. Check CORS settings in .env
CORS_ORIGINS=http://localhost:3000

# 3. Clear browser cache
Ctrl+Shift+Delete (Chrome/Edge)

# 4. Check browser console (F12)
# Look for errors in Console tab`}
                    </DocsCodeBlock>
                  </DocsCallout>
                </div>
              ),
            },
            {
              title: 'Upload Failing',
              content: (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Problem: File uploads not working</p>
                  <DocsList
                    items={[
                      'Verify file format: only .xml, .iodd, and .zip files are accepted',
                      'Check file size: must be less than 10MB (configurable)',
                      'Ensure API has write permissions to storage directory',
                      'Check API logs for detailed error messages',
                    ]}
                  />
                  <DocsCodeBlock language="bash" title="Check Upload Configuration">
{`# Verify storage directory exists and is writable
ls -la ./iodd_storage

# Check maximum upload size in .env
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes

# View recent API logs
tail -f logs/greenstack.log`}
                  </DocsCodeBlock>
                </div>
              ),
            },
            {
              title: 'Slow Performance',
              content: (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Problem: Interface feels slow or laggy</p>
                  <DocsCallout type="tip" title="Performance Tips">
                    <DocsList
                      items={[
                        'Clear browser cache and reload',
                        'Disable browser extensions that may interfere',
                        'Use Chrome/Edge for best performance',
                        'Check if other applications are consuming resources',
                        'For large device libraries (100+ devices), consider pagination',
                      ]}
                    />
                  </DocsCallout>
                </div>
              ),
            },
          ]}
          className="my-6"
        />
      </DocsSection>

      <DocsSection title="Tips & Tricks">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <DocsCallout type="tip" title="Quick Multi-Upload">
            <DocsParagraph>
              Drag multiple IODD files directly onto the upload area or select multiple files in the file picker
              to batch import devices.
            </DocsParagraph>
          </DocsCallout>

          <DocsCallout type="tip" title="Keyboard Navigation">
            <DocsParagraph>
              Use Tab to navigate between interactive elements, Enter to activate buttons, and Esc to close
              modals for faster navigation.
            </DocsParagraph>
          </DocsCallout>

          <DocsCallout type="tip" title="Search Shortcuts">
            <DocsParagraph>
              The search supports fuzzy matching - you don't need exact spellings. Try "ifm" to find "IFM Electronic"
              devices.
            </DocsParagraph>
          </DocsCallout>

          <DocsCallout type="tip" title="Export Devices">
            <DocsParagraph>
              Download devices as properly formatted ZIP packages that can be shared or imported into other
              Greenstack instances.
            </DocsParagraph>
          </DocsCallout>
        </div>
      </DocsSection>

      <DocsSection title="Customization">
        <DocsParagraph>
          Advanced users can customize the interface theme and colors through the theme management system.
        </DocsParagraph>

        <DocsCallout type="info" title="Theme Customization">
          <DocsParagraph>
            Visit the <DocsLink href="/theme-manager" external={false}>Theme Manager</DocsLink> to customize colors,
            create custom themes, and export your theme configurations.
          </DocsParagraph>
        </DocsCallout>

        <DocsCodeBlock language="javascript" title="Custom Theme Example" className="my-4">
{`// Custom theme configuration
{
  "name": "My Custom Theme",
  "colors": {
    "primary": "#3DB60F",     // Brand green
    "background": "#0a0a0a",  // Dark background
    "surface": "#1a1a1a",     // Card background
    "foreground": "#ffffff"   // Text color
  }
}`}
        </DocsCodeBlock>

        <DocsParagraph className="mt-4">
          For more details on theme customization, see the <DocsLink href="/docs/components/theme-manager" external={false}>
          Theme Manager Documentation</DocsLink>.
        </DocsParagraph>
      </DocsSection>

      <DocsSection title="Next Steps">
        <DocsParagraph>
          Now that you're familiar with the web interface, explore these related topics:
        </DocsParagraph>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-6">
          <DocsLink href="/docs/getting-started/quick-start" external={false} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Quick Start Guide</h5>
            <p className="text-sm text-muted-foreground">Get started with Greenstack in minutes</p>
          </DocsLink>

          <DocsLink href="/docs/user-guide/configuration" external={false} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Configuration</h5>
            <p className="text-sm text-muted-foreground">Configure Greenstack for your environment</p>
          </DocsLink>

          <DocsLink href="/docs/api/overview" external={false} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">API Documentation</h5>
            <p className="text-sm text-muted-foreground">Learn about the REST API</p>
          </DocsLink>

          <DocsLink href="/theme-manager" external={false} className="block border border-border rounded-lg p-4 hover:border-brand-green transition-colors">
            <h5 className="font-semibold text-foreground mb-1">Theme Manager</h5>
            <p className="text-sm text-muted-foreground">Customize the interface appearance</p>
          </DocsLink>
        </div>
      </DocsSection>
    </DocsPage>
  );
}
