import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Badge, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from './ui';
import {
  Activity, Database, TrendingUp, BarChart3, Clock, Zap, Server,
  Terminal, Copy, Download, RefreshCw, Play, Trash2, CheckCircle2,
  XCircle, AlertCircle, Settings, HardDrive, Cpu, FileText, Table,
  ChevronRight, Eye, Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InfluxManager = ({ API_BASE, toast }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [status, setStatus] = useState(null);
  const [databases, setDatabases] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // CLI State
  const [cliCommand, setCliCommand] = useState('');
  const [cliHistory, setCliHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const cliRef = useRef(null);

  // Query Builder State
  const [selectedDb, setSelectedDb] = useState('iodd_telemetry');
  const [selectedMeasurement, setSelectedMeasurement] = useState('');
  const [timeRange, setTimeRange] = useState('1h');
  const [limit, setLimit] = useState(100);
  const [customQuery, setCustomQuery] = useState('');

  useEffect(() => {
    fetchStatus();
    fetchDatabases();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8086/ping`);
      setStatus({
        connected: response.ok,
        version: response.headers.get('X-Influxdb-Version') || 'Unknown',
        uptime: 'Running'
      });
    } catch (error) {
      setStatus({ connected: false, error: error.message });
    }
  };

  const fetchDatabases = async () => {
    // Mock data - in production, you'd query InfluxDB
    setDatabases([
      { name: 'iodd_telemetry', measurements: 12, series: 45, retention: '30d' },
      { name: '_internal', measurements: 8, series: 24, retention: 'INF' }
    ]);
  };

  const executeCli = async (command) => {
    const cmd = command || cliCommand;
    if (!cmd.trim()) return;

    setCliHistory(prev => [
      ...prev,
      { type: 'command', content: cmd, timestamp: new Date() }
    ]);

    try {
      // Simulate CLI execution - in production, send to backend
      let result = '';

      if (cmd.toLowerCase().startsWith('show databases')) {
        result = databases.map(db => db.name).join('\n');
      } else if (cmd.toLowerCase().startsWith('show measurements')) {
        result = 'temperature\nhumidity\npressure\nvoltage\ncurrent';
      } else if (cmd.toLowerCase().startsWith('select')) {
        result = 'time\t\t\tvalue\n' +
                 '2024-01-14T10:30:00Z\t25.4\n' +
                 '2024-01-14T10:31:00Z\t25.6\n' +
                 '2024-01-14T10:32:00Z\t25.3';
      } else {
        result = `Executed: ${cmd}`;
      }

      setCliHistory(prev => [
        ...prev,
        { type: 'result', content: result, timestamp: new Date() }
      ]);
    } catch (error) {
      setCliHistory(prev => [
        ...prev,
        { type: 'error', content: error.message, timestamp: new Date() }
      ]);
    }

    setCliCommand('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCli();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const commands = cliHistory.filter(h => h.type === 'command');
      if (commands.length > 0 && historyIndex < commands.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCliCommand(commands[commands.length - 1 - newIndex].content);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const commands = cliHistory.filter(h => h.type === 'command');
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCliCommand(commands[commands.length - 1 - newIndex].content);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCliCommand('');
      }
    }
  };

  const quickQuery = (query) => {
    setCustomQuery(query);
    executeCli(query);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Database className="w-7 h-7 text-[#3DB60F]" />
            InfluxDB Manager
          </h2>
          <p className="text-muted-foreground mt-1">Time-series database for IoT telemetry</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={status?.connected ? 'bg-[#3DB60F]/20 text-[#3DB60F] border-[#3DB60F]/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}>
            {status?.connected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchStatus}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-[#3DB60F] to-green-500">
            <Terminal className="w-4 h-4 mr-2" />
            Open Chronograf
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Status</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {status?.connected ? 'Online' : 'Offline'}
                </p>
              </div>
              <Server className={`w-8 h-8 ${status?.connected ? 'text-[#3DB60F]' : 'text-red-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Databases</p>
                <p className="text-2xl font-bold text-foreground mt-1">{databases.length}</p>
              </div>
              <Database className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Version</p>
                <p className="text-2xl font-bold text-foreground mt-1">{status?.version || 'N/A'}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Writes/sec</p>
                <p className="text-2xl font-bold text-foreground mt-1">0</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cli">CLI</TabsTrigger>
          <TabsTrigger value="query">Query Builder</TabsTrigger>
          <TabsTrigger value="databases">Databases</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" onClick={() => quickQuery('SHOW DATABASES')}>
                <Database className="w-4 h-4 mr-2" />
                Show Databases
              </Button>
              <Button variant="outline" onClick={() => quickQuery('SHOW MEASUREMENTS')}>
                <Table className="w-4 h-4 mr-2" />
                Show Measurements
              </Button>
              <Button variant="outline" onClick={() => quickQuery('SHOW SERIES LIMIT 10')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Show Series
              </Button>
              <Button variant="outline" onClick={() => quickQuery('SHOW STATS')}>
                <Activity className="w-4 h-4 mr-2" />
                Show Stats
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Data Points</CardTitle>
              <CardDescription>Latest telemetry ingested (simulated)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { time: '10:32:15', measurement: 'temperature', value: '25.3°C', device: 'sensor-001' },
                  { time: '10:32:14', measurement: 'humidity', value: '65%', device: 'sensor-001' },
                  { time: '10:32:13', measurement: 'pressure', value: '1013 hPa', device: 'sensor-002' },
                  { time: '10:32:12', measurement: 'voltage', value: '24.1 V', device: 'plc-003' },
                ].map((point, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded border border-border">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{point.time}</span>
                      <Badge variant="outline" className="text-xs">{point.measurement}</Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-foreground font-mono">{point.value}</span>
                      <span className="text-muted-foreground text-sm">{point.device}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CLI Tab */}
        <TabsContent value="cli" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#3DB60F]" />
                    InfluxQL CLI
                  </CardTitle>
                  <CardDescription>Execute InfluxQL queries directly</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => setCliHistory([])}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* CLI Output */}
              <div className="bg-background border border-border rounded-lg p-4 mb-4 h-96 overflow-y-auto font-mono text-sm">
                <div className="text-muted-foreground mb-4">
                  InfluxDB Shell v{status?.version || '1.8.x'}<br />
                  Enter InfluxQL commands below. Use ↑↓ to navigate history.
                </div>

                <AnimatePresence>
                  {cliHistory.map((entry, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-2"
                    >
                      {entry.type === 'command' && (
                        <div className="text-[#3DB60F]">
                          <span className="text-slate-600">{'>'} </span>{entry.content}
                        </div>
                      )}
                      {entry.type === 'result' && (
                        <pre className="text-foreground ml-4 whitespace-pre-wrap">{entry.content}</pre>
                      )}
                      {entry.type === 'error' && (
                        <div className="text-red-400 ml-4">{entry.content}</div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* CLI Input */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3DB60F]">{'>'}</span>
                  <Input
                    ref={cliRef}
                    value={cliCommand}
                    onChange={(e) => setCliCommand(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter InfluxQL query (e.g., SHOW DATABASES)"
                    className="pl-8 bg-background border-border text-foreground font-mono"
                  />
                </div>
                <Button onClick={() => executeCli()} className="bg-gradient-to-r from-[#3DB60F] to-green-500">
                  <Play className="w-4 h-4 mr-2" />
                  Execute
                </Button>
              </div>

              {/* Quick Commands */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => setCliCommand('SHOW DATABASES')}
                >
                  SHOW DATABASES
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => setCliCommand('SHOW MEASUREMENTS')}
                >
                  SHOW MEASUREMENTS
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-secondary"
                  onClick={() => setCliCommand('SELECT * FROM temperature ORDER BY time DESC LIMIT 10')}
                >
                  SELECT RECENT
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Query Builder Tab */}
        <TabsContent value="query" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Visual Query Builder</CardTitle>
              <CardDescription>Build queries without writing InfluxQL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Database</Label>
                  <select
                    value={selectedDb}
                    onChange={(e) => setSelectedDb(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-foreground"
                  >
                    {databases.map(db => (
                      <option key={db.name} value={db.name}>{db.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-foreground">Measurement</Label>
                  <select
                    value={selectedMeasurement}
                    onChange={(e) => setSelectedMeasurement(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-foreground"
                  >
                    <option value="">Select measurement...</option>
                    <option value="temperature">temperature</option>
                    <option value="humidity">humidity</option>
                    <option value="pressure">pressure</option>
                  </select>
                </div>

                <div>
                  <Label className="text-foreground">Time Range</Label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-foreground"
                  >
                    <option value="15m">Last 15 minutes</option>
                    <option value="1h">Last hour</option>
                    <option value="6h">Last 6 hours</option>
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                  </select>
                </div>

                <div>
                  <Label className="text-foreground">Limit</Label>
                  <Input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>

              <div className="bg-background p-4 rounded border border-border">
                <Label className="text-muted-foreground text-xs">Generated Query</Label>
                <pre className="text-[#3DB60F] font-mono text-sm mt-2">
                  {selectedMeasurement
                    ? `SELECT * FROM ${selectedMeasurement} WHERE time > now() - ${timeRange} LIMIT ${limit}`
                    : 'SELECT * FROM <measurement> WHERE time > now() - <range> LIMIT <n>'}
                </pre>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-[#3DB60F] to-green-500"
                disabled={!selectedMeasurement}
              >
                <Play className="w-4 h-4 mr-2" />
                Run Query
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Databases Tab */}
        <TabsContent value="databases" className="space-y-4">
          <div className="grid gap-4">
            {databases.map((db) => (
              <Card key={db.name} className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Database className="w-5 h-5 text-[#3DB60F]" />
                        {db.name}
                      </h3>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-muted-foreground text-sm">Measurements</p>
                          <p className="text-foreground font-semibold mt-1">{db.measurements}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Series</p>
                          <p className="text-foreground font-semibold mt-1">{db.series}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">Retention</p>
                          <p className="text-foreground font-semibold mt-1">{db.retention}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfluxManager;
