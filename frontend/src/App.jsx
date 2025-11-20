import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription,
  Button, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Progress, Skeleton,
  Toaster, useToast,
} from '@/components/ui';
import {
  Upload, Download, FileCode, Cpu, Settings, Trash2, Code2,
  Activity, Database, Package, Zap, ChevronRight, Search, Filter,
  BarChart3, Home, ChevronLeft, Star, Calendar,
  Grid3x3, List, Image as ImageIcon, ArrowLeft, ExternalLink, Copy,
  AlertTriangle, Radio, ArrowRightLeft, FileText, Lock, Wrench, Monitor,
  Wifi, Menu, Info, Type, Command, RotateCcw,
  AlertCircle, Network, Server, Cable, Clock, Layers, GitBranch,
  CheckCircle, FolderOpen,
  Workflow, LineChart, Book, Palette, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import EDSDetailsView from './components/EDSDetailsView';
import TicketButton from './components/TicketButton';
import TicketModal from './components/TicketModal';
import SearchPage from './components/SearchPage';
import ComparisonView from './components/ComparisonView';
import AdminConsole from './components/AdminConsole';
import MqttManager from './components/MqttManager';
import InfluxManager from './components/InfluxManager';
import NodeRedManager from './components/NodeRedManager';
import GrafanaManager from './components/GrafanaManager';
import ServicesAdmin from './components/ServicesAdmin';
import ThemeToggle from './components/ThemeToggle';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import DocsViewer from './components/docs/DocsViewer';
import EdsFilesListPage from './pages/EdsFilesListPage';
import { useKeyboardShortcuts, KEYBOARD_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { useTheme } from './contexts/ThemeContext';
import { getUnitInfo } from './utils/iolinkUnits';
import {
  translateBitrate,
  decodeProfileCharacteristics,
  getWireColorInfo,
  formatCycleTime,
  getAccessRightInfo,
  decodeMSequence,
  getConnectionTypeInfo
} from './utils/iolinkConstants';

// ============================================================================
// Helper Functions
// ============================================================================

// Format version string - strip leading 'v' or 'V' if present
const formatVersion = (version) => {
  if (!version) return '';
  const str = version.toString();
  return str.replace(/^[vV]/, '');
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';


// ============================================================================
// Sidebar Component
// ============================================================================

const Sidebar = ({ activeView, setActiveView, devices, edsFiles }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-background border-r border-border transition-all duration-300 z-50 ${collapsed ? 'w-16' : 'w-64'}`}
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <header className="px-4 py-5 border-b border-border flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Cpu className="w-6 h-6 text-brand-green" aria-hidden="true" />
              <h1 className="text-lg font-bold bg-gradient-to-r from-brand-green to-brand-green bg-clip-text text-transparent">
                GreenStack
              </h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} aria-hidden="true" />
          </Button>
        </header>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto" aria-label="Primary navigation">
          <NavItem
            icon={<Home className="w-5 h-5" />}
            label="Overview"
            active={activeView === 'overview'}
            onClick={() => setActiveView('overview')}
            collapsed={collapsed}
          />

          {/* Devices Section */}
          {!collapsed && (
            <div className="px-3 pt-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Devices</p>
            </div>
          )}
          <NavItem
            icon={<Radio className="w-5 h-5" />}
            label="IO Link Devices"
            badge={devices.length}
            active={activeView === 'devices'}
            onClick={() => setActiveView('devices')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<FileText className="w-5 h-5" />}
            label="EDS Files"
            badge={edsFiles.length}
            active={activeView === 'eds-files'}
            onClick={() => setActiveView('eds-files')}
            collapsed={collapsed}
          />

          {/* Applications Section */}
          {!collapsed && (
            <div className="px-3 pt-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Applications</p>
            </div>
          )}
          <NavItem
            icon={<Wifi className="w-5 h-5" />}
            label="MQTT Broker"
            active={activeView === 'mqtt'}
            onClick={() => setActiveView('mqtt')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Database className="w-5 h-5" />}
            label="InfluxDB"
            active={activeView === 'influxdb'}
            onClick={() => setActiveView('influxdb')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Workflow className="w-5 h-5" />}
            label="Node-RED"
            active={activeView === 'nodered'}
            onClick={() => setActiveView('nodered')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<LineChart className="w-5 h-5" />}
            label="Grafana"
            active={activeView === 'grafana'}
            onClick={() => setActiveView('grafana')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Server className="w-5 h-5" />}
            label="Services"
            active={activeView === 'services'}
            onClick={() => setActiveView('services')}
            collapsed={collapsed}
          />

          {/* Tools Section */}
          {!collapsed && (
            <div className="px-3 pt-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tools</p>
            </div>
          )}
          <NavItem
            icon={<Zap className="w-5 h-5" />}
            label="Generators"
            active={activeView === 'generators'}
            onClick={() => setActiveView('generators')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Search className="w-5 h-5" />}
            label="Search"
            active={activeView === 'search'}
            onClick={() => setActiveView('search')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<GitBranch className="w-5 h-5" />}
            label="Compare"
            active={activeView === 'compare'}
            onClick={() => setActiveView('compare')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<BarChart3 className="w-5 h-5" />}
            label="Analytics"
            active={activeView === 'analytics'}
            onClick={() => setActiveView('analytics')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Book className="w-5 h-5" />}
            label="Documentation"
            active={activeView === 'documentation'}
            onClick={() => setActiveView('documentation')}
            collapsed={collapsed}
          />
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => setActiveView('settings')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <ThemeToggle variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ThemeToggle variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, badge, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-all ${
      active
        ? 'bg-gradient-to-r from-brand-green to-brand-green text-foreground shadow-lg shadow-brand-green/20'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`}
    aria-label={`${label}${badge !== undefined ? `, ${badge} items` : ''}`}
    aria-current={active ? 'page' : undefined}
    role="menuitem"
  >
    <span aria-hidden="true">{icon}</span>
    {!collapsed && (
      <>
        <span className="flex-1 text-sm font-medium text-left">{label}</span>
        {badge !== undefined && (
          <Badge className="bg-muted text-foreground text-xs" aria-label={`${badge} items`}>
            {badge}
          </Badge>
        )}
      </>
    )}
  </button>
);

// ============================================================================
// Overview Dashboard
// ============================================================================

const OverviewDashboard = ({ stats, devices, onNavigate }) => (
  <section className="space-y-8" aria-labelledby="overview-heading">
    {/* Hero Welcome Section */}
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-green/10 via-brand-green/5 to-transparent border border-brand-green/20 p-8 md:p-12">
      <div className="relative z-10">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand-green/20 flex items-center justify-center" aria-hidden="true">
            <Package className="w-6 h-6 text-brand-green" aria-hidden="true" />
          </div>
          <h2 id="overview-heading" className="text-4xl md:text-5xl font-bold text-foreground">
            Welcome to Greenstack
          </h2>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Industrial IoT development platform
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {/* IO-Link Stats */}
          <div className="bg-card/50 backdrop-blur rounded-xl p-5 border border-border/50 hover:border-brand-green/30 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-brand-green/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-brand-green" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IO-Link Devices</p>
                <p className="text-2xl font-bold text-foreground">{stats.total_devices}</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur rounded-xl p-5 border border-border/50 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">IO-Link Parameters</p>
                <p className="text-2xl font-bold text-foreground">{stats.total_parameters}</p>
              </div>
            </div>
          </div>

          {/* EDS Stats */}
          <div className="bg-card/50 backdrop-blur rounded-xl p-5 border border-border/50 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Network className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">EtherNet/IP Devices</p>
                <p className="text-2xl font-bold text-foreground">{stats.unique_eds_devices || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-card/50 backdrop-blur rounded-xl p-5 border border-border/50 hover:border-orange-500/30 transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">EDS Parameters</p>
                <p className="text-2xl font-bold text-foreground">{stats.total_eds_parameters || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -z-0"></div>
    </div>

    {/* Recent Devices */}
    {devices.length > 0 && (
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-brand-green/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-brand-green/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-brand-green" />
              </div>
              <CardTitle className="text-foreground">Recent Devices</CardTitle>
            </div>
            <button
              onClick={() => onNavigate('devices')}
              className="text-sm text-brand-green hover:text-brand-green/80 flex items-center space-x-1"
            >
              <span>View all</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {devices.slice(0, 5).map((device, index) => (
              <motion.button
                key={device.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/50 hover:border-brand-green/30 transition-all cursor-pointer w-full text-left"
                onClick={() => onNavigate('devices', device)}
                type="button"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-green/30 to-brand-green/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6 text-brand-green" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-brand-green transition-colors">
                      {device.product_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{device.manufacturer}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-brand-green group-hover:translate-x-1 transition-all" />
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Empty State */}
    {devices.length === 0 && (
      <Card className="bg-card border-border border-dashed">
        <CardContent className="py-16">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-green/20 to-purple-500/20 flex items-center justify-center">
              <Package className="w-10 h-10 text-brand-green" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No devices yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload your first IODD file to get started
            </p>
            <button
              onClick={() => onNavigate('upload')}
              className="px-6 py-3 bg-brand-green hover:bg-brand-green/90 text-white rounded-lg font-medium transition-colors"
            >
              Upload IODD File
            </button>
          </div>
        </CardContent>
      </Card>
    )}
  </section>
);

// ============================================================================
// Device List Page
// ============================================================================

const DeviceListPage = ({ devices, onDeviceSelect, onUpload, onUploadFolder, API_BASE, toast, onDevicesChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'table'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  const filteredDevices = useMemo(() => {
    if (!searchQuery) {
      return devices;
    }
    return devices.filter(d =>
      d.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.device_id.toString().includes(searchQuery)
    );
  }, [devices, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);

  const paginatedDevices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDevices.slice(startIndex, endIndex);
  }, [filteredDevices, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const toggleDeviceSelection = (deviceId) => {
    setSelectedDevices(prev =>
      prev.includes(deviceId)
        ? prev.filter(id => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDevices.length === filteredDevices.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(filteredDevices.map(d => d.id));
    }
  };

  const handleBatchDelete = async () => {
    setDeleting(true);
    try {
      await axios.post(`${API_BASE}/api/iodd/bulk-delete`, {
        device_ids: selectedDevices
      });
      toast({
        title: 'Devices deleted',
        description: `Successfully deleted ${selectedDevices.length} device(s).`,
      });
      setSelectedDevices([]);
      setDeleteDialogOpen(false);
      // Refresh devices list
      if (onDevicesChange) onDevicesChange();
    } catch (error) {
      console.error('Failed to delete devices:', error);
      toast({
        title: 'Delete failed',
        description: error.response?.data?.error || 'Failed to delete devices',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Devices</h2>
            <p className="text-muted-foreground mt-1">
              {selectedDevices.length > 0 ? (
                <span>{selectedDevices.length} selected of {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''}</span>
              ) : (
                <span>{filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} found</span>
              )}
            </p>
          </div>
          {filteredDevices.length > 0 && (
            <label htmlFor="select-all-devices" className="flex items-center space-x-2 text-foreground cursor-pointer">
              <input
                id="select-all-devices"
                type="checkbox"
                checked={selectedDevices.length === filteredDevices.length && filteredDevices.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-border bg-muted checked:bg-brand-green"
              />
              <span className="text-sm">Select All</span>
            </label>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {selectedDevices.length > 0 && (
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              className="bg-error hover:bg-error/90 text-foreground"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedDevices.length} Device{selectedDevices.length !== 1 ? 's' : ''}
            </Button>
          )}
          <Button onClick={onUpload} className="bg-gradient-to-r from-brand-green to-brand-green hover:from-brand-green hover:to-brand-green">
            <Upload className="w-4 h-4 mr-2" />
            Import IODD Files
          </Button>
          <Button onClick={onUploadFolder} className="bg-gradient-to-r from-secondary to-accent hover:from-secondary hover:to-accent">
            <FolderOpen className="w-4 h-4 mr-2" />
            Import IODD Folder
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4">
            {/* Search and View Controls */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <label htmlFor="device-search" className="sr-only">Search devices by name, manufacturer, or ID</label>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  id="device-search"
                  type="text"
                  placeholder="Search devices by name, manufacturer, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-border text-foreground"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <div className="flex items-center space-x-1 border border-border rounded-md p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-2"
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-2"
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="p-4 border border-border rounded-lg bg-secondary/50 text-muted-foreground">
                Filter controls temporarily unavailable while repairing JSX structure.
              </div>
            )}
          </div>
          </CardContent>
        </Card>

      {/* Device List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
        {paginatedDevices.map((device) => (
          viewMode === 'grid' ? (
            <DeviceGridCard
              key={device.id}
              device={device}
              onClick={() => onDeviceSelect(device)}
              selected={selectedDevices.includes(device.id)}
              onToggleSelect={(e) => {
                e.stopPropagation();
                toggleDeviceSelection(device.id);
              }}
              API_BASE={API_BASE}
            />
          ) : (
            <DeviceListItem
              key={device.id}
              device={device}
              onClick={() => onDeviceSelect(device)}
              selected={selectedDevices.includes(device.id)}
              onToggleSelect={(e) => {
                e.stopPropagation();
                toggleDeviceSelection(device.id);
              }}
              API_BASE={API_BASE}
            />
          )
        ))}
      </div>

      {/* Pagination Controls */}
      {filteredDevices.length > 0 && totalPages > 1 && (
        <Card className="bg-card border-border mt-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Results Info */}
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDevices.length)} of {filteredDevices.length} devices
              </div>

              {/* Page Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="border-border text-foreground hover:bg-secondary disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="border-border text-foreground hover:bg-secondary disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum
                          ? 'bg-brand-green hover:bg-brand-green/90 text-foreground'
                          : 'border-border text-foreground hover:bg-secondary'}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="border-border text-foreground hover:bg-secondary disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="border-border text-foreground hover:bg-secondary disabled:opacity-30"
                >
                  Last
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Items Per Page */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 rounded bg-secondary border border-border text-foreground text-sm focus:border-brand-green/50 focus:ring-brand-green/20"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={96}>96</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredDevices.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No devices found</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-brand-green"
              >
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Batch Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-error/50 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-error flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Multiple Devices
            </DialogTitle>
            <DialogDescription className="text-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">{selectedDevices.length} device(s)</span>?
              <br />
              <span className="text-error">This action cannot be undone.</span> All device data, parameters, and assets will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="border-border text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBatchDelete}
              disabled={deleting}
              className="bg-error hover:bg-error/90 text-foreground"
            >
              {deleting ? 'Deleting...' : `Delete ${selectedDevices.length} Device${selectedDevices.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DeviceListItem = ({ device, onClick, selected, onToggleSelect, API_BASE }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <Card
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      }}
      role="button"
      tabIndex={0}
      className={`bg-card border-border hover:border-brand-green/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-brand-green/10 ${selected ? 'ring-2 ring-brand-green' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex items-center pt-1">
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 rounded border-border bg-muted checked:bg-brand-green"
            />
          </div>
          <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 p-2 overflow-hidden">
            {!imgError ? (
              <img
                src={`${API_BASE}/api/iodd/${device.id}/thumbnail`}
                alt={device.product_name}
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <Package className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-lg font-semibold text-foreground truncate">{device.product_name}</h3>
            <Badge className="bg-brand-green/20 text-brand-green border-brand-green/50 ml-2">
              v{formatVersion(device.iodd_version)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{device.manufacturer}</p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center">
              <span className="font-mono mr-1">ID:</span> {device.device_id}
            </span>
            <span className="flex items-center">
              <span className="font-mono mr-1">Vendor:</span> {device.vendor_id}
            </span>
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {format(new Date(device.import_date), 'MMM d, yyyy')}
            </span>
          </div>
        </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
};

const DeviceGridCard = ({ device, onClick, selected, onToggleSelect, API_BASE }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <Card
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      }}
      role="button"
      tabIndex={0}
      className={`bg-card border-border hover:border-brand-green/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-brand-green/10 ${selected ? 'ring-2 ring-brand-green' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex justify-end mb-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 rounded border-border bg-muted checked:bg-brand-green"
          />
        </div>
        <div className="w-full h-32 rounded-lg bg-secondary flex items-center justify-center mb-4 p-4 overflow-hidden">
          {!imgError ? (
            <img
              src={`${API_BASE}/api/iodd/${device.id}/thumbnail`}
              alt={device.product_name}
              className="w-full h-full object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <Package className="w-16 h-16 text-muted-foreground" />
          )}
        </div>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-semibold text-foreground truncate flex-1">{device.product_name}</h3>
        <Badge className="bg-brand-green/20 text-brand-green border-brand-green/50 text-xs ml-2">
          v{formatVersion(device.iodd_version)}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{device.manufacturer}</p>
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Device ID: <span className="font-mono">{device.device_id}</span></div>
        <div>{format(new Date(device.import_date), 'MMM d, yyyy')}</div>
      </div>
    </CardContent>
  </Card>
  );
};


// ============================================================================
// Device Details Full Screen
// ============================================================================

const DeviceDetailsPage = ({ device, onBack, API_BASE, toast }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [assets, setAssets] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [errors, setErrors] = useState([]);
  const [events, setEvents] = useState([]);
  const [processData, setProcessData] = useState([]);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [deviceFeatures, setDeviceFeatures] = useState(null);
  const [communicationProfile, setCommunicationProfile] = useState(null);
  const [uiMenus, setUiMenus] = useState(null);
  const [configSchema, setConfigSchema] = useState(null);
  const [parameterValues, setParameterValues] = useState({});
  const [activeConfigMenu, setActiveConfigMenu] = useState(null);
  const [selectedParameter, setSelectedParameter] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [configurationName, setConfigurationName] = useState('Untitled Configuration');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [xmlContent, setXmlContent] = useState('');
  const [loadingXml, setLoadingXml] = useState(false);
  const [loadingErrors, setLoadingErrors] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingProcessData, setLoadingProcessData] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [paramSearchQuery, setParamSearchQuery] = useState('');
  const [paramAccessFilter, setParamAccessFilter] = useState('all');
  const [paramDataTypeFilter, setParamDataTypeFilter] = useState('all');
  const [paramShowFilters, setParamShowFilters] = useState(false);
  const [errorSearchQuery, setErrorSearchQuery] = useState('');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  // Multi-language support
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [textData, setTextData] = useState({});

  // Phase 1-5 comprehensive IODD data
  const [processDataUiInfo, setProcessDataUiInfo] = useState([]);
  const [deviceVariants, setDeviceVariants] = useState([]);
  const [processDataConditions, setProcessDataConditions] = useState([]);
  const [menuButtons, setMenuButtons] = useState([]);
  const [wiringConfigurations, setWiringConfigurations] = useState([]);
  const [testConfigurations, setTestConfigurations] = useState(null);
  const [customDatatypes, setCustomDatatypes] = useState([]);

  const deviceId = device?.id;

  const fetchAssets = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/assets`);
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  }, [API_BASE, deviceId]);

  const fetchLanguages = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/languages`);
      setAvailableLanguages(response.data.languages || []);
      setTextData(response.data.text_data || {});
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    }
  }, [API_BASE, deviceId]);

  // Phase 1-5 fetch functions
  const fetchProcessDataUiInfo = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/processdata/ui-info`);
      setProcessDataUiInfo(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch process data UI info:', error);
      setProcessDataUiInfo([]);
    }
  }, [API_BASE, deviceId]);

  const fetchDeviceVariants = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/variants`);
      setDeviceVariants(response.data);
    } catch (error) {
      console.error('Failed to fetch device variants:', error);
    }
  }, [API_BASE, deviceId]);

  const fetchProcessDataConditions = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/processdata/conditions`);
      setProcessDataConditions(response.data);
    } catch (error) {
      console.error('Failed to fetch process data conditions:', error);
    }
  }, [API_BASE, deviceId]);

  const fetchMenuButtons = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/menu-buttons`);
      setMenuButtons(response.data);
    } catch (error) {
      console.error('Failed to fetch menu buttons:', error);
    }
  }, [API_BASE, deviceId]);

  const fetchWiringConfigurations = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/wiring`);
      setWiringConfigurations(response.data);
    } catch (error) {
      console.error('Failed to fetch wiring configurations:', error);
    }
  }, [API_BASE, deviceId]);

  const fetchTestConfigurations = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/test-config`);
      setTestConfigurations(response.data);
    } catch (error) {
      console.error('Failed to fetch test configurations:', error);
    }
  }, [API_BASE, deviceId]);

  const fetchCustomDatatypes = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/custom-datatypes`);
      setCustomDatatypes(response.data);
    } catch (error) {
      console.error('Failed to fetch custom datatypes:', error);
    }
  }, [API_BASE, deviceId]);

  // Export functions
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Handle values that contain commas or quotes
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportToJSON = (data, filename) => {
    if (!data) return;

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleExportParameters = (format) => {
    const filename = `${device.product_name}_parameters_${new Date().toISOString().split('T')[0]}.${format}`;
    if (format === 'csv') {
      exportToCSV(filteredParameters, filename);
    } else {
      exportToJSON(filteredParameters, filename);
    }
    toast({
      title: 'Export successful',
      description: `Parameters exported to ${filename}`,
    });
  };

  const handleExportProcessData = (format) => {
    const filename = `${device.product_name}_processdata_${new Date().toISOString().split('T')[0]}.${format}`;
    if (format === 'csv') {
      exportToCSV(processData, filename);
    } else {
      exportToJSON(processData, filename);
    }
    toast({
      title: 'Export successful',
      description: `Process data exported to ${filename}`,
    });
  };

  const fetchParameters = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/parameters`);
      setParameters(response.data);
    } catch (error) {
      console.error('Failed to fetch parameters:', error);
    }
  }, [API_BASE, deviceId]);

  const fetchXml = async () => {
    if (xmlContent) return; // Already loaded
    setLoadingXml(true);
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/xml`);
      setXmlContent(response.data.xml_content);
    } catch (error) {
      console.error('Failed to fetch XML:', error);
      toast({
        title: 'Failed to load XML',
        description: error.response?.data?.error || 'Could not load XML content',
        variant: 'destructive',
      });
    } finally {
      setLoadingXml(false);
    }
  };

  const fetchErrors = useCallback(async () => {
    if (!deviceId) return;
    setLoadingErrors(true);
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/errors`);
      setErrors(response.data);
    } catch (error) {
      console.error('Failed to fetch errors:', error);
    } finally {
      setLoadingErrors(false);
    }
  }, [API_BASE, deviceId]);

  const fetchEvents = useCallback(async () => {
    if (!deviceId) return;
    setLoadingEvents(true);
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoadingEvents(false);
    }
  }, [API_BASE, deviceId]);

  const fetchProcessData = useCallback(async () => {
    if (!deviceId) return;
    setLoadingProcessData(true);
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/processdata`);
      setProcessData(response.data);
    } catch (error) {
      console.error('Failed to fetch process data:', error);
    } finally {
      setLoadingProcessData(false);
    }
  }, [API_BASE, deviceId]);

  const fetchDocumentInfo = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/documentinfo`);
      setDocumentInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch document info:', error);
    }
  }, [API_BASE, deviceId]);

  const fetchDeviceFeatures = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/features`);
      setDeviceFeatures(response.data);
    } catch (error) {
      console.error('Failed to fetch device features:', error);
    }
  }, [API_BASE, deviceId]);

  const fetchCommunicationProfile = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/communication`);
      setCommunicationProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch communication profile:', error);
    }
  }, [API_BASE, deviceId]);

  const fetchUiMenus = useCallback(async () => {
    if (!deviceId) return;
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${deviceId}/menus`);
      setUiMenus(response.data);
    } catch (error) {
      console.error('Failed to fetch UI menus:', error);
    }
  }, [API_BASE, deviceId]);

  const fetchConfigSchema = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/config-schema`);
      setConfigSchema(response.data);
    } catch (error) {
      console.error('Failed to fetch config schema:', error);
    }
  };

  // Fetch all device data when device changes
  useEffect(() => {
    if (!device) return;
    fetchAssets();
    fetchParameters();
    fetchErrors();
    fetchEvents();
    fetchDocumentInfo();
    fetchDeviceFeatures();
    fetchCommunicationProfile();
    fetchUiMenus();
    fetchLanguages();
    fetchProcessDataUiInfo();
    fetchDeviceVariants();
    fetchProcessDataConditions();
    fetchMenuButtons();
    fetchWiringConfigurations();
    fetchTestConfigurations();
    fetchCustomDatatypes();
  }, [
    device,
    fetchAssets,
    fetchParameters,
    fetchErrors,
    fetchEvents,
    fetchDocumentInfo,
    fetchDeviceFeatures,
    fetchCommunicationProfile,
    fetchUiMenus,
    fetchLanguages,
    fetchProcessDataUiInfo,
    fetchDeviceVariants,
    fetchProcessDataConditions,
    fetchMenuButtons,
    fetchWiringConfigurations,
    fetchTestConfigurations,
    fetchCustomDatatypes,
  ]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === 'xml' && !xmlContent) {
      fetchXml();
    }
    if (value === 'menus' && !configSchema) {
      fetchConfigSchema();
    }
    if (value === 'processdata' && processData.length === 0 && !loadingProcessData) {
      fetchProcessData();
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE}/api/iodd/${device.id}`);
      toast({
        title: 'Device deleted',
        description: `${device.product_name} has been deleted successfully.`,
      });
      setDeleteDialogOpen(false);
      // Go back to devices list after successful deletion
      setTimeout(() => onBack(), 500);
    } catch (error) {
      console.error('Failed to delete device:', error);
      toast({
        title: 'Delete failed',
        description: error.response?.data?.error || 'Failed to delete device',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Helper Functions for Interactive Configuration
  const initializeParameterValues = (schema) => {
    const values = {};
    schema.menus.forEach(menu => {
      menu.items.forEach(item => {
        if (item.parameter && item.variable_id) {
          values[item.variable_id] = item.parameter.default_value || '';
        }
      });
    });
    setParameterValues(values);
    if (schema.menus.length > 0) {
      setActiveConfigMenu(schema.menus[0].id);
    }
  };

  const updateParameterValue = (variableId, value, param) => {
    setParameterValues(prev => ({ ...prev, [variableId]: value }));
    setHasUnsavedChanges(true);

    // Validate the new value
    const errors = validateParameter(param, value);
    setValidationErrors(prev => ({
      ...prev,
      [variableId]: errors.length > 0 ? errors[0] : null
    }));
  };

  const validateParameter = (param, value) => {
    const errors = [];

    if (param.enumeration_values && Object.keys(param.enumeration_values).length > 0) {
      if (!Object.keys(param.enumeration_values).includes(value)) {
        errors.push('Invalid enumeration value');
      }
    }

    if (param.min_value !== null && param.min_value !== undefined) {
      const numValue = parseFloat(value);
      const minValue = parseFloat(param.min_value);
      if (!isNaN(numValue) && !isNaN(minValue) && numValue < minValue) {
        errors.push(`Value must be >= ${param.min_value}`);
      }
    }

    if (param.max_value !== null && param.max_value !== undefined) {
      const numValue = parseFloat(value);
      const maxValue = parseFloat(param.max_value);
      if (!isNaN(numValue) && !isNaN(maxValue) && numValue > maxValue) {
        errors.push(`Value must be <= ${param.max_value}`);
      }
    }

    return errors;
  };

  const exportConfiguration = () => {
    const config = {
      deviceId: device.id,
      deviceName: device.product_text,
      configurationName,
      timestamp: new Date().toISOString(),
      parameters: parameterValues
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${device.product_text}_${configurationName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Configuration exported successfully'
    });
  };

  const resetConfiguration = () => {
    if (configSchema) {
      initializeParameterValues(configSchema);
      setValidationErrors({});
      setHasUnsavedChanges(false);
      toast({
        title: 'Info',
        description: 'Configuration reset to default values'
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Success',
      description: 'Copied to clipboard'
    });
  };

  // Initialize parameter values when config schema loads
  useEffect(() => {
    if (configSchema && Object.keys(parameterValues).length === 0) {
      initializeParameterValues(configSchema);
    }
  }, [configSchema, parameterValues]);

  // Comprehensive Menu Item Display Component - Shows ALL menu items
  const MenuItemDisplay = ({ item }) => {
    // Handle Button Items
    if (item.button_value) {
      return (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Command className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-foreground">Action Button</span>
              {item.variable_id && (
                <Badge className="bg-brand-green/20 text-foreground-secondary border-brand-green/50 font-mono text-xs">
                  {item.variable_id}
                </Badge>
              )}
            </div>
            <Badge className="bg-warning/20 text-warning border-warning/50">
              Value: {item.button_value}
            </Badge>
          </div>
          {item.access_right_restriction && (() => {
            const accessInfo = getAccessRightInfo(item.access_right_restriction);
            return (
              <div className="mt-2 text-xs text-muted-foreground">
                Access: <Badge
                  className={`ml-1 bg-${accessInfo?.color || 'slate'}-500/20 text-${accessInfo?.color || 'slate'}-300 border-${accessInfo?.color || 'slate'}-500/50 text-xs`}
                  title={accessInfo?.description || item.access_right_restriction}
                >
                  {accessInfo?.icon} {accessInfo?.label || item.access_right_restriction}
                </Badge>
              </div>
            );
          })()}
        </div>
      );
    }

    // Handle Menu References (Submenus)
    if (item.menu_ref) {
      return (
        <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium text-foreground">Submenu Link</span>
            </div>
            <Badge className="bg-secondary/20 text-foreground-secondary border-secondary/50 font-mono">
              {item.menu_ref}
            </Badge>
          </div>
          {item.variable_id && (
            <div className="mt-2 text-xs text-muted-foreground">
              Variable: <Badge className="ml-1 bg-brand-green/20 text-foreground-secondary font-mono text-xs">{item.variable_id}</Badge>
            </div>
          )}
        </div>
      );
    }

    // Handle RecordItem References
    if (item.record_item_ref) {
      return (
        <div className="p-3 rounded-lg bg-brand-green/10 border border-brand-green/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-brand-green" />
              <span className="text-sm font-medium text-foreground">Record Item</span>
            </div>
            <Badge className="bg-brand-green/20 text-foreground-secondary border-brand-green/50 font-mono">
              {item.record_item_ref}
            </Badge>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            {item.subindex !== null && (
              <div className="text-muted-foreground">
                Subindex: <Badge className="ml-1 bg-muted text-foreground text-xs">{item.subindex}</Badge>
              </div>
            )}
            {item.access_right_restriction && (() => {
              const accessInfo = getAccessRightInfo(item.access_right_restriction);
              return (
                <div className="text-muted-foreground">
                  Access: <Badge
                    className={`ml-1 bg-${accessInfo?.color || 'slate'}-500/20 text-${accessInfo?.color || 'slate'}-300 border-${accessInfo?.color || 'slate'}-500/50 text-xs`}
                    title={accessInfo?.description || item.access_right_restriction}
                  >
                    {accessInfo?.icon} {accessInfo?.label || item.access_right_restriction}
                  </Badge>
                </div>
              );
            })()}
            {item.display_format && (
              <div className="text-muted-foreground">
                Format: <Badge className="ml-1 bg-muted text-foreground text-xs">{item.display_format}</Badge>
              </div>
            )}
            {item.unit_code && (() => {
              const unitInfo = getUnitInfo(item.unit_code);
              return (
                <div className="text-muted-foreground">
                  Unit: <Badge className="ml-1 bg-muted text-foreground text-xs" title={unitInfo.name}>
                    {unitInfo.symbol || item.unit_code}
                  </Badge>
                  {unitInfo.symbol && (
                    <span className="ml-1 text-xs text-muted-foreground">({unitInfo.name})</span>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      );
    }

    // Handle Variable Items (with or without parameter details)
    if (item.variable_id) {
      const param = item.parameter;
      const variableId = item.variable_id;
      const isReadOnly = item.access_right_restriction === 'ro';

      // If we have full parameter details, show interactive control
      if (param) {
        return <InteractiveParameterControl item={item} />;
      }

      // Otherwise, show variable info card (parameter lookup failed)
      return (
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-muted-foreground" />
              <Badge className="bg-brand-green/20 text-foreground-secondary border-brand-green/50 font-mono text-xs">
                {variableId}
              </Badge>
            </div>
            {isReadOnly && (
              <Badge className="text-xs bg-info/20 text-info border-info/50">Read Only</Badge>
            )}
          </div>
          <div className="space-y-1 text-xs">
            {item.access_right_restriction && (() => {
              const accessInfo = getAccessRightInfo(item.access_right_restriction);
              return (
                <div className="text-muted-foreground">
                  Access: <Badge
                    className={`ml-1 bg-${accessInfo?.color || 'slate'}-500/20 text-${accessInfo?.color || 'slate'}-300 border-${accessInfo?.color || 'slate'}-500/50 text-xs`}
                    title={accessInfo?.description || item.access_right_restriction}
                  >
                    {accessInfo?.icon} {accessInfo?.label || item.access_right_restriction}
                  </Badge>
                </div>
              );
            })()}
            {item.display_format && (
              <div className="text-muted-foreground">
                Format: <Badge className="ml-1 bg-muted text-foreground text-xs">{item.display_format}</Badge>
              </div>
            )}
            {item.unit_code && (() => {
              const unitInfo = getUnitInfo(item.unit_code);
              return (
                <div className="text-muted-foreground">
                  Unit: <Badge className="ml-1 bg-muted text-foreground text-xs" title={unitInfo.name}>
                    {unitInfo.symbol || item.unit_code}
                  </Badge>
                  {unitInfo.symbol && (
                    <span className="ml-1 text-xs text-muted-foreground">({unitInfo.name})</span>
                  )}
                </div>
              );
            })()}
            <div className="text-muted-foreground text-xs mt-2">
              ⚠ Parameter details not found in database
            </div>
          </div>
        </div>
      );
    }

    // Fallback for unknown item types
    return (
      <div className="p-3 rounded-lg bg-secondary/30 border border-border">
        <div className="text-xs text-muted-foreground">Unknown item type</div>
        <pre className="text-xs text-muted-foreground mt-1">{JSON.stringify(item, null, 2)}</pre>
      </div>
    );
  };

  // Interactive Parameter Control Component
  const InteractiveParameterControl = ({ item }) => {
    const param = item.parameter;
    const variableId = item.variable_id;
    const value = parameterValues[variableId] || param.default_value || '';
    const error = validationErrors[variableId];
    const isReadOnly = item.access_right_restriction === 'ro';

    if (!param) return null;

    const handleChange = (newValue) => {
      updateParameterValue(variableId, newValue, param);
    };

    // Enumeration - Dropdown
    if (param.enumeration_values && Object.keys(param.enumeration_values).length > 0) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="text-sm text-foreground cursor-pointer text-left"
              onClick={() => setSelectedParameter(item)}
            >
              {param.name}
              {item.unit_code && <span className="ml-1 text-xs text-muted-foreground">({item.unit_code})</span>}
            </button>
            {isReadOnly && <Badge className="text-xs bg-info/20 text-info">Read Only</Badge>}
          </div>
          <Select
            value={value}
            onValueChange={handleChange}
            disabled={isReadOnly}
          >
            <SelectTrigger className={`bg-secondary border-border text-foreground ${error ? 'border-error' : ''}`}>
              <SelectValue placeholder="Select value..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(param.enumeration_values).map(([enumValue, enumName]) => (
                <SelectItem key={enumValue} value={enumValue}>
                  {enumName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <p className="text-xs text-error flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          )}
        </div>
      );
    }

    // Boolean - Toggle
    if (param.data_type && param.data_type.toLowerCase().includes('bool')) {
      return (
        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
          <button
            type="button"
            className="text-sm text-foreground cursor-pointer flex-1 text-left"
            onClick={() => setSelectedParameter(item)}
          >
            {param.name}
            {isReadOnly && <Badge className="ml-2 text-xs bg-info/20 text-info">Read Only</Badge>}
          </button>
          <input
            id={`param-bool-${variableId}`}
            aria-label={param.name}
            type="checkbox"
            checked={value === '1' || value === 'true' || value === true}
            onChange={(e) => handleChange(e.target.checked ? '1' : '0')}
            disabled={isReadOnly}
            className="w-5 h-5 rounded border-border text-secondary focus:ring-secondary"
          />
        </div>
      );
    }

    // Numeric with range - Slider + Input
    if (param.min_value !== null && param.max_value !== null) {
      const numValue = parseFloat(value) || 0;
      const minVal = parseFloat(param.min_value) || 0;
      const maxVal = parseFloat(param.max_value) || 100;

      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="text-sm text-foreground cursor-pointer text-left"
              onClick={() => setSelectedParameter(item)}
            >
              {param.name}
              {item.unit_code && <span className="ml-1 text-xs text-muted-foreground">({item.unit_code})</span>}
            </button>
            <div className="flex items-center gap-2">
              <Input
                id={`param-num-${variableId}`}
                aria-label={param.name}
                type="number"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                disabled={isReadOnly}
                min={minVal}
                max={maxVal}
                className={`w-20 h-8 bg-secondary border-border text-foreground text-sm ${error ? 'border-error' : ''}`}
              />
              {isReadOnly && <Badge className="text-xs bg-info/20 text-info">RO</Badge>}
            </div>
          </div>
          <input
            type="range"
            min={minVal}
            max={maxVal}
            value={numValue}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isReadOnly}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-secondary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{param.min_value}</span>
            <span>{param.max_value}</span>
          </div>
          {error && (
            <p className="text-xs text-error flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          )}
        </div>
      );
    }

    // Default - Text Input
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-sm text-foreground cursor-pointer text-left"
            onClick={() => setSelectedParameter(item)}
          >
            {param.name}
            {item.unit_code && <span className="ml-1 text-xs text-muted-foreground">({item.unit_code})</span>}
          </button>
          {isReadOnly && <Badge className="text-xs bg-info/20 text-info">Read Only</Badge>}
        </div>
        <Input
          id={`param-text-${variableId}`}
          aria-label={param.name}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isReadOnly}
          placeholder={`Enter ${param.name.toLowerCase()}...`}
          className={`bg-secondary border-border text-foreground ${error ? 'border-error' : ''}`}
        />
        {error && (
          <p className="text-xs text-error flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  };

  const normalizeAssetName = (fileName) => {
    if (!fileName) return '';
    const parts = fileName.split(/[/\\]/);
    return parts[parts.length - 1].toLowerCase();
  };

  const findAssetByFileName = (fileName) => {
    if (!fileName || !assets?.length) return null;
    const normalized = normalizeAssetName(fileName);
    return assets.find(
      (asset) => asset.file_name && asset.file_name.toLowerCase() === normalized
    );
  };

  const imageAssets = assets.filter(a => a.file_type === 'image');
  const lightboxSlides = imageAssets.map(asset => ({
    src: `${API_BASE}/api/iodd/${device.id}/assets/${asset.id}`,
    alt: asset.file_name,
  }));

  const standardVariables = useMemo(() => {
    const map = {};
    parameters.forEach((param) => {
      if (param?.id?.startsWith?.('V_')) {
        map[param.id] = param;
      }
    });
    return map;
  }, [parameters]);

  const parseNumericValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  };

  const deviceStatusValue = standardVariables['V_DeviceStatus']?.default_value;
  const deviceStatusInfo = useMemo(() => {
    if (deviceStatusValue === undefined || deviceStatusValue === null) return null;
    const statusMap = {
      0: { label: 'OK', tone: 'success', description: 'Device operating normally' },
      1: { label: 'Maintenance Required', tone: 'warning', description: 'Device needs maintenance soon' },
      2: { label: 'Out of Specification', tone: 'warning', description: 'Operating outside defined range' },
      3: { label: 'Function Check', tone: 'muted', description: 'Device in function-check state' },
      4: { label: 'Failure', tone: 'destructive', description: 'Device reports critical fault' },
    };
    const numericValue = parseNumericValue(deviceStatusValue);
    const resolved = numericValue !== null ? statusMap[numericValue] : null;
    return {
      value: deviceStatusValue,
      label: resolved?.label || `Code ${deviceStatusValue}`,
      tone: resolved?.tone || 'muted',
      description: resolved?.description || 'Reported by V_DeviceStatus',
    };
  }, [deviceStatusValue]);

  const deviceErrorCount = standardVariables['V_ErrorCount']?.default_value;
  const deviceOperatingTime = standardVariables['V_OperatingTime']?.default_value;
  const deviceAccessLocksValue = useMemo(() => {
    const val = standardVariables['V_DeviceAccessLocks']?.default_value;
    const numeric = parseNumericValue(val);
    return numeric !== null ? numeric : null;
  }, [standardVariables]);

  const diagnosticParameters = useMemo(() => {
    const matchDiag = (text = '') => /diagnos/i.test(text);
    return parameters
      .filter((param) => matchDiag(param?.name) || matchDiag(param?.id) || matchDiag(param?.description))
      .slice(0, 6);
  }, [parameters]);

  const filteredParameters = useMemo(() => parameters.filter((p) => {
    // Text search filter
    if (paramSearchQuery) {
      const matchesSearch = p.name.toLowerCase().includes(paramSearchQuery.toLowerCase()) ||
                          p.index.toString().includes(paramSearchQuery);
      if (!matchesSearch) return false;
    }

    // Access rights filter
    if (paramAccessFilter !== 'all') {
      if (p.access_rights !== paramAccessFilter) return false;
    }

    // Data type filter
    if (paramDataTypeFilter !== 'all') {
      if (!p.data_type || !p.data_type.toLowerCase().includes(paramDataTypeFilter.toLowerCase())) return false;
    }

    return true;
  }), [parameters, paramSearchQuery, paramAccessFilter, paramDataTypeFilter]);

  const filteredErrors = useMemo(() => {
    if (!errorSearchQuery) return errors;
    const query = errorSearchQuery.toLowerCase();
    return errors.filter(error =>
      (error.name && error.name.toLowerCase().includes(query)) ||
      (error.description && error.description.toLowerCase().includes(query)) ||
      (error.error_code && error.error_code.toString().includes(query)) ||
      (error.additional_code && error.additional_code.toString().includes(query))
    );
  }, [errors, errorSearchQuery]);

  const filteredEvents = useMemo(() => {
    if (!eventSearchQuery) return events;
    const query = eventSearchQuery.toLowerCase();
    return events.filter(event =>
      (event.name && event.name.toLowerCase().includes(query)) ||
      (event.description && event.description.toLowerCase().includes(query)) ||
      (event.event_code && event.event_code.toString().includes(query)) ||
      (event.event_type && event.event_type.toLowerCase().includes(query))
    );
  }, [events, eventSearchQuery]);

  // Helper function to translate text IDs based on selected language
  const translateText = (textId) => {
    if (!textId || !textData[textId]) {
      return textId; // Return the text ID itself if no translation found
    }

    // Try to get text in selected language
    if (textData[textId][selectedLanguage]) {
      return textData[textId][selectedLanguage];
    }

    // Fallback to English
    if (textData[textId]['en']) {
      return textData[textId]['en'];
    }

    // Fallback to any available language
    const availableLangs = Object.keys(textData[textId]);
    if (availableLangs.length > 0) {
      return textData[textId][availableLangs[0]];
    }

    // Last resort: return the text ID
    return textId;
  };

  // Helper function to get UI rendering metadata for a record item
  const getUiInfo = (recordItemName) => {
    if (!Array.isArray(processDataUiInfo)) {
      return undefined;
    }
    return processDataUiInfo.find(ui => ui.record_item_name === recordItemName);
  };

  // Helper function to apply gradient/offset scaling to a value
  const displayPreview = useMemo(() => {
    if (!Array.isArray(processData) || processData.length === 0) {
      return null;
    }
    const outputs = processData.filter((pd) => pd.direction === 'output');
    if (!outputs.length) {
      return null;
    }
    const digitItems = [];
    const ledColorItems = [];
    const miscItems = [];

    outputs.forEach((pd) => {
      if (!Array.isArray(pd.record_items)) return;
      pd.record_items.forEach((item) => {
        const name = item.name || '';
        if (/display digit/i.test(name) || /digit [1-9]/i.test(name)) {
          digitItems.push(item);
        } else if (/led color/i.test(name) || /rgb/i.test(name)) {
          ledColorItems.push(item);
        } else if (/active leds|automatic|brightness|effect/i.test(name)) {
          miscItems.push(item);
        }
      });
    });

    if (!digitItems.length && !ledColorItems.length && !miscItems.length) {
      return null;
    }

    return {
      digitItems: digitItems.sort((a, b) => (a.subindex || 0) - (b.subindex || 0)),
      ledColorItems,
      miscItems,
    };
  }, [processData]);

  const profileCharacteristics = useMemo(() => {
    if (!deviceFeatures?.profile_characteristic) {
      return [];
    }
    return deviceFeatures.profile_characteristic
      .split(/\s+/)
      .map((value) => value.trim())
      .filter(Boolean);
  }, [deviceFeatures]);


  const renderProcessDataConditions = () => {
    if (!processDataConditions || processDataConditions.length === 0) {
      return null;
    }
    return (
      <div className="mb-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            Conditional Process Data Structures
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Process data structures that change based on device operating mode or configuration
          </p>
          <div className="space-y-3">
            {processDataConditions.map((condition, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-background/50 border border-border"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-xs">
                      Condition {idx + 1}
                    </Badge>
                  </div>
                  <div className="flex-1 space-y-2">
                    {condition.variable_id && (
                      <div>
                        <span className="text-xs text-muted-foreground">Variable: </span>
                        <code className="text-xs bg-muted px-2 py-0.5 rounded text-brand-green">
                          {condition.variable_id}
                        </code>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                      {condition.value_filter && (
                        <div>
                          <span className="text-muted-foreground">Filter: </span>
                          <code className="text-foreground font-mono">{condition.value_filter}</code>
                        </div>
                      )}
                      {condition.max_value !== null && (
                        <div>
                          <span className="text-muted-foreground">Max Value: </span>
                          <code className="text-foreground font-mono">{condition.max_value}</code>
                        </div>
                      )}
                      {condition.min_value !== null && (
                        <div>
                          <span className="text-muted-foreground">Min Value: </span>
                          <code className="text-foreground font-mono">{condition.min_value}</code>
                        </div>
                      )}
                    </div>
                    {condition.structure_overview && (
                      <div className="mt-1 text-xs text-muted-foreground/80">
                        {condition.structure_overview}
                      </div>
                    )}
                  </div>
                </div>
                {condition.structure && condition.structure.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {condition.structure.map((structure, sidx) => (
                      <div
                        key={`${idx}-${sidx}`}
                        className="p-3 rounded-md border border-border bg-background/30 text-xs"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-semibold text-foreground">{structure.name}</div>
                          <div className="text-muted-foreground font-mono">
                            {structure.bit_length} bits
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          {structure.description || 'No description provided'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderProcessDataSection = (direction) => {
    const items = processData.filter(pd => pd.direction === direction);
    if (items.length === 0) {
      return null;
    }
    const isInput = direction === 'input';
    return (
      <div>
        <h3 className={`text-lg font-semibold ${isInput ? 'text-brand-green' : 'text-secondary'} mb-3 flex items-center gap-2`}>
          <div className={`w-2 h-2 rounded-full ${isInput ? 'bg-brand-green' : 'bg-secondary'} animate-pulse`} />
          {isInput ? 'Process Data Inputs' : 'Process Data Outputs'} ({items.length})
        </h3>
        <div className="space-y-3">
          {items.map((pd) => renderProcessDataCard(pd, direction, getUiInfo))}
        </div>
      </div>
    );
  };

  const renderDisplayPreview = () => {
    if (!displayPreview) {
      return null;
    }
    return (
      <div className="mt-6">
        <Card className="bg-card/80 border-border hover:border-brand-green/40 transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground text-xl flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-green/20 to-brand-green/5 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-brand-green" />
                </div>
                Display Layout Preview
              </CardTitle>
              <Badge className="bg-brand-green/20 text-brand-green border-brand-green/40">
                CANEO Visualization
              </Badge>
            </div>
            <CardDescription className="text-muted-foreground mt-2">
              Mapping of process-data fields to the four-digit display and LED ring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900/40 to-slate-800/30 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Layers className="w-3 h-3" />
                  Digits & Text Segments
                </p>
                {displayPreview.digitItems.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {displayPreview.digitItems.map((digit, idx) => (
                      <div key={`digit-${idx}`} className="p-3 rounded-lg border border-slate-700 bg-slate-900/60 text-white">
                        <p className="text-sm font-semibold">{digit.name || `Digit ${digit.subindex}`}</p>
                        <p className="text-[11px] text-white/70 font-mono">
                          Bits {formatBitRange(digit)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No digit fields detected in process data outputs.
                  </p>
                )}
              </div>
              <div className="space-y-4">
                {displayPreview.ledColorItems.length > 0 && (
                  <div className="p-4 rounded-xl bg-background/60 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Palette className="w-3 h-3" />
                      LED Color Channels
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {displayPreview.ledColorItems.map((item, idx) => (
                        <div key={`led-color-${idx}`} className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full border border-border"
                            style={{ backgroundColor: resolveColorHex(item.name || '') }}
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              Bits {formatBitRange(item)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {displayPreview.miscItems.length > 0 && (
                  <div className="p-4 rounded-xl bg-background/60 border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <List className="w-3 h-3" />
                      Auxiliary Fields
                    </p>
                    <div className="space-y-2">
                      {displayPreview.miscItems.map((item, idx) => (
                        <div key={`misc-${idx}`} className="flex items-center justify-between text-xs">
                          <span className="text-foreground font-medium">{item.name}</span>
                          <span className="font-mono text-muted-foreground">{formatBitRange(item)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderProcessDataContent = () => {
    if (loadingProcessData) {
      return (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 bg-secondary" />
          ))}
        </div>
      );
    }

    if (processData.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No process data defined for this device
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {renderProcessDataConditions()}
        {renderProcessDataSection('input')}
        {renderProcessDataSection('output')}
        {renderDisplayPreview()}
      </div>
    );
  };

  const renderProcessDataTab = () => (
    <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-sm border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground text-xl flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-green/20 to-brand-green/20 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-brand-green" />
                </div>
                Process Data Structure
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Input and output process data configuration for real-time communication
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportProcessData('csv')}
                disabled={processData.length === 0}
                className="border-brand-green/50 text-foreground-secondary hover:bg-brand-green/10"
                title="Export to CSV"
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportProcessData('json')}
                disabled={processData.length === 0}
                className="border-brand-green/50 text-foreground-secondary hover:bg-brand-green/10"
                title="Export to JSON"
              >
                <Download className="w-4 h-4 mr-1" />
                JSON
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderProcessDataContent()}</CardContent>
      </Card>
    </div>
  );

  // Find the main device image (device-pic like *symbol-pic.png)
  // Priority: device-pic > any non-icon image > icon as last resort
  const mainDeviceImage = imageAssets.find(a => a.image_purpose === 'device-pic')
    || imageAssets.find(a => a.image_purpose !== 'icon' && a.image_purpose !== 'logo')
    || imageAssets[0];

  // Find the manufacturer logo

  return (
    <div className="relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      <div className="relative space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary -ml-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Devices
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => window.open(`${API_BASE}/api/iodd/${device.id}/export?format=zip`, '_blank')}
              className="border-border text-foreground hover:border-brand-green/50 hover:bg-secondary transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              className="border-border text-foreground hover:border-brand-green/50 hover:bg-secondary transition-all"
            >
              <Star className="w-4 h-4 mr-2" />
              Favorite
            </Button>
            {availableLanguages.length > 1 && (
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-[120px] border-border text-foreground hover:border-brand-green/50 hover:bg-secondary transition-all">
                  <Globe className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="border-error/50 text-error hover:border-error hover:bg-error/20 transition-all"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Enhanced Device Header with Showcase */}
        <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-brand-green/30 transition-all duration-300 overflow-hidden relative group">
          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-green via-secondary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Device Image Showcase */}
              <div className="lg:col-span-1">
                <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-surface to-surface border-2 border-border p-6 overflow-hidden group-hover:border-brand-green/50 transition-all duration-300">
                  {/* Animated background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-green/10 via-secondary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {mainDeviceImage ? (
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <img
                        src={`${API_BASE}/api/iodd/${device.id}/assets/${mainDeviceImage.id}`}
                        alt={device.product_name}
                        className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <Package className="w-32 h-32 text-muted-foreground" />
                    </div>
                  )}

                  {/* Pulse animation circle */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-green/20 to-secondary/20 opacity-0 group-hover:opacity-100 animate-pulse" style={{ animationDuration: '3s' }} />
                </div>
              </div>

              {/* Device Info Grid */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-green via-brand-green to-brand-green bg-clip-text text-transparent mb-2">
                        {device.product_name}
                      </h1>
                      <p className="text-xl text-foreground font-medium">{device.manufacturer}</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-brand-green/20 to-brand-green/20 text-foreground-secondary border-brand-green/50 text-base px-4 py-1 shadow-lg shadow-brand-green/20 animate-pulse" style={{ animationDuration: '3s' }}>
                      IODD v{formatVersion(device.iodd_version)}
                    </Badge>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-brand-green/10 to-brand-green/10 border border-border hover:border-brand-green/50 rounded-lg p-4 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-green/20 flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-brand-green" />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Vendor ID</p>
                    </div>
                    <p className="text-xl font-bold font-mono text-foreground">{device.vendor_id}</p>
                  </div>

                  <div className="bg-gradient-to-br from-secondary/10 to-accent/10 border border-border hover:border-secondary/50 rounded-lg p-4 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                        <Package className="w-4 h-4 text-secondary" />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Device ID</p>
                    </div>
                    <p className="text-xl font-bold font-mono text-foreground">{device.device_id}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-border hover:border-success/50 rounded-lg p-4 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                        <Database className="w-4 h-4 text-success" />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Parameters</p>
                    </div>
                    <p className="text-xl font-bold text-foreground">{parameters.length}</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-border hover:border-warning/50 rounded-lg p-4 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-warning" />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Images</p>
                    </div>
                    <p className="text-xl font-bold text-foreground">{imageAssets.length}</p>
                  </div>

                  <div className="bg-gradient-to-br from-brand-green/10 to-brand-green/10 border border-border hover:border-brand-green/50 rounded-lg p-4 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-green/20 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-brand-green" />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Imported</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(device.import_date), 'MMM d, yyyy')}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-border hover:border-pink-500/50 rounded-lg p-4 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-pink-400" />
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Revision</p>
                    </div>
                    <p className="text-lg font-semibold text-foreground">v{formatVersion(device.iodd_version)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs with Icons */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border -mx-8 px-8 py-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="bg-card/50 border border-border p-1 h-auto">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:to-brand-green data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-brand-green/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <Activity className="w-4 h-4" />
                <span className="font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="parameters"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-accent data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-secondary/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Parameters</span>
                <Badge className="ml-2 bg-muted text-foreground text-xs px-2 py-0.5">
                  {parameters.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="images"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-amber-600 data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="font-medium">Images</span>
                <Badge className="ml-2 bg-muted text-foreground text-xs px-2 py-0.5">
                  {imageAssets.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="errors"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-rose-600 data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Errors</span>
                <Badge className="ml-2 bg-muted text-foreground text-xs px-2 py-0.5">
                  {errors.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-amber-600 data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <Radio className="w-4 h-4" />
                <span className="font-medium">Events</span>
                <Badge className="ml-2 bg-muted text-foreground text-xs px-2 py-0.5">
                  {events.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="processdata"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:to-brand-green data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-brand-green/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span className="font-medium">Process Data</span>
                <Badge className="ml-2 bg-muted text-foreground text-xs px-2 py-0.5">
                  {processData.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="communication"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <Wifi className="w-4 h-4" />
                <span className="font-medium">Communication</span>
              </TabsTrigger>
              <TabsTrigger
                value="menus"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-secondary data-[state=active]:to-secondary data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-secondary/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <Menu className="w-4 h-4" />
                <span className="font-medium">Menus</span>
                {uiMenus && uiMenus.menus && (
                  <Badge className="ml-2 bg-muted text-foreground text-xs px-2 py-0.5">
                    {uiMenus.menus.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="xml"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <FileCode className="w-4 h-4" />
                <span className="font-medium">XML</span>
              </TabsTrigger>
              <TabsTrigger
                value="technical"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-green-600 data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <Code2 className="w-4 h-4" />
                <span className="font-medium">Technical</span>
              </TabsTrigger>
              <TabsTrigger
                value="generate"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-brand-green data-[state=active]:to-brand-green data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-brand-green/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <Zap className="w-4 h-4" />
                <span className="font-medium">Generate</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Contents */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="space-y-6">
            {/* Device Capabilities */}
            <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-brand-green/30 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground text-xl flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-green/20 to-brand-green/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-brand-green" />
                    </div>
                    Device Capabilities
                  </CardTitle>
                  <Badge className="bg-brand-green/20 text-brand-green border-brand-green/50">
                    Features
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-border hover:border-success/50 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                      <Database className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Parameters</p>
                      <p className="text-lg font-bold text-foreground">{parameters.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-border hover:border-warning/50 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Asset Files</p>
                      <p className="text-lg font-bold text-foreground">{imageAssets.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-br from-brand-green/10 to-brand-green/5 border border-border hover:border-brand-green/50 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-brand-green/20 flex items-center justify-center flex-shrink-0">
                      <FileCode className="w-5 h-5 text-brand-green" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">IODD Version</p>
                      <p className="text-lg font-bold text-foreground">v{formatVersion(device.iodd_version)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Information */}
            {documentInfo && (
              <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-brand-green/30 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-green/20 to-brand-green/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-brand-green" />
                      </div>
                      Document Information
                    </CardTitle>
                    <Badge className="bg-brand-green/20 text-brand-green border-brand-green/50">
                      Metadata
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Vendor Information Section */}
                    {(documentInfo.vendor_name || documentInfo.vendor_url || documentInfo.vendor_text) && (
                      <div className="pb-4 border-b border-border">
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Vendor Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {documentInfo.vendor_name && (
                            <div className="p-4 rounded-lg bg-gradient-to-br from-brand-green/10 to-brand-green/5 border border-border">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Vendor</p>
                              <p className="text-sm text-foreground font-medium">{documentInfo.vendor_name}</p>
                            </div>
                          )}
                          {documentInfo.vendor_url && (
                            <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-border">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Website</p>
                              <a
                                href={documentInfo.vendor_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-success hover:text-foreground-secondary underline transition-colors inline-flex items-center gap-1"
                              >
                                {documentInfo.vendor_url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                          {documentInfo.vendor_text && (
                            <div className="p-4 rounded-lg bg-gradient-to-br from-surface to-surface border border-border">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Description</p>
                              <p className="text-sm text-foreground">{documentInfo.vendor_text}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Product Information */}
                    {(documentInfo.product_text || documentInfo.device_family) && (
                      <div className="pb-4 border-b border-border">
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Product Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {documentInfo.product_text && (
                            <div className="p-4 rounded-lg bg-gradient-to-br from-surface to-surface border border-border">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Product Description</p>
                              <p className="text-sm text-foreground">{documentInfo.product_text}</p>
                            </div>
                          )}
                          {documentInfo.device_family && (
                            <div className="p-4 rounded-lg bg-gradient-to-br from-surface to-surface border border-border">
                              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Device Family</p>
                              <p className="text-sm text-foreground">{documentInfo.device_family}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Document Metadata */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Document Metadata</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {documentInfo.copyright && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-surface to-surface border border-border">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Copyright</p>
                            <p className="text-sm text-foreground">{documentInfo.copyright}</p>
                          </div>
                        )}
                        {documentInfo.release_date && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-surface to-surface border border-border">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Release Date</p>
                            <p className="text-sm text-foreground">{documentInfo.release_date}</p>
                          </div>
                        )}
                        {documentInfo.version && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-surface to-surface border border-border">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Document Version</p>
                            <p className="text-sm text-foreground">{documentInfo.version}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Device Variants */}
            {deviceVariants && deviceVariants.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-brand-green/30 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <GitBranch className="w-5 h-5 text-purple-400" />
                      </div>
                      Device Variants
                    </CardTitle>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                      {deviceVariants.length} {deviceVariants.length === 1 ? 'Variant' : 'Variants'}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground mt-2">
                    Multiple product configurations available for this device family
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deviceVariants.map((variant, idx) => {
                      const imageAsset = findAssetByFileName(variant.product_variant_image) || findAssetByFileName(variant.device_symbol);
                      const fallbackName = normalizeAssetName(variant.product_variant_image || variant.device_symbol);
                      const imageSrc = imageAsset
                        ? `${API_BASE}/api/iodd/${device.id}/assets/${imageAsset.id}`
                        : fallbackName
                          ? `${API_BASE}/api/iodd/${device.id}/asset/${encodeURIComponent(fallbackName)}`
                          : null;

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-border hover:border-purple-500/50 transition-all"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-24 h-24 rounded-xl bg-background/60 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt={variant.product_variant_name ? translateText(variant.product_variant_name) : 'Variant'}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<div class="text-muted-foreground text-xs">No Image</div>';
                                  }}
                                />
                              ) : (
                                <span className="text-muted-foreground text-xs">No Image</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                {variant.product_variant_id && (
                                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40 text-xs">
                                    {variant.product_variant_id}
                                  </Badge>
                                )}
                                {variant.device_symbol && (
                                  <Badge className="bg-muted text-foreground text-xs">
                                    {variant.device_symbol}
                                  </Badge>
                                )}
                              </div>
                              {variant.product_variant_name && (
                                <h4 className="text-foreground font-semibold text-lg mb-1">
                                  {translateText(variant.product_variant_name)}
                                </h4>
                              )}
                              {variant.product_variant_text && (
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                  {translateText(variant.product_variant_text)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Wiring Configurations */}
            {wiringConfigurations && wiringConfigurations.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-brand-green/30 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                        <Cable className="w-5 h-5 text-teal-400" />
                      </div>
                      Wiring Configurations
                    </CardTitle>
                    <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/50">
                      Installation Guide
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground mt-2">
                    Connector pin-outs and wire assignments for proper device installation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Group by connector type */}
                    {Object.entries(
                      wiringConfigurations.reduce((acc, wire, idx) => {
                        const connectorType = wire.connector_type || `Unknown-${idx}`;
                        if (!acc[connectorType]) {
                          acc[connectorType] = [];
                        }
                        acc[connectorType].push(wire);
                        return acc;
                      }, {})
                    ).map(([connectorType, wires], mapIdx) => (
                      <div key={`${connectorType}-${mapIdx}`} className="p-4 rounded-lg bg-gradient-to-br from-teal-500/10 to-emerald-500/5 border border-border">
                        <div className="flex items-start gap-4">
                          {/* Diagram Image (if available) */}
                          {wires[0].diagram_image && (
                            <div className="w-48 h-48 rounded-lg bg-background/50 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                              <img
                                src={`${API_BASE}/api/iodd/${device.id}/asset/${wires[0].diagram_image}`}
                                alt={`${connectorType} diagram`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="text-muted-foreground text-xs p-4 text-center">Diagram not available</div>';
                                }}
                              />
                            </div>
                          )}

                          {/* Wire Details */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className="bg-teal-500/30 text-teal-300 border-teal-500/50">
                                {connectorType}
                              </Badge>
                            </div>

                            {wires[0].description && (
                              <p className="text-sm text-muted-foreground mb-4">
                                {translateText(wires[0].description)}
                              </p>
                            )}

                            {/* Pin Assignment Table */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border">
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-teal-400 uppercase tracking-wider">Pin</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-teal-400 uppercase tracking-wider">Assignment</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-teal-400 uppercase tracking-wider">Color</th>
                                    <th className="text-left py-2 px-3 text-xs font-semibold text-teal-400 uppercase tracking-wider">Function</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {wires.map((wire, idx) => (
                                    <tr key={`${connectorType}-wire-${wire.wire_number || idx}`} className="border-b border-border/50 hover:bg-teal-500/5 transition-colors">
                                      <td className="py-2 px-3">
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/50 flex items-center justify-center">
                                            <span className="text-xs font-semibold text-teal-300">
                                              {wire.wire_number || '-'}
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-2 px-3 text-foreground font-mono text-xs">
                                        {wire.pin_assignment || '-'}
                                      </td>
                                      <td className="py-2 px-3">
                                        {wire.wire_color ? (
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="w-4 h-4 rounded-full border border-border"
                                              style={{
                                                backgroundColor: wire.wire_color.toLowerCase().includes('brown') ? '#8B4513' :
                                                              wire.wire_color.toLowerCase().includes('white') ? '#FFFFFF' :
                                                              wire.wire_color.toLowerCase().includes('blue') ? '#0000FF' :
                                                              wire.wire_color.toLowerCase().includes('black') ? '#000000' :
                                                              wire.wire_color.toLowerCase().includes('red') ? '#FF0000' :
                                                              wire.wire_color.toLowerCase().includes('green') ? '#00FF00' :
                                                              wire.wire_color.toLowerCase().includes('yellow') ? '#FFFF00' :
                                                              wire.wire_color.toLowerCase().includes('gray') || wire.wire_color.toLowerCase().includes('grey') ? '#808080' :
                                                              '#666666'
                                              }}
                                            />
                                            <span className="text-xs text-muted-foreground">{wire.wire_color}</span>
                                          </div>
                                        ) : (
                                          <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                      </td>
                                      <td className="py-2 px-3 text-muted-foreground text-xs">
                                        {wire.wire_function || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Test Configuration Procedures */}
            {testConfigurations && testConfigurations.config && (
              <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-brand-green/30 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-violet-400" />
                      </div>
                      Test & Commissioning Procedures
                    </CardTitle>
                    <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/50">
                      Quality Assurance
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground mt-2">
                    Automated test procedures and validation steps for device commissioning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Test Configuration Info */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-border">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-violet-400" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-foreground font-semibold text-base mb-2">
                              {testConfigurations.config.test_name || 'Device Test Configuration'}
                            </h4>
                            {testConfigurations.config.test_description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {translateText(testConfigurations.config.test_description)}
                              </p>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {testConfigurations.config.test_duration && (
                                <div className="p-3 rounded-lg bg-background/50 border border-border">
                                  <p className="text-xs text-muted-foreground mb-1">Test Duration</p>
                                  <p className="text-sm font-mono text-violet-400">
                                    {testConfigurations.config.test_duration}
                                  </p>
                                </div>
                              )}
                              {testConfigurations.config.test_conditions && (
                                <div className="p-3 rounded-lg bg-background/50 border border-border md:col-span-2">
                                  <p className="text-xs text-muted-foreground mb-1">Test Conditions</p>
                                  <p className="text-sm text-foreground">
                                    {translateText(testConfigurations.config.test_conditions)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event Triggers */}
                    {testConfigurations.events && testConfigurations.events.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-violet-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Test Event Triggers ({testConfigurations.events.length})
                        </h4>
                        <div className="space-y-3">
                          {testConfigurations.events.map((event, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-border hover:border-violet-500/30 transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-1">
                                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                                    <span className="text-xs font-semibold text-violet-300">
                                      {idx + 1}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h5 className="text-foreground font-semibold text-sm">
                                      {event.event_name || `Event ${idx + 1}`}
                                    </h5>
                                    {event.trigger_condition && (
                                      <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/50 text-xs">
                                        {event.trigger_condition}
                                      </Badge>
                                    )}
                                  </div>
                                  {event.event_description && (
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {translateText(event.event_description)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Datatypes */}
            {customDatatypes && customDatatypes.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-brand-green/30 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center">
                        <Code2 className="w-5 h-5 text-amber-400" />
                      </div>
                      Custom Datatypes
                    </CardTitle>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                      {customDatatypes.length} {customDatatypes.length === 1 ? 'Type' : 'Types'}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground mt-2">
                    Device-specific complex data structures and enumerations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customDatatypes.map((datatype, idx) => {
                      const hasSingleValues = Array.isArray(datatype.single_values) && datatype.single_values.length > 0;
                      const hasRecordItems = Array.isArray(datatype.record_items) && datatype.record_items.length > 0;
                      const inferredValueType = datatype.value_type || (hasRecordItems ? 'RecordItem' : hasSingleValues ? 'SingleValue' : 'Datatype');
                      const isColorDatatype = /color|led/i.test(datatype.datatype_id || '');
                      const isEffectDatatype = /effect|pattern|blink|pulse/i.test(datatype.datatype_id || '');

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-lg bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-border hover:border-amber-500/30 transition-all"
                        >
                          <div className="space-y-3">
                            {/* Datatype Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-foreground font-semibold text-base">
                                    {datatype.datatype_name || datatype.datatype_id}
                                  </h4>
                                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-xs">
                                    {inferredValueType}
                                  </Badge>
                                  {datatype.bit_length && (
                                    <Badge className="bg-muted text-foreground text-xs">
                                      {datatype.bit_length} bits
                                    </Badge>
                                  )}
                                </div>
                                {datatype.datatype_id && datatype.datatype_id !== datatype.datatype_name && (
                                  <p className="text-xs text-muted-foreground font-mono mb-2">
                                    ID: {datatype.datatype_id}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Single Value Enumeration */}
                            {datatype.value_type === 'SingleValue' && hasSingleValues && (
                              <div>
                                <h5 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                  <List className="w-3 h-3" />
                                  Enumeration Values ({datatype.single_values.length})
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {datatype.single_values.map((sv, svIdx) => (
                                    <div
                                      key={svIdx}
                                      className="p-2 rounded bg-background/50 border border-border hover:bg-amber-500/5 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                                          <span className="text-xs font-mono font-semibold text-amber-300">
                                            {sv.value}
                                          </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm text-foreground truncate">
                                            {sv.name || `Value ${sv.value}`}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Color Palette Preview */}
                            {isColorDatatype && hasSingleValues && (
                              <div>
                                <h5 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                  <Palette className="w-3 h-3" />
                                  Color Palette
                                </h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {datatype.single_values.map((sv, svIdx) => (
                                    <div
                                      key={`color-${svIdx}`}
                                      className="p-2 rounded-lg border border-border bg-background/70"
                                    >
                                      <div
                                        className="w-full h-12 rounded-md border border-border mb-2"
                                        style={{ backgroundColor: resolveColorHex(sv.name) }}
                                      />
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-foreground font-medium truncate">{sv.name}</span>
                                        <span className="text-muted-foreground font-mono">{sv.value}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Effect Preview */}
                            {isEffectDatatype && hasSingleValues && (
                              <div>
                                <h5 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                  <Zap className="w-3 h-3" />
                                  Effect Preview
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {datatype.single_values.map((sv, svIdx) => {
                                    const effectStyle = resolveEffectStyle(sv.name || '');
                                    return (
                                      <div
                                        key={`effect-${svIdx}`}
                                        className={`p-3 rounded-xl border border-border/50 bg-gradient-to-br ${effectStyle.gradient}`}
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-sm font-semibold text-white drop-shadow">{sv.name}</span>
                                          <Badge className="bg-white/20 text-white border-white/40 text-[10px]">
                                            {sv.value}
                                          </Badge>
                                        </div>
                                        <p className="text-[11px] text-white/80 leading-relaxed">{effectStyle.description}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Record Item Structure */}
                            {datatype.value_type === 'RecordItem' && datatype.record_items && datatype.record_items.length > 0 && (
                              <div>
                                <h5 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                  <Layers className="w-3 h-3" />
                                  Record Structure ({datatype.record_items.length} fields)
                                </h5>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="border-b border-border">
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-amber-400 uppercase tracking-wider">Subindex</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-amber-400 uppercase tracking-wider">Field Name</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-amber-400 uppercase tracking-wider">Type</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-amber-400 uppercase tracking-wider">Bit Length</th>
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-amber-400 uppercase tracking-wider">Offset</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {datatype.record_items.map((item, itemIdx) => (
                                        <tr key={itemIdx} className="border-b border-border/50 hover:bg-amber-500/5 transition-colors">
                                          <td className="py-2 px-3">
                                            <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                              <span className="text-xs font-semibold text-amber-300">
                                                {item.subindex}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="py-2 px-3 text-foreground font-mono text-xs">
                                            {item.record_item_name}
                                          </td>
                                          <td className="py-2 px-3">
                                            <Badge className="bg-muted text-foreground text-xs">
                                              {item.simple_datatype}
                                            </Badge>
                                          </td>
                                          <td className="py-2 px-3 text-muted-foreground text-xs font-mono">
                                            {item.bit_length || '-'}
                                          </td>
                                          <td className="py-2 px-3 text-muted-foreground text-xs font-mono">
                                            {item.bit_offset !== null ? item.bit_offset : '-'}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* IO-Link Advanced Profiles */}
            {profileCharacteristics.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-brand-green/30 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-green/20 to-brand-green/5 flex items-center justify-center">
                        <Server className="w-5 h-5 text-brand-green" />
                      </div>
                      Advanced IO-Link Profiles
                    </CardTitle>
                    <Badge className="bg-brand-green/20 text-brand-green border-brand-green/40">
                      Profiles {profileCharacteristics.join(', ')}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground mt-2">
                    This device exposes additional IO-Link profiles for binary transfers and firmware updates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profileCharacteristics.map((code, idx) => {
                      const meta = profileCharacteristicInfo[code] || {
                        label: `Profile ${code}`,
                        description: 'Custom IO-Link profile supported by this device.',
                        icon: <Cpu className="w-4 h-4" />,
                      };
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-lg bg-gradient-to-br from-brand-green/10 to-brand-green/5 border border-border"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-brand-green/20 border border-brand-green/40 flex items-center justify-center">
                              {meta.icon}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{meta.label}</p>
                              <p className="text-xs text-muted-foreground">Profile {code}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{meta.description}</p>
                          {code === '48' && (
                            <div className="mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-brand-green/40 text-brand-green hover:bg-brand-green/10"
                                onClick={() =>
                                  toast({
                                    title: 'BLOB Transfer Tools',
                                    description: 'Scene/BLOB management UI coming soon.',
                                  })
                                }
                              >
                                Manage Scenes
                              </Button>
                            </div>
                          )}
                          {code === '49' && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-brand-green/40 text-brand-green hover:bg-brand-green/10"
                                onClick={() =>
                                  toast({
                                    title: 'Firmware Update',
                                    description: 'Firmware workflow UI coming soon.',
                                  })
                                }
                              >
                                Upload Firmware
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  toast({
                                    title: 'Check Compatibility',
                                    description: 'Firmware compatibility checks will be available soon.',
                                  })
                                }
                              >
                                Check Compatibility
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Device Features & Capabilities */}
            {deviceFeatures && (
              <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-brand-green/30 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-secondary" />
                      </div>
                      Device Features
                    </CardTitle>
                    <Badge className="bg-secondary/20 text-secondary border-secondary/50">
                      Capabilities
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Feature flags */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className={`p-3 rounded-lg border ${deviceFeatures.data_storage ? 'bg-success/10 border-success/30' : 'bg-secondary/50 border-border'}`}>
                        <div className="flex items-center gap-2">
                          <Database className={`w-4 h-4 ${deviceFeatures.data_storage ? 'text-success' : 'text-muted-foreground'}`} />
                          <span className={`text-sm ${deviceFeatures.data_storage ? 'text-success' : 'text-muted-foreground'}`}>
                            Data Storage
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg border ${deviceFeatures.block_parameter ? 'bg-success/10 border-success/30' : 'bg-secondary/50 border-border'}`}>
                        <div className="flex items-center gap-2">
                          <Lock className={`w-4 h-4 ${deviceFeatures.block_parameter ? 'text-success' : 'text-muted-foreground'}`} />
                          <span className={`text-sm ${deviceFeatures.block_parameter ? 'text-success' : 'text-muted-foreground'}`}>
                            Block Parameter
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Profile Characteristic */}
                    {deviceFeatures.profile_characteristic && (() => {
                      const characteristics = decodeProfileCharacteristics(deviceFeatures.profile_characteristic);
                      return (
                        <div className="p-4 rounded-lg bg-gradient-to-br from-surface to-surface border border-border">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Profile Characteristics</p>
                          <p className="text-xs text-muted-foreground font-mono mb-2">Raw: {deviceFeatures.profile_characteristic}</p>
                          {characteristics.length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {characteristics.map((char) => (
                                <Badge
                                  key={char.code}
                                  className="bg-secondary/20 text-foreground-secondary border-secondary/50 text-xs"
                                  title={`${char.description} (Code: ${char.code})`}
                                >
                                  {char.name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No profile characteristics decoded</p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Access Locks */}
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Supported Access Locks</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className={`p-3 rounded-lg border text-center ${deviceFeatures.access_locks_data_storage ? 'bg-brand-green/10 border-brand-green/30' : 'bg-secondary/50 border-border'}`}>
                          <Database className={`w-4 h-4 mx-auto mb-1 ${deviceFeatures.access_locks_data_storage ? 'text-brand-green' : 'text-muted-foreground'}`} />
                          <span className={`text-xs ${deviceFeatures.access_locks_data_storage ? 'text-brand-green' : 'text-muted-foreground'}`}>
                            Data Storage
                          </span>
                        </div>
                        <div className={`p-3 rounded-lg border text-center ${deviceFeatures.access_locks_parameter ? 'bg-brand-green/10 border-brand-green/30' : 'bg-secondary/50 border-border'}`}>
                          <Settings className={`w-4 h-4 mx-auto mb-1 ${deviceFeatures.access_locks_parameter ? 'text-brand-green' : 'text-muted-foreground'}`} />
                          <span className={`text-xs ${deviceFeatures.access_locks_parameter ? 'text-brand-green' : 'text-muted-foreground'}`}>
                            Parameter
                          </span>
                        </div>
                        <div className={`p-3 rounded-lg border text-center ${deviceFeatures.access_locks_local_parameterization ? 'bg-brand-green/10 border-brand-green/30' : 'bg-secondary/50 border-border'}`}>
                          <Wrench className={`w-4 h-4 mx-auto mb-1 ${deviceFeatures.access_locks_local_parameterization ? 'text-brand-green' : 'text-muted-foreground'}`} />
                          <span className={`text-xs ${deviceFeatures.access_locks_local_parameterization ? 'text-brand-green' : 'text-muted-foreground'}`}>
                            Local Param
                          </span>
                        </div>
                        <div className={`p-3 rounded-lg border text-center ${deviceFeatures.access_locks_local_user_interface ? 'bg-brand-green/10 border-brand-green/30' : 'bg-secondary/50 border-border'}`}>
                          <Monitor className={`w-4 h-4 mx-auto mb-1 ${deviceFeatures.access_locks_local_user_interface ? 'text-brand-green' : 'text-muted-foreground'}`} />
                          <span className={`text-xs ${deviceFeatures.access_locks_local_user_interface ? 'text-brand-green' : 'text-muted-foreground'}`}>
                            Local UI
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Standard IO-Link Status & Diagnostics */}
            {(deviceStatusInfo || deviceAccessLocksValue !== null || deviceErrorCount || diagnosticParameters.length > 0) && (
              <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-brand-green/30 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-success" />
                      </div>
                      Standard Device Status
                    </CardTitle>
                    <Badge className="bg-success/20 text-success border-success/40">
                      IO-Link Spec
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground mt-2">
                    Real-time health indicators derived from standard IO-Link variables (V_*)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {deviceStatusInfo && (
                      <div className={`p-4 rounded-lg border ${deviceStatusInfo.tone === 'success' ? 'border-success/40 bg-success/10' : deviceStatusInfo.tone === 'warning' ? 'border-warning/40 bg-warning/10' : deviceStatusInfo.tone === 'destructive' ? 'border-destructive/40 bg-destructive/10' : 'border-border bg-secondary/50'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">Device Status</span>
                          <Badge className="bg-background/50 text-foreground text-xs">
                            {deviceStatusInfo.value}
                          </Badge>
                        </div>
                        <p className="text-lg font-semibold text-foreground">{deviceStatusInfo.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{deviceStatusInfo.description}</p>
                      </div>
                    )}
                    {deviceErrorCount !== undefined && deviceErrorCount !== null && (
                      <div className="p-4 rounded-lg border border-border bg-secondary/40">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs uppercase tracking-wide text-muted-foreground">Error Count</span>
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        </div>
                        <p className="text-lg font-semibold text-foreground">
                          {deviceErrorCount || '0'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Reported via V_ErrorCount</p>
                      </div>
                    )}
                    {(deviceAccessLocksValue !== null || deviceOperatingTime) && (
                      <div className="p-4 rounded-lg border border-border bg-secondary/40 space-y-2">
                        {deviceOperatingTime && (
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Operating Time (approx.)</p>
                            <p className="text-lg font-semibold text-foreground">{deviceOperatingTime}</p>
                          </div>
                        )}
                        {deviceAccessLocksValue !== null && (
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Access Locks</p>
                            <div className="flex flex-wrap gap-1 text-xs">
                              {[
                                { label: 'Parameter', mask: 1 },
                                { label: 'Data Storage', mask: 2 },
                                { label: 'Local Params', mask: 4 },
                                { label: 'Local UI', mask: 8 },
                              ].map((lock) => (
                                <Badge
                                  key={lock.label}
                                  className={`${deviceAccessLocksValue & lock.mask ? 'bg-success/20 text-success border-success/40' : 'bg-muted text-muted-foreground border-border'}`}
                                >
                                  {lock.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {diagnosticParameters.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/40">Diagnostics</Badge>
                        <span className="text-xs text-muted-foreground">Key variables with diagnostic focus</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {diagnosticParameters.map((param) => (
                          <div key={`${param.id}-${param.subindex ?? 0}`} className="p-3 rounded-lg border border-border bg-background/60">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="text-sm font-semibold text-foreground">{param.name || param.id}</h5>
                              {param.bit_length && (
                                <Badge className="bg-muted text-foreground text-[10px]">
                                  {param.bit_length} bits
                                </Badge>
                              )}
                            </div>
                            {param.description && (
                              <p className="text-xs text-muted-foreground mb-2">
                                {param.description}
                              </p>
                            )}
                            <div className="flex items-center text-xs text-muted-foreground gap-3">
                              <span className="font-mono text-foreground/80">Index {param.index}</span>
                              {param.default_value !== undefined && (
                                <span>Default: {param.default_value === null ? '—' : param.default_value}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Device Images Gallery */}
            {imageAssets.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-brand-green/30 transition-all">
                <CardHeader>
                  <CardTitle className="text-foreground text-xl flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-warning" />
                    </div>
                    Device Images
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Visual assets and product images
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imageAssets.map((asset, index) => (
                      <div key={asset.id} className="group space-y-2">
                        <div
                          onClick={() => {
                            setLightboxIndex(index);
                            setLightboxOpen(true);
                          }}
                          className="aspect-square bg-gradient-to-br from-surface to-surface rounded-lg p-3 border border-border hover:border-brand-green/50 transition-all cursor-pointer relative overflow-hidden"
                        >
                          {/* Hover glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                          <img
                            src={`${API_BASE}/api/iodd/${device.id}/assets/${asset.id}`}
                            alt={asset.file_name}
                            className="relative z-10 w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground truncate">{asset.file_name}</p>
                          {asset.image_purpose && (
                            <Badge className="text-xs mt-1 bg-brand-green/20 text-brand-green border-brand-green/50">
                              {asset.image_purpose}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          </TabsContent>

          {/* Parameters Tab */}
          <TabsContent value="parameters" className="space-y-4 mt-6">
            <div className="space-y-4">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground text-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-secondary" />
                      </div>
                      Device Parameters
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                      {parameters.length} configuration parameters available
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-secondary/20 text-secondary border-secondary/50 text-base px-4 py-1">
                      {filteredParameters.length} / {parameters.length}
                    </Badge>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportParameters('csv')}
                        disabled={filteredParameters.length === 0}
                        className="border-secondary/50 text-foreground-secondary hover:bg-secondary/10"
                        title="Export to CSV"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportParameters('json')}
                        disabled={filteredParameters.length === 0}
                        className="border-secondary/50 text-foreground-secondary hover:bg-secondary/10"
                        title="Export to JSON"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        JSON
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Box */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search parameters by name or index..."
                      value={paramSearchQuery}
                      onChange={(e) => setParamSearchQuery(e.target.value)}
                      className="pl-11 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-secondary/50 focus:ring-secondary/20 transition-all"
                    />
                  </div>

                  {/* Filter Toggle and Advanced Filters */}
                  <div className="mt-3">
                    <button
                      onClick={() => setParamShowFilters(!paramShowFilters)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors"
                    >
                      <Filter className="w-4 h-4" />
                      {paramShowFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    {paramShowFilters && (
                      <div className="mt-3 p-4 rounded-lg bg-secondary/50 border border-border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Access Rights Filter */}
                          <div>
                            <label className="block text-xs text-muted-foreground mb-2">Access Rights</label>
                            <select
                              value={paramAccessFilter}
                              onChange={(e) => setParamAccessFilter(e.target.value)}
                              className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-sm focus:border-secondary/50 focus:ring-secondary/20 transition-all"
                            >
                              <option value="all">All Access Rights</option>
                              <option value="ro">🔒 Read Only (ro)</option>
                              <option value="rw">🔓 Read/Write (rw)</option>
                              <option value="wo">✏️ Write Only (wo)</option>
                            </select>
                          </div>

                          {/* Data Type Filter */}
                          <div>
                            <label className="block text-xs text-muted-foreground mb-2">Data Type</label>
                            <select
                              value={paramDataTypeFilter}
                              onChange={(e) => setParamDataTypeFilter(e.target.value)}
                              className="w-full px-3 py-2 rounded bg-card border border-border text-foreground text-sm focus:border-secondary/50 focus:ring-secondary/20 transition-all"
                            >
                              <option value="all">All Data Types</option>
                              <option value="boolean">Boolean</option>
                              <option value="integer">Integer</option>
                              <option value="uinteger">Unsigned Integer</option>
                              <option value="float">Float</option>
                              <option value="string">String</option>
                              <option value="octetstring">Octet String</option>
                              <option value="record">Record</option>
                              <option value="array">Array</option>
                            </select>
                          </div>
                        </div>

                        {/* Active Filters Summary */}
                        {(paramAccessFilter !== 'all' || paramDataTypeFilter !== 'all') && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-muted-foreground">Active filters:</span>
                              {paramAccessFilter !== 'all' && (
                                <Badge className="bg-brand-green/20 text-foreground-secondary border-brand-green/50 text-xs">
                                  Access: {paramAccessFilter.toUpperCase()}
                                </Badge>
                              )}
                              {paramDataTypeFilter !== 'all' && (
                                <Badge className="bg-success/20 text-foreground-secondary border-success/50 text-xs">
                                  Type: {paramDataTypeFilter}
                                </Badge>
                              )}
                              <button
                                onClick={() => {
                                  setParamAccessFilter('all');
                                  setParamDataTypeFilter('all');
                                }}
                                className="text-xs text-muted-foreground hover:text-error transition-colors ml-auto"
                              >
                                Clear all filters
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {filteredParameters.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-secondary to-accent">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Index</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Type</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Access</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Default</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Range/Options</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredParameters.map((param, index) => (
                          <tr
                            key={index}
                            className="border-b border-border hover:bg-gradient-to-r hover:from-secondary/10 hover:to-transparent transition-all"
                          >
                            <td className="py-3 px-4 text-sm font-mono text-brand-green font-semibold">{param.index}</td>
                            <td className="py-3 px-4 text-sm text-foreground font-medium">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span>{param.name}</span>
                                {param.dynamic && (
                                  <Badge className="bg-brand-green/20 text-brand-green border-brand-green/50 text-xs" title="Parameter updates in real-time">
                                    🔄 Dynamic
                                  </Badge>
                                )}
                                {param.unit_code && (() => {
                                  const unitInfo = getUnitInfo(param.unit_code);
                                  return (
                                    <span className="text-xs text-secondary font-semibold" title={`Unit Code ${param.unit_code}: ${unitInfo.name}`}>
                                      [{unitInfo.symbol || param.unit_code}]
                                    </span>
                                  );
                                })()}
                                {param.bit_length && (
                                  <span className="text-xs text-muted-foreground">({param.bit_length} bits)</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{param.data_type}</td>
                            <td className="py-3 px-4 text-sm">
                              <Badge className={`text-xs ${
                                param.access_rights === 'rw' || param.access_rights === 'RW'
                                  ? 'bg-success/20 text-success border-success/50'
                                  : param.access_rights === 'ro' || param.access_rights === 'RO'
                                  ? 'bg-brand-green/20 text-brand-green border-brand-green/50'
                                  : 'bg-warning/20 text-warning border-warning/50'
                              }`}>
                                {param.access_rights}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {param.enumeration_values && param.default_value ? (
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-brand-green">{param.default_value}</span>
                                  <span className="text-muted-foreground">=</span>
                                  <span className="text-foreground">
                                    {param.enumeration_values[param.default_value] || 'Unknown'}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-mono text-muted-foreground">
                                  {param.default_value || '-'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {param.enumeration_values && Object.keys(param.enumeration_values).length > 0 ? (
                                <div className="space-y-1">
                                  <Badge className="bg-secondary/20 text-foreground-secondary border-secondary/50 text-xs">
                                    {Object.keys(param.enumeration_values).length} options
                                  </Badge>
                                  <div className="text-xs text-muted-foreground">
                                    {Object.entries(param.enumeration_values).slice(0, 2).map(([value, label]) => (
                                      <div key={value}>{value}: {label}</div>
                                    ))}
                                    {Object.keys(param.enumeration_values).length > 2 && (
                                      <div>...</div>
                                    )}
                                  </div>
                                </div>
                              ) : param.min_value && param.max_value ? (
                                <span className="font-mono text-muted-foreground">
                                  {param.min_value} - {param.max_value}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {(param.access_rights === 'rw' || param.access_rights === 'RW') ? (
                                param.enumeration_values && Object.keys(param.enumeration_values).length > 0 ? (
                                  <Select defaultValue={param.default_value || Object.keys(param.enumeration_values)[0]}>
                                    <SelectTrigger className="w-full bg-secondary border-border text-foreground hover:border-secondary/50 transition-all">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-secondary border-border">
                                      {Object.entries(param.enumeration_values).map(([value, label]) => (
                                        <SelectItem
                                          key={value}
                                          value={value}
                                          className="text-foreground hover:bg-secondary/20 cursor-pointer"
                                        >
                                          <div className="flex items-center space-x-2">
                                            <span className="font-mono text-brand-green text-xs">{value}:</span>
                                            <span>{label}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : param.data_type === 'BooleanT' ? (
                                  <Select defaultValue={param.default_value || '0'}>
                                    <SelectTrigger className="w-full bg-secondary border-border text-foreground hover:border-secondary/50 transition-all">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-secondary border-border">
                                      <SelectItem value="0" className="text-foreground hover:bg-secondary/20 cursor-pointer">
                                        False (0)
                                      </SelectItem>
                                      <SelectItem value="1" className="text-foreground hover:bg-secondary/20 cursor-pointer">
                                        True (1)
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : param.data_type === 'StringT' ? (
                                  <Input
                                    type="text"
                                    defaultValue={param.default_value || ''}
                                    placeholder="Enter value..."
                                    className="w-full bg-secondary border-border text-foreground focus:border-secondary/50 focus:ring-secondary/20 transition-all"
                                  />
                                ) : (
                                  <Input
                                    type="number"
                                    defaultValue={param.default_value || ''}
                                    min={param.min_value || undefined}
                                    max={param.max_value || undefined}
                                    placeholder="Enter value..."
                                    className="w-full bg-secondary border-border text-foreground focus:border-secondary/50 focus:ring-secondary/20 transition-all font-mono"
                                  />
                                )
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-muted/50 text-muted-foreground border-border text-xs">
                                    Read Only
                                  </Badge>
                                  {param.enumeration_values && param.default_value && (
                                    <span className="text-xs text-muted-foreground">
                                      ({param.enumeration_values[param.default_value]})
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {paramSearchQuery ? 'No parameters match your search' : 'No parameters found'}
                    </p>
                    {paramSearchQuery && (
                      <Button
                        variant="link"
                        onClick={() => setParamSearchQuery('')}
                        className="mt-2 text-secondary"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-4 mt-6">
            <div className="space-y-4">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-warning" />
                  </div>
                  Device Images
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {imageAssets.length} image file{imageAssets.length !== 1 ? 's' : ''} available
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imageAssets.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {imageAssets.map((asset, index) => (
                      <div key={asset.id} className="group space-y-3">
                        <div
                          onClick={() => {
                            setLightboxIndex(index);
                            setLightboxOpen(true);
                          }}
                          className="aspect-square bg-gradient-to-br from-surface to-surface rounded-lg p-4 border border-border hover:border-warning/50 transition-all cursor-pointer relative overflow-hidden"
                        >
                          {/* Hover glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                          <img
                            src={`${API_BASE}/api/iodd/${device.id}/assets/${asset.id}`}
                            alt={asset.file_name}
                            className="relative z-10 w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div>
                          <p className="text-sm text-foreground font-medium truncate">{asset.file_name}</p>
                          {asset.image_purpose && (
                            <Badge className="text-xs mt-1 bg-warning/20 text-warning border-warning/50">
                              {asset.image_purpose}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No images found</p>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors" className="space-y-4 mt-6">
            <div className="space-y-4">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-error" />
                  </div>
                  Error Types
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Standard IO-Link error codes supported by this device
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search Box */}
                {errors.length > 0 && (
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search errors by name, code, or description..."
                        value={errorSearchQuery}
                        onChange={(e) => setErrorSearchQuery(e.target.value)}
                        className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-error/50 focus:ring-error/20 text-sm"
                      />
                    </div>
                  </div>
                )}

                {loadingErrors ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 bg-secondary" />
                    ))}
                  </div>
                ) : errors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No error types defined for this device
                  </div>
                ) : filteredErrors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No errors match your search
                    <Button
                      variant="link"
                      onClick={() => setErrorSearchQuery('')}
                      className="mt-2 text-error"
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredErrors.map((error) => (
                      <div
                        key={error.id}
                        className="p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-border hover:border-error/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="px-3 py-1 rounded-md bg-error/20 border border-error/30">
                              <span className="text-error font-mono text-sm font-bold">
                                {error.code}/{error.additional_code}
                              </span>
                            </div>
                            <div className="px-3 py-1 rounded-md bg-muted/30 border border-border/30">
                              <span className="text-foreground font-mono text-xs">
                                0x{error.code.toString(16).toUpperCase().padStart(2, '0')}/0x{error.additional_code.toString(16).toUpperCase().padStart(2, '0')}
                              </span>
                            </div>
                            <h3 className="text-foreground font-semibold">{error.name}</h3>
                          </div>
                        </div>
                        {error.description && (
                          <p className="text-muted-foreground text-sm mt-2 ml-1">{error.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4 mt-6">
            <div className="space-y-4">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                    <Radio className="w-5 h-5 text-warning" />
                  </div>
                  Device Events
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Events that can be triggered by this device
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search Box */}
                {events.length > 0 && (
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search events by name, code, type, or description..."
                        value={eventSearchQuery}
                        onChange={(e) => setEventSearchQuery(e.target.value)}
                        className="pl-10 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-warning/50 focus:ring-yellow-500/20 text-sm"
                      />
                    </div>
                  </div>
                )}

                {loadingEvents ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 bg-secondary" />
                    ))}
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No events defined for this device
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No events match your search
                    <Button
                      variant="link"
                      onClick={() => setEventSearchQuery('')}
                      className="mt-2 text-warning"
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-border hover:border-warning/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="px-3 py-1 rounded-md bg-warning/20 border border-warning/30">
                              <span className="text-warning font-mono text-sm font-bold">
                                {event.code}
                              </span>
                            </div>
                            <div className="px-3 py-1 rounded-md bg-muted/30 border border-border/30">
                              <span className="text-foreground font-mono text-xs">
                                0x{event.code.toString(16).toUpperCase().padStart(4, '0')}
                              </span>
                            </div>
                            {event.event_type && (
                              <Badge className={`
                                ${event.event_type === 'Error' ? 'bg-error/20 text-error border-error/50' : ''}
                                ${event.event_type === 'Warning' ? 'bg-warning/20 text-warning border-warning/50' : ''}
                                ${event.event_type === 'Notification' ? 'bg-brand-green/20 text-brand-green border-brand-green/50' : ''}
                                font-semibold
                              `}>
                                {event.event_type}
                              </Badge>
                            )}
                            <h3 className="text-foreground font-semibold">{event.name}</h3>
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-muted-foreground text-sm mt-2 ml-1">{event.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Process Data Tab */}
          <TabsContent value="processdata" className="space-y-4 mt-6">
            {renderProcessDataTab()}
          </TabsContent>
          <TabsContent value="communication" className="space-y-4 mt-6">
            <div className="space-y-4">
              {communicationProfile ? (
                <Card className="bg-card/80 border-border hover-border-teal-500/30 transition-all">
                  <CardHeader>
                    <CardTitle className="text-foreground text-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-600/20 to-emerald-500/10 flex items-center justify-center">
                        <Network className="w-5 h-5 text-teal-400" />
                      </div>
                      Communication Profile
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                      Electrical, timing, and wiring characteristics for this IO-Link device
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                {/* Protocol Information */}
                <div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Protocol</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {communicationProfile.iolink_revision && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-teal-500/10 to-emerald-500/5 border border-border">
                            <p className="text-xs text-muted-foreground mb-1">IO-Link Revision</p>
                            <p className="text-lg font-bold text-teal-400">{communicationProfile.iolink_revision}</p>
                          </div>
                        )}
                        {communicationProfile.compatible_with && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-brand-green/10 to-brand-green/5 border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Compatible With</p>
                            <p className="text-lg font-bold text-brand-green">{communicationProfile.compatible_with}</p>
                          </div>
                        )}
                        {communicationProfile.bitrate && (() => {
                          const bitrateDisplay = translateBitrate(communicationProfile.bitrate);
                          return (
                            <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-accent/5 border border-border">
                              <p className="text-xs text-muted-foreground mb-1">Bitrate</p>
                              <p className="text-lg font-bold text-secondary" title={`${communicationProfile.bitrate} - ${bitrateDisplay}`}>
                                {bitrateDisplay}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Timing Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Timing & Performance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {communicationProfile.min_cycle_time && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-border">
                            <p className="text-xs text-muted-foreground mb-1">Min Cycle Time</p>
                            <p className="text-lg font-bold text-warning" title={`${communicationProfile.min_cycle_time} microseconds`}>
                              {formatCycleTime(communicationProfile.min_cycle_time)}
                            </p>
                          </div>
                        )}
                        {communicationProfile.msequence_capability && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-border">
                            <p className="text-xs text-muted-foreground mb-1">M-Sequence Capability</p>
                            <p className="text-lg font-bold text-success" title={`${communicationProfile.msequence_capability} bytes`}>
                              {decodeMSequence(communicationProfile.msequence_capability)}
                            </p>
                          </div>
                        )}
                        <div className={`p-4 rounded-lg border ${communicationProfile.sio_supported ? 'bg-success/10 border-success/30' : 'bg-secondary/50 border-border'}`}>
                          <p className="text-xs text-muted-foreground mb-1">SIO Support</p>
                          <p className={`text-lg font-bold ${communicationProfile.sio_supported ? 'text-success' : 'text-muted-foreground'}`}>
                            {communicationProfile.sio_supported ? 'Supported' : 'Not Supported'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Physical Connection */}
                    {communicationProfile.connection_type && (() => {
                      const connInfo = getConnectionTypeInfo(communicationProfile.connection_type);
                      return (
                        <div>
                          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Physical Connection</h3>
                          <div className="p-4 rounded-lg bg-gradient-to-br from-surface to-surface border border-border">
                            <p className="text-xs text-muted-foreground mb-2">Connection Type</p>
                            <p className="text-lg font-bold text-foreground">{communicationProfile.connection_type}</p>
                            {connInfo.description !== communicationProfile.connection_type && (
                              <p className="text-xs text-muted-foreground mt-2">{connInfo.description}</p>
                            )}
                            {connInfo.pins > 0 && (
                              <p className="text-xs text-success mt-1">{connInfo.pins} pins</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Wire Configuration */}
                    {communicationProfile.wire_config && Object.keys(communicationProfile.wire_config).length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Wire Configuration</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(communicationProfile.wire_config).map(([wire, func]) => {
                            const wireInfo = getWireColorInfo(wire);
                            return (
                              <div key={wire} className="p-3 rounded-lg bg-gradient-to-br from-brand-green/10 to-brand-green/5 border border-border hover:border-brand-green/50 transition-all">
                                <div className="flex items-center gap-2 mb-1">
                                  <div
                                    className="w-4 h-4 rounded-full border-2 border-border shadow-inner"
                                    style={{ backgroundColor: wireInfo.hex }}
                                    title={wireInfo.name}
                                  />
                                  <p className="text-xs text-muted-foreground font-mono">{wire}</p>
                                </div>
                                <p className="text-xs text-foreground mb-1">{wireInfo.name}</p>
                                <p className="text-xs font-semibold text-brand-green">{func}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No communication profile information available for this device
                </div>
              )}
            </div>
          </TabsContent>

          {/* Enhanced Menus Tab with Parameter Details */}
          <TabsContent value="menus" className="space-y-4 mt-6">
            <div className="space-y-4">
            {/* System Command Buttons */}
            {menuButtons && menuButtons.length > 0 && (
              <Card className="bg-card/80 backdrop-blur-sm border-border hover:border-orange-500/30 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                        <Command className="w-5 h-5 text-orange-400" />
                      </div>
                      System Commands
                    </CardTitle>
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                      {menuButtons.length} {menuButtons.length === 1 ? 'Command' : 'Commands'}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground mt-2">
                    System-level commands for device management and maintenance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {menuButtons.map((button, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-border hover:border-orange-500/50 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
                              {button.button_function === 'FactoryReset' && <RotateCcw className="w-5 h-5 text-orange-400" />}
                              {button.button_function === 'Identify' && <Radio className="w-5 h-5 text-orange-400" />}
                              {button.button_function === 'TeachIn' && <Book className="w-5 h-5 text-orange-400" />}
                              {button.button_function === 'LocalParameterization' && <Wrench className="w-5 h-5 text-orange-400" />}
                              {button.button_function === 'RestoreFactorySettings' && <RotateCcw className="w-5 h-5 text-orange-400" />}
                              {!['FactoryReset', 'Identify', 'TeachIn', 'LocalParameterization', 'RestoreFactorySettings'].includes(button.button_function) && (
                                <Command className="w-5 h-5 text-orange-400" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-foreground font-semibold text-sm mb-1">
                              {button.button_function || 'System Command'}
                            </h4>
                            {button.button_value !== null && (
                              <div className="text-xs text-muted-foreground mb-2">
                                <span className="font-mono">Value: {button.button_value}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Badge className="bg-muted text-foreground text-xs">
                                Menu: {button.menu_id || 'N/A'}
                              </Badge>
                              {button.access_rights && (
                                <Badge className={`text-xs ${
                                  button.access_rights === 'ro' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                                  button.access_rights === 'rw' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                                  'bg-muted text-foreground'
                                }`}>
                                  {button.access_rights.toUpperCase()}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {configSchema && configSchema.menus && configSchema.menus.length > 0 ? (
              <div className="space-y-4">
                {/* Configuration Toolbar */}
                <Card className="bg-gradient-to-r from-secondary/10 to-secondary/10 border-secondary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/20 flex items-center justify-center">
                          <Settings className="w-5 h-5 text-secondary" />
                        </div>
                        <div className="flex-1">
                          <Input
                            value={configurationName}
                            onChange={(e) => setConfigurationName(e.target.value)}
                            className="bg-secondary/50 border-secondary/30 text-foreground font-semibold max-w-md"
                            placeholder="Configuration name..."
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {hasUnsavedChanges ? (
                              <span className="text-warning">Unsaved changes</span>
                            ) : (
                              'All changes auto-saved'
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetConfiguration}
                          className="bg-secondary border-border hover:bg-muted"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportConfiguration}
                          className="bg-secondary/10 border-secondary/50 hover:bg-secondary/20 text-secondary"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Main Configuration Interface */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Left: Configuration Interface */}
                  <div className="col-span-12 lg:col-span-8">
                    <Card className="bg-card/80 backdrop-blur-sm border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-foreground text-lg">Device Configuration</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Adjust device parameters - changes are not applied to the physical device
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Menu Tabs */}
                        <Tabs value={activeConfigMenu} onValueChange={setActiveConfigMenu} className="w-full">
                          <TabsList className="bg-secondary/50 border border-border p-1 flex flex-wrap h-auto">
                            {configSchema.menus.map((menu) => (
                              <TabsTrigger
                                key={menu.id}
                                value={menu.id}
                                className="data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary text-muted-foreground text-sm"
                              >
                                {menu.name}
                                <Badge className="ml-2 bg-muted text-foreground text-xs">
                                  {menu.items.length}
                                </Badge>
                              </TabsTrigger>
                            ))}
                          </TabsList>

                          {/* Menu Content - Show ALL items */}
                          {configSchema.menus.map((menu) => (
                            <TabsContent key={menu.id} value={menu.id} className="mt-4 space-y-3">
                              <div className="space-y-3">
                              {menu.items.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                  No items in this menu
                                </div>
                              ) : (
                                menu.items.map((item, idx) => (
                                  <MenuItemDisplay key={idx} item={item} />
                                ))
                              )}
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right: Parameter Details Panel */}
                  <div className="col-span-12 lg:col-span-4">
                    <Card className="bg-card/80 backdrop-blur-sm border-border sticky top-4">
                      <CardHeader>
                        <CardTitle className="text-foreground text-lg flex items-center gap-2">
                          <Info className="w-5 h-5 text-secondary" />
                          Parameter Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedParameter && selectedParameter.parameter ? (
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground mb-1">
                                {selectedParameter.parameter.name}
                              </h3>
                              <Badge className="font-mono text-xs bg-brand-green/20 text-foreground-secondary border-brand-green/50">
                                {selectedParameter.variable_id}
                              </Badge>
                            </div>

                            {selectedParameter.parameter.description && (
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Description</p>
                                <p className="text-sm text-foreground">{selectedParameter.parameter.description}</p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="p-2 rounded bg-secondary/50 border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Data Type</p>
                                <p className="text-foreground font-mono text-xs">{selectedParameter.parameter.data_type}</p>
                              </div>
                              <div className="p-2 rounded bg-secondary/50 border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Access</p>
                                <Badge className={`text-xs ${selectedParameter.access_right_restriction === 'ro' ? 'bg-brand-green/20 text-brand-green' : selectedParameter.access_right_restriction === 'wo' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                                  {selectedParameter.access_right_restriction}
                                </Badge>
                              </div>
                              {selectedParameter.parameter.default_value && (
                                <div className="p-2 rounded bg-secondary/50 border border-border">
                                  <p className="text-xs text-muted-foreground mb-1">Default</p>
                                  <p className="text-foreground font-mono text-xs">{selectedParameter.parameter.default_value}</p>
                                </div>
                              )}
                              {selectedParameter.parameter.bit_length && (
                                <div className="p-2 rounded bg-secondary/50 border border-border">
                                  <p className="text-xs text-muted-foreground mb-1">Bit Length</p>
                                  <p className="text-foreground font-mono text-xs">{selectedParameter.parameter.bit_length}</p>
                                </div>
                              )}
                            </div>

                            {(selectedParameter.parameter.min_value !== null || selectedParameter.parameter.max_value !== null) && (
                              <div className="p-3 rounded-lg bg-brand-green/10 border border-brand-green/30">
                                <p className="text-xs text-brand-green font-semibold mb-2">Value Range</p>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-foreground">Min: <span className="font-mono">{selectedParameter.parameter.min_value}</span></span>
                                  <span className="text-foreground">Max: <span className="font-mono">{selectedParameter.parameter.max_value}</span></span>
                                </div>
                              </div>
                            )}

                            {selectedParameter.parameter.enumeration_values && Object.keys(selectedParameter.parameter.enumeration_values).length > 0 && (
                              <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                                <p className="text-xs text-success font-semibold mb-2">Valid Values</p>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                  {Object.entries(selectedParameter.parameter.enumeration_values).map(([value, name]) => (
                                    <div key={value} className="text-xs text-foreground flex items-center gap-2">
                                      <span className="font-mono bg-secondary px-2 py-1 rounded">{value}</span>
                                      <span>{name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="pt-3 border-t border-border">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(selectedParameter.variable_id)}
                                className="w-full bg-secondary border-border hover:bg-muted"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Variable ID
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="text-sm">Click on any parameter to view details</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {configSchema === null ? (
                  <div>
                    <Skeleton className="h-8 w-64 mx-auto mb-2 bg-secondary" />
                    <Skeleton className="h-4 w-48 mx-auto bg-secondary" />
                  </div>
                ) : (
                  'No menu structure information available for this device'
                )}
              </div>
            )}
            </div>
          </TabsContent>

          {/* XML Viewer Tab */}
          <TabsContent value="xml" className="space-y-4 mt-6">
            <div className="space-y-4">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-xl flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-success" />
                  IODD XML Source
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  View the raw XML definition for this device
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingXml ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-muted-foreground">Loading XML...</div>
                  </div>
                ) : xmlContent ? (
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(xmlContent);
                        toast({
                          title: 'Copied to clipboard',
                          description: 'XML content copied successfully',
                        });
                      }}
                      className="absolute top-2 right-2 z-10 border-border text-foreground hover:bg-secondary"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <div className="h-[600px] w-full rounded-lg border border-border bg-background overflow-auto">
                      <pre className="p-4 text-xs font-mono text-success whitespace-pre-wrap break-words">
                        {xmlContent}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No XML content available
                  </div>
                )}
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6 mt-6">
            <div className="space-y-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border">
                <CardHeader>
                <CardTitle className="text-foreground text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-success" />
                  </div>
                  Technical Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Device specifications and metadata
                </CardDescription>
              </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-brand-green/10 to-brand-green/5 border border-border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Cpu className="w-4 h-4 text-brand-green" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Vendor ID</p>
                    </div>
                    <p className="text-lg font-mono font-bold text-foreground">{device.vendor_id}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-accent/5 border border-border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-4 h-4 text-secondary" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Device ID</p>
                    </div>
                    <p className="text-lg font-mono font-bold text-foreground">{device.device_id}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-border">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileCode className="w-4 h-4 text-success" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">IODD Version</p>
                    </div>
                    <p className="text-lg font-bold text-foreground">v{formatVersion(device.iodd_version)}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Database className="w-4 h-4 text-warning" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Parameters</p>
                    </div>
                    <p className="text-lg font-bold text-foreground">{parameters.length}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-brand-green/10 to-brand-green/5 border border-border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-brand-green" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Import Date</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(device.import_date), 'PPP')}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-rose-500/5 border border-border">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-pink-400" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Asset Count</p>
                    </div>
                    <p className="text-lg font-bold text-foreground">{assets.length}</p>
                  </div>
                </div>

                {/* Standard Variables */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                      <Database className="w-4 h-4 text-success" />
                    </div>
                    Standard Variables
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-green-600 to-emerald-600">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Variable</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Value</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border hover:bg-success/5">
                          <td className="py-3 px-4 text-sm font-medium text-foreground">Product Name</td>
                          <td className="py-3 px-4 text-sm text-foreground">{device.product_name}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">Device product name</td>
                        </tr>
                        <tr className="border-b border-border hover:bg-success/5">
                          <td className="py-3 px-4 text-sm font-medium text-foreground">Manufacturer</td>
                          <td className="py-3 px-4 text-sm text-foreground">{device.manufacturer}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">Manufacturer name</td>
                        </tr>
                        <tr className="border-b border-border hover:bg-success/5">
                          <td className="py-3 px-4 text-sm font-medium text-foreground">IODD Version</td>
                          <td className="py-3 px-4 text-sm font-mono text-foreground">{device.iodd_version}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">IO-Link Device Description version</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-4 mt-6">
            <div className="space-y-4">
            <Card className="bg-card/80 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-green/20 to-brand-green/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-brand-green" />
                  </div>
                  Generate Adapter
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Create adapters for various platforms and frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    className="h-32 flex-col space-y-3 bg-gradient-to-br from-brand-green/20 to-brand-green/20 border-brand-green/50 transition-all"
                    disabled
                  >
                    <div className="w-16 h-16 rounded-xl bg-brand-green/20 flex items-center justify-center">
                      <Code2 className="w-8 h-8 text-brand-green opacity-50" />
                    </div>
                    <span className="text-base font-semibold">Node-RED (Coming Soon)</span>
                  </Button>
                  <Button
                    className="h-32 flex-col space-y-3 bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-success/50 transition-all"
                    disabled
                  >
                    <div className="w-16 h-16 rounded-xl bg-success/20 flex items-center justify-center">
                      <FileCode className="w-8 h-8 text-success opacity-50" />
                    </div>
                    <span className="text-base font-semibold">Python (Coming Soon)</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={lightboxSlides}
        index={lightboxIndex}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-error/50 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-error flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Device
            </DialogTitle>
            <DialogDescription className="text-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">{device.product_name}</span>?
              <br />
              <span className="text-error">This action cannot be undone.</span> All device data, parameters, and assets will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="border-border text-foreground hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-error hover:bg-error/90 text-foreground"
            >
              {deleting ? 'Deleting...' : 'Delete Device'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Button */}
      <TicketButton onClick={() => setShowTicketModal(true)} />

      {/* Ticket Modal */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        deviceType="IODD"
        deviceId={device.id}
        deviceName={device.product_name}
        vendorName={device.vendor_name}
        productCode={device.product_id}
      />
    </div>
  );
};

// ============================================================================
// Main App Component
// ============================================================================

const IODDManager = () => {
  const { toast } = useToast();
  const { toggleTheme } = useTheme();
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const edsFileInputRef = useRef(null);
  const edsFolderInputRef = useRef(null);
  const [activeView, setActiveView] = useState('devices');
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [edsFiles, setEdsFiles] = useState([]);
  const [selectedEds, setSelectedEds] = useState(null);
  const [stats, setStats] = useState({
    total_devices: 0,
    total_parameters: 0,
    total_generated: 0,
    adapters_by_platform: {},
    total_eds_files: 0,
    total_eds_parameters: 0,
    total_eds_packages: 0,
    unique_eds_devices: 0
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  const fetchDevices = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd`);
      setDevices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      toast({
        title: 'Failed to load devices',
        description: error.response?.data?.error || error.message || 'Unable to load devices',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchEdsFiles = useCallback(async () => {
    try {
      // Use grouped endpoint to show only latest revision per device with revision count
      const response = await axios.get(`${API_BASE}/api/eds/grouped/by-device`);
      setEdsFiles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch EDS files:', error);
      toast({
        title: 'Failed to load EDS files',
        description: error.response?.data?.error || error.message || 'Unable to load EDS files',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/stats`);
      const data = response.data || {};
      setStats({
        total_devices: data.total_devices ?? 0,
        total_parameters: data.total_parameters ?? 0,
        total_generated: data.total_generated_adapters ?? data.total_generated ?? 0,
        adapters_by_platform: data.adapters_by_platform ?? {},
        total_eds_files: data.total_eds_files ?? 0,
        total_eds_parameters: data.total_eds_parameters ?? 0,
        total_eds_packages: data.total_eds_packages ?? 0,
        unique_eds_devices: data.unique_eds_devices ?? 0,
      });
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    fetchStats();
    fetchEdsFiles();
  }, [fetchDevices, fetchStats, fetchEdsFiles]);
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setUploadProgress(0);

    try {
      const response = await axios.post(
        `${API_BASE}/api/iodd/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );

      // Handle both single and multi-device responses
      if (response.data.devices) {
        // Multi-device response (nested ZIP)
        toast({
          title: 'Success',
          description: `Imported ${response.data.total_count} device(s) from nested ZIP`,
        });
      } else {
        // Single device response
        toast({
          title: 'Success',
          description: `Device "${response.data.product_name}" imported successfully`,
        });
      }

      fetchDevices();
      fetchStats();
    } catch (error) {
      console.error('IODD Upload Error:', error);
      console.error('Error Response:', error.response?.data);
      console.error('File Info:', {
        name: file?.name,
        size: file?.size,
        type: file?.type
      });
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.detail || error.message || 'Failed to upload IODD file',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleMultiFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    let successCount = 0;
    let failCount = 0;
    const failedFiles = [];
    const totalFiles = files.length;

    // Helper function to upload a single file with retry logic
    const uploadFileWithRetry = async (file, retries = 4) => {
      const formData = new FormData();
      formData.append('file', file);

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await axios.post(
            `${API_BASE}/api/iodd/upload`,
            formData,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
              timeout: 60000 // 60 second timeout
            }
          );

          // Handle both single and multi-device responses
          const devicesImported = response.data.devices
            ? response.data.total_count
            : 1;

          return { success: true, count: devicesImported };
        } catch (error) {
          const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message;

          // Check if it's a database locked error and we have retries left
          if (errorMsg.includes('database is locked') && attempt < retries) {
            // Wait before retry with exponential backoff (2s, 4s, 6s, 8s)
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }

          // If we've exhausted retries or it's a different error
          console.error(`Failed to upload ${file.name} after ${attempt} attempt(s):`, errorMsg);
          return { success: false, error: errorMsg };
        }
      }
    };

    // Process files one by one with progress updates
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = Math.round(((i) / totalFiles) * 100);
      setUploadProgress(progress);

      // Show current file being processed
      toast({
        title: 'Processing files...',
        description: `${i + 1}/${totalFiles}: ${file.name}`,
        duration: 1000,
      });

      const result = await uploadFileWithRetry(file);

      if (result.success) {
        successCount += result.count;
      } else {
        failCount += 1;
        failedFiles.push({ name: file.name, error: result.error });
      }

      // Small delay between uploads to prevent database lock
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setLoading(false);
    setUploadProgress(0);

    // Show detailed summary toast
    if (successCount > 0 && failCount === 0) {
      toast({
        title: 'All imports successful! ✓',
        description: `Successfully imported ${successCount} device(s) from ${totalFiles} file(s)`,
        duration: 5000,
      });
    } else if (successCount > 0 && failCount > 0) {
      const failedList = failedFiles.map(f => `• ${f.name}: ${f.error}`).join('\n');
      toast({
        title: 'Partial success',
        description: `Imported ${successCount} device(s), ${failCount} file(s) failed:\n${failedList}`,
        variant: 'warning',
        duration: 10000,
      });
    } else {
      const failedList = failedFiles.map(f => `• ${f.name}: ${f.error}`).join('\n');
      toast({
        title: 'Import failed',
        description: `Failed to import ${failCount} file(s):\n${failedList}`,
        variant: 'destructive',
        duration: 10000,
      });
    }

    fetchDevices();
    fetchStats();
  };

  const handleEdsFileUpload = async (files) => {
    if (!files || files.length === 0) {
      return;
    }

    setLoading(true);
    let successCount = 0;
    let failCount = 0;
    let totalEdsImported = 0;
    const failedFiles = [];
    const totalFiles = files.length;

    // Helper function to upload a single EDS file with retry logic
    const uploadEdsFileWithRetry = async (file, retries = 4) => {
      const formData = new FormData();
      formData.append('file', file);

      // Determine endpoint based on file extension
      const isZipFile = file.name.toLowerCase().endsWith('.zip');
      const endpoint = isZipFile
        ? `${API_BASE}/api/eds/upload-package`
        : `${API_BASE}/api/eds/upload`;

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await axios.post(
            endpoint,
            formData,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
              timeout: 60000 // 60 second timeout
            }
          );

          // Handle package response (multiple EDS files)
          const edsCount = response.data.total_eds_files || 1;
          return { success: true, count: edsCount, isDuplicate: false };

        } catch (error) {
          const errorMsg = error.response?.data?.detail || error.response?.data?.error || error.message;

          // Handle duplicate packages (409 Conflict) - don't count as failure
          if (error.response?.status === 409) {
            return { success: true, count: 0, isDuplicate: true };
          }

          // Check if it's a database locked error and we have retries left
          if (errorMsg.includes('database is locked') && attempt < retries) {
            // Wait before retry with exponential backoff (2s, 4s, 6s, 8s)
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            continue;
          }

          // If we've exhausted retries or it's a different error
          console.error(`Failed to upload ${file.name} after ${attempt} attempt(s):`, errorMsg);
          return { success: false, error: errorMsg };
        }
      }
    };

    // Process files one by one with progress updates
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = Math.round(((i) / totalFiles) * 100);
      setUploadProgress(progress);


      // Show current file being processed
      toast({
        title: 'Processing EDS files...',
        description: `${i + 1}/${totalFiles}: ${file.name}`,
        duration: 1000,
      });

      const result = await uploadEdsFileWithRetry(file);

      if (result.success) {
        if (!result.isDuplicate) {
          totalEdsImported += result.count;
          successCount += 1;
        }
      } else {
        failCount += 1;
        failedFiles.push({ name: file.name, error: result.error });
      }

      // Small delay between uploads to prevent database lock
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setLoading(false);
    setUploadProgress(0);

    // Show detailed summary toast
    if (successCount > 0 && failCount === 0) {
      toast({
        title: 'All EDS imports successful! ✓',
        description: `Successfully imported ${totalEdsImported} EDS file(s) from ${successCount} package(s)`,
        duration: 5000,
      });
    } else if (successCount > 0 && failCount > 0) {
      const failedList = failedFiles.slice(0, 5).map(f => `• ${f.name}`).join('\n');
      const moreMsg = failedFiles.length > 5 ? `\n...and ${failedFiles.length - 5} more` : '';
      toast({
        title: 'Partial success',
        description: `Imported ${totalEdsImported} EDS file(s) from ${successCount} package(s). ${failCount} failed:\n${failedList}${moreMsg}`,
        variant: 'warning',
        duration: 10000,
      });
    } else {
      const failedList = failedFiles.slice(0, 5).map(f => `• ${f.name}`).join('\n');
      const moreMsg = failedFiles.length > 5 ? `\n...and ${failedFiles.length - 5} more` : '';
      toast({
        title: 'EDS import failed',
        description: `Failed to import ${failCount} file(s):\n${failedList}${moreMsg}`,
        variant: 'destructive',
        duration: 10000,
      });
    }

    fetchEdsFiles();
    fetchStats();
  };

  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
    setActiveView('device-details');
  };

  const handleBackToDevices = () => {
    setSelectedDevice(null);
    setActiveView('devices');
    fetchDevices(); // Refresh devices list when returning from details
  };

  const handleEdsSelect = async (eds) => {
    // Fetch full EDS details including parameters, connections, capacity, etc.
    try {
      const [detailsResponse, diagnosticsResponse] = await Promise.all([
        fetch(`${API_BASE}/api/eds/${eds.id}`),
        fetch(`${API_BASE}/api/eds/${eds.id}/diagnostics`)
      ]);

      const fullEdsData = await detailsResponse.json();
      const diagnosticsData = await diagnosticsResponse.json();

      // Add diagnostics to EDS data
      fullEdsData.diagnostics_details = diagnosticsData;

      setSelectedEds(fullEdsData);
      setActiveView('eds-details');
    } catch (error) {
      console.error('Failed to fetch EDS details:', error);
      setSelectedEds(eds); // Fallback to summary data
      setActiveView('eds-details');
    }
  };

  const handleBackToEdsFiles = () => {
    setSelectedEds(null);
    setActiveView('eds-files');
    fetchEdsFiles();
  };

  const handleExportEdsJson = () => {
    if (!selectedEds) return;

    // Create a clean export object with all EDS data
    const exportData = {
      file_info: {
        product_name: selectedEds.product_name,
        vendor_name: selectedEds.vendor_name,
        catalog_number: selectedEds.catalog_number,
        product_code: selectedEds.product_code,
        vendor_code: selectedEds.vendor_code,
        revision: `${selectedEds.major_revision}.${selectedEds.minor_revision}`,
        description: selectedEds.description,
        home_url: selectedEds.home_url,
        create_date: selectedEds.create_date,
        create_time: selectedEds.create_time,
        mod_date: selectedEds.mod_date,
        mod_time: selectedEds.mod_time,
        file_revision: selectedEds.file_revision
      },
      device_classification: {
        class1: selectedEds.class1,
        class2: selectedEds.class2,
        class3: selectedEds.class3,
        class4: selectedEds.class4
      },
      parameters: selectedEds.parameters || [],
      connections: selectedEds.connections || [],
      ports: selectedEds.ports || [],
      capacity: selectedEds.capacity || null,
      diagnostics: selectedEds.diagnostics_details || null,
      export_metadata: {
        exported_at: new Date().toISOString(),
        exported_from: 'Greenstack',
        eds_id: selectedEds.id
      }
    };

    // Create blob and download
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedEds.product_name || 'eds'}_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export successful',
      description: 'EDS data exported to JSON file',
    });
  };

  const handleExportZIP = async () => {
    if (!selectedEds) return;

    try {
      const response = await axios.get(`${API_BASE}/api/eds/${selectedEds.id}/export-zip`, {
        responseType: 'blob'
      });

      // Create blob URL and download
      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${selectedEds.vendor_name?.replace(/\s+/g, '_')}_${selectedEds.product_name?.replace(/\s+/g, '_')}_${selectedEds.product_code}_v${selectedEds.major_revision}.${selectedEds.minor_revision}.zip`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: 'EDS package exported as ZIP file',
      });
    } catch (error) {
      console.error('Export ZIP error:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export EDS package',
        variant: 'destructive',
      });
    }
  };

  const handleNavigate = (view, device = null) => {
    setActiveView(view);
    if (device) {
      setSelectedDevice(device);
      setActiveView('device-details');
    }
  };

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFolderUploadClick = useCallback(() => {
    folderInputRef.current?.click();
  }, []);

  const handleEdsUploadClick = useCallback(() => {
    edsFileInputRef.current?.click();
  }, []);

  const handleEdsFolderUploadClick = useCallback(() => {
    edsFolderInputRef.current?.click();
  }, []);

  const shortcutBindings = useMemo(() => [
    {
      ...KEYBOARD_SHORTCUTS.GOTO_OVERVIEW,
      callback: () => setActiveView('overview'),
    },
    {
      ...KEYBOARD_SHORTCUTS.GOTO_DEVICES,
      callback: () => setActiveView('devices'),
    },
    {
      ...KEYBOARD_SHORTCUTS.GOTO_SEARCH,
      callback: () => setActiveView('search'),
    },
    {
      ...KEYBOARD_SHORTCUTS.GOTO_COMPARE,
      callback: () => setActiveView('compare'),
    },
    {
      ...KEYBOARD_SHORTCUTS.GOTO_ANALYTICS,
      callback: () => setActiveView('analytics'),
    },
    {
      ...KEYBOARD_SHORTCUTS.UPLOAD_FILE,
      callback: handleUploadClick,
    },
    {
      ...KEYBOARD_SHORTCUTS.REFRESH,
      callback: () => {
        fetchDevices();
        fetchEdsFiles();
        fetchStats();
      },
    },
    {
      ...KEYBOARD_SHORTCUTS.TOGGLE_THEME,
      callback: () => {
        if (typeof toggleTheme === 'function') {
          toggleTheme();
        }
      },
    },
    {
      ...KEYBOARD_SHORTCUTS.SHOW_HELP,
      callback: () => setShowKeyboardHelp(true),
    },
  ], [
    fetchDevices,
    fetchEdsFiles,
    fetchStats,
    handleUploadClick,
    setActiveView,
    toggleTheme,
  ]);

  useKeyboardShortcuts(shortcutBindings, true);

  return (
    <div className="min-h-screen bg-background">
      {/* Hide sidebar when in documentation view */}
      {activeView !== 'documentation' && (
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          devices={devices}
          edsFiles={edsFiles}
        />
      )}

      <div className={activeView === 'documentation' ? 'min-h-screen' : 'ml-64 min-h-screen'}>
        <div className={activeView === 'documentation' ? '' : 'p-8'}>
          <AnimatePresence mode="wait">
            {activeView === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <OverviewDashboard
                  stats={stats}
                  devices={devices}
                  onNavigate={handleNavigate}
                />
              </motion.div>
            )}

            {activeView === 'devices' && (
              <motion.div
                key="devices"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DeviceListPage
                  devices={devices}
                  onDeviceSelect={handleDeviceSelect}
                  onUpload={handleUploadClick}
                  onUploadFolder={handleFolderUploadClick}
                  API_BASE={API_BASE}
                  toast={toast}
                  onDevicesChange={fetchDevices}
                />
              </motion.div>
            )}

            {activeView === 'device-details' && selectedDevice && (
              <motion.div
                key="device-details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DeviceDetailsPage
                  device={selectedDevice}
                  onBack={handleBackToDevices}
                  API_BASE={API_BASE}
                  toast={toast}
                />
              </motion.div>
            )}

            {activeView === 'eds-files' && (
              <motion.div
                key="eds-files"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <EdsFilesListPage
                  edsFiles={edsFiles}
                  onEdsSelect={handleEdsSelect}
                  onUpload={handleEdsUploadClick}
                  onUploadFolder={handleEdsFolderUploadClick}
                  API_BASE={API_BASE}
                  toast={toast}
                  onEdsFilesChange={fetchEdsFiles}
                />
              </motion.div>
            )}

            {activeView === 'eds-details' && selectedEds && (
              <EDSDetailsView
                selectedEds={selectedEds}
                API_BASE={API_BASE}
                onBack={handleBackToEdsFiles}
                onExportJSON={handleExportEdsJson}
                onExportZIP={handleExportZIP}
              />
            )}

            {activeView === 'generators' && (
              <motion.div
                key="generators"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-foreground">
                  <h2 className="text-2xl font-bold mb-4">Adapter Generators</h2>
                  <p className="text-muted-foreground">Coming soon...</p>
                </div>
              </motion.div>
            )}

            {activeView === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <SearchPage
                  API_BASE={API_BASE}
                  onNavigate={(type, id) => {
                    if (type === 'eds') {
                      const eds = edsFiles.find(e => e.id === id);
                      if (eds) handleEdsSelect(eds);
                    } else if (type === 'iodd') {
                      const device = devices.find(d => d.id === id);
                      if (device) handleDeviceSelect(device);
                    }
                  }}
                />
              </motion.div>
            )}

            {activeView === 'compare' && (
              <motion.div
                key="compare"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ComparisonView
                  API_BASE={API_BASE}
                  onBack={() => setActiveView('overview')}
                />
              </motion.div>
            )}

            {activeView === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <AnalyticsDashboard
                  devices={devices}
                  edsFiles={edsFiles}
                  stats={stats}
                />
              </motion.div>
            )}

            {activeView === 'mqtt' && (
              <motion.div
                key="mqtt"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <MqttManager
                  API_BASE={API_BASE}
                  toast={toast}
                />
              </motion.div>
            )}

            {activeView === 'influxdb' && (
              <motion.div
                key="influxdb"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <InfluxManager
                  API_BASE={API_BASE}
                  toast={toast}
                />
              </motion.div>
            )}

            {activeView === 'nodered' && (
              <motion.div
                key="nodered"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <NodeRedManager
                  API_BASE={API_BASE}
                  toast={toast}
                />
              </motion.div>
            )}

            {activeView === 'grafana' && (
              <motion.div
                key="grafana"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <GrafanaManager
                  API_BASE={API_BASE}
                  toast={toast}
                />
              </motion.div>
            )}

            {activeView === 'services' && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <ServicesAdmin
                  API_BASE={API_BASE}
                  toast={toast}
                />
              </motion.div>
            )}

            {activeView === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <AdminConsole
                  API_BASE={API_BASE}
                  toast={toast}
                  onNavigate={setActiveView}
                />
              </motion.div>
            )}

            {activeView === 'documentation' && (
              <motion.div
                key="documentation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50"
              >
                <DocsViewer onClose={() => setActiveView('overview')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hidden File Input for IODD */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml,.iodd,.zip"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            if (e.target.files.length === 1) {
              handleFileUpload(e.target.files[0]);
            } else {
              handleMultiFileUpload(Array.from(e.target.files));
            }
            // Reset input so same files can be selected again
            e.target.value = '';
          }
        }}
      />

      {/* Hidden Folder Input for IODD - Supports folder selection */}
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            // Filter to only .xml, .iodd, and .zip files from the folder
            const validFiles = Array.from(e.target.files).filter(file =>
              file.name.toLowerCase().endsWith('.xml') ||
              file.name.toLowerCase().endsWith('.iodd') ||
              file.name.toLowerCase().endsWith('.zip')
            );
            if (validFiles.length > 0) {
              handleMultiFileUpload(validFiles);
            } else {
              toast({
                title: 'No IODD files found',
                description: 'The selected folder does not contain any .xml, .iodd, or .zip files',
                variant: 'destructive',
              });
            }
            // Reset input so same folder can be selected again
            e.target.value = '';
          }
        }}
      />

      {/* Hidden File Input for EDS - Supports .eds and .zip files, multiple selection */}
      <input
        ref={edsFileInputRef}
        type="file"
        accept=".eds,.zip"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleEdsFileUpload(Array.from(e.target.files));
            // Reset input so same files can be selected again
            e.target.value = '';
          }
        }}
      />

      {/* Hidden Folder Input for EDS - Supports folder selection */}
      <input
        ref={edsFolderInputRef}
        type="file"
        webkitdirectory=""
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            // Filter to only .eds and .zip files from the folder
            const validFiles = Array.from(e.target.files).filter(file =>
              file.name.toLowerCase().endsWith('.eds') ||
              file.name.toLowerCase().endsWith('.zip')
            );
            if (validFiles.length > 0) {
              handleEdsFileUpload(validFiles);
            } else {
              toast({
                title: 'No EDS files found',
                description: 'The selected folder does not contain any .eds or .zip files',
                variant: 'warning',
              });
            }
            // Reset input
            e.target.value = '';
          }
        }}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
          <Card className="bg-secondary border-border p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
              <p className="text-foreground">Processing...</p>
              {uploadProgress > 0 && (
                <Progress value={uploadProgress} className="w-48" />
              )}
            </div>
          </Card>
        </div>
      )}

      <KeyboardShortcutsHelp
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />

      <Toaster />
    </div>
  );
};

export default IODDManager;
const processDataColorClasses = [
  'from-brand-green/40 to-emerald-500/20 text-emerald-50',
    'from-purple-500/40 to-indigo-500/20 text-purple-50',
    'from-sky-500/40 to-cyan-500/20 text-sky-50',
    'from-amber-500/40 to-orange-500/20 text-amber-50',
    'from-rose-500/40 to-pink-500/20 text-rose-50',
    'from-slate-500/40 to-slate-500/10 text-slate-50',
  ];

  const getSegmentColorClass = (index) => `bg-gradient-to-br ${processDataColorClasses[index % processDataColorClasses.length]}`;

  const buildProcessDataSegments = (pd) => {
    if (!pd.record_items || pd.record_items.length === 0) {
      return [{
        name: pd.name || 'Process Data',
        subindex: 0,
        bit_offset: 0,
        bit_length: pd.bit_length || 1,
      }];
    }

    let runningOffset = 0;
    return pd.record_items
      .map((item) => {
        const start = item.bit_offset !== null && item.bit_offset !== undefined ? item.bit_offset : runningOffset;
        const length = item.bit_length || 1;
        runningOffset = start + length;
        return {
          ...item,
          bit_offset: start,
          bit_length: length,
        };
      })
      .sort((a, b) => a.bit_offset - b.bit_offset);
  };

  const formatBitRange = (item) => {
    const start = item.bit_offset || 0;
    const end = item.bit_length ? start + item.bit_length - 1 : start;
    return `${start}–${end}`;
  };

  const processDataToneConfig = {
    input: {
      gradient: 'from-brand-green/10 to-brand-green/5',
      border: 'hover:border-brand-green/50',
      badge: 'bg-brand-green/20 text-brand-green border-brand-green/40',
      dot: 'bg-brand-green',
      accentText: 'text-brand-green',
    },
    output: {
      gradient: 'from-secondary/10 to-accent/5',
      border: 'hover:border-secondary/50',
      badge: 'bg-secondary/20 text-foreground-secondary border-secondary/40',
      dot: 'bg-secondary',
      accentText: 'text-secondary',
    },
  };

const renderProcessDataCard = (pd, toneKey = 'input', getUiInfoResolver) => {
    const tone = processDataToneConfig[toneKey] || processDataToneConfig.input;
    const segments = buildProcessDataSegments(pd);

    return (
      <div
        key={pd.id}
        className={`p-4 rounded-lg bg-gradient-to-br ${tone.gradient} border border-border ${tone.border} transition-all`}
      >
        <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-foreground font-semibold text-lg">{pd.name}</h4>
              <Badge className={tone.badge}>{pd.bit_length} bits</Badge>
              <Badge className="bg-muted text-foreground text-[11px]">{pd.data_type}</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1">ID: {pd.pd_id}</p>
            {pd.description && (
              <p className="text-sm text-muted-foreground mt-1">{pd.description}</p>
            )}
          </div>
        </div>

        {segments.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Bit Layout</p>
            <div className="w-full h-16 flex rounded-lg border border-border overflow-hidden">
              {segments.map((segment, segIdx) => (
                <div
                  key={`${segment.subindex}-${segIdx}`}
                  className={`relative flex items-center justify-center text-[10px] font-semibold ${getSegmentColorClass(segIdx)} px-2`}
                  style={{ flexGrow: segment.bit_length || 1 }}
                  title={`${segment.name || `Field ${segment.subindex}`} • bits ${formatBitRange(segment)}`}
                >
                  <div className="text-xs text-white/90 text-center leading-tight drop-shadow">
                    <div className="font-semibold truncate">{segment.name || `Sub ${segment.subindex}`}</div>
                    <div className="text-[10px] opacity-80 font-mono">{formatBitRange(segment)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
              {segments.map((segment, segIdx) => (
                <div key={`legend-${segment.subindex}-${segIdx}`} className="flex items-center gap-1">
                  <span className={`w-3 h-3 rounded-full border border-border ${tone.dot}`} />
                  <span>{segment.name || `Subindex ${segment.subindex}`}</span>
                  <span className="font-mono text-[10px] opacity-70">{formatBitRange(segment)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {(pd.record_items && pd.record_items.length > 0 ? pd.record_items : [{
            name: pd.name,
            subindex: 0,
            bit_length: pd.bit_length,
            bit_offset: 0,
            data_type: pd.data_type,
          }]).map((item, index) => {
            const uiInfo = getUiInfoResolver ? getUiInfoResolver(item.name) : undefined;
            return (
              <div
                key={item.subindex ?? index}
                className="p-3 rounded-lg bg-background border border-border hover:border-brand-green/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.name || `Field ${item.subindex}`}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Bits {formatBitRange(item)}
                    </p>
                  </div>
                  <Badge className="bg-muted text-foreground text-[10px]">
                    {item.data_type || pd.data_type}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground flex flex-wrap gap-2">
                  <span>Offset: {item.bit_offset ?? 0}</span>
                  <span>Length: {item.bit_length ?? '—'} bits</span>
                  {item.default_value !== undefined && item.default_value !== null && (
                    <span>Default: {item.default_value}</span>
                  )}
                </div>
                {uiInfo && (uiInfo.gradient !== null || uiInfo.offset !== null || uiInfo.unit_code || uiInfo.display_format) && (
                  <div className="mt-2 p-2 rounded bg-brand-green/5 border border-brand-green/20 text-xs text-brand-green">
                    <p className="font-semibold mb-1">UI Scaling</p>
                    {uiInfo.gradient !== null && <p>Gradient: {uiInfo.gradient}</p>}
                    {uiInfo.offset !== null && <p>Offset: {uiInfo.offset}</p>}
                    {uiInfo.unit_code && <p>Unit: {uiInfo.unit_code}</p>}
                    {uiInfo.display_format && <p>Format: {uiInfo.display_format}</p>}
                  </div>
                )}
                {item.single_values && item.single_values.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Enumeration:</p>
                    <div className="flex flex-wrap gap-1">
                      {item.single_values.map((sv, svIdx) => (
                        <Badge
                          key={svIdx}
                          className="bg-muted text-foreground-secondary border-border text-[11px]"
                          title={sv.description || sv.name}
                        >
                          {sv.value}: {sv.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
  );
};

const baseColorMap = {
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  yellow: '#eab308',
  magenta: '#d946ef',
  cyan: '#06b6d4',
  orange: '#fb923c',
  violet: '#8b5cf6',
  purple: '#a855f7',
  black: '#020617',
  white: '#f8fafc',
  cleanblue: '#38bdf8',
  turquoise: '#14b8a6',
  amber: '#f59e0b',
  teal: '#0d9488',
  pink: '#ec4899',
};

const resolveColorHex = (label = '') => {
  const key = label.toLowerCase().trim();
  if (baseColorMap[key]) {
    return baseColorMap[key];
  }
  if (/user/.test(key)) {
    return '#4b5563';
  }
  return '#1f2937';
};

const effectStyles = [
  { pattern: /(blink|flash)/i, gradient: 'from-rose-500/40 to-orange-400/30', label: 'Blink', description: 'Rapid on/off pulse' },
  { pattern: /(pulse|breath|fade)/i, gradient: 'from-indigo-500/40 to-purple-400/30', label: 'Pulse', description: 'Smooth breathing effect' },
  { pattern: /(wave|scroll|rotate|wheel)/i, gradient: 'from-sky-500/40 to-cyan-400/30', label: 'Wave', description: 'Sequential animation' },
  { pattern: /(static|solid|steady)/i, gradient: 'from-emerald-500/40 to-lime-400/30', label: 'Static', description: 'Constant output' },
];

const resolveEffectStyle = (name = '') => {
  const match = effectStyles.find((style) => style.pattern.test(name));
  return match || {
    gradient: 'from-slate-500/30 to-slate-400/20',
    label: 'Effect',
    description: 'Custom pattern',
  };
};

const profileCharacteristicInfo = {
  '48': {
    label: 'BLOB Transfer',
    description: 'Supports Binary Large Object streaming for custom scenes or configuration data.',
    icon: <Database className="w-4 h-4" />,
  },
  '49': {
    label: 'Firmware Update',
    description: 'Enables IO-Link firmware update workflow (Profile 0x31).',
    icon: <Upload className="w-4 h-4" />,
  },
};
