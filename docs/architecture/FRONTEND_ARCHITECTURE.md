# Frontend Architecture

## Overview

The GreenStack frontend is a modern React 18 application built with Vite, featuring a component-based architecture with advanced state management, theming, and user interaction patterns.

## Technology Stack

- **React 18.2** - UI library with hooks and functional components
- **Vite 4.5** - Fast build tool and dev server
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library for smooth transitions
- **Chart.js** - Data visualization library
- **Three.js** - 3D graphics rendering
- **Axios** - HTTP client for API requests
- **Lucide React** - Icon library

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (Button, Card, etc.)
│   │   ├── AnalyticsDashboard.jsx
│   │   ├── ComparisonView.jsx
│   │   ├── EDSDetailsView.jsx
│   │   ├── KeyboardShortcutsHelp.jsx
│   │   ├── SearchPage.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── TicketSystem/
│   ├── contexts/         # React contexts
│   │   └── ThemeContext.jsx
│   ├── hooks/            # Custom React hooks
│   │   └── useKeyboardShortcuts.js
│   ├── utils/            # Utility functions
│   │   ├── iolinkConstants.js
│   │   └── iolinkUnits.js
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## Core Components

### Main Application (App.jsx)

The root component managing application state and routing.

**Key Features:**
- Sidebar navigation with collapsible menu
- View-based routing (devices, overview, search, compare, analytics)
- Global state management for devices, EDS files, and statistics
- File upload handling (IODD and EDS)
- Toast notifications
- Keyboard shortcut integration

**State Management:**
```javascript
const [activeView, setActiveView] = useState('devices');
const [devices, setDevices] = useState([]);
const [edsFiles, setEdsFiles] = useState([]);
const [selectedDevice, setSelectedDevice] = useState(null);
const [selectedEds, setSelectedEds] = useState(null);
const [stats, setStats] = useState({ ... });
const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
```

### Theme System

#### ThemeContext (contexts/ThemeContext.jsx)

**Features:**
- System preference detection via `prefers-color-scheme`
- localStorage persistence
- Manual theme override
- Automatic DOM class manipulation

**API:**
```javascript
const { theme, toggleTheme, setTheme } = useTheme();
```

**Implementation Details:**
- Detects system preference on initial load
- Saves user preference to `iodd-manager-theme` in localStorage
- Applies theme class (`light` or `dark`) to document root
- Listens for system preference changes

#### ThemeToggle Component

Animated toggle button with smooth transitions between Sun and Moon icons.

### Keyboard Shortcuts System

#### useKeyboardShortcuts Hook

**Features:**
- Modifier key support (Ctrl, Shift, Alt, Meta)
- Input field awareness
- Configurable shortcuts
- Format helper for display

**Usage:**
```javascript
useKeyboardShortcuts([
  {
    key: 'h',
    ctrl: false,
    callback: () => setActiveView('overview'),
    description: 'Go to Overview',
  }
]);
```

**Predefined Shortcuts:**
- **Navigation**: `h` (Overview), `d` (Devices), `s` (Search), `c` (Compare), `a` (Analytics)
- **Actions**: `Ctrl+U` (Upload), `Ctrl+Shift+T` (Toggle Theme), `Ctrl+R` (Refresh)
- **Help**: `Shift+?` (Show keyboard shortcuts)

#### KeyboardShortcutsHelp Component

Modal displaying all available shortcuts, categorized by function.

**Features:**
- Categorized shortcut list
- Visual `<kbd>` elements
- Dark theme styling
- Dismissible overlay

### Analytics Dashboard

#### AnalyticsDashboard Component

**Features:**
- Summary metrics cards with trend indicators
- Multi-tab interface (Overview, Devices, Parameters, EDS)
- Chart.js integration for visualizations
- Time range selector

**Chart Types:**
- **Bar Charts**: Manufacturer distribution, vendor distribution
- **Doughnut Charts**: I/O type distribution
- **Pie Charts**: Data type distribution

**Data Processing:**
```javascript
// Manufacturer distribution
const manufacturerCounts = {};
devices.forEach((device) => {
  const mfg = device.manufacturer || 'Unknown';
  manufacturerCounts[mfg] = (manufacturerCounts[mfg] || 0) + 1;
});
```

### Device Details Views

#### EDS Details View

Comprehensive tabbed interface for EtherNet/IP device information.

**Tabs:**
1. **Overview**: Device metadata, diagnostics
2. **Parameters**: Searchable parameter table
3. **Connections**: Network configurations
4. **Capacity**: Visual capacity gauges
5. **Raw Content**: Full EDS file viewer

#### IODD Details View

Device information panel with:
- Parameter configuration
- Menu rendering
- Process data visualization
- 3D device models (Three.js)

### Search & Comparison

#### SearchPage Component

Advanced search with:
- Multi-field filtering
- Real-time results
- Device and EDS file search

#### ComparisonView Component

Side-by-side device comparison with:
- Parameter diff highlighting
- Specification comparison
- Visual indicators for differences

### UI Component Library

Located in `src/components/ui/`, built with Radix UI primitives:

- **Button**: Variants (default, ghost, outline), sizes (sm, md, lg)
- **Card**: Container with header, content, footer sections
- **Dialog**: Modal dialogs with overlay
- **Tabs**: Tabbed interfaces
- **Select**: Dropdown selects
- **Input**: Form inputs with validation
- **Badge**: Status indicators
- **Progress**: Progress bars
- **Skeleton**: Loading placeholders
- **Toast**: Notification system
- **ScrollArea**: Custom scrollbars

## State Management Patterns

### Local Component State

Used for UI-specific state (modals, tabs, filters):

```javascript
const [showModal, setShowModal] = useState(false);
const [activeTab, setActiveTab] = useState('overview');
```

### Context API

Used for global application state:

**ThemeContext:**
- Theme preference (light/dark)
- Theme toggle function

### Props Drilling

Data passed from App.jsx to child components:

```javascript
<AnalyticsDashboard
  devices={devices}
  edsFiles={edsFiles}
  stats={stats}
/>
```

## Styling System

### Tailwind CSS

Utility-first CSS framework with custom configuration.

**Dark Mode:**
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom color palette
      }
    }
  }
}
```

**Usage:**
```jsx
<div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
  Content
</div>
```

### CSS Modules

Used for component-specific styles when needed.

### Framer Motion

Animation library for:
- Page transitions
- Modal animations
- Element entrance/exit animations

**Example:**
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>
```

## Data Fetching

### Axios Integration

Centralized API client with base URL configuration.

**Patterns:**
```javascript
// GET request
const fetchDevices = async () => {
  const response = await axios.get(`${API_BASE}/api/devices`);
  setDevices(response.data);
};

// POST request with file upload
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  await axios.post(`${API_BASE}/api/upload`, formData);
};
```

### Error Handling

Toast notifications for user feedback:

```javascript
toast({
  title: 'Error',
  description: 'Failed to load devices',
  variant: 'destructive',
});
```

## Performance Optimizations

### Code Splitting

Vite automatically splits vendor chunks for optimal loading.

### Memoization

```javascript
const filteredDevices = useMemo(() => {
  return devices.filter(device =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [devices, searchQuery]);
```

### Lazy Loading

Images and heavy components loaded on demand.

## Build Configuration

### Vite Config

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'ui-vendor': ['@radix-ui/react-dialog', ...],
        }
      }
    }
  }
});
```

## Development Workflow

### Local Development

```bash
cd frontend
npm install
npm run dev
```

Access at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

Output in `frontend/dist/`

### Testing

```bash
npm run lint
```

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management in modals
- Screen reader compatibility
- High contrast theme support

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- Redux/Zustand for complex state management
- React Query for server state caching
- Progressive Web App (PWA) support
- Offline mode
- Real-time updates via WebSockets
- E2E testing with Playwright/Cypress
