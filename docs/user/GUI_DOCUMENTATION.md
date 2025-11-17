# Greenstack - Web Interface Documentation

## 🎨 GUI Overview

The Greenstack features a stunning, modern web interface with advanced visualizations, real-time updates, and an intuitive user experience. The interface is available in two versions:

1. **Vue.js Version** - Lightweight, single-file implementation
2. **React Version** - Advanced dashboard with 3D visualizations

## 🚀 Quick Start

### One-Command Launch

```bash
# Start everything with one command
python start.py

# Options:
python start.py --create-shortcut  # Creates desktop shortcut
python start.py --no-browser       # Don't open browser automatically
python start.py --api-only         # Start only API server
python start.py --frontend-only    # Start only frontend
```

The system will:
1. Check and install dependencies
2. Start the API server (port 8000)
3. Start the web server (port 5173)
4. Open your browser automatically

## 🖥️ Interface Features

### Dashboard View

#### Key Metrics Cards
- **Total Devices**: Live count with trend indicator
- **Parameters**: Total parameters across all devices
- **Storage Size**: Total storage used by IODD files

#### Visualizations
- **Activity Chart**: Line graph showing device imports over time
- **3D Device Preview**: Interactive 3D model of selected device
- **Network Topology**: Visual representation of device connections

#### Quick Actions Panel
- One-click upload button
- Device browser shortcut
- System refresh control

### Device Library

#### Advanced Search & Filtering
- Real-time search across device names, manufacturers, and IDs
- Category-based filtering
- Sort by import date, name, or ID

#### Device Cards
Each device displays:
- Product name with gradient highlighting
- Manufacturer information
- Version badge with glow effect
- Device and Vendor IDs
- Import date
- Parameter count
- Quick action buttons (View, Export, Delete)

#### Device Details Modal
- **Information Tab**: Complete device specifications
- **Parameters Tab**: Interactive table with access rights badges
- **Menus Tab**: Interactive configuration interface with parameter controls
- **Actions Tab**: Export and delete options

### Interactive Menus Interface

#### Configuration Features
- Full IODD menu structure rendering
- Type-specific controls (dropdowns, sliders, checkboxes, text inputs)
- Real-time validation with inline error display
- Parameter details panel with copy-to-clipboard support
- Configuration export as JSON files

### Analytics Dashboard

#### Advanced Charts
- **Device Distribution**: Visual comparison of device types
- **Network Topology 3D**: Interactive device network visualization
- **Heat Map**: Parameter distribution across devices
- **Time Series**: Historical activity tracking

## 🎯 Visual Design Elements

### Color Scheme
- **Primary**: Cyan (#00d4ff) - Main actions and highlights
- **Secondary**: Purple (#667eea) - Secondary elements
- **Success**: Green (#51cf66) - Successful operations
- **Warning**: Yellow (#ffd43b) - Warnings and pending
- **Danger**: Red (#ff6b6b) - Destructive actions
- **Dark Background**: Deep navy (#0a0e27) with gradient overlays

### Animations & Effects
- **Glassmorphism**: Frosted glass effect on cards
- **Gradient Animations**: Animated background meshes
- **Hover Effects**: 3D transforms and glow effects
- **Loading States**: Animated spinners and progress bars
- **Transitions**: Smooth page transitions with Framer Motion

### Interactive Elements
- **Drag & Drop Upload**: Visual feedback zone
- **3D Visualizations**: Using Three.js for device models
- **Real-time Updates**: WebSocket-ready architecture
- **Toast Notifications**: Non-intrusive status updates
- **Tooltips**: Contextual help on hover

## 🛠️ Technical Implementation

### Vue.js Version (index.html)
Single-file implementation with:
- No build step required
- CDN-based dependencies
- Instant deployment
- Responsive design
- Chart.js integration

### React Version (IODDDashboard.jsx)
Advanced implementation featuring:
- Component-based architecture
- State management with hooks
- Three.js 3D graphics
- Nivo charts for data visualization
- Tailwind CSS for styling
- shadcn/ui components

## 📦 File Structure

```
frontend/
├── src/
│   ├── App.jsx                # Main React application
│   ├── components/            # Reusable UI components
│   ├── main.jsx              # Application entry point
│   └── index.css             # Styles
├── package.json              # Dependencies and scripts
└── vite.config.js            # Vite configuration
```

## 🔧 Configuration

### API Connection
The frontend automatically connects to the API server. The API base URL can be configured:

```javascript
// Default configuration
const API_BASE = 'http://localhost:8000';
```

### Port Configuration
```bash
# Custom ports via environment variables
API_PORT=8080
FRONTEND_PORT=3001
```

## 🎨 Customization

### Theme Customization

#### Colors
Edit the CSS variables in your stylesheet:
```css
:root {
    --primary: #00d4ff;        /* Your primary color */
    --primary-dark: #00a8cc;    /* Darker variant */
    --secondary: #ff6b6b;       /* Secondary color */
}
```

#### Tailwind Theme
Modify `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "#00d4ff",
        // Add your custom shades
      }
    }
  }
}
```

### Adding New Visualizations

1. **Add Chart Component**:
```javascript
import { ResponsiveBar } from '@nivo/bar';

const MyChart = ({ data }) => (
  <ResponsiveBar
    data={data}
    // Chart configuration
  />
);
```

2. **Add 3D Model**:
```javascript
const Custom3D = () => {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#00d4ff" />
    </mesh>
  );
};
```

## 📱 Responsive Design

The interface is fully responsive with breakpoints:
- **Mobile**: < 768px (single column layout)
- **Tablet**: 768px - 1024px (two column layout)
- **Desktop**: > 1024px (full multi-column layout)

### Mobile Optimizations
- Collapsible navigation
- Touch-friendly buttons
- Swipeable tabs
- Optimized card layouts
- Bottom sheet modals

## 🚦 Performance Features

- **Lazy Loading**: Components load on demand
- **Virtual Scrolling**: For large device lists
- **Debounced Search**: Reduces API calls
- **Memoization**: Prevents unnecessary re-renders
- **Code Splitting**: Separate bundles for different views

## 🔒 Security Features

- **Input Sanitization**: All user inputs are validated
- **CORS Configuration**: Proper cross-origin setup
- **File Type Validation**: Only .xml, .iodd, and .zip files accepted
- **Size Limits**: Maximum upload size enforced
- **Rate Limiting**: API call throttling

## 📊 Usage Analytics

The dashboard tracks:
- Device import frequency
- User activity patterns
- System performance metrics
- Storage utilization

## 🎯 Keyboard Shortcuts

- `Ctrl/Cmd + U`: Upload new IODD
- `Ctrl/Cmd + D`: View devices
- `Ctrl/Cmd + /`: Search focus
- `Esc`: Close modals

## 🌐 Browser Support

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support (WebGL enabled)
- **Mobile Browsers**: Optimized for touch

## 🔧 Troubleshooting

### Common Issues

1. **Blank Page**
   - Check if API server is running
   - Verify CORS settings
   - Check browser console for errors

2. **3D Graphics Not Loading**
   - Enable WebGL in browser
   - Update graphics drivers
   - Check GPU acceleration settings

3. **Upload Failing**
   - Verify file format (.xml, .iodd, or .zip)
   - Check file size (< 10MB)
   - Ensure API has write permissions

## 📝 Development

### Local Development Setup

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Adding Custom Components

1. Create component file
2. Import in main application
3. Add to routing/navigation
4. Update documentation

## 🎉 Tips & Tricks

1. **Quick Device Import**: Drag multiple IODD files directly onto the upload area
2. **Multi-File Upload**: Select multiple files in the file picker
3. **Export Device**: Download devices as properly formatted ZIP packages
4. **Performance Mode**: Add `?perf=true` to URL for simplified graphics

---

## 📧 Support

For issues or questions about the web interface:
1. Check browser console for errors
2. Review API logs
3. Verify network connectivity
4. Consult the [Troubleshooting Guide](../troubleshooting/TROUBLESHOOTING.md)

The web interface is designed to provide a professional, intuitive experience for managing IO-Link devices. Enjoy the beautiful visualizations and powerful features!
