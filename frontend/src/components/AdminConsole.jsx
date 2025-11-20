import { useState, useEffect, useCallback } from 'react';
import {
  Settings, Database, HardDrive, Activity, AlertTriangle, CheckCircle, CheckCircle2,
  Download, Trash2, BarChart3, Server, Cpu, Package, FileText,
  RefreshCw, Shield, Zap, TrendingUp, Info, BookOpen,
  ExternalLink, Home, Rocket, Terminal, Github, Bug, Search, GitBranch,
  Wifi, WifiOff, Play, StopCircle, RotateCw, Palette, AlertCircle, XCircle, FileCode
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from './ui';
import TicketsPage from './TicketsPage';
import ThemeManager from './ThemeManager';
import PQAConsole from './PQAConsole';

const confirmAction = (message) =>
  // eslint-disable-next-line no-alert
  window.confirm(message);

const promptAction = (message) =>
  // eslint-disable-next-line no-alert
  window.prompt(message);

/**
 * Comprehensive Admin Console - System management hub
 */
const AdminConsole = ({ API_BASE, toast, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [dbHealth, setDbHealth] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [edsDiagnostics, setEdsDiagnostics] = useState(null);
  const [ioddDiagnostics, setIoddDiagnostics] = useState(null);
  const [vendorStats, setVendorStats] = useState(null);
  const [activeTab, setActiveTab] = useState('hub');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, healthRes, systemRes, edsDiagRes, ioddDiagRes, vendorRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/stats/overview`),
        axios.get(`${API_BASE}/api/admin/stats/database-health`),
        axios.get(`${API_BASE}/api/admin/system/info`),
        axios.get(`${API_BASE}/api/admin/diagnostics/eds-summary`),
        axios.get(`${API_BASE}/api/admin/diagnostics/iodd-summary`),
        axios.get(`${API_BASE}/api/admin/stats/devices-by-vendor`)
      ]);

      setOverview(overviewRes.data);
      setDbHealth(healthRes.data);
      setSystemInfo(systemRes.data);
      setEdsDiagnostics(edsDiagRes.data);
      setIoddDiagnostics(ioddDiagRes.data);
      setVendorStats(vendorRes.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin console data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [API_BASE, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVacuum = async () => {
    if (!confirmAction('Vacuum database? This will optimize storage but may take a few moments.')) return;

    try {
      const response = await axios.post(`${API_BASE}/api/admin/database/vacuum`);
      toast({
        title: 'Success',
        description: `Database optimized! Saved ${response.data.space_saved_mb} MB`
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to vacuum database',
        variant: 'destructive'
      });
    }
  };

  const handleCleanFKViolations = async () => {
    if (!confirmAction('Clean orphaned records? This will permanently delete records that reference non-existent parent data.')) return;

    try {
      const response = await axios.post(`${API_BASE}/api/admin/database/clean-fk-violations`);
      toast({
        title: 'Foreign Key Violations Cleaned',
        description: `${response.data.message}. Deleted ${response.data.records_deleted} orphaned records.`
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to clean FK violations',
        variant: 'destructive'
      });
    }
  };

  const handleBackup = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/admin/database/backup`);
      toast({
        title: 'Success',
        description: `Backup created: ${response.data.backup_file}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create backup',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/admin/database/backup/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `greenstack_backup_${new Date().toISOString().split('T')[0]}.db`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: 'Success',
        description: 'Backup downloaded successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download backup',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteIODD = async () => {
    if (!confirmAction('⚠️ WARNING: This will delete ALL IODD devices and parameters!\n\nThis action cannot be undone. Are you absolutely sure?')) return;

    try {
      const response = await axios.post(`${API_BASE}/api/admin/database/delete-iodd`);
      toast({
        title: 'Success',
        description: `Deleted ${response.data.devices_deleted} devices and ${response.data.parameters_deleted} parameters`
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete IODD devices',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteEDS = async () => {
    if (!confirmAction('⚠️ WARNING: This will delete ALL EDS files and parameters!\n\nThis action cannot be undone. Are you absolutely sure?')) return;

    try {
      const response = await axios.post(`${API_BASE}/api/admin/database/delete-eds`);
      toast({
        title: 'Success',
        description: `Deleted ${response.data.files_deleted} files and ${response.data.parameters_deleted} parameters`
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete EDS files',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTickets = async () => {
    if (!confirmAction('⚠️ WARNING: This will delete ALL tickets and attachments!\n\nThis action cannot be undone. Are you absolutely sure?')) return;

    try {
      const response = await axios.post(`${API_BASE}/api/admin/database/delete-tickets`);
      toast({
        title: 'Success',
        description: `Deleted ${response.data.tickets_deleted} tickets and ${response.data.attachments_deleted} attachments`
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tickets',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAll = async () => {
    const firstConfirm = confirmAction('⚠️ DANGER: This will delete ALL data from the database!\n\nThis includes:\n- All IODD devices\n- All EDS files\n- All tickets\n- All parameters\n\nThis action cannot be undone. Continue?');
    if (!firstConfirm) return;

    const secondConfirm = confirmAction('⚠️ FINAL WARNING: You are about to permanently delete everything!\n\nType "DELETE" in the next prompt to confirm.');
    if (!secondConfirm) return;

    const userInput = promptAction('Type DELETE (in capital letters) to confirm:');
    if (userInput !== 'DELETE') {
      toast({
        title: 'Cancelled',
        description: 'Delete operation cancelled',
        variant: 'default'
      });
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/admin/database/delete-all`);
      toast({
        title: 'Success',
        description: `All data deleted: ${response.data.iodd_devices_deleted} IODD devices, ${response.data.eds_files_deleted} EDS files`
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete all data',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteTemp = async () => {
    if (!confirmAction('Delete all temporary files and cached data?\n\nThis will clean up temp files but won&rsquo;t affect your database.')) return;

    try {
      const response = await axios.post(`${API_BASE}/api/admin/database/delete-temp`);
      toast({
        title: 'Success',
        description: `Cleaned ${response.data.files_deleted} files, ${response.data.directories_deleted} directories. Freed ${response.data.space_freed_mb} MB`
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete temp data',
        variant: 'destructive'
      });
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-brand-green animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="w-8 h-8 text-brand-green" />
            Admin Console
          </h1>
          <p className="text-muted-foreground mt-1">
            System management, monitoring, and resources
          </p>
        </div>
        <Button
          onClick={loadData}
          disabled={loading}
          className="bg-secondary hover:bg-muted text-foreground"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'hub', label: 'Hub', icon: Home },
            { id: 'tickets', label: 'Tickets', icon: Bug },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'database', label: 'Database', icon: Database },
            { id: 'diagnostics', label: 'Parser Diagnostics', icon: Activity },
            { id: 'system', label: 'System', icon: Server }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-brand-green border-b-2 border-brand-green'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'hub' && (
        <HubTab overview={overview} onNavigate={onNavigate} API_BASE={API_BASE} />
      )}

      {activeTab === 'tickets' && (
        <TicketsPage API_BASE={API_BASE} toast={toast} />
      )}

      {activeTab === 'appearance' && (
        <ThemeManager API_BASE={API_BASE} toast={toast} />
      )}

      {activeTab === 'database' && (
        <DatabaseTab
          overview={overview}
          dbHealth={dbHealth}
          handleVacuum={handleVacuum}
          handleCleanFKViolations={handleCleanFKViolations}
          handleBackup={handleBackup}
          handleDownloadBackup={handleDownloadBackup}
          handleDeleteIODD={handleDeleteIODD}
          handleDeleteEDS={handleDeleteEDS}
          handleDeleteTickets={handleDeleteTickets}
          handleDeleteTemp={handleDeleteTemp}
          handleDeleteAll={handleDeleteAll}
        />
      )}

      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <DiagnosticsTab
            edsDiagnostics={edsDiagnostics}
            ioddDiagnostics={ioddDiagnostics}
            vendorStats={vendorStats}
          />
          <PQAConsole API_BASE={API_BASE} toast={toast} />
        </div>
      )}

      {activeTab === 'system' && (
        <SystemTab systemInfo={systemInfo} overview={overview} />
      )}
    </div>
  );
};

/**
 * Hub Tab - Visual starting point with quick links and resources
 */
const HubTab = ({ overview, onNavigate, API_BASE }) => {
  const [mqttStatus, setMqttStatus] = useState(null);
  const [mqttLoading, setMqttLoading] = useState(false);

  useEffect(() => {
    fetchMqttStatus();
  }, []);

  const fetchMqttStatus = async () => {
    try {
      const response = await axios.get('/api/mqtt/status');
      setMqttStatus(response.data);
    } catch (error) {
      console.error('Failed to fetch MQTT status:', error);
    }
  };

  const handleMqttAction = async (action) => {
    setMqttLoading(true);
    try {
      await axios.post(`/api/mqtt/${action}`);
      await fetchMqttStatus();
    } catch (error) {
      console.error(`Failed to ${action} MQTT:`, error);
    } finally {
      setMqttLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Browse Devices',
      description: 'View and manage IO-Link devices',
      icon: Package,
      color: 'from-primary to-brand-green',
      action: () => onNavigate?.('devices'),
      count: overview?.devices?.iodd || 0
    },
    {
      title: 'Browse EDS Files',
      description: 'Manage EtherNet/IP device files',
      icon: FileText,
      color: 'from-secondary to-accent',
      action: () => onNavigate?.('eds-files'),
      count: overview?.devices?.eds || 0
    },
    {
      title: 'Search',
      description: 'Find devices and parameters',
      icon: Search,
      color: 'from-warning to-error',
      action: () => onNavigate?.('search')
    },
    {
      title: 'Compare',
      description: 'Compare device specifications',
      icon: GitBranch,
      color: 'from-success to-brand-green',
      action: () => onNavigate?.('compare')
    }
  ];

  const resources = [
    {
      title: 'Documentation',
      icon: BookOpen,
      items: [
        { label: 'README', onClick: () => onNavigate('docs'), internal: true },
        { label: 'API Docs (Swagger)', href: `${API_BASE}/docs`, external: true },
        { label: 'Changelog', href: '/docs/reports/CHANGELOG.md', external: true },
        { label: 'Contributing Guide', href: '/docs/guides/CONTRIBUTING.md', external: true }
      ]
    },
    {
      title: 'Development',
      icon: Terminal,
      items: [
        { label: 'GitHub Repository', href: 'https://github.com/ME-Catalyst/greenstack' },
        { label: 'Report Issues', href: 'https://github.com/ME-Catalyst/greenstack/issues' },
        { label: 'View Source', href: 'https://github.com/ME-Catalyst/greenstack/tree/main' },
        { label: 'API Docs (Swagger)', href: `${API_BASE}/docs`, external: true }
      ]
    },
    {
      title: 'Community',
      icon: Github,
      items: [
        { label: 'GitHub Repository', href: 'https://github.com/ME-Catalyst/greenstack' },
        { label: 'Report Issues', href: 'https://github.com/ME-Catalyst/greenstack/issues' },
        { label: 'Archived Docs', href: '/docs/archive', external: true },
        { label: 'License', href: 'https://github.com/ME-Catalyst/greenstack/blob/main/LICENSE' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-br from-brand-green/10 via-primary/10 to-secondary/10 border-brand-green/30">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-brand-green/10 rounded-xl border border-brand-green/20">
              <Rocket className="w-12 h-12 text-brand-green" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome to Greenstack
              </h2>
              <p className="text-foreground mb-4">
                A comprehensive tool for managing IO-Link Device Descriptions and EtherNet/IP Electronic Data Sheets.
                Explore devices, search parameters, compare specifications, and manage your industrial automation data.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="w-4 h-4 text-primary" />
                  <span className="text-primary font-semibold">{overview?.devices?.total || 0}</span> Total Devices
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Settings className="w-4 h-4 text-secondary" />
                  <span className="text-secondary font-semibold">{overview?.parameters?.total?.toLocaleString() || 0}</span> Parameters
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HardDrive className="w-4 h-4 text-success" />
                  <span className="text-success font-semibold">{overview?.storage?.total_size_mb || 0} MB</span> Storage
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-warning" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={action.action}
                className="group text-left p-6 bg-card border border-border rounded-lg hover:border-brand-green hover:shadow-lg hover:shadow-brand-green/10 transition-all"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} mb-4`}>
                  <Icon className="w-6 h-6 text-foreground" />
                </div>
                <h4 className="font-semibold text-foreground mb-1 group-hover:text-brand-green transition-colors">
                  {action.title}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
                {action.count !== undefined && (
                  <div className="mt-3">
                    <Badge className="bg-secondary text-foreground border-border">
                      {action.count} items
                    </Badge>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resources */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-warning" />
          Resources & Documentation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resources.map((section, idx) => {
            const Icon = section.icon;
            return (
              <Card key={idx} className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <Icon className="w-5 h-5 text-brand-green" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.items.map((item, itemIdx) => {
                      if (item.internal && item.onClick) {
                        return (
                          <button
                            key={itemIdx}
                            onClick={item.onClick}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-green transition-colors group w-full text-left"
                          >
                            <Home className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span>{item.label}</span>
                          </button>
                        );
                      }
                      return (
                        <a
                          key={itemIdx}
                          href={item.href}
                          target={item.external ? '_self' : '_blank'}
                          rel={item.external ? undefined : 'noopener noreferrer'}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-green transition-colors group"
                        >
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span>{item.label}</span>
                        </a>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* IoT Platform Services */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Server className="w-5 h-5 text-brand-green" />
          IoT Platform Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* MQTT Broker */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {mqttStatus?.connected ? (
                    <Wifi className="w-4 h-4 text-success" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-error" />
                  )}
                  MQTT Broker
                </span>
                <Badge className={mqttStatus?.connected ? 'bg-success/20 text-success border-success/30' : 'bg-error/20 text-error border-error/30'}>
                  {mqttStatus?.connected ? 'Online' : 'Offline'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Message broker for device telemetry & communication
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Port:</span>
                  <span className="text-foreground">{mqttStatus?.mqtt_port || 1883}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Host:</span>
                  <span className="text-foreground">{mqttStatus?.broker || 'localhost'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {!mqttStatus?.connected ? (
                  <Button
                    size="sm"
                    onClick={() => handleMqttAction('connect')}
                    disabled={mqttLoading}
                    className="flex-1 bg-success hover:bg-success/80"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Connect
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleMqttAction('restart')}
                      disabled={mqttLoading}
                      className="flex-1"
                    >
                      <RotateCw className="w-3 h-3 mr-1" />
                      Restart
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleMqttAction('disconnect')}
                      disabled={mqttLoading}
                      className="flex-1"
                    >
                      <StopCircle className="w-3 h-3 mr-1" />
                      Stop
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Grafana */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-warning" />
                Grafana
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Visualization & dashboarding platform for device telemetry
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Port:</span>
                  <span className="text-foreground">3001</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Default:</span>
                  <span className="text-foreground">admin/admin123</span>
                </div>
              </div>
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button size="sm" className="w-full bg-warning hover:bg-warning/80">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open Grafana
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* Node-RED */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-error" />
                Node-RED
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Flow-based automation & data processing
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Port:</span>
                  <span className="text-foreground">1880</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Flows:</span>
                  <span className="text-foreground">Pre-loaded</span>
                </div>
              </div>
              <a
                href="http://localhost:1880"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button size="sm" className="w-full bg-brand-green hover:bg-brand-green/80">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open Node-RED
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* InfluxDB */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                InfluxDB
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Time-series database for device telemetry
              </p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Port:</span>
                  <span className="text-foreground">8086</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Bucket:</span>
                  <span className="text-foreground">device-telemetry</span>
                </div>
              </div>
              <a
                href="http://localhost:8086"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button size="sm" className="w-full bg-primary hover:bg-primary/80">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open InfluxDB
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status Summary */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-success" />
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Database Health</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-lg font-semibold text-foreground">Healthy</span>
                  </div>
                </div>
                <Database className="w-8 h-8 text-success/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Open Tickets</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-foreground">
                      {overview?.tickets?.open || 0}
                    </span>
                  </div>
                </div>
                <Bug className="w-8 h-8 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Recent Imports (7d)</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-foreground">
                      {(overview?.recent_activity?.iodd_imports || 0) + (overview?.recent_activity?.eds_imports || 0)}
                    </span>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-secondary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Diagnostic Issues</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-foreground">
                      {overview?.diagnostics?.total_issues || 0}
                    </span>
                  </div>
                </div>
                <AlertTriangle className="w-8 h-8 text-warning/30" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

/**
 * Database Tab
 */
const DatabaseTab = ({ overview, dbHealth, handleVacuum, handleCleanFKViolations, handleBackup, handleDownloadBackup, handleDeleteIODD, handleDeleteEDS, handleDeleteTickets, handleDeleteTemp, handleDeleteAll }) => (
  <div className="space-y-6">
      {/* Health Status */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-success" />
            Database Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Overall Health Status */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${
              dbHealth?.health_status === 'healthy' ? 'bg-success/10 border-success/50' :
              dbHealth?.health_status === 'needs_attention' ? 'bg-primary/10 border-primary/50' :
              dbHealth?.health_status === 'warning' ? 'bg-warning/10 border-warning/50' :
              'bg-error/10 border-error/50'
            }`}>
              <div className="flex items-center gap-3">
                {dbHealth?.health_status === 'healthy' ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : dbHealth?.health_status === 'needs_attention' ? (
                  <Info className="w-6 h-6 text-primary" />
                ) : dbHealth?.health_status === 'warning' ? (
                  <AlertTriangle className="w-6 h-6 text-warning" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-error" />
                )}
                <div>
                  <p className={`font-medium ${
                    dbHealth?.health_status === 'healthy' ? 'text-success' :
                    dbHealth?.health_status === 'needs_attention' ? 'text-primary' :
                    dbHealth?.health_status === 'warning' ? 'text-warning' :
                    'text-error'
                  }`}>
                    {dbHealth?.health_status === 'healthy' ? 'Healthy' :
                     dbHealth?.health_status === 'needs_attention' ? 'Needs Attention' :
                     dbHealth?.health_status === 'warning' ? 'Warning' :
                     'Critical Issues Detected'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Integrity: {dbHealth?.integrity} • FK Violations: {dbHealth?.foreign_key_violations}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tables</p>
                <p className="text-lg font-semibold text-foreground">{dbHealth?.tables?.length || 0}</p>
              </div>
            </div>

            {/* Database Issues */}
            {dbHealth?.issues && dbHealth.issues.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Detected Issues ({dbHealth.issues.length})
                </h4>
                {dbHealth.issues.map((issue, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${
                    issue.severity === 'critical' ? 'bg-error/10 border-error/50' :
                    issue.severity === 'high' ? 'bg-warning/10 border-warning/50' :
                    issue.severity === 'medium' ? 'bg-warning/10 border-warning/50' :
                    'bg-primary/10 border-primary/50'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={
                            issue.severity === 'critical' ? 'bg-error/20 text-error border-error/50' :
                            issue.severity === 'high' ? 'bg-warning/20 text-warning border-warning/50' :
                            issue.severity === 'medium' ? 'bg-warning/20 text-warning border-warning/50' :
                            'bg-primary/20 text-primary border-primary/50'
                          }>
                            {issue.severity?.toUpperCase()}
                          </Badge>
                          <span className="font-semibold text-foreground">{issue.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{issue.description}</p>
                      </div>
                      {issue.action && (
                        <Button
                          size="sm"
                          onClick={issue.action === 'backup' ? handleBackup :
                                   issue.action === 'vacuum' ? handleVacuum :
                                   issue.action === 'clean_fk' ? handleCleanFKViolations :
                                   null}
                          className={
                            issue.severity === 'critical' ? 'bg-error hover:bg-error/80' :
                            issue.severity === 'high' ? 'bg-warning hover:bg-warning/80' :
                            'bg-primary hover:bg-primary/80'
                          }
                        >
                          {issue.action_label || 'Fix Now'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {dbHealth?.recommendations && dbHealth.recommendations.length > 0 && (
              <div className="p-4 bg-primary/10 border border-primary/50 rounded-lg">
                <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Recommendations
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {dbHealth.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Database Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-4 h-4 text-brand-green" />
                  <span className="text-sm text-muted-foreground">Database Size</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{overview?.storage?.database_size_mb} MB</p>
              </div>

              <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-secondary" />
                  <span className="text-sm text-muted-foreground">Indexes</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{dbHealth?.index_count || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Statistics */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-green" />
            Table Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {dbHealth?.tables?.map((table, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded border border-border/50">
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground font-mono text-sm">{table.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {table.row_count?.toLocaleString()} rows
                  </span>
                  <span className="text-muted-foreground">
                    {table.index_count} indexes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning" />
            Database Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleVacuum}
              className="bg-primary hover:bg-primary/80 text-foreground h-auto py-4 flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4" />
                <span className="font-semibold">Optimize (VACUUM)</span>
              </div>
              <p className="text-xs opacity-80 text-left">
                Reclaim unused space and improve performance
              </p>
            </Button>

            <Button
              onClick={handleBackup}
              className="bg-success hover:bg-success/80 text-foreground h-auto py-4 flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4" />
                <span className="font-semibold">Create Backup</span>
              </div>
              <p className="text-xs opacity-80 text-left">
                Save backup to server&rsquo;s backup directory
              </p>
            </Button>

            <Button
              onClick={handleDownloadBackup}
              className="bg-secondary hover:bg-secondary/80 text-foreground h-auto py-4 flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-1">
                <Download className="w-4 h-4" />
                <span className="font-semibold">Download Backup</span>
              </div>
              <p className="text-xs opacity-80 text-left">
                Download database backup to your computer
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-error/10 border-error/50">
        <CardHeader>
          <CardTitle className="text-error flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            ⚠️ Dangerous operations that can result in permanent data loss. Use with extreme caution.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={handleDeleteIODD}
              variant="destructive"
              className="h-auto py-4 flex-col items-start bg-error hover:bg-error/90 border-2 border-error shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-5 h-5" />
                <span className="font-bold text-base">Delete All IODD</span>
              </div>
              <p className="text-xs opacity-90 text-left font-medium">
                Permanently remove all IODD devices and parameters
              </p>
            </Button>

            <Button
              onClick={handleDeleteEDS}
              variant="destructive"
              className="h-auto py-4 flex-col items-start bg-error hover:bg-error/90 border-2 border-error shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-5 h-5" />
                <span className="font-bold text-base">Delete All EDS</span>
              </div>
              <p className="text-xs opacity-90 text-left font-medium">
                Permanently remove all EDS files and parameters
              </p>
            </Button>

            <Button
              onClick={handleDeleteTickets}
              variant="destructive"
              className="h-auto py-4 flex-col items-start bg-error hover:bg-error/90 border-2 border-error shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-5 h-5" />
                <span className="font-bold text-base">Delete All Tickets</span>
              </div>
              <p className="text-xs opacity-90 text-left font-medium">
                Permanently remove all tickets and attachments
              </p>
            </Button>

            <Button
              onClick={handleDeleteTemp}
              variant="destructive"
              className="h-auto py-4 flex-col items-start bg-warning hover:bg-warning/90 border-2 border-warning shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-5 h-5" />
                <span className="font-bold text-base">Delete Temp Data</span>
              </div>
              <p className="text-xs opacity-90 text-left font-medium">
                Clean temporary files and cached data (safe operation)
              </p>
            </Button>

            <Button
              onClick={handleDeleteAll}
              variant="destructive"
              className="h-auto py-4 flex-col items-start bg-error hover:bg-error/80 border-4 border-error shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110 ring-2 ring-error ring-offset-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-6 h-6" />
                <span className="font-extrabold text-lg">Delete ALL Data</span>
              </div>
              <p className="text-xs opacity-90 text-left font-bold">
                EXTREME: Remove everything from the database
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
  </div>
);

const getQualityColor = (score = 0) => {
  if (score >= 90) return 'text-success';
  if (score >= 70) return 'text-warning';
  return 'text-error';
};

const getQualityBgColor = (score = 0) => {
  if (score >= 90) return 'bg-success/20 border-success/50';
  if (score >= 70) return 'bg-warning/20 border-warning/50';
  return 'bg-error/20 border-error/50';
};

const DiagnosticsProgressBar = ({ value = 0, label }) => {
  const normalized = Number.isFinite(value) ? value : Number(value) || 0;
  const clamped = Math.max(0, Math.min(100, normalized));
  const tone = clamped >= 90 ? 'success' : clamped >= 70 ? 'warning' : 'error';
  const textClass = tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-error';
  const barClass = tone === 'success' ? 'bg-success' : tone === 'warning' ? 'bg-warning' : 'bg-error';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${textClass}`}>
          {clamped.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-secondary/30 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${barClass}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

const VendorDistribution = ({ label, items = [] }) => {
  const topCount = items[0]?.count || 0;
  return (
    <div className="p-4 rounded-lg border border-border bg-secondary/20">
      <h4 className="text-sm font-semibold text-muted-foreground mb-3">{label}</h4>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No imports yet</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map((vendor, idx) => {
            const ratio = topCount ? (vendor.count / topCount) * 100 : 0;
            const width = ratio === 0 ? 0 : Math.min(100, Math.max(5, ratio));
            return (
              <div key={`${label}-${vendor.vendor || 'unknown'}-${idx}`} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium">
                    {idx + 1}. {vendor.vendor || 'Unknown Vendor'}
                  </span>
                  <Badge className="bg-muted text-foreground px-2 py-0 h-auto">
                    {vendor.count}
                  </Badge>
                </div>
                <div className="h-1.5 bg-secondary/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-green/80"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Diagnostics Tab
 */
const DiagnosticsTab = ({ edsDiagnostics, ioddDiagnostics, vendorStats }) => (
  <div className="space-y-6">
      {/* Quality Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* EDS Quality Score */}
        <Card className={`bg-card border ${getQualityBgColor(edsDiagnostics?.quality_score || 0)}`}>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-warning" />
                EDS Parsing Quality
              </span>
              <span className={`text-3xl font-bold ${getQualityColor(edsDiagnostics?.quality_score || 0)}`}>
                {edsDiagnostics?.quality_score || 0}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-2xl font-bold text-success">{edsDiagnostics?.total_files || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Files</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-2xl font-bold text-error">{edsDiagnostics?.total_files_with_issues || 0}</p>
                  <p className="text-xs text-muted-foreground">With Issues</p>
                </div>
              </div>
              {edsDiagnostics?.completeness && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Data Completeness</h4>
                  <DiagnosticsProgressBar value={edsDiagnostics.completeness.product_name_pct} label="Product Names" />
                  <DiagnosticsProgressBar value={edsDiagnostics.completeness.vendor_name_pct} label="Vendor Names" />
                  <DiagnosticsProgressBar value={edsDiagnostics.completeness.description_pct} label="Descriptions" />
                  <DiagnosticsProgressBar value={edsDiagnostics.completeness.icon_pct} label="Icons" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* IODD Quality Score */}
        <Card className={`bg-card border ${getQualityBgColor(ioddDiagnostics?.quality_score || 0)}`}>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                IODD Parsing Quality
              </span>
              <span className={`text-3xl font-bold ${getQualityColor(ioddDiagnostics?.quality_score || 0)}`}>
                {ioddDiagnostics?.quality_score || 0}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-2xl font-bold text-success">{ioddDiagnostics?.total_files || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Files</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-2xl font-bold text-error">{ioddDiagnostics?.total_files_with_issues || 0}</p>
                  <p className="text-xs text-muted-foreground">With Issues</p>
                </div>
              </div>
              {ioddDiagnostics?.completeness && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Data Completeness</h4>
                  <DiagnosticsProgressBar value={ioddDiagnostics.completeness.product_name_pct} label="Product Names" />
                  <DiagnosticsProgressBar value={ioddDiagnostics.completeness.manufacturer_pct} label="Manufacturers" />
                  <DiagnosticsProgressBar value={ioddDiagnostics.completeness.vendor_id_pct} label="Vendor IDs" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PQA (Parser Quality Assurance) Stats Section */}
      <Card className="bg-gradient-to-br from-brand-green/5 to-purple-500/5 border-brand-green/30">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-green" />
            Parser Quality Assurance (PQA) Metrics
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Real-time quality metrics from forensic reconstruction and diff analysis of parsed files
          </p>
        </CardHeader>
        <CardContent>
          <PQAMetricsDisplay API_BASE={window.API_BASE || 'http://localhost:8000'} />
        </CardContent>
      </Card>

      {/* EDS Diagnostic Details */}
      {edsDiagnostics?.by_severity?.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              EDS Diagnostic Issues by Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {edsDiagnostics.by_severity.map((item, idx) => {
                const colors = {
                  INFO: { text: 'text-primary', bg: 'bg-primary/20' },
                  WARN: { text: 'text-warning', bg: 'bg-warning/20' },
                  ERROR: { text: 'text-warning', bg: 'bg-warning/20' },
                  FATAL: { text: 'text-error', bg: 'bg-error/20' }
                };
                return (
                  <div key={idx} className={`p-4 ${colors[item.severity].bg} rounded-lg border border-border`}>
                    <p className="text-sm text-muted-foreground mb-1">{item.severity}</p>
                    <p className={`text-3xl font-bold ${colors[item.severity].text}`}>
                      {item.count}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files with Issues */}
      {edsDiagnostics?.files_with_issues?.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-error" />
              EDS Files with Parsing Issues ({edsDiagnostics.files_with_issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {edsDiagnostics.files_with_issues.map((file, idx) => (
                <div key={idx} className="p-3 bg-secondary/30 rounded border border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{file.product_name}</p>
                      <p className="text-sm text-muted-foreground">{file.vendor_name}</p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      {file.fatal > 0 && (
                        <Badge className="bg-error/20 text-error border-error/50">
                          {file.fatal} fatal
                        </Badge>
                      )}
                      {file.errors > 0 && (
                        <Badge className="bg-warning/20 text-warning border-warning/50">
                          {file.errors} errors
                        </Badge>
                      )}
                      {file.warnings > 0 && (
                        <Badge className="bg-warning/20 text-warning border-warning/50">
                          {file.warnings} warnings
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* IODD Files with Issues */}
      {ioddDiagnostics?.files_with_issues?.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-error" />
              IODD Files with Issues ({ioddDiagnostics.files_with_issues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {ioddDiagnostics.files_with_issues.map((file, idx) => (
                <div key={idx} className="p-3 bg-secondary/30 rounded border border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-foreground font-medium">{file.product_name}</p>
                      <p className="text-sm text-muted-foreground">{file.manufacturer}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 text-xs">
                      {file.issues.map((issue, i) => (
                        <Badge key={i} className="bg-warning/20 text-warning border-warning/50">
                          {issue}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Common Diagnostic Codes */}
      {edsDiagnostics?.common_codes?.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Most Common EDS Diagnostic Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {edsDiagnostics.common_codes.map((code, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded border border-border/50">
                  <div className="flex items-center gap-3">
                    <Badge className={
                      code.severity === 'FATAL' ? 'bg-error/20 text-error border-error/50' :
                      code.severity === 'ERROR' ? 'bg-warning/20 text-warning border-warning/50' :
                      code.severity === 'WARN' ? 'bg-warning/20 text-warning border-warning/50' :
                      'bg-primary/20 text-primary border-primary/50'
                    }>
                      {code.severity}
                    </Badge>
                    <span className="text-foreground font-mono text-sm">{code.code}</span>
                  </div>
                  <span className="text-muted-foreground">{code.count} occurrences</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {(vendorStats?.iodd?.length || vendorStats?.eds?.length) > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-green" />
              Vendor Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VendorDistribution label="IO-Link Devices" items={vendorStats?.iodd || []} />
              <VendorDistribution label="EDS Files" items={vendorStats?.eds || []} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message when no issues */}
      {edsDiagnostics?.total_files_with_issues === 0 && ioddDiagnostics?.total_files_with_issues === 0 && (
        <Card className="bg-success/10 border-success/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-success">
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <p className="font-semibold">Excellent Parsing Quality!</p>
                <p className="text-sm text-muted-foreground">
                  All {(edsDiagnostics?.total_files || 0) + (ioddDiagnostics?.total_files || 0)} files parsed successfully with no issues detected.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
  </div>
);

/**
 * System Tab
 */
const SystemTab = ({ systemInfo, overview }) => (
  <div className="space-y-6">
    {/* Application Info */}
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Cpu className="w-5 h-5 text-brand-green" />
          Application Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Name</p>
            <p className="text-foreground font-medium">{systemInfo?.application?.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Version</p>
            <p className="text-foreground font-medium">{systemInfo?.application?.version}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Database Path</p>
            <p className="text-foreground font-mono text-sm">{systemInfo?.application?.database_path}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Database Status</p>
            <div className="flex items-center gap-2">
              {systemInfo?.application?.database_exists ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-success">Connected</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-error" />
                  <span className="text-error">Not Found</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Platform Info */}
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Server className="w-5 h-5 text-secondary" />
          Platform Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Operating System</p>
            <p className="text-foreground font-medium">{systemInfo?.platform?.system} {systemInfo?.platform?.release}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Architecture</p>
            <p className="text-foreground font-medium">{systemInfo?.platform?.machine}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground mb-1">Processor</p>
            <p className="text-foreground font-medium text-sm">{systemInfo?.platform?.processor}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Python Environment */}
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Terminal className="w-5 h-5 text-success" />
          Python Environment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Version</p>
            <p className="text-foreground font-mono text-sm">{systemInfo?.python?.version?.split('\n')[0]}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Implementation</p>
            <p className="text-foreground font-medium">{systemInfo?.python?.implementation}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Compiler</p>
            <p className="text-foreground font-mono text-sm">{systemInfo?.python?.compiler}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Storage Info */}
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-warning" />
          Storage Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-secondary/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Database</p>
            <p className="text-2xl font-bold text-foreground">{overview?.storage?.database_size_mb} MB</p>
          </div>
          <div className="p-4 bg-secondary/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Attachments</p>
            <p className="text-2xl font-bold text-foreground">{overview?.storage?.attachments_size_mb} MB</p>
            <p className="text-xs text-muted-foreground mt-1">{overview?.storage?.attachment_count} files</p>
          </div>
          <div className="p-4 bg-secondary/30 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground mb-1">Total</p>
            <p className="text-2xl font-bold text-brand-green">{overview?.storage?.total_size_mb} MB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

/**
 * PQA Metrics Display Component
 * Shows detailed Parser Quality Assurance statistics
 */
const PQAMetricsDisplay = ({ API_BASE }) => {
  const [fileTypeFilter, setFileTypeFilter] = useState('ALL'); // 'ALL', 'IODD', 'EDS'
  const [pqaData, setPqaData] = useState(null);
  const [ioddData, setIoddData] = useState(null);
  const [edsData, setEdsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPQAData();
  }, [fileTypeFilter]);

  const fetchPQAData = async () => {
    try {
      setLoading(true);

      if (fileTypeFilter === 'ALL') {
        // Fetch all data and both file types separately
        const [allResponse, ioddResponse, edsResponse] = await Promise.all([
          axios.get(`${API_BASE}/api/pqa/dashboard/summary`),
          axios.get(`${API_BASE}/api/pqa/dashboard/summary?file_type=IODD`).catch(() => null),
          axios.get(`${API_BASE}/api/pqa/dashboard/summary?file_type=EDS`).catch(() => null)
        ]);
        setPqaData(allResponse.data);
        setIoddData(ioddResponse?.data || null);
        setEdsData(edsResponse?.data || null);
      } else {
        // Fetch filtered data
        const response = await axios.get(`${API_BASE}/api/pqa/dashboard/summary?file_type=${fileTypeFilter}`);
        setPqaData(response.data);
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch PQA data:', err);
      setError('PQA system not initialized or no analyses run yet');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading PQA metrics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-warning mx-auto mb-3" />
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Run PQA analysis from the PQA Console tab below to see metrics
          </p>
        </div>
      </div>
    );
  }

  const passRate = pqaData.total_analyses > 0
    ? ((pqaData.passed_analyses / pqaData.total_analyses) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* File Type Filter Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setFileTypeFilter('ALL')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            fileTypeFilter === 'ALL'
              ? 'bg-brand-green text-white font-semibold'
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
          }`}
        >
          All Files
        </button>
        <button
          onClick={() => setFileTypeFilter('IODD')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            fileTypeFilter === 'IODD'
              ? 'bg-brand-green text-white font-semibold'
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
          }`}
        >
          IODD (XML)
        </button>
        <button
          onClick={() => setFileTypeFilter('EDS')}
          className={`px-4 py-2 rounded-t-lg transition-colors ${
            fileTypeFilter === 'EDS'
              ? 'bg-brand-green text-white font-semibold'
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
          }`}
        >
          EDS (INI)
        </button>
      </div>

      {/* Comparison View for 'ALL' tab */}
      {fileTypeFilter === 'ALL' && ioddData && edsData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* IODD Summary */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-brand-green" />
              IODD Files (XML)
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Analyses</span>
                <span className="text-xl font-bold text-foreground">{ioddData.total_analyses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <span className="text-xl font-bold text-brand-green">{ioddData.average_score.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pass Rate</span>
                <span className="text-lg font-semibold text-success">
                  {ioddData.total_analyses > 0 ? ((ioddData.passed_analyses / ioddData.total_analyses) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Critical Failures</span>
                <span className="text-lg font-semibold text-error">{ioddData.critical_failures}</span>
              </div>
            </div>
          </div>

          {/* EDS Summary */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileCode className="w-5 h-5 text-cyan-400" />
              EDS Files (INI)
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Analyses</span>
                <span className="text-xl font-bold text-foreground">{edsData.total_analyses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <span className="text-xl font-bold text-cyan-400">{edsData.average_score.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pass Rate</span>
                <span className="text-lg font-semibold text-success">
                  {edsData.total_analyses > 0 ? ((edsData.passed_analyses / edsData.total_analyses) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Critical Failures</span>
                <span className="text-lg font-semibold text-error">{edsData.critical_failures}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-brand-green/10 to-brand-green/5 rounded-lg p-4 border border-brand-green/30">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-brand-green" />
            <TrendingUp className="w-4 h-4 text-brand-green/50" />
          </div>
          <p className="text-3xl font-bold text-brand-green">{pqaData.total_analyses}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Analyses</p>
        </div>

        <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-lg p-4 border border-success/30">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-xs font-semibold text-success">{passRate}%</span>
          </div>
          <p className="text-3xl font-bold text-success">{pqaData.passed_analyses}</p>
          <p className="text-sm text-muted-foreground mt-1">Passed Threshold</p>
        </div>

        <div className="bg-gradient-to-br from-error/10 to-error/5 rounded-lg p-4 border border-error/30">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-error" />
            {pqaData.critical_failures > 0 && (
              <AlertTriangle className="w-4 h-4 text-error animate-pulse" />
            )}
          </div>
          <p className="text-3xl font-bold text-error">{pqaData.failed_analyses}</p>
          <p className="text-sm text-muted-foreground mt-1">Failed Analyses</p>
        </div>

        <div className="bg-gradient-to-br from-warning/10 to-warning/5 rounded-lg p-4 border border-warning/30">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <p className="text-3xl font-bold text-warning">{pqaData.critical_failures}</p>
          <p className="text-sm text-muted-foreground mt-1">Critical Data Loss</p>
        </div>
      </div>

      {/* Average Score Display */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-foreground">Average Quality Score</h4>
            <p className="text-sm text-muted-foreground">Across {pqaData.devices_analyzed} analyzed devices</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold bg-gradient-to-r from-brand-green to-cyan-400 bg-clip-text text-transparent">
              {pqaData.average_score.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div className="relative w-full h-4 bg-secondary rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-500 ${
              pqaData.average_score >= 95 ? 'bg-gradient-to-r from-success to-brand-green' :
              pqaData.average_score >= 80 ? 'bg-gradient-to-r from-brand-green to-cyan-400' :
              pqaData.average_score >= 60 ? 'bg-gradient-to-r from-warning to-orange-400' :
              'bg-gradient-to-r from-error to-red-600'
            }`}
            style={{ width: `${pqaData.average_score}%` }}
          />
        </div>

        {/* Score Legend */}
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>0%</span>
          <span>Poor</span>
          <span>Fair</span>
          <span>Good</span>
          <span>Excellent</span>
          <span>100%</span>
        </div>
      </div>

      {/* Recent Analyses */}
      {pqaData.recent_analyses && pqaData.recent_analyses.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Recent Analyses</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pqaData.recent_analyses.slice(0, 10).map((analysis, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/50 hover:border-brand-green/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${analysis.passed ? 'bg-success' : 'bg-error'}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {analysis.file_type} Device #{analysis.device_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(analysis.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    analysis.overall_score >= 95 ? 'text-success' :
                    analysis.overall_score >= 80 ? 'text-brand-green' :
                    analysis.overall_score >= 60 ? 'text-warning' :
                    'text-error'
                  }`}>
                    {analysis.overall_score.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">About PQA Metrics</p>
            <p className="text-xs text-muted-foreground">
              PQA (Parser Quality Assurance) uses forensic reconstruction to rebuild files from database content,
              then performs detailed diff analysis against originals. The system now supports separate analysis workflows:
              <strong className="text-foreground"> IODD files</strong> use XML-based DiffAnalyzer,
              and <strong className="text-foreground"> EDS files</strong> use INI-format EDSDiffAnalyzer.
              Use the tabs above to view metrics for each file type separately or combined.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConsole;
