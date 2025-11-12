import React, { useState, useEffect, useMemo } from 'react';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription,
  Button, Badge, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Alert, AlertDescription,
  Progress, Skeleton, ScrollArea, Separator,
  Toaster, useToast,
} from '@/components/ui';
import {
  Upload, Download, FileCode, Cpu, Settings, Trash2, Eye, Code2,
  Activity, Database, Package, Zap, ChevronRight, Search, Filter,
  BarChart3, Home, ChevronLeft, Star, X, MoreVertical, Calendar,
  Grid3x3, List, Image as ImageIcon, ArrowLeft, ExternalLink, Copy,
  AlertTriangle, Radio, ArrowRightLeft, FileText, Lock, Wrench, Monitor,
  Wifi, Menu, ChevronDown, Info, Type, Hash, ToggleLeft, Command, RotateCcw,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

// ============================================================================
// Helper Functions
// ============================================================================

// Format version string - strip leading 'v' or 'V' if present
const formatVersion = (version) => {
  if (!version) return '';
  const str = version.toString();
  return str.replace(/^[vV]/, '');
};


// ============================================================================
// Sidebar Component
// ============================================================================

const Sidebar = ({ activeView, setActiveView, devices, onDeviceSelect, recentDevices }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`fixed left-0 top-0 h-screen bg-slate-950 border-r border-slate-800 transition-all duration-300 z-50 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="px-4 py-5 border-b border-slate-800 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Cpu className="w-6 h-6 text-cyan-400" />
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                IODD Manager
              </h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <NavItem
            icon={<Home className="w-5 h-5" />}
            label="Overview"
            active={activeView === 'overview'}
            onClick={() => setActiveView('overview')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Package className="w-5 h-5" />}
            label={`Devices`}
            badge={devices.length}
            active={activeView === 'devices'}
            onClick={() => setActiveView('devices')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Zap className="w-5 h-5" />}
            label="Generators"
            active={activeView === 'generators'}
            onClick={() => setActiveView('generators')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<BarChart3 className="w-5 h-5" />}
            label="Analytics"
            active={activeView === 'analytics'}
            onClick={() => setActiveView('analytics')}
            collapsed={collapsed}
          />

          {!collapsed && recentDevices.length > 0 && (
            <>
              <div className="px-3 pt-4 pb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent</p>
              </div>
              {recentDevices.slice(0, 5).map((device) => (
                <button
                  key={device.id}
                  onClick={() => onDeviceSelect(device)}
                  className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 rounded-md transition-colors flex items-center space-x-2"
                >
                  <ChevronRight className="w-3 h-3" />
                  <span className="truncate">{device.product_name}</span>
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-400 hover:text-white"
              onClick={() => setActiveView('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, badge, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-all ${
      active
        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    {!collapsed && (
      <>
        <span className="flex-1 text-sm font-medium text-left">{label}</span>
        {badge !== undefined && (
          <Badge className="bg-slate-700 text-slate-200 text-xs">{badge}</Badge>
        )}
      </>
    )}
  </button>
);

// ============================================================================
// Overview Dashboard
// ============================================================================

const OverviewDashboard = ({ stats, devices, onNavigate }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-white">Overview</h2>
      <p className="text-slate-400 mt-1">Quick stats and recent activity</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Devices"
        value={stats.total_devices}
        icon={<Package className="w-5 h-5" />}
        color="cyan"
        change="+12%"
      />
      <StatCard
        title="Parameters"
        value={stats.total_parameters}
        icon={<Database className="w-5 h-5" />}
        color="green"
        subtitle="Across all devices"
      />
      <StatCard
        title="Generated"
        value={stats.total_generated}
        icon={<Code2 className="w-5 h-5" />}
        color="purple"
        subtitle="Adapters created"
      />
      <StatCard
        title="Platforms"
        value="5"
        icon={<Activity className="w-5 h-5" />}
        color="orange"
        subtitle="Supported targets"
      />
    </div>

    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white">Recent Devices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {devices.slice(0, 5).map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => onNavigate('devices', device)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{device.product_name}</p>
                  <p className="text-xs text-slate-400">{device.manufacturer}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const StatCard = ({ title, value, icon, color, change, subtitle }) => {
  const colors = {
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/50',
    green: 'from-green-500/20 to-green-600/20 border-green-500/50',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/50',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/50',
  };

  return (
    <Card className={`bg-gradient-to-br ${colors[color]}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-300">{title}</p>
          {icon}
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        {change && <p className="text-sm text-green-400">{change} from last week</p>}
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

// ============================================================================
// Device List Page
// ============================================================================

const DeviceListPage = ({ devices, onDeviceSelect, onUpload, API_BASE, toast, onDevicesChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'table'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    vendors: [],
    hasImages: false,
    ioddVersion: [],
  });
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredDevices = useMemo(() => {
    let result = devices;

    // Search filter
    if (searchQuery) {
      result = result.filter(d =>
        d.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.device_id.toString().includes(searchQuery)
      );
    }

    // Vendor filter
    if (filters.vendors.length > 0) {
      result = result.filter(d => filters.vendors.includes(d.manufacturer));
    }

    return result;
  }, [devices, searchQuery, filters]);

  const vendors = useMemo(() => {
    const uniqueVendors = [...new Set(devices.map(d => d.manufacturer))];
    return uniqueVendors.sort();
  }, [devices]);

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
            <h2 className="text-2xl font-bold text-white">Devices</h2>
            <p className="text-slate-400 mt-1">
              {selectedDevices.length > 0 ? (
                <span>{selectedDevices.length} selected of {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''}</span>
              ) : (
                <span>{filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''} found</span>
              )}
            </p>
          </div>
          {filteredDevices.length > 0 && (
            <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedDevices.length === filteredDevices.length && filteredDevices.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 checked:bg-cyan-600"
              />
              <span className="text-sm">Select All</span>
            </label>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {selectedDevices.length > 0 && (
            <Button
              onClick={() => setDeleteDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {selectedDevices.length} Device{selectedDevices.length !== 1 ? 's' : ''}
            </Button>
          )}
          <Button onClick={onUpload} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
            <Upload className="w-4 h-4 mr-2" />
            Import IODD
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-4">
            {/* Search and View Controls */}
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search devices by name, manufacturer, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-slate-700 text-slate-300"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <div className="flex items-center space-x-1 border border-slate-700 rounded-md p-1">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-2"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-2"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Advanced Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({ vendors: [], hasImages: false, ioddVersion: [] })}
                    className="text-slate-400 hover:text-white"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-300 text-sm mb-2">Vendor</Label>
                    <div className="space-y-2 mt-2">
                      {vendors.map((vendor) => (
                        <label key={vendor} className="flex items-center space-x-2 text-sm text-slate-300">
                          <input
                            type="checkbox"
                            checked={filters.vendors.includes(vendor)}
                            onChange={(e) => {
                              setFilters(prev => ({
                                ...prev,
                                vendors: e.target.checked
                                  ? [...prev.vendors, vendor]
                                  : prev.vendors.filter(v => v !== vendor)
                              }));
                            }}
                            className="rounded border-slate-600 bg-slate-700"
                          />
                          <span>{vendor} ({devices.filter(d => d.manufacturer === vendor).length})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Device List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
        {filteredDevices.map((device) => (
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

      {filteredDevices.length === 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No devices found</p>
            {searchQuery && (
              <Button
                variant="link"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-cyan-400"
              >
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Batch Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-red-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Multiple Devices
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Are you sure you want to delete <span className="font-semibold text-white">{selectedDevices.length} device(s)</span>?
              <br />
              <span className="text-red-400">This action cannot be undone.</span> All device data, parameters, and assets will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBatchDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
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
      className={`bg-slate-900 border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10 ${selected ? 'ring-2 ring-cyan-500' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex items-center pt-1">
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 rounded border-slate-600 bg-slate-700 checked:bg-cyan-600"
            />
          </div>
          <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 p-2 overflow-hidden">
            {!imgError ? (
              <img
                src={`${API_BASE}/api/iodd/${device.id}/thumbnail`}
                alt={device.product_name}
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <Package className="w-8 h-8 text-slate-500" />
            )}
          </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="text-lg font-semibold text-white truncate">{device.product_name}</h3>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 ml-2">
              v{formatVersion(device.iodd_version)}
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mb-2">{device.manufacturer}</p>
          <div className="flex items-center space-x-4 text-xs text-slate-500">
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
          <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
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
      className={`bg-slate-900 border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10 ${selected ? 'ring-2 ring-cyan-500' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex justify-end mb-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 rounded border-slate-600 bg-slate-700 checked:bg-cyan-600"
          />
        </div>
        <div className="w-full h-32 rounded-lg bg-slate-800 flex items-center justify-center mb-4 p-4 overflow-hidden">
          {!imgError ? (
            <img
              src={`${API_BASE}/api/iodd/${device.id}/thumbnail`}
              alt={device.product_name}
              className="w-full h-full object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <Package className="w-16 h-16 text-slate-500" />
          )}
        </div>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-semibold text-white truncate flex-1">{device.product_name}</h3>
        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs ml-2">
          v{formatVersion(device.iodd_version)}
        </Badge>
      </div>
      <p className="text-sm text-slate-400 mb-3">{device.manufacturer}</p>
      <div className="text-xs text-slate-500 space-y-1">
        <div>Device ID: <span className="font-mono">{device.device_id}</span></div>
        <div>{format(new Date(device.import_date), 'MMM d, yyyy')}</div>
      </div>
    </CardContent>
  </Card>
  );
};

// ============================================================================
// Settings Page
// ============================================================================

const SettingsPage = ({ API_BASE, toast, onDevicesChange, recentDevices, setRecentDevices }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resettingRecent, setResettingRecent] = useState(false);

  const handleResetDatabase = async () => {
    setDeleting(true);
    try {
      const response = await axios.delete(`${API_BASE}/api/iodd/reset`);
      toast({
        title: 'Database reset',
        description: response.data.message || 'All devices have been deleted successfully.',
      });
      setDeleteDialogOpen(false);
      // Refresh devices list
      if (onDevicesChange) onDevicesChange();
    } catch (error) {
      console.error('Failed to reset database:', error);
      toast({
        title: 'Reset failed',
        description: error.response?.data?.error || 'Failed to reset database',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleResetRecentDevices = () => {
    setResettingRecent(true);
    try {
      setRecentDevices([]);
      localStorage.removeItem('recentDevices');
      toast({
        title: 'Recent devices cleared',
        description: 'Recent devices list has been reset successfully.',
      });
    } catch (error) {
      console.error('Failed to reset recent devices:', error);
      toast({
        title: 'Reset failed',
        description: 'Failed to reset recent devices list',
        variant: 'destructive',
      });
    } finally {
      setResettingRecent(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 mt-1">Manage your IODD Manager configuration</p>
      </div>

      {/* System Management */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            System Management
          </CardTitle>
          <CardDescription className="text-slate-400">
            Manage system data and refresh statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-slate-700 rounded-lg bg-slate-800/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Reset Recent Devices</h3>
                <p className="text-sm text-slate-300">
                  Clear the recent devices list from the sidebar.
                </p>
              </div>
              <Button
                onClick={handleResetRecentDevices}
                disabled={resettingRecent || !recentDevices || recentDevices.length === 0}
                className="bg-slate-700 hover:bg-slate-600 text-white ml-4"
              >
                {resettingRecent ? 'Clearing...' : 'Clear Recent'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-slate-900 border-red-700/30">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center">
            <Trash2 className="w-5 h-5 mr-2" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-slate-400">
            Irreversible actions that can permanently delete data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-red-700/50 rounded-lg bg-red-950/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">Reset Database</h3>
                <p className="text-sm text-slate-300 mb-3">
                  Delete all devices, parameters, and assets from the database.
                  <br />
                  <span className="text-red-400 font-medium">This action cannot be undone!</span>
                </p>
              </div>
              <Button
                onClick={() => setDeleteDialogOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white ml-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset Database
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-red-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Reset Database
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              <span className="font-semibold text-white">Are you absolutely sure?</span>
              <br />
              <br />
              This will permanently delete <span className="font-semibold text-red-400">ALL devices, parameters, and assets</span> from your database.
              <br />
              <br />
              <span className="text-red-400 font-medium">This action cannot be undone!</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetDatabase}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Resetting...' : 'Yes, Reset Database'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (device) {
      fetchAssets();
      fetchParameters();
      fetchErrors();
      fetchEvents();
      fetchProcessData();
      fetchDocumentInfo();
      fetchDeviceFeatures();
      fetchCommunicationProfile();
      fetchUiMenus();
    }
  }, [device]);

  const fetchAssets = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/assets`);
      setAssets(response.data);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    }
  };

  const fetchParameters = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/parameters`);
      setParameters(response.data);
    } catch (error) {
      console.error('Failed to fetch parameters:', error);
    }
  };

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

  const fetchErrors = async () => {
    setLoadingErrors(true);
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/errors`);
      setErrors(response.data);
    } catch (error) {
      console.error('Failed to fetch errors:', error);
    } finally {
      setLoadingErrors(false);
    }
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchProcessData = async () => {
    setLoadingProcessData(true);
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/processdata`);
      setProcessData(response.data);
    } catch (error) {
      console.error('Failed to fetch process data:', error);
    } finally {
      setLoadingProcessData(false);
    }
  };

  const fetchDocumentInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/documentinfo`);
      setDocumentInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch document info:', error);
    }
  };

  const fetchDeviceFeatures = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/features`);
      setDeviceFeatures(response.data);
    } catch (error) {
      console.error('Failed to fetch device features:', error);
    }
  };

  const fetchCommunicationProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/communication`);
      setCommunicationProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch communication profile:', error);
    }
  };

  const fetchUiMenus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/menus`);
      setUiMenus(response.data);
    } catch (error) {
      console.error('Failed to fetch UI menus:', error);
    }
  };

  const fetchConfigSchema = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd/${device.id}/config-schema`);
      setConfigSchema(response.data);
    } catch (error) {
      console.error('Failed to fetch config schema:', error);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === 'xml' && !xmlContent) {
      fetchXml();
    }
    if (value === 'menus' && !configSchema) {
      fetchConfigSchema();
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

    toast.success('Configuration exported successfully');
  };

  const resetConfiguration = () => {
    if (configSchema) {
      initializeParameterValues(configSchema);
      setValidationErrors({});
      setHasUnsavedChanges(false);
      toast.info('Configuration reset to default values');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Initialize parameter values when config schema loads
  useEffect(() => {
    if (configSchema && Object.keys(parameterValues).length === 0) {
      initializeParameterValues(configSchema);
    }
  }, [configSchema]);

  // Comprehensive Menu Item Display Component - Shows ALL menu items
  const MenuItemDisplay = ({ item, index }) => {
    // Handle Button Items
    if (item.button_value) {
      return (
        <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Command className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-medium text-slate-300">Action Button</span>
              {item.variable_id && (
                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-mono text-xs">
                  {item.variable_id}
                </Badge>
              )}
            </div>
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50">
              Value: {item.button_value}
            </Badge>
          </div>
          {item.access_right_restriction && (
            <div className="mt-2 text-xs text-slate-400">
              Access: <Badge className="ml-1 bg-slate-700 text-slate-300 text-xs">{item.access_right_restriction}</Badge>
            </div>
          )}
        </div>
      );
    }

    // Handle Menu References (Submenus)
    if (item.menu_ref) {
      return (
        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">Submenu Link</span>
            </div>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 font-mono">
              {item.menu_ref}
            </Badge>
          </div>
          {item.variable_id && (
            <div className="mt-2 text-xs text-slate-400">
              Variable: <Badge className="ml-1 bg-cyan-500/20 text-cyan-300 font-mono text-xs">{item.variable_id}</Badge>
            </div>
          )}
        </div>
      );
    }

    // Handle RecordItem References
    if (item.record_item_ref) {
      return (
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">Record Item</span>
            </div>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50 font-mono">
              {item.record_item_ref}
            </Badge>
          </div>
          <div className="mt-2 space-y-1 text-xs">
            {item.subindex !== null && (
              <div className="text-slate-400">
                Subindex: <Badge className="ml-1 bg-slate-700 text-slate-300 text-xs">{item.subindex}</Badge>
              </div>
            )}
            {item.access_right_restriction && (
              <div className="text-slate-400">
                Access: <Badge className="ml-1 bg-slate-700 text-slate-300 text-xs">{item.access_right_restriction}</Badge>
              </div>
            )}
            {item.display_format && (
              <div className="text-slate-400">
                Format: <Badge className="ml-1 bg-slate-700 text-slate-300 text-xs">{item.display_format}</Badge>
              </div>
            )}
            {item.unit_code && (
              <div className="text-slate-400">
                Unit: <Badge className="ml-1 bg-slate-700 text-slate-300 text-xs">{item.unit_code}</Badge>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Handle Variable Items (with or without parameter details)
    if (item.variable_id) {
      const param = item.parameter;
      const variableId = item.variable_id;
      const value = parameterValues[variableId] || (param?.default_value) || '';
      const isReadOnly = item.access_right_restriction === 'ro';

      // If we have full parameter details, show interactive control
      if (param) {
        return <InteractiveParameterControl item={item} />;
      }

      // Otherwise, show variable info card (parameter lookup failed)
      return (
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-slate-400" />
              <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-mono text-xs">
                {variableId}
              </Badge>
            </div>
            {isReadOnly && (
              <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/50">Read Only</Badge>
            )}
          </div>
          <div className="space-y-1 text-xs">
            {item.access_right_restriction && (
              <div className="text-slate-400">
                Access: <Badge className="ml-1 bg-slate-700 text-slate-300 text-xs">{item.access_right_restriction}</Badge>
              </div>
            )}
            {item.display_format && (
              <div className="text-slate-400">
                Format: <Badge className="ml-1 bg-slate-700 text-slate-300 text-xs">{item.display_format}</Badge>
              </div>
            )}
            {item.unit_code && (
              <div className="text-slate-400">
                Unit: <Badge className="ml-1 bg-slate-700 text-slate-300 text-xs">{item.unit_code}</Badge>
              </div>
            )}
            <div className="text-slate-500 text-xs mt-2">
              ⚠ Parameter details not found in database
            </div>
          </div>
        </div>
      );
    }

    // Fallback for unknown item types
    return (
      <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
        <div className="text-xs text-slate-500">Unknown item type</div>
        <pre className="text-xs text-slate-600 mt-1">{JSON.stringify(item, null, 2)}</pre>
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
            <Label className="text-sm text-slate-300 cursor-pointer" onClick={() => setSelectedParameter(item)}>
              {param.name}
              {item.unit_code && <span className="ml-1 text-xs text-slate-500">({item.unit_code})</span>}
            </Label>
            {isReadOnly && <Badge className="text-xs bg-blue-500/20 text-blue-400">Read Only</Badge>}
          </div>
          <Select
            value={value}
            onValueChange={handleChange}
            disabled={isReadOnly}
          >
            <SelectTrigger className={`bg-slate-800 border-slate-700 text-white ${error ? 'border-red-500' : ''}`}>
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
            <p className="text-xs text-red-400 flex items-center gap-1">
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
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <Label className="text-sm text-slate-300 cursor-pointer flex-1" onClick={() => setSelectedParameter(item)}>
            {param.name}
            {isReadOnly && <Badge className="ml-2 text-xs bg-blue-500/20 text-blue-400">Read Only</Badge>}
          </Label>
          <input
            type="checkbox"
            checked={value === '1' || value === 'true' || value === true}
            onChange={(e) => handleChange(e.target.checked ? '1' : '0')}
            disabled={isReadOnly}
            className="w-5 h-5 rounded border-slate-600 text-violet-500 focus:ring-violet-500"
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
            <Label className="text-sm text-slate-300 cursor-pointer" onClick={() => setSelectedParameter(item)}>
              {param.name}
              {item.unit_code && <span className="ml-1 text-xs text-slate-500">({item.unit_code})</span>}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                disabled={isReadOnly}
                min={minVal}
                max={maxVal}
                className={`w-20 h-8 bg-slate-800 border-slate-700 text-white text-sm ${error ? 'border-red-500' : ''}`}
              />
              {isReadOnly && <Badge className="text-xs bg-blue-500/20 text-blue-400">RO</Badge>}
            </div>
          </div>
          <input
            type="range"
            min={minVal}
            max={maxVal}
            value={numValue}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isReadOnly}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>{param.min_value}</span>
            <span>{param.max_value}</span>
          </div>
          {error && (
            <p className="text-xs text-red-400 flex items-center gap-1">
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
          <Label className="text-sm text-slate-300 cursor-pointer" onClick={() => setSelectedParameter(item)}>
            {param.name}
            {item.unit_code && <span className="ml-1 text-xs text-slate-500">({item.unit_code})</span>}
          </Label>
          {isReadOnly && <Badge className="text-xs bg-blue-500/20 text-blue-400">Read Only</Badge>}
        </div>
        <Input
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isReadOnly}
          placeholder={`Enter ${param.name.toLowerCase()}...`}
          className={`bg-slate-800 border-slate-700 text-white ${error ? 'border-red-500' : ''}`}
        />
        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  };

  // MenuSection Component - Shows a collapsible menu with parameter details
  const MenuSection = ({ menu, isEven }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    // Separate items by type
    const variableItems = menu.items.filter(item => item.variable_id && item.parameter);
    const subMenuItems = menu.items.filter(item => item.menu_ref);
    const buttonItems = menu.items.filter(item => item.button_value);

    return (
      <div className={`rounded-lg border ${isEven ? 'bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/30' : 'bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border-blue-500/30'}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-t-lg"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEven ? 'bg-violet-500/20' : 'bg-blue-500/20'}`}>
              <Menu className={`w-4 h-4 ${isEven ? 'text-violet-400' : 'text-blue-400'}`} />
            </div>
            <h3 className="text-lg font-semibold text-white">{menu.name}</h3>
            <Badge className={`${isEven ? 'bg-violet-500/20 text-violet-400 border-violet-500/50' : 'bg-blue-500/20 text-blue-400 border-blue-500/50'}`}>
              {menu.items.length} items
            </Badge>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {isExpanded && (
          <div className="p-4 space-y-3 border-t border-slate-700">
            {variableItems.map((item, idx) => (
              <ParameterItem key={idx} item={item} />
            ))}

            {subMenuItems.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-slate-300">Submenu:</span>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 font-mono">
                    {item.menu_ref}
                  </Badge>
                </div>
              </div>
            ))}

            {buttonItems.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="flex items-center gap-2">
                  <Command className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-slate-300">Action Button:</span>
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/50">
                    Value: {item.button_value}
                  </Badge>
                </div>
              </div>
            ))}

            {menu.items.length === 0 && (
              <div className="text-center py-4 text-slate-500 text-sm">No items in this menu</div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ParameterItem Component - Shows detailed parameter information
  const ParameterItem = ({ item }) => {
    const [showDetails, setShowDetails] = useState(false);
    const param = item.parameter;

    const getTypeIcon = (dataType) => {
      if (!dataType) return <Hash className="w-4 h-4" />;
      const type = dataType.toLowerCase();
      if (type.includes('string')) return <Type className="w-4 h-4 text-cyan-400" />;
      if (type.includes('bool')) return <ToggleLeft className="w-4 h-4 text-green-400" />;
      if (type.includes('int') || type.includes('float')) return <Hash className="w-4 h-4 text-blue-400" />;
      return <Database className="w-4 h-4 text-slate-400" />;
    };

    const getAccessColor = (rights) => {
      if (rights === 'ro') return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      if (rights === 'wo') return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      return 'bg-green-500/20 text-green-400 border-green-500/50';
    };

    if (!param) {
      return (
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="flex items-center gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-mono text-xs">
              {item.variable_id || item.record_item_ref}
            </Badge>
            <span className="text-xs text-slate-500">No parameter definition found</span>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-lg bg-slate-800/50 border border-slate-700 overflow-hidden">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-3 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {getTypeIcon(param.data_type)}
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-white">{param.name}</span>
                <span className="text-xs text-slate-500 font-mono">{item.variable_id}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {param.default_value && (
                <span className="text-xs text-slate-400 px-2 py-1 rounded bg-slate-700">
                  Default: <span className="text-cyan-300 font-mono">{param.default_value}</span>
                </span>
              )}
              {item.access_right_restriction && (
                <Badge className={`text-xs ${getAccessColor(item.access_right_restriction)}`}>
                  {item.access_right_restriction}
                </Badge>
              )}
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>

        {showDetails && (
          <div className="p-4 border-t border-slate-700 bg-slate-900/50 space-y-3">
            {param.description && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-slate-300">{param.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-2 rounded bg-slate-800 border border-slate-700">
                <p className="text-xs text-slate-500 mb-1">Data Type</p>
                <p className="text-xs font-mono text-white">{param.data_type}</p>
              </div>
              {param.bit_length && (
                <div className="p-2 rounded bg-slate-800 border border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">Bit Length</p>
                  <p className="text-xs font-mono text-white">{param.bit_length} bits</p>
                </div>
              )}
              {item.display_format && (
                <div className="p-2 rounded bg-slate-800 border border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">Display Format</p>
                  <p className="text-xs font-mono text-white">{item.display_format}</p>
                </div>
              )}
              {item.unit_code && (
                <div className="p-2 rounded bg-slate-800 border border-slate-700">
                  <p className="text-xs text-slate-500 mb-1">Unit Code</p>
                  <p className="text-xs font-mono text-white">{item.unit_code}</p>
                </div>
              )}
            </div>

            {(param.min_value !== null || param.max_value !== null) && (
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-xs text-blue-400 font-semibold mb-2">Value Range</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-mono">{param.min_value !== null ? param.min_value : '−∞'}</span>
                  <span className="text-slate-500">to</span>
                  <span className="text-sm text-white font-mono">{param.max_value !== null ? param.max_value : '+∞'}</span>
                </div>
              </div>
            )}

            {param.enumeration_values && Object.keys(param.enumeration_values).length > 0 && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <p className="text-xs text-green-400 font-semibold mb-2">Enumeration Values</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(param.enumeration_values).map(([value, name]) => (
                    <div key={value} className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs">
                      <span className="text-green-400 font-mono">{value}</span>
                      <span className="text-slate-500 mx-1">→</span>
                      <span className="text-slate-300">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
              <p className="text-xs text-violet-400 font-semibold mb-2 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Config Form Preview
              </p>
              <ParameterPreview param={param} item={item} />
            </div>
          </div>
        )}
      </div>
    );
  };

  // ParameterPreview Component - Shows what the config control would look like
  const ParameterPreview = ({ param, item }) => {
    if (param.enumeration_values && Object.keys(param.enumeration_values).length > 0) {
      return (
        <div className="space-y-2">
          <Label className="text-xs text-slate-300">{param.name}</Label>
          <Select disabled value={param.default_value || ''}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Select value..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(param.enumeration_values).map(([value, name]) => (
                <SelectItem key={value} value={value}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    } else if (param.data_type && param.data_type.toLowerCase().includes('bool')) {
      return (
        <div className="flex items-center gap-2 p-2 rounded bg-slate-800">
          <input
            type="checkbox"
            disabled
            checked={param.default_value === '1' || param.default_value === 'true'}
            className="w-4 h-4"
          />
          <Label className="text-sm text-slate-300">{param.name}</Label>
        </div>
      );
    } else if (param.min_value !== null || param.max_value !== null) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-slate-300">{param.name}</Label>
            <span className="text-xs text-slate-400">{param.default_value || '0'}</span>
          </div>
          <input
            type="range"
            min={param.min_value || 0}
            max={param.max_value || 100}
            value={param.default_value || 0}
            disabled
            className="w-full"
          />
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <Label className="text-xs text-slate-300">{param.name}</Label>
          <Input
            disabled
            value={param.default_value || ''}
            placeholder={`Enter ${param.name.toLowerCase()}...`}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </div>
      );
    }
  };

  const imageAssets = assets.filter(a => a.file_type === 'image');
  const lightboxSlides = imageAssets.map(asset => ({
    src: `${API_BASE}/api/iodd/${device.id}/assets/${asset.id}`,
    alt: asset.file_name,
  }));

  const filteredParameters = useMemo(() => {
    if (!paramSearchQuery) return parameters;
    return parameters.filter(p =>
      p.name.toLowerCase().includes(paramSearchQuery.toLowerCase()) ||
      p.index.toString().includes(paramSearchQuery)
    );
  }, [parameters, paramSearchQuery]);

  // Find the main device image (device-pic like *symbol-pic.png)
  // Priority: device-pic > any non-icon image > icon as last resort
  const mainDeviceImage = imageAssets.find(a => a.image_purpose === 'device-pic')
    || imageAssets.find(a => a.image_purpose !== 'icon' && a.image_purpose !== 'logo')
    || imageAssets[0];

  // Find the manufacturer logo
  const logoImage = imageAssets.find(a => a.image_purpose === 'logo');

  // Find thumbnail (icon)
  const thumbnailImage = imageAssets.find(a => a.image_purpose === 'icon');

  // Find connection diagram
  const connectionImage = imageAssets.find(a => a.image_purpose === 'connection');

  return (
    <div className="relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      </div>

      <div className="relative space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-slate-400 hover:text-white hover:bg-slate-800 -ml-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Devices
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => window.open(`${API_BASE}/api/iodd/${device.id}/export?format=zip`, '_blank')}
              className="border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800 transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:bg-slate-800 transition-all"
            >
              <Star className="w-4 h-4 mr-2" />
              Favorite
            </Button>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="border-red-700/50 text-red-400 hover:border-red-500 hover:bg-red-950/30 transition-all"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Enhanced Device Header with Showcase */}
        <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden relative group">
          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Device Image Showcase */}
              <div className="lg:col-span-1">
                <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-slate-700 p-6 overflow-hidden group-hover:border-cyan-500/50 transition-all duration-300">
                  {/* Animated background glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

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
                      <Package className="w-32 h-32 text-slate-600" />
                    </div>
                  )}

                  {/* Pulse animation circle */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 animate-pulse" style={{ animationDuration: '3s' }} />
                </div>
              </div>

              {/* Device Info Grid */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        {device.product_name}
                      </h1>
                      <p className="text-xl text-slate-300 font-medium">{device.manufacturer}</p>
                    </div>
                    <Badge className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/50 text-base px-4 py-1 shadow-lg shadow-cyan-500/20 animate-pulse" style={{ animationDuration: '3s' }}>
                      IODD v{formatVersion(device.iodd_version)}
                    </Badge>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-slate-700 hover:border-cyan-500/50 rounded-lg p-4 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-cyan-400" />
                      </div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Vendor ID</p>
                    </div>
                    <p className="text-xl font-bold font-mono text-white">{device.vendor_id}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-slate-700 hover:border-purple-500/50 rounded-lg p-4 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Package className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Device ID</p>
                    </div>
                    <p className="text-xl font-bold font-mono text-white">{device.device_id}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-slate-700 hover:border-green-500/50 rounded-lg p-4 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Database className="w-4 h-4 text-green-400" />
                      </div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Parameters</p>
                    </div>
                    <p className="text-xl font-bold text-white">{parameters.length}</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-slate-700 hover:border-orange-500/50 rounded-lg p-4 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-orange-400" />
                      </div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Images</p>
                    </div>
                    <p className="text-xl font-bold text-white">{imageAssets.length}</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-slate-700 hover:border-blue-500/50 rounded-lg p-4 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Imported</p>
                    </div>
                    <p className="text-sm font-medium text-white">
                      {format(new Date(device.import_date), 'MMM d, yyyy')}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-slate-700 hover:border-pink-500/50 rounded-lg p-4 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-pink-400" />
                      </div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Revision</p>
                    </div>
                    <p className="text-lg font-semibold text-white">v{formatVersion(device.iodd_version)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Tabs with Icons */}
        <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800 -mx-8 px-8 py-4">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="bg-slate-900/50 border border-slate-800 p-1 h-auto">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <Activity className="w-4 h-4" />
                <span className="font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="parameters"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Parameters</span>
                <Badge className="ml-2 bg-slate-700 text-slate-200 text-xs px-2 py-0.5">
                  {parameters.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="images"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="font-medium">Images</span>
                <Badge className="ml-2 bg-slate-700 text-slate-200 text-xs px-2 py-0.5">
                  {imageAssets.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="errors"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-red-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Errors</span>
                <Badge className="ml-2 bg-slate-700 text-slate-200 text-xs px-2 py-0.5">
                  {errors.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <Radio className="w-4 h-4" />
                <span className="font-medium">Events</span>
                <Badge className="ml-2 bg-slate-700 text-slate-200 text-xs px-2 py-0.5">
                  {events.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="processdata"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span className="font-medium">Process Data</span>
                <Badge className="ml-2 bg-slate-700 text-slate-200 text-xs px-2 py-0.5">
                  {processData.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="communication"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <Wifi className="w-4 h-4" />
                <span className="font-medium">Communication</span>
              </TabsTrigger>
              <TabsTrigger
                value="menus"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <Menu className="w-4 h-4" />
                <span className="font-medium">Menus</span>
                {uiMenus && uiMenus.menus && (
                  <Badge className="ml-2 bg-slate-700 text-slate-200 text-xs px-2 py-0.5">
                    {uiMenus.menus.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="xml"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <FileCode className="w-4 h-4" />
                <span className="font-medium">XML</span>
              </TabsTrigger>
              <TabsTrigger
                value="technical"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
              >
                <Code2 className="w-4 h-4" />
                <span className="font-medium">Technical</span>
              </TabsTrigger>
              <TabsTrigger
                value="generate"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-500/20 transition-all duration-300 gap-2 px-6 py-2.5"
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
            {/* Device Capabilities */}
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800 hover:border-cyan-500/30 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    Device Capabilities
                  </CardTitle>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
                    Features
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-slate-700 hover:border-green-500/50 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Database className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Parameters</p>
                      <p className="text-lg font-bold text-white">{parameters.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-slate-700 hover:border-orange-500/50 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                      <ImageIcon className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Asset Files</p>
                      <p className="text-lg font-bold text-white">{imageAssets.length}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-slate-700 hover:border-blue-500/50 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <FileCode className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">IODD Version</p>
                      <p className="text-lg font-bold text-white">v{formatVersion(device.iodd_version)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Information */}
            {documentInfo && (
              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800 hover:border-cyan-500/30 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      Document Information
                    </CardTitle>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                      Metadata
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {documentInfo.copyright && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Copyright</p>
                        <p className="text-sm text-white">{documentInfo.copyright}</p>
                      </div>
                    )}
                    {documentInfo.release_date && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Release Date</p>
                        <p className="text-sm text-white">{documentInfo.release_date}</p>
                      </div>
                    )}
                    {documentInfo.version && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Document Version</p>
                        <p className="text-sm text-white">{documentInfo.version}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Device Features & Capabilities */}
            {deviceFeatures && (
              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800 hover:border-cyan-500/30 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-purple-400" />
                      </div>
                      Device Features
                    </CardTitle>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                      Capabilities
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Feature flags */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className={`p-3 rounded-lg border ${deviceFeatures.data_storage ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                        <div className="flex items-center gap-2">
                          <Database className={`w-4 h-4 ${deviceFeatures.data_storage ? 'text-green-400' : 'text-slate-500'}`} />
                          <span className={`text-sm ${deviceFeatures.data_storage ? 'text-green-400' : 'text-slate-500'}`}>
                            Data Storage
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg border ${deviceFeatures.block_parameter ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                        <div className="flex items-center gap-2">
                          <Lock className={`w-4 h-4 ${deviceFeatures.block_parameter ? 'text-green-400' : 'text-slate-500'}`} />
                          <span className={`text-sm ${deviceFeatures.block_parameter ? 'text-green-400' : 'text-slate-500'}`}>
                            Block Parameter
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Profile Characteristic */}
                    {deviceFeatures.profile_characteristic && (
                      <div className="p-4 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700">
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Profile Characteristic</p>
                        <p className="text-sm text-white font-mono">{deviceFeatures.profile_characteristic}</p>
                      </div>
                    )}

                    {/* Access Locks */}
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Supported Access Locks</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className={`p-3 rounded-lg border text-center ${deviceFeatures.access_locks_data_storage ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                          <Database className={`w-4 h-4 mx-auto mb-1 ${deviceFeatures.access_locks_data_storage ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span className={`text-xs ${deviceFeatures.access_locks_data_storage ? 'text-cyan-400' : 'text-slate-500'}`}>
                            Data Storage
                          </span>
                        </div>
                        <div className={`p-3 rounded-lg border text-center ${deviceFeatures.access_locks_parameter ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                          <Settings className={`w-4 h-4 mx-auto mb-1 ${deviceFeatures.access_locks_parameter ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span className={`text-xs ${deviceFeatures.access_locks_parameter ? 'text-cyan-400' : 'text-slate-500'}`}>
                            Parameter
                          </span>
                        </div>
                        <div className={`p-3 rounded-lg border text-center ${deviceFeatures.access_locks_local_parameterization ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                          <Wrench className={`w-4 h-4 mx-auto mb-1 ${deviceFeatures.access_locks_local_parameterization ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span className={`text-xs ${deviceFeatures.access_locks_local_parameterization ? 'text-cyan-400' : 'text-slate-500'}`}>
                            Local Param
                          </span>
                        </div>
                        <div className={`p-3 rounded-lg border text-center ${deviceFeatures.access_locks_local_user_interface ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                          <Monitor className={`w-4 h-4 mx-auto mb-1 ${deviceFeatures.access_locks_local_user_interface ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <span className={`text-xs ${deviceFeatures.access_locks_local_user_interface ? 'text-cyan-400' : 'text-slate-500'}`}>
                            Local UI
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Device Images Gallery */}
            {imageAssets.length > 0 && (
              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800 hover:border-cyan-500/30 transition-all">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-orange-400" />
                    </div>
                    Device Images
                  </CardTitle>
                  <CardDescription className="text-slate-400">
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
                          className="aspect-square bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-3 border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer relative overflow-hidden"
                        >
                          {/* Hover glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                          <img
                            src={`${API_BASE}/api/iodd/${device.id}/assets/${asset.id}`}
                            alt={asset.file_name}
                            className="relative z-10 w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-400 truncate">{asset.file_name}</p>
                          {asset.image_purpose && (
                            <Badge className="text-xs mt-1 bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
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
          </TabsContent>

          {/* Parameters Tab */}
          <TabsContent value="parameters" className="space-y-4 mt-6">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-xl flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-purple-400" />
                      </div>
                      Device Parameters
                    </CardTitle>
                    <CardDescription className="text-slate-400 mt-2">
                      {parameters.length} configuration parameters available
                    </CardDescription>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50 text-base px-4 py-1">
                    {filteredParameters.length} / {parameters.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Box */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search parameters by name or index..."
                      value={paramSearchQuery}
                      onChange={(e) => setParamSearchQuery(e.target.value)}
                      className="pl-11 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                    />
                  </div>
                </div>

                {filteredParameters.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-600 to-pink-600">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-white">Index</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-white">Name</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-white">Type</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-white">Access</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-white">Default</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-white">Range/Options</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-white">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredParameters.map((param, index) => (
                          <tr
                            key={index}
                            className="border-b border-slate-800 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-transparent transition-all"
                          >
                            <td className="py-3 px-4 text-sm font-mono text-cyan-400 font-semibold">{param.index}</td>
                            <td className="py-3 px-4 text-sm text-white font-medium">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span>{param.name}</span>
                                {param.dynamic && (
                                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
                                    Dynamic
                                  </Badge>
                                )}
                                {param.unit_code && (
                                  <span className="text-xs text-purple-400 font-semibold">
                                    [{param.unit_code}]
                                  </span>
                                )}
                                {param.bit_length && (
                                  <span className="text-xs text-slate-500">({param.bit_length} bits)</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm font-mono text-slate-400">{param.data_type}</td>
                            <td className="py-3 px-4 text-sm">
                              <Badge className={`text-xs ${
                                param.access_rights === 'rw' || param.access_rights === 'RW'
                                  ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                  : param.access_rights === 'ro' || param.access_rights === 'RO'
                                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                  : 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                              }`}>
                                {param.access_rights}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {param.enumeration_values && param.default_value ? (
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-cyan-400">{param.default_value}</span>
                                  <span className="text-slate-500">=</span>
                                  <span className="text-white">
                                    {param.enumeration_values[param.default_value] || 'Unknown'}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-mono text-slate-400">
                                  {param.default_value || '-'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {param.enumeration_values && Object.keys(param.enumeration_values).length > 0 ? (
                                <div className="space-y-1">
                                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 text-xs">
                                    {Object.keys(param.enumeration_values).length} options
                                  </Badge>
                                  <div className="text-xs text-slate-500">
                                    {Object.entries(param.enumeration_values).slice(0, 2).map(([value, label]) => (
                                      <div key={value}>{value}: {label}</div>
                                    ))}
                                    {Object.keys(param.enumeration_values).length > 2 && (
                                      <div>...</div>
                                    )}
                                  </div>
                                </div>
                              ) : param.min_value && param.max_value ? (
                                <span className="font-mono text-slate-400">
                                  {param.min_value} - {param.max_value}
                                </span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {(param.access_rights === 'rw' || param.access_rights === 'RW') ? (
                                param.enumeration_values && Object.keys(param.enumeration_values).length > 0 ? (
                                  <Select defaultValue={param.default_value || Object.keys(param.enumeration_values)[0]}>
                                    <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white hover:border-purple-500/50 transition-all">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                      {Object.entries(param.enumeration_values).map(([value, label]) => (
                                        <SelectItem
                                          key={value}
                                          value={value}
                                          className="text-white hover:bg-purple-500/20 cursor-pointer"
                                        >
                                          <div className="flex items-center space-x-2">
                                            <span className="font-mono text-cyan-400 text-xs">{value}:</span>
                                            <span>{label}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : param.data_type === 'BooleanT' ? (
                                  <Select defaultValue={param.default_value || '0'}>
                                    <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white hover:border-purple-500/50 transition-all">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                      <SelectItem value="0" className="text-white hover:bg-purple-500/20 cursor-pointer">
                                        False (0)
                                      </SelectItem>
                                      <SelectItem value="1" className="text-white hover:bg-purple-500/20 cursor-pointer">
                                        True (1)
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : param.data_type === 'StringT' ? (
                                  <Input
                                    type="text"
                                    defaultValue={param.default_value || ''}
                                    placeholder="Enter value..."
                                    className="w-full bg-slate-800 border-slate-700 text-white focus:border-purple-500/50 focus:ring-purple-500/20 transition-all"
                                  />
                                ) : (
                                  <Input
                                    type="number"
                                    defaultValue={param.default_value || ''}
                                    min={param.min_value || undefined}
                                    max={param.max_value || undefined}
                                    placeholder="Enter value..."
                                    className="w-full bg-slate-800 border-slate-700 text-white focus:border-purple-500/50 focus:ring-purple-500/20 transition-all font-mono"
                                  />
                                )
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-xs">
                                    Read Only
                                  </Badge>
                                  {param.enumeration_values && param.default_value && (
                                    <span className="text-xs text-slate-500">
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
                    <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">
                      {paramSearchQuery ? 'No parameters match your search' : 'No parameters found'}
                    </p>
                    {paramSearchQuery && (
                      <Button
                        variant="link"
                        onClick={() => setParamSearchQuery('')}
                        className="mt-2 text-purple-400"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Tab */}
          <TabsContent value="images" className="space-y-4 mt-6">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-orange-400" />
                  </div>
                  Device Images
                </CardTitle>
                <CardDescription className="text-slate-400">
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
                          className="aspect-square bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-orange-500/50 transition-all cursor-pointer relative overflow-hidden"
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
                          <p className="text-sm text-white font-medium truncate">{asset.file_name}</p>
                          {asset.image_purpose && (
                            <Badge className="text-xs mt-1 bg-orange-500/20 text-orange-400 border-orange-500/50">
                              {asset.image_purpose}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No images found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Errors Tab */}
          <TabsContent value="errors" className="space-y-4 mt-6">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  Error Types
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Standard IO-Link error codes supported by this device
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingErrors ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 bg-slate-800" />
                    ))}
                  </div>
                ) : errors.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No error types defined for this device
                  </div>
                ) : (
                  <div className="space-y-3">
                    {errors.map((error) => (
                      <div
                        key={error.id}
                        className="p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-rose-500/5 border border-slate-700 hover:border-red-500/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="px-3 py-1 rounded-md bg-red-500/20 border border-red-500/30">
                              <span className="text-red-300 font-mono text-sm font-bold">
                                {error.code}/{error.additional_code}
                              </span>
                            </div>
                            <div className="px-3 py-1 rounded-md bg-slate-700/30 border border-slate-600/30">
                              <span className="text-slate-300 font-mono text-xs">
                                0x{error.code.toString(16).toUpperCase().padStart(2, '0')}/0x{error.additional_code.toString(16).toUpperCase().padStart(2, '0')}
                              </span>
                            </div>
                            <h3 className="text-white font-semibold">{error.name}</h3>
                          </div>
                        </div>
                        {error.description && (
                          <p className="text-slate-400 text-sm mt-2 ml-1">{error.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4 mt-6">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                    <Radio className="w-5 h-5 text-yellow-400" />
                  </div>
                  Device Events
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Events that can be triggered by this device
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingEvents ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 bg-slate-800" />
                    ))}
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No events defined for this device
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border border-slate-700 hover:border-yellow-500/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="px-3 py-1 rounded-md bg-yellow-500/20 border border-yellow-500/30">
                              <span className="text-yellow-300 font-mono text-sm font-bold">
                                {event.code}
                              </span>
                            </div>
                            <div className="px-3 py-1 rounded-md bg-slate-700/30 border border-slate-600/30">
                              <span className="text-slate-300 font-mono text-xs">
                                0x{event.code.toString(16).toUpperCase().padStart(4, '0')}
                              </span>
                            </div>
                            {event.event_type && (
                              <Badge className={`
                                ${event.event_type === 'Error' ? 'bg-red-500/20 text-red-400 border-red-500/50' : ''}
                                ${event.event_type === 'Warning' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : ''}
                                ${event.event_type === 'Notification' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : ''}
                                font-semibold
                              `}>
                                {event.event_type}
                              </Badge>
                            )}
                            <h3 className="text-white font-semibold">{event.name}</h3>
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-slate-400 text-sm mt-2 ml-1">{event.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Process Data Tab */}
          <TabsContent value="processdata" className="space-y-4 mt-6">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                  </div>
                  Process Data Structure
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Input and output process data configuration for real-time communication
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingProcessData ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-24 bg-slate-800" />
                    ))}
                  </div>
                ) : processData.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No process data defined for this device
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Process Data Inputs */}
                    {processData.filter(pd => pd.direction === 'input').length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          Process Data Inputs ({processData.filter(pd => pd.direction === 'input').length})
                        </h3>
                        <div className="space-y-3">
                          {processData.filter(pd => pd.direction === 'input').map((pd) => (
                            <div
                              key={pd.id}
                              className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-slate-700 hover:border-cyan-500/50 transition-all"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="text-white font-semibold">{pd.name}</h4>
                                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50 text-xs">
                                      {pd.bit_length} bits
                                    </Badge>
                                    <Badge className="bg-slate-700 text-slate-300 text-xs">
                                      {pd.data_type}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-500 font-mono">ID: {pd.pd_id}</p>
                                </div>
                              </div>
                              {pd.record_items && pd.record_items.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-700">
                                  <p className="text-xs text-slate-400 mb-2 font-semibold">Record Structure:</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {pd.record_items.map((item) => (
                                      <div
                                        key={item.subindex}
                                        className="p-2 rounded bg-slate-800/50 border border-slate-700"
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-slate-300 text-sm font-medium">{item.name}</span>
                                          <span className="text-xs text-slate-500 font-mono">idx:{item.subindex}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                          <span className="font-mono">{item.data_type}</span>
                                          <span>•</span>
                                          <span>{item.bit_length} bits</span>
                                          <span>•</span>
                                          <span>offset: {item.bit_offset}</span>
                                        </div>
                                        {item.single_values && item.single_values.length > 0 && (
                                          <div className="mt-2 pt-2 border-t border-slate-700">
                                            <p className="text-xs text-slate-500 mb-1">Values:</p>
                                            <div className="flex flex-wrap gap-1">
                                              {item.single_values.map((sv, svIdx) => (
                                                <div
                                                  key={svIdx}
                                                  className="text-xs px-2 py-1 rounded bg-slate-700/50 text-slate-300"
                                                  title={sv.description || sv.name}
                                                >
                                                  <span className="font-mono text-cyan-400">{sv.value}</span>
                                                  <span className="text-slate-500 mx-1">=</span>
                                                  <span>{sv.name}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Process Data Outputs */}
                    {processData.filter(pd => pd.direction === 'output').length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                          Process Data Outputs ({processData.filter(pd => pd.direction === 'output').length})
                        </h3>
                        <div className="space-y-3">
                          {processData.filter(pd => pd.direction === 'output').map((pd) => (
                            <div
                              key={pd.id}
                              className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-slate-700 hover:border-purple-500/50 transition-all"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="text-white font-semibold">{pd.name}</h4>
                                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50 text-xs">
                                      {pd.bit_length} bits
                                    </Badge>
                                    <Badge className="bg-slate-700 text-slate-300 text-xs">
                                      {pd.data_type}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-500 font-mono">ID: {pd.pd_id}</p>
                                </div>
                              </div>
                              {pd.record_items && pd.record_items.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-700">
                                  <p className="text-xs text-slate-400 mb-2 font-semibold">Record Structure:</p>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {pd.record_items.map((item) => (
                                      <div
                                        key={item.subindex}
                                        className="p-2 rounded bg-slate-800/50 border border-slate-700"
                                      >
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="text-slate-300 text-sm font-medium">{item.name}</span>
                                          <span className="text-xs text-slate-500 font-mono">idx:{item.subindex}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                          <span className="font-mono">{item.data_type}</span>
                                          <span>•</span>
                                          <span>{item.bit_length} bits</span>
                                          <span>•</span>
                                          <span>offset: {item.bit_offset}</span>
                                        </div>
                                        {item.single_values && item.single_values.length > 0 && (
                                          <div className="mt-2 pt-2 border-t border-slate-700">
                                            <p className="text-xs text-slate-500 mb-1">Values:</p>
                                            <div className="flex flex-wrap gap-1">
                                              {item.single_values.map((sv, svIdx) => (
                                                <div
                                                  key={svIdx}
                                                  className="text-xs px-2 py-1 rounded bg-slate-700/50 text-slate-300"
                                                  title={sv.description || sv.name}
                                                >
                                                  <span className="font-mono text-cyan-400">{sv.value}</span>
                                                  <span className="text-slate-500 mx-1">=</span>
                                                  <span>{sv.name}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-4 mt-6">
            {communicationProfile ? (
              <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-teal-400" />
                    </div>
                    IO-Link Communication Profile
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Network configuration and physical connection details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Protocol Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Protocol</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {communicationProfile.iolink_revision && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-teal-500/10 to-emerald-500/5 border border-slate-700">
                            <p className="text-xs text-slate-400 mb-1">IO-Link Revision</p>
                            <p className="text-lg font-bold text-teal-400">{communicationProfile.iolink_revision}</p>
                          </div>
                        )}
                        {communicationProfile.compatible_with && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-slate-700">
                            <p className="text-xs text-slate-400 mb-1">Compatible With</p>
                            <p className="text-lg font-bold text-blue-400">{communicationProfile.compatible_with}</p>
                          </div>
                        )}
                        {communicationProfile.bitrate && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-slate-700">
                            <p className="text-xs text-slate-400 mb-1">Bitrate</p>
                            <p className="text-lg font-bold text-purple-400">{communicationProfile.bitrate}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timing Information */}
                    <div>
                      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Timing & Performance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {communicationProfile.min_cycle_time && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-slate-700">
                            <p className="text-xs text-slate-400 mb-1">Min Cycle Time</p>
                            <p className="text-lg font-bold text-orange-400">{(communicationProfile.min_cycle_time / 1000).toFixed(1)} ms</p>
                          </div>
                        )}
                        {communicationProfile.msequence_capability && (
                          <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-slate-700">
                            <p className="text-xs text-slate-400 mb-1">M-Sequence Capability</p>
                            <p className="text-lg font-bold text-green-400">{communicationProfile.msequence_capability} bytes</p>
                          </div>
                        )}
                        <div className={`p-4 rounded-lg border ${communicationProfile.sio_supported ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                          <p className="text-xs text-slate-400 mb-1">SIO Support</p>
                          <p className={`text-lg font-bold ${communicationProfile.sio_supported ? 'text-green-400' : 'text-slate-500'}`}>
                            {communicationProfile.sio_supported ? 'Supported' : 'Not Supported'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Physical Connection */}
                    {communicationProfile.connection_type && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Physical Connection</h3>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700">
                          <p className="text-xs text-slate-400 mb-2">Connection Type</p>
                          <p className="text-lg font-bold text-white">{communicationProfile.connection_type}</p>
                        </div>
                      </div>
                    )}

                    {/* Wire Configuration */}
                    {communicationProfile.wire_config && Object.keys(communicationProfile.wire_config).length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Wire Configuration</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(communicationProfile.wire_config).map(([wire, func]) => (
                            <div key={wire} className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-slate-700">
                              <p className="text-xs text-slate-400 mb-1">{wire}</p>
                              <p className="text-sm font-semibold text-cyan-400">{func}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12 text-slate-400">
                No communication profile information available for this device
              </div>
            )}
          </TabsContent>

          {/* Enhanced Menus Tab with Parameter Details */}
          <TabsContent value="menus" className="space-y-4 mt-6">
            {configSchema && configSchema.menus && configSchema.menus.length > 0 ? (
              <div className="space-y-4">
                {/* Configuration Toolbar */}
                <Card className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                          <Settings className="w-5 h-5 text-violet-400" />
                        </div>
                        <div className="flex-1">
                          <Input
                            value={configurationName}
                            onChange={(e) => setConfigurationName(e.target.value)}
                            className="bg-slate-800/50 border-violet-500/30 text-white font-semibold max-w-md"
                            placeholder="Configuration name..."
                          />
                          <p className="text-xs text-slate-400 mt-1">
                            {hasUnsavedChanges ? (
                              <span className="text-orange-400">Unsaved changes</span>
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
                          className="bg-slate-800 border-slate-700 hover:bg-slate-700"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportConfiguration}
                          className="bg-violet-500/10 border-violet-500/50 hover:bg-violet-500/20 text-violet-400"
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
                    <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white text-lg">Device Configuration</CardTitle>
                        <CardDescription className="text-slate-400">
                          Adjust device parameters - changes are not applied to the physical device
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* Menu Tabs */}
                        <Tabs value={activeConfigMenu} onValueChange={setActiveConfigMenu} className="w-full">
                          <TabsList className="bg-slate-800/50 border border-slate-700 p-1 flex flex-wrap h-auto">
                            {configSchema.menus.map((menu) => (
                              <TabsTrigger
                                key={menu.id}
                                value={menu.id}
                                className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400 text-slate-400 text-sm"
                              >
                                {menu.name}
                                <Badge className="ml-2 bg-slate-700 text-slate-300 text-xs">
                                  {menu.items.length}
                                </Badge>
                              </TabsTrigger>
                            ))}
                          </TabsList>

                          {/* Menu Content - Show ALL items */}
                          {configSchema.menus.map((menu) => (
                            <TabsContent key={menu.id} value={menu.id} className="mt-4 space-y-3">
                              {menu.items.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                  No items in this menu
                                </div>
                              ) : (
                                menu.items.map((item, idx) => (
                                  <MenuItemDisplay key={idx} item={item} index={idx} />
                                ))
                              )}
                            </TabsContent>
                          ))}
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right: Parameter Details Panel */}
                  <div className="col-span-12 lg:col-span-4">
                    <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800 sticky top-4">
                      <CardHeader>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                          <Info className="w-5 h-5 text-violet-400" />
                          Parameter Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedParameter && selectedParameter.parameter ? (
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {selectedParameter.parameter.name}
                              </h3>
                              <Badge className="font-mono text-xs bg-cyan-500/20 text-cyan-300 border-cyan-500/50">
                                {selectedParameter.variable_id}
                              </Badge>
                            </div>

                            {selectedParameter.parameter.description && (
                              <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Description</p>
                                <p className="text-sm text-slate-300">{selectedParameter.parameter.description}</p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="p-2 rounded bg-slate-800/50 border border-slate-700">
                                <p className="text-xs text-slate-500 mb-1">Data Type</p>
                                <p className="text-slate-300 font-mono text-xs">{selectedParameter.parameter.data_type}</p>
                              </div>
                              <div className="p-2 rounded bg-slate-800/50 border border-slate-700">
                                <p className="text-xs text-slate-500 mb-1">Access</p>
                                <Badge className={`text-xs ${selectedParameter.access_right_restriction === 'ro' ? 'bg-blue-500/20 text-blue-400' : selectedParameter.access_right_restriction === 'wo' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>
                                  {selectedParameter.access_right_restriction}
                                </Badge>
                              </div>
                              {selectedParameter.parameter.default_value && (
                                <div className="p-2 rounded bg-slate-800/50 border border-slate-700">
                                  <p className="text-xs text-slate-500 mb-1">Default</p>
                                  <p className="text-slate-300 font-mono text-xs">{selectedParameter.parameter.default_value}</p>
                                </div>
                              )}
                              {selectedParameter.parameter.bit_length && (
                                <div className="p-2 rounded bg-slate-800/50 border border-slate-700">
                                  <p className="text-xs text-slate-500 mb-1">Bit Length</p>
                                  <p className="text-slate-300 font-mono text-xs">{selectedParameter.parameter.bit_length}</p>
                                </div>
                              )}
                            </div>

                            {(selectedParameter.parameter.min_value !== null || selectedParameter.parameter.max_value !== null) && (
                              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                <p className="text-xs text-blue-400 font-semibold mb-2">Value Range</p>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-300">Min: <span className="font-mono">{selectedParameter.parameter.min_value}</span></span>
                                  <span className="text-slate-300">Max: <span className="font-mono">{selectedParameter.parameter.max_value}</span></span>
                                </div>
                              </div>
                            )}

                            {selectedParameter.parameter.enumeration_values && Object.keys(selectedParameter.parameter.enumeration_values).length > 0 && (
                              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                                <p className="text-xs text-green-400 font-semibold mb-2">Valid Values</p>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                  {Object.entries(selectedParameter.parameter.enumeration_values).map(([value, name]) => (
                                    <div key={value} className="text-xs text-slate-300 flex items-center gap-2">
                                      <span className="font-mono bg-slate-800 px-2 py-1 rounded">{value}</span>
                                      <span>{name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="pt-3 border-t border-slate-700">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(selectedParameter.variable_id)}
                                className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Variable ID
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12 text-slate-500">
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
              <div className="text-center py-12 text-slate-400">
                {configSchema === null ? (
                  <div>
                    <Skeleton className="h-8 w-64 mx-auto mb-2 bg-slate-800" />
                    <Skeleton className="h-4 w-48 mx-auto bg-slate-800" />
                  </div>
                ) : (
                  'No menu structure information available for this device'
                )}
              </div>
            )}
          </TabsContent>

          {/* XML Viewer Tab */}
          <TabsContent value="xml" className="space-y-4 mt-6">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-green-400" />
                  IODD XML Source
                </CardTitle>
                <CardDescription className="text-slate-400">
                  View the raw XML definition for this device
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingXml ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-slate-400">Loading XML...</div>
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
                      className="absolute top-2 right-2 z-10 border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <div className="h-[600px] w-full rounded-lg border border-slate-700 bg-slate-950 overflow-auto">
                      <pre className="p-4 text-xs font-mono text-green-400 whitespace-pre-wrap break-words">
                        {xmlContent}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    No XML content available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-6 mt-6">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <Code2 className="w-5 h-5 text-green-400" />
                  </div>
                  Technical Information
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Device specifications and metadata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-slate-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Vendor ID</p>
                    </div>
                    <p className="text-lg font-mono font-bold text-white">{device.vendor_id}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-slate-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="w-4 h-4 text-purple-400" />
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Device ID</p>
                    </div>
                    <p className="text-lg font-mono font-bold text-white">{device.device_id}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-slate-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileCode className="w-4 h-4 text-green-400" />
                      <p className="text-xs text-slate-400 uppercase tracking-wider">IODD Version</p>
                    </div>
                    <p className="text-lg font-bold text-white">v{formatVersion(device.iodd_version)}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-slate-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Database className="w-4 h-4 text-orange-400" />
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Total Parameters</p>
                    </div>
                    <p className="text-lg font-bold text-white">{parameters.length}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-slate-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Import Date</p>
                    </div>
                    <p className="text-sm font-medium text-white">
                      {format(new Date(device.import_date), 'PPP')}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-rose-500/5 border border-slate-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-pink-400" />
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Asset Count</p>
                    </div>
                    <p className="text-lg font-bold text-white">{assets.length}</p>
                  </div>
                </div>

                {/* Standard Variables */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Database className="w-4 h-4 text-green-400" />
                    </div>
                    Standard Variables
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-green-600 to-emerald-600">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-white">Variable</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-white">Value</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-white">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-800 hover:bg-green-500/5">
                          <td className="py-3 px-4 text-sm font-medium text-white">Product Name</td>
                          <td className="py-3 px-4 text-sm text-slate-300">{device.product_name}</td>
                          <td className="py-3 px-4 text-sm text-slate-400">Device product name</td>
                        </tr>
                        <tr className="border-b border-slate-800 hover:bg-green-500/5">
                          <td className="py-3 px-4 text-sm font-medium text-white">Manufacturer</td>
                          <td className="py-3 px-4 text-sm text-slate-300">{device.manufacturer}</td>
                          <td className="py-3 px-4 text-sm text-slate-400">Manufacturer name</td>
                        </tr>
                        <tr className="border-b border-slate-800 hover:bg-green-500/5">
                          <td className="py-3 px-4 text-sm font-medium text-white">IODD Version</td>
                          <td className="py-3 px-4 text-sm font-mono text-slate-300">{device.iodd_version}</td>
                          <td className="py-3 px-4 text-sm text-slate-400">IO-Link Device Description version</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-4 mt-6">
            <Card className="bg-slate-900/80 backdrop-blur-sm border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-indigo-400" />
                  </div>
                  Generate Adapter
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Create adapters for various platforms and frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    className="h-32 flex-col space-y-3 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-500/50 transition-all"
                    disabled
                  >
                    <div className="w-16 h-16 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                      <Code2 className="w-8 h-8 text-cyan-400 opacity-50" />
                    </div>
                    <span className="text-base font-semibold">Node-RED (Coming Soon)</span>
                  </Button>
                  <Button
                    className="h-32 flex-col space-y-3 bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/50 transition-all"
                    disabled
                  >
                    <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <FileCode className="w-8 h-8 text-green-400 opacity-50" />
                    </div>
                    <span className="text-base font-semibold">Python (Coming Soon)</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
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
        <DialogContent className="bg-slate-900 border-red-700/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Device
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Are you sure you want to delete <span className="font-semibold text-white">{device.product_name}</span>?
              <br />
              <span className="text-red-400">This action cannot be undone.</span> All device data, parameters, and assets will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete Device'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ============================================================================
// Main App Component
// ============================================================================

const IODDManager = () => {
  const [activeView, setActiveView] = useState('devices');
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [stats, setStats] = useState({
    total_devices: 0,
    total_parameters: 0,
    total_generated: 0,
    adapters_by_platform: {}
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentDevices, setRecentDevices] = useState([]);
  const { toast } = useToast();
  const fileInputRef = React.useRef();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchDevices();
    fetchStats();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/iodd`);
      setDevices(response.data);
      // Update recent devices (last 5 imported)
      const sorted = [...response.data].sort((a, b) =>
        new Date(b.import_date) - new Date(a.import_date)
      );
      setRecentDevices(sorted.slice(0, 5));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch devices',
        variant: 'destructive',
      });
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

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
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.detail || 'Failed to upload IODD file',
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
    const totalFiles = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));

        const response = await axios.post(
          `${API_BASE}/api/iodd/upload`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );

        // Handle both single and multi-device responses
        if (response.data.devices) {
          successCount += response.data.total_count;
        } else {
          successCount += 1;
        }
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        failCount += 1;
      }
    }

    setLoading(false);
    setUploadProgress(0);

    // Show summary toast
    if (successCount > 0 && failCount === 0) {
      toast({
        title: 'All imports successful',
        description: `Successfully imported ${successCount} device(s) from ${totalFiles} file(s)`,
      });
    } else if (successCount > 0 && failCount > 0) {
      toast({
        title: 'Partial success',
        description: `Imported ${successCount} device(s), ${failCount} file(s) failed`,
        variant: 'warning',
      });
    } else {
      toast({
        title: 'Import failed',
        description: `Failed to import ${failCount} file(s)`,
        variant: 'destructive',
      });
    }

    fetchDevices();
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

  const handleNavigate = (view, device = null) => {
    setActiveView(view);
    if (device) {
      setSelectedDevice(device);
      setActiveView('device-details');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const sidebarWidth = 'w-64';

  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        devices={devices}
        onDeviceSelect={handleDeviceSelect}
        recentDevices={recentDevices}
      />

      <div className="ml-64 min-h-screen">
        <div className="p-8">
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

            {activeView === 'generators' && (
              <motion.div
                key="generators"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-4">Adapter Generators</h2>
                  <p className="text-slate-400">Coming soon...</p>
                </div>
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
                <div className="text-white">
                  <h2 className="text-2xl font-bold mb-4">Analytics</h2>
                  <p className="text-slate-400">Coming soon...</p>
                </div>
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
                <SettingsPage
                  API_BASE={API_BASE}
                  toast={toast}
                  onDevicesChange={fetchDevices}
                  recentDevices={recentDevices}
                  setRecentDevices={setRecentDevices}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Hidden File Input */}
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

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white">Processing...</p>
              {uploadProgress > 0 && (
                <Progress value={uploadProgress} className="w-48" />
              )}
            </div>
          </Card>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default IODDManager;
