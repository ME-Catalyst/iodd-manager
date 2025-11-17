import React, { useState, useEffect } from 'react';
import {
  Settings, Database, HardDrive, Activity, AlertTriangle, CheckCircle,
  Download, Trash2, BarChart3, Server, Cpu, Clock, Package, FileText,
  RefreshCw, Shield, Zap, TrendingUp, Users, Calendar, Info, BookOpen,
  ExternalLink, Home, Rocket, Terminal, Github, Bug, Eye, Search, GitBranch,
  Wifi, WifiOff, Play, StopCircle, RotateCw
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { Button } from './ui';
import { Badge } from './ui';
import TicketsPage from './TicketsPage';

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
  const [readme, setReadme] = useState('');

  useEffect(() => {
    loadData();
    loadReadme();
  }, []);

  const loadData = async () => {
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
  };

  const loadReadme = async () => {
    try {
      const response = await fetch('/README.md');
      if (response.ok) {
        const text = await response.text();
        setReadme(text);
      }
    } catch (error) {
      console.error('Failed to load README:', error);
    }
  };

  const handleVacuum = async () => {
    if (!confirm('Vacuum database? This will optimize storage but may take a few moments.')) return;

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
    if (!confirm('⚠️ WARNING: This will delete ALL IODD devices and parameters!\n\nThis action cannot be undone. Are you absolutely sure?')) return;

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
    if (!confirm('⚠️ WARNING: This will delete ALL EDS files and parameters!\n\nThis action cannot be undone. Are you absolutely sure?')) return;

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
    if (!confirm('⚠️ WARNING: This will delete ALL tickets and attachments!\n\nThis action cannot be undone. Are you absolutely sure?')) return;

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
    const firstConfirm = confirm('⚠️ DANGER: This will delete ALL data from the database!\n\nThis includes:\n- All IODD devices\n- All EDS files\n- All tickets\n- All parameters\n\nThis action cannot be undone. Continue?');
    if (!firstConfirm) return;

    const secondConfirm = confirm('⚠️ FINAL WARNING: You are about to permanently delete everything!\n\nType "DELETE" in the next prompt to confirm.');
    if (!secondConfirm) return;

    const userInput = prompt('Type DELETE (in capital letters) to confirm:');
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

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
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
            <Settings className="w-8 h-8 text-cyan-500" />
            Admin Console
          </h1>
          <p className="text-muted-foreground mt-1">
            System management, monitoring, and resources
          </p>
        </div>
        <Button
          onClick={loadData}
          className="bg-secondary hover:bg-muted text-foreground"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { id: 'hub', label: 'Hub', icon: Home },
            { id: 'tickets', label: 'Tickets', icon: Bug },
            { id: 'database', label: 'Database', icon: Database },
            { id: 'diagnostics', label: 'Diagnostics', icon: Activity },
            { id: 'system', label: 'System', icon: Server }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
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
        <HubTab overview={overview} onNavigate={onNavigate} />
      )}

      {activeTab === 'tickets' && (
        <TicketsPage API_BASE={API_BASE} toast={toast} />
      )}

      {activeTab === 'database' && (
        <DatabaseTab
          overview={overview}
          dbHealth={dbHealth}
          handleVacuum={handleVacuum}
          handleBackup={handleBackup}
          handleDownloadBackup={handleDownloadBackup}
          handleDeleteIODD={handleDeleteIODD}
          handleDeleteEDS={handleDeleteEDS}
          handleDeleteTickets={handleDeleteTickets}
          handleDeleteAll={handleDeleteAll}
          toast={toast}
        />
      )}

      {activeTab === 'diagnostics' && (
        <DiagnosticsTab
          edsDiagnostics={edsDiagnostics}
          ioddDiagnostics={ioddDiagnostics}
          vendorStats={vendorStats}
        />
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
const HubTab = ({ overview, onNavigate }) => {
  const [mqttStatus, setMqttStatus] = useState(null);
  const [mqttLoading, setMqttLoading] = useState(false);

  useEffect(() => {
    fetchMqttStatus();
  }, []);

  const fetchMqttStatus = async () => {
    try {
      const response = await axios.get(`/api/mqtt/status`);
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
      color: 'from-blue-600 to-cyan-600',
      action: () => onNavigate?.('devices'),
      count: overview?.devices?.iodd || 0
    },
    {
      title: 'Browse EDS Files',
      description: 'Manage EtherNet/IP device files',
      icon: FileText,
      color: 'from-purple-600 to-pink-600',
      action: () => onNavigate?.('eds-files'),
      count: overview?.devices?.eds || 0
    },
    {
      title: 'Search',
      description: 'Find devices and parameters',
      icon: Search,
      color: 'from-orange-600 to-red-600',
      action: () => onNavigate?.('search')
    },
    {
      title: 'Compare',
      description: 'Compare device specifications',
      icon: GitBranch,
      color: 'from-green-600 to-emerald-600',
      action: () => onNavigate?.('compare')
    }
  ];

  const resources = [
    {
      title: 'Documentation',
      icon: BookOpen,
      items: [
        { label: 'User Manual', href: 'https://github.com/ME-Catalyst/greenstack/blob/main/docs/user/USER_MANUAL.md' },
        { label: 'API Reference', href: 'https://github.com/ME-Catalyst/greenstack/blob/main/docs/developer/API_SPECIFICATION.md' },
        { label: 'Configuration Guide', href: 'https://github.com/ME-Catalyst/greenstack/blob/main/docs/user/CONFIGURATION.md' },
        { label: 'Troubleshooting', href: 'https://github.com/ME-Catalyst/greenstack/blob/main/docs/troubleshooting/TROUBLESHOOTING.md' }
      ]
    },
    {
      title: 'Development',
      icon: Terminal,
      items: [
        { label: 'Architecture', href: 'https://github.com/ME-Catalyst/greenstack/blob/main/docs/architecture/ARCHITECTURE.md' },
        { label: 'Developer Reference', href: 'https://github.com/ME-Catalyst/greenstack/blob/main/docs/developer/DEVELOPER_REFERENCE.md' },
        { label: 'Contributing Guide', href: 'https://github.com/ME-Catalyst/greenstack/blob/main/CONTRIBUTING.md' },
        { label: 'API Docs (Swagger)', href: '/docs', external: true }
      ]
    },
    {
      title: 'Community',
      icon: Github,
      items: [
        { label: 'GitHub Repository', href: 'https://github.com/ME-Catalyst/greenstack' },
        { label: 'Report Issues', href: 'https://github.com/ME-Catalyst/greenstack/issues' },
        { label: 'View Changelog', href: 'https://github.com/ME-Catalyst/greenstack/blob/main/CHANGELOG.md' },
        { label: 'License (MIT)', href: 'https://github.com/ME-Catalyst/greenstack/blob/main/LICENSE.md' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-br from-cyan-900/20 via-blue-900/20 to-purple-900/20 border-cyan-800/50">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
              <Rocket className="w-12 h-12 text-cyan-400" />
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
                  <Package className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-400 font-semibold">{overview?.devices?.total || 0}</span> Total Devices
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-semibold">{overview?.parameters?.total?.toLocaleString() || 0}</span> Parameters
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HardDrive className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-semibold">{overview?.storage?.total_size_mb || 0} MB</span> Storage
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={action.action}
                className="group text-left p-6 bg-card border border-border rounded-lg hover:border-border hover:shadow-lg hover:shadow-cyan-500/10 transition-all"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} mb-4`}>
                  <Icon className="w-6 h-6 text-foreground" />
                </div>
                <h4 className="font-semibold text-foreground mb-1 group-hover:text-cyan-400 transition-colors">
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
          <BookOpen className="w-5 h-5 text-orange-500" />
          Resources & Documentation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resources.map((section, idx) => {
            const Icon = section.icon;
            return (
              <Card key={idx} className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground text-base flex items-center gap-2">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {section.items.map((item, itemIdx) => (
                      <a
                        key={itemIdx}
                        href={item.href}
                        target={item.external ? '_self' : '_blank'}
                        rel={item.external ? undefined : 'noopener noreferrer'}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-400 transition-colors group"
                      >
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span>{item.label}</span>
                      </a>
                    ))}
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
          <Server className="w-5 h-5 text-cyan-500" />
          IoT Platform Services
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* MQTT Broker */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {mqttStatus?.connected ? (
                    <Wifi className="w-4 h-4 text-green-400" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                  )}
                  MQTT Broker
                </span>
                <Badge className={mqttStatus?.connected ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                  {mqttStatus?.connected ? 'Online' : 'Offline'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
                    className="flex-1 bg-green-600 hover:bg-green-500"
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
              <a
                href="http://localhost:1883"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Broker Details
              </a>
            </CardContent>
          </Card>

          {/* Grafana */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-400" />
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
                <Button size="sm" className="w-full bg-orange-600 hover:bg-orange-500">
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
                <Zap className="w-4 h-4 text-red-400" />
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
                <Button size="sm" className="w-full bg-red-600 hover:bg-red-500">
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
                <TrendingUp className="w-4 h-4 text-blue-400" />
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
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500">
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
          <Activity className="w-5 h-5 text-green-500" />
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Database Health</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-lg font-semibold text-foreground">Healthy</span>
                  </div>
                </div>
                <Database className="w-8 h-8 text-green-500/30" />
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
                <Bug className="w-8 h-8 text-blue-500/30" />
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
                <TrendingUp className="w-8 h-8 text-purple-500/30" />
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
                <AlertTriangle className="w-8 h-8 text-orange-500/30" />
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
const DatabaseTab = ({ overview, dbHealth, handleVacuum, handleBackup, handleDownloadBackup, handleDeleteIODD, handleDeleteEDS, handleDeleteTickets, handleDeleteAll, toast }) => {
  return (
    <div className="space-y-6">
      {/* Health Status */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Database Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3">
                {dbHealth?.healthy ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                )}
                <div>
                  <p className="text-foreground font-medium">
                    {dbHealth?.healthy ? 'Healthy' : 'Issues Detected'}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-muted-foreground">Database Size</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{overview?.storage?.database_size_mb} MB</p>
              </div>

              <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-purple-400" />
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
            <BarChart3 className="w-5 h-5 text-cyan-500" />
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
            <Zap className="w-5 h-5 text-yellow-500" />
            Database Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleVacuum}
              className="bg-blue-600 hover:bg-blue-700 text-foreground h-auto py-4 flex-col items-start"
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
              className="bg-green-600 hover:bg-green-700 text-foreground h-auto py-4 flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4" />
                <span className="font-semibold">Create Backup</span>
              </div>
              <p className="text-xs opacity-80 text-left">
                Save backup to server's backup directory
              </p>
            </Button>

            <Button
              onClick={handleDownloadBackup}
              className="bg-purple-600 hover:bg-purple-700 text-foreground h-auto py-4 flex-col items-start"
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
      <Card className="bg-red-950/20 border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
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
              className="h-auto py-4 flex-col items-start bg-red-900/50 hover:bg-red-900/70 border-red-800"
            >
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-4 h-4" />
                <span className="font-semibold">Delete All IODD</span>
              </div>
              <p className="text-xs opacity-80 text-left">
                Permanently remove all IODD devices and parameters
              </p>
            </Button>

            <Button
              onClick={handleDeleteEDS}
              variant="destructive"
              className="h-auto py-4 flex-col items-start bg-red-900/50 hover:bg-red-900/70 border-red-800"
            >
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-4 h-4" />
                <span className="font-semibold">Delete All EDS</span>
              </div>
              <p className="text-xs opacity-80 text-left">
                Permanently remove all EDS files and parameters
              </p>
            </Button>

            <Button
              onClick={handleDeleteTickets}
              variant="destructive"
              className="h-auto py-4 flex-col items-start bg-red-900/50 hover:bg-red-900/70 border-red-800"
            >
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-4 h-4" />
                <span className="font-semibold">Delete All Tickets</span>
              </div>
              <p className="text-xs opacity-80 text-left">
                Permanently remove all tickets and attachments
              </p>
            </Button>

            <Button
              onClick={handleDeleteAll}
              variant="destructive"
              className="h-auto py-4 flex-col items-start bg-red-900 hover:bg-red-800 border-red-700"
            >
              <div className="flex items-center gap-2 mb-1">
                <Trash2 className="w-4 h-4" />
                <span className="font-semibold">Delete ALL Data</span>
              </div>
              <p className="text-xs opacity-80 text-left">
                EXTREME: Remove everything from the database
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Diagnostics Tab
 */
const DiagnosticsTab = ({ edsDiagnostics, ioddDiagnostics, vendorStats }) => {
  const getQualityColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getQualityBgColor = (score) => {
    if (score >= 90) return 'bg-green-500/20 border-green-500/50';
    if (score >= 70) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  const ProgressBar = ({ value, label }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={value >= 90 ? 'text-green-400' : value >= 70 ? 'text-yellow-400' : 'text-red-400'}>
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-secondary/30 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${value >= 90 ? 'bg-green-500' : value >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Quality Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* EDS Quality Score */}
        <Card className={`bg-card border ${getQualityBgColor(edsDiagnostics?.quality_score || 0)}`}>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
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
                  <p className="text-2xl font-bold text-green-400">{edsDiagnostics?.total_files || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Files</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-2xl font-bold text-red-400">{edsDiagnostics?.total_files_with_issues || 0}</p>
                  <p className="text-xs text-muted-foreground">With Issues</p>
                </div>
              </div>
              {edsDiagnostics?.completeness && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Data Completeness</h4>
                  <ProgressBar value={edsDiagnostics.completeness.product_name_pct} label="Product Names" />
                  <ProgressBar value={edsDiagnostics.completeness.vendor_name_pct} label="Vendor Names" />
                  <ProgressBar value={edsDiagnostics.completeness.description_pct} label="Descriptions" />
                  <ProgressBar value={edsDiagnostics.completeness.icon_pct} label="Icons" />
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
                <FileText className="w-5 h-5 text-blue-500" />
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
                  <p className="text-2xl font-bold text-green-400">{ioddDiagnostics?.total_files || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Files</p>
                </div>
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-2xl font-bold text-red-400">{ioddDiagnostics?.total_files_with_issues || 0}</p>
                  <p className="text-xs text-muted-foreground">With Issues</p>
                </div>
              </div>
              {ioddDiagnostics?.completeness && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Data Completeness</h4>
                  <ProgressBar value={ioddDiagnostics.completeness.product_name_pct} label="Product Names" />
                  <ProgressBar value={ioddDiagnostics.completeness.manufacturer_pct} label="Manufacturers" />
                  <ProgressBar value={ioddDiagnostics.completeness.vendor_id_pct} label="Vendor IDs" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EDS Diagnostic Details */}
      {edsDiagnostics?.by_severity?.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              EDS Diagnostic Issues by Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {edsDiagnostics.by_severity.map((item, idx) => {
                const colors = {
                  INFO: { text: 'text-blue-400', bg: 'bg-blue-500/20' },
                  WARN: { text: 'text-yellow-400', bg: 'bg-yellow-500/20' },
                  ERROR: { text: 'text-orange-400', bg: 'bg-orange-500/20' },
                  FATAL: { text: 'text-red-400', bg: 'bg-red-500/20' }
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
              <AlertCircle className="w-5 h-5 text-red-500" />
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
                        <Badge className="bg-red-900/30 text-red-300 border-red-700/50">
                          {file.fatal} fatal
                        </Badge>
                      )}
                      {file.errors > 0 && (
                        <Badge className="bg-orange-900/30 text-orange-300 border-orange-700/50">
                          {file.errors} errors
                        </Badge>
                      )}
                      {file.warnings > 0 && (
                        <Badge className="bg-yellow-900/30 text-yellow-300 border-yellow-700/50">
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
              <AlertCircle className="w-5 h-5 text-red-500" />
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
                        <Badge key={i} className="bg-orange-900/30 text-orange-300 border-orange-700/50">
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
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Most Common EDS Diagnostic Codes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {edsDiagnostics.common_codes.map((code, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded border border-border/50">
                  <div className="flex items-center gap-3">
                    <Badge className={
                      code.severity === 'FATAL' ? 'bg-red-900/30 text-red-300 border-red-700/50' :
                      code.severity === 'ERROR' ? 'bg-orange-900/30 text-orange-300 border-orange-700/50' :
                      code.severity === 'WARN' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50' :
                      'bg-blue-900/30 text-blue-300 border-blue-700/50'
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

      {/* Success Message when no issues */}
      {edsDiagnostics?.total_files_with_issues === 0 && ioddDiagnostics?.total_files_with_issues === 0 && (
        <Card className="bg-green-500/10 border-green-500/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-green-400">
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
};

/**
 * System Tab
 */
const SystemTab = ({ systemInfo, overview }) => {
  return (
    <div className="space-y-6">
      {/* Application Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-500" />
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
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-400">Connected</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-red-400">Not Found</span>
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
            <Server className="w-5 h-5 text-purple-500" />
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
            <Terminal className="w-5 h-5 text-green-500" />
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
            <HardDrive className="w-5 h-5 text-orange-500" />
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
              <p className="text-2xl font-bold text-cyan-400">{overview?.storage?.total_size_mb} MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminConsole;
