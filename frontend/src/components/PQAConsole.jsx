import React, { useState, useEffect } from 'react';
import {
  Activity, AlertCircle, XCircle, CheckCircle, Target, BarChart,
  ArrowRight, ChevronDown, ChevronRight, RefreshCw, TrendingUp,
  AlertTriangle, FileText, Play, Clock, Database, Eye, Settings,
  Plus, Edit, Trash2, Search, Filter, Download, Upload, Code,
  GitCompare, FileCode, Hash, Calendar, User, Zap
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { Button } from './ui';
import { Badge } from './ui';

/**
 * Comprehensive PQA (Parser Quality Assurance) Console
 * Provides forensic analysis and quality metrics for IODD and EDS parsers
 */
const PQAConsole = ({ API_BASE, toast }) => {
  // State management
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [failures, setFailures] = useState(null);
  const [thresholds, setThresholds] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, analyze, history, thresholds, diff
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedFileType, setSelectedFileType] = useState('IODD');
  const [devices, setDevices] = useState([]);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [diffDetails, setDiffDetails] = useState(null);
  const [expandedFailure, setExpandedFailure] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [newThreshold, setNewThreshold] = useState({
    threshold_name: '',
    file_type: 'IODD',
    min_overall_score: 98.0,
    min_structural_score: 99.0,
    max_data_loss_percentage: 0.1,
    auto_ticket_on_fail: true,
    active: true
  });

  useEffect(() => {
    loadPQAData();
    loadDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice && activeView === 'history') {
      loadAnalysisHistory(selectedDevice.id);
    }
  }, [selectedDevice, activeView]);

  useEffect(() => {
    if (selectedMetric && activeView === 'diff') {
      loadDiffDetails(selectedMetric.id);
    }
  }, [selectedMetric, activeView]);

  const loadPQAData = async () => {
    setLoading(true);
    try {
      const [summaryRes, trendsRes, failuresRes, thresholdsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/pqa/dashboard/summary`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/api/pqa/dashboard/trends?days=30`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/api/pqa/dashboard/failures?limit=20`).catch(() => ({ data: null })),
        axios.get(`${API_BASE}/api/pqa/thresholds`).catch(() => ({ data: [] }))
      ]);

      setSummary(summaryRes.data);
      setTrends(trendsRes.data);
      setFailures(failuresRes.data);
      setThresholds(thresholdsRes.data);
    } catch (error) {
      console.error('Error loading PQA data:', error);
      toast?.({
        title: 'PQA Data Load Error',
        description: 'Could not load PQA dashboard data. The PQA system may not be initialized yet.',
        variant: 'warning'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDevices = async () => {
    try {
      const [ioddRes, edsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/iodd`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE}/api/eds`).catch(() => ({ data: [] }))
      ]);

      const ioddDevices = (ioddRes.data || []).map(d => ({ ...d, file_type: 'IODD' }));
      const edsDevices = (edsRes.data || []).map(d => ({ ...d, file_type: 'EDS' }));

      setDevices([...ioddDevices, ...edsDevices]);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const loadAnalysisHistory = async (deviceId) => {
    try {
      const res = await axios.get(`${API_BASE}/api/pqa/metrics/${deviceId}/history`);
      setAnalysisHistory(res.data || []);
    } catch (error) {
      console.error('Error loading analysis history:', error);
      toast?.({
        title: 'History Load Error',
        description: 'Could not load analysis history for this device.',
        variant: 'error'
      });
    }
  };

  const loadDiffDetails = async (metricId) => {
    try {
      const res = await axios.get(`${API_BASE}/api/pqa/diff/${metricId}`);
      setDiffDetails(res.data || []);
    } catch (error) {
      console.error('Error loading diff details:', error);
      toast?.({
        title: 'Diff Load Error',
        description: 'Could not load difference details.',
        variant: 'error'
      });
    }
  };

  const runAnalysis = async (deviceId, fileType) => {
    setAnalyzing(true);
    try {
      await axios.post(`${API_BASE}/api/pqa/analyze`, {
        device_id: deviceId,
        file_type: fileType
      });

      toast?.({
        title: 'Analysis Started',
        description: `Parser quality analysis initiated for ${fileType} device ${deviceId}`,
        variant: 'success'
      });

      setTimeout(() => {
        loadPQAData();
        if (selectedDevice && selectedDevice.id === deviceId) {
          loadAnalysisHistory(deviceId);
        }
      }, 3000);
    } catch (error) {
      toast?.({
        title: 'Analysis Failed',
        description: error.response?.data?.detail || 'Could not start quality analysis',
        variant: 'error'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const createThreshold = async () => {
    try {
      await axios.post(`${API_BASE}/api/pqa/thresholds`, newThreshold);

      toast?.({
        title: 'Threshold Created',
        description: `Quality threshold "${newThreshold.threshold_name}" created successfully`,
        variant: 'success'
      });

      setShowThresholdModal(false);
      setNewThreshold({
        threshold_name: '',
        file_type: 'IODD',
        min_overall_score: 98.0,
        min_structural_score: 99.0,
        max_data_loss_percentage: 0.1,
        auto_ticket_on_fail: true,
        active: true
      });

      loadPQAData();
    } catch (error) {
      toast?.({
        title: 'Threshold Creation Failed',
        description: error.response?.data?.detail || 'Could not create threshold',
        variant: 'error'
      });
    }
  };

  const deleteThreshold = async (thresholdId) => {
    if (!confirm('Are you sure you want to delete this threshold?')) return;

    try {
      await axios.delete(`${API_BASE}/api/pqa/thresholds/${thresholdId}`);

      toast?.({
        title: 'Threshold Deleted',
        description: 'Quality threshold deleted successfully',
        variant: 'success'
      });

      loadPQAData();
    } catch (error) {
      toast?.({
        title: 'Threshold Deletion Failed',
        description: error.response?.data?.detail || 'Could not delete threshold',
        variant: 'error'
      });
    }
  };

  const downloadReconstruction = async (deviceId, fileType) => {
    try {
      const res = await axios.get(`${API_BASE}/api/pqa/reconstruct/${deviceId}`, {
        params: { file_type: fileType },
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reconstructed_${fileType}_${deviceId}.${fileType === 'IODD' ? 'xml' : 'ini'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast?.({
        title: 'Download Started',
        description: 'Reconstructed file download initiated',
        variant: 'success'
      });
    } catch (error) {
      toast?.({
        title: 'Download Failed',
        description: error.response?.data?.detail || 'Could not download reconstructed file',
        variant: 'error'
      });
    }
  };

  const getScoreColor = (score) => {
    if (score >= 98) return 'text-success';
    if (score >= 95) return 'text-warning';
    return 'text-error';
  };

  const getScoreBgColor = (score) => {
    if (score >= 98) return 'bg-success/20 border-success/50';
    if (score >= 95) return 'bg-warning/20 border-warning/50';
    return 'bg-error/20 border-error/50';
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-error';
      case 'high': return 'text-warning';
      case 'medium': return 'text-warning/70';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-error/20 text-error border-error/50';
      case 'high': return 'bg-warning/20 text-warning border-warning/50';
      case 'medium': return 'bg-warning/10 text-warning/70 border-warning/30';
      case 'low': return 'bg-secondary text-muted-foreground border-border';
      default: return 'bg-secondary text-muted-foreground border-border';
    }
  };

  const QualityGauge = ({ score, label }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <svg width="150" height="150" className="-rotate-90">
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-secondary"
          />
          <circle
            cx="75"
            cy="75"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={score >= 98 ? 'text-success' : score >= 95 ? 'text-warning' : 'text-error'}
            strokeLinecap="round"
          />
          <text
            x="75"
            y="75"
            className="text-3xl font-bold fill-current text-foreground rotate-90"
            textAnchor="middle"
            dominantBaseline="middle"
            transform="rotate(90 75 75)"
          >
            {score.toFixed(1)}
          </text>
        </svg>
        <p className="text-sm text-muted-foreground mt-2">{label}</p>
      </div>
    );
  };

  const filteredDevices = devices.filter(d => {
    const matchesSearch = !searchQuery ||
      d.manufacturer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.device_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.device_id?.toString().includes(searchQuery);

    const matchesFileType = selectedFileType === 'all' || d.file_type === selectedFileType;

    return matchesSearch && matchesFileType;
  });

  const filteredDiffDetails = diffDetails?.filter(d => {
    return filterSeverity === 'all' || d.severity?.toLowerCase() === filterSeverity;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-green" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PQA System Header */}
      <Card className="bg-gradient-to-br from-brand-green/10 to-background border-brand-green/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-brand-green/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-brand-green" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Parser Quality Assurance Console</h2>
                <p className="text-sm text-muted-foreground">Forensic analysis & reconstruction quality metrics</p>
              </div>
            </div>
            <Button
              onClick={loadPQAData}
              className="bg-brand-green/20 hover:bg-brand-green/30 text-brand-green border-brand-green/50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* View Navigation Tabs */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex gap-2 overflow-x-auto">
            <Button
              onClick={() => setActiveView('dashboard')}
              className={activeView === 'dashboard'
                ? 'bg-brand-green/20 text-brand-green border-brand-green/50'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}
            >
              <BarChart className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={() => setActiveView('analyze')}
              className={activeView === 'analyze'
                ? 'bg-brand-green/20 text-brand-green border-brand-green/50'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}
            >
              <Play className="w-4 h-4 mr-2" />
              Run Analysis
            </Button>
            <Button
              onClick={() => setActiveView('history')}
              className={activeView === 'history'
                ? 'bg-brand-green/20 text-brand-green border-brand-green/50'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}
              disabled={!selectedDevice}
            >
              <Clock className="w-4 h-4 mr-2" />
              Analysis History
            </Button>
            <Button
              onClick={() => setActiveView('diff')}
              className={activeView === 'diff'
                ? 'bg-brand-green/20 text-brand-green border-brand-green/50'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}
              disabled={!selectedMetric}
            >
              <GitCompare className="w-4 h-4 mr-2" />
              Diff Viewer
            </Button>
            <Button
              onClick={() => setActiveView('thresholds')}
              className={activeView === 'thresholds'
                ? 'bg-brand-green/20 text-brand-green border-brand-green/50'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'}
            >
              <Settings className="w-4 h-4 mr-2" />
              Thresholds
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <>
          {/* Summary Statistics */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Analyses</p>
                      <p className="text-3xl font-bold text-foreground">{summary.total_analyses || 0}</p>
                    </div>
                    <BarChart className="w-10 h-10 text-brand-green/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className={`bg-card border ${getScoreBgColor(summary.average_score || 0)}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                      <p className={`text-3xl font-bold ${getScoreColor(summary.average_score || 0)}`}>
                        {(summary.average_score || 0).toFixed(1)}%
                      </p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-success/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-success/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Passed</p>
                      <p className="text-3xl font-bold text-success">{summary.passed_analyses || 0}</p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-success/50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-error/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="text-3xl font-bold text-error">{summary.failed_analyses || 0}</p>
                    </div>
                    <XCircle className="w-10 h-10 text-error/50" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Quality Metrics Gauges */}
          {summary && summary.average_score > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-brand-green" />
                  Quality Metrics Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                  <QualityGauge score={summary.average_score || 0} label="Overall Quality" />
                  <div className="flex flex-col items-center space-y-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-foreground">{summary.devices_analyzed || 0}</p>
                      <p className="text-sm text-muted-foreground">Devices Analyzed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-error">{summary.critical_failures || 0}</p>
                      <p className="text-sm text-muted-foreground">Critical Failures</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 w-full max-w-xs">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Quality Target: 98%+</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Pass Rate</span>
                        <span className={getScoreColor(summary.average_score || 0)}>
                          {summary.total_analyses > 0
                            ? ((summary.passed_analyses / summary.total_analyses) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary/30 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-success"
                          style={{
                            width: summary.total_analyses > 0
                              ? `${(summary.passed_analyses / summary.total_analyses) * 100}%`
                              : '0%'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Failures */}
          {failures && failures.failures && failures.failures.length > 0 && (
            <Card className="bg-card border-error/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-error" />
                  Recent Quality Failures ({failures.failures.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {failures.failures.map((failure, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-error/10 rounded-lg border border-error/30 cursor-pointer hover:bg-error/20 transition-colors"
                      onClick={() => setExpandedFailure(expandedFailure === idx ? null : idx)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-error" />
                            <span className="font-medium text-foreground">
                              {failure.file_type} Device #{failure.device_id}
                            </span>
                            <Badge className="bg-error/20 text-error text-xs">
                              Score: {failure.overall_score.toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Analyzed: {new Date(failure.timestamp).toLocaleString()}
                          </div>
                        </div>
                        {expandedFailure === idx ? (
                          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>

                      {expandedFailure === idx && (
                        <div className="mt-4 pt-4 border-t border-error/30 space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Data Loss:</span>
                              <span className="ml-2 text-error font-medium">
                                {failure.data_loss_percentage?.toFixed(2)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Critical:</span>
                              <span className="ml-2 text-error font-medium">
                                {failure.critical_data_loss ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-brand-green/20 hover:bg-brand-green/30 text-brand-green"
                              onClick={(e) => {
                                e.stopPropagation();
                                runAnalysis(failure.device_id, failure.file_type);
                              }}
                              disabled={analyzing}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Re-analyze
                            </Button>
                            <Button
                              size="sm"
                              className="bg-secondary hover:bg-secondary/80"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMetric(failure);
                                setActiveView('diff');
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Diff
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Getting Started Guide */}
          {(!summary || summary.total_analyses === 0) && (
            <Card className="bg-card border-brand-green/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-brand-green" />
                  Getting Started with PQA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The Parser Quality Assurance system provides forensic analysis of IODD and EDS file parsing.
                  No analyses have been run yet.
                </p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">How it works:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Original files are archived with SHA256 hash verification</li>
                    <li>Files are reconstructed from database using forensic engines</li>
                    <li>Differential analysis compares original vs. reconstructed</li>
                    <li>Quality scores are calculated (Target: 98%+, Structural: 99%+)</li>
                    <li>Auto-tickets are generated for failures</li>
                  </ol>
                </div>
                <div className="flex items-start gap-2 p-3 bg-brand-green/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Click on "Run Analysis" tab to start your first quality analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Run Analysis View */}
      {activeView === 'analyze' && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-brand-green" />
              Run Quality Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">File Type:</label>
              <div className="flex gap-2">
                <Button
                  onClick={() => setSelectedFileType('all')}
                  className={selectedFileType === 'all'
                    ? 'bg-brand-green/20 text-brand-green'
                    : 'bg-secondary/50'}
                >
                  All
                </Button>
                <Button
                  onClick={() => setSelectedFileType('IODD')}
                  className={selectedFileType === 'IODD'
                    ? 'bg-brand-green/20 text-brand-green'
                    : 'bg-secondary/50'}
                >
                  IODD
                </Button>
                <Button
                  onClick={() => setSelectedFileType('EDS')}
                  className={selectedFileType === 'EDS'
                    ? 'bg-brand-green/20 text-brand-green'
                    : 'bg-secondary/50'}
                >
                  EDS
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Search Devices:</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by manufacturer, device name, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-green/50"
                />
              </div>
            </div>

            {/* Device List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredDevices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No devices found</p>
                </div>
              ) : (
                filteredDevices.map((device, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-secondary/30 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={device.file_type === 'IODD'
                            ? 'bg-blue-500/20 text-blue-500'
                            : 'bg-purple-500/20 text-purple-500'}>
                            {device.file_type}
                          </Badge>
                          <span className="font-medium text-foreground">
                            {device.manufacturer_name || device.vendor_name} - {device.device_name || device.product_name}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Device ID: {device.id || device.device_id}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-brand-green/20 hover:bg-brand-green/30 text-brand-green"
                          onClick={() => {
                            setSelectedDevice(device);
                            runAnalysis(device.id || device.device_id, device.file_type);
                          }}
                          disabled={analyzing}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Analyze
                        </Button>
                        <Button
                          size="sm"
                          className="bg-secondary hover:bg-secondary/80"
                          onClick={() => {
                            setSelectedDevice(device);
                            setActiveView('history');
                          }}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          History
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis History View */}
      {activeView === 'history' && selectedDevice && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-green" />
                Analysis History - {selectedDevice.file_type} Device #{selectedDevice.id || selectedDevice.device_id}
              </div>
              <Button
                size="sm"
                onClick={() => loadAnalysisHistory(selectedDevice.id || selectedDevice.device_id)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysisHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No analysis history for this device</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {analysisHistory.map((metric, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${getScoreBgColor(metric.overall_score)} cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => {
                      setSelectedMetric(metric);
                      setActiveView('diff');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={metric.passed ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}>
                          {metric.passed ? 'PASSED' : 'FAILED'}
                        </Badge>
                        <span className={`text-2xl font-bold ${getScoreColor(metric.overall_score)}`}>
                          {metric.overall_score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(metric.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Data Loss:</span>
                        <span className="ml-2 text-foreground font-medium">
                          {metric.data_loss_percentage?.toFixed(2)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Differences:</span>
                        <span className="ml-2 text-foreground font-medium">
                          {metric.differences_count || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Parser:</span>
                        <span className="ml-2 text-foreground font-medium">
                          v{metric.parser_version}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diff Viewer */}
      {activeView === 'diff' && selectedMetric && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-brand-green" />
                Difference Details - Analysis #{selectedMetric.id}
              </div>
              <div className="flex gap-2">
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-3 py-1 bg-secondary border border-border rounded-lg text-foreground text-sm"
                >
                  <option value="all">All Severity</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <Button
                  size="sm"
                  onClick={() => downloadReconstruction(selectedMetric.device_id, selectedMetric.file_type)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Reconstruction
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!diffDetails || diffDetails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <GitCompare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No differences found or loading...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredDiffDetails.map((diff, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-secondary/30 rounded-lg border border-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityBadgeClass(diff.severity)}>
                          {diff.severity}
                        </Badge>
                        <span className="font-medium text-foreground">{diff.diff_type}</span>
                      </div>
                      {diff.phase && (
                        <Badge className="bg-secondary">
                          Phase: {diff.phase}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Path:</span>
                        <code className="ml-2 text-foreground bg-black/30 px-2 py-0.5 rounded">
                          {diff.xpath || diff.section}
                        </code>
                      </div>
                      {diff.attribute && (
                        <div>
                          <span className="text-muted-foreground">Attribute:</span>
                          <code className="ml-2 text-foreground bg-black/30 px-2 py-0.5 rounded">
                            {diff.attribute}
                          </code>
                        </div>
                      )}
                      {diff.expected_value && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-muted-foreground block mb-1">Expected:</span>
                            <pre className="text-xs bg-success/10 border border-success/30 p-2 rounded overflow-x-auto">
                              {diff.expected_value}
                            </pre>
                          </div>
                          <div>
                            <span className="text-muted-foreground block mb-1">Actual:</span>
                            <pre className="text-xs bg-error/10 border border-error/30 p-2 rounded overflow-x-auto">
                              {diff.actual_value || '<missing>'}
                            </pre>
                          </div>
                        </div>
                      )}
                      {diff.message && (
                        <div>
                          <span className="text-muted-foreground">Message:</span>
                          <span className="ml-2 text-foreground">{diff.message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Thresholds Management View */}
      {activeView === 'thresholds' && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-green" />
                Quality Thresholds
              </div>
              <Button
                onClick={() => setShowThresholdModal(true)}
                className="bg-brand-green/20 hover:bg-brand-green/30 text-brand-green"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Threshold
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!thresholds || thresholds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No quality thresholds configured</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {thresholds.map((threshold, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-secondary/30 rounded-lg border border-border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-foreground">{threshold.threshold_name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={threshold.active
                          ? 'bg-success/20 text-success'
                          : 'bg-secondary'}>
                          {threshold.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteThreshold(threshold.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">File Type:</span>
                        <Badge className={threshold.file_type === 'IODD'
                          ? 'bg-blue-500/20 text-blue-500'
                          : 'bg-purple-500/20 text-purple-500'}>
                          {threshold.file_type}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min Overall Score:</span>
                        <span className="text-foreground font-medium">{threshold.min_overall_score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min Structural:</span>
                        <span className="text-foreground font-medium">{threshold.min_structural_score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Data Loss:</span>
                        <span className="text-foreground font-medium">{threshold.max_data_loss_percentage}%</span>
                      </div>
                      {threshold.auto_ticket_on_fail && (
                        <Badge className="bg-warning/20 text-warning text-xs">Auto-ticket enabled</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Threshold Modal */}
      {showThresholdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md bg-card border-border">
            <CardHeader>
              <CardTitle>Create Quality Threshold</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">Threshold Name:</label>
                <input
                  type="text"
                  value={newThreshold.threshold_name}
                  onChange={(e) => setNewThreshold({...newThreshold, threshold_name: e.target.value})}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                  placeholder="e.g., Production Quality Standard"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">File Type:</label>
                <select
                  value={newThreshold.file_type}
                  onChange={(e) => setNewThreshold({...newThreshold, file_type: e.target.value})}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                >
                  <option value="IODD">IODD</option>
                  <option value="EDS">EDS</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">Min Overall Score (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newThreshold.min_overall_score}
                  onChange={(e) => setNewThreshold({...newThreshold, min_overall_score: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">Min Structural Score (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newThreshold.min_structural_score}
                  onChange={(e) => setNewThreshold({...newThreshold, min_structural_score: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">Max Data Loss (%):</label>
                <input
                  type="number"
                  step="0.01"
                  value={newThreshold.max_data_loss_percentage}
                  onChange={(e) => setNewThreshold({...newThreshold, max_data_loss_percentage: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newThreshold.auto_ticket_on_fail}
                  onChange={(e) => setNewThreshold({...newThreshold, auto_ticket_on_fail: e.target.checked})}
                  className="w-4 h-4"
                />
                <label className="text-sm text-foreground">Auto-create tickets on failure</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newThreshold.active}
                  onChange={(e) => setNewThreshold({...newThreshold, active: e.target.checked})}
                  className="w-4 h-4"
                />
                <label className="text-sm text-foreground">Active</label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={createThreshold}
                  className="flex-1 bg-brand-green/20 hover:bg-brand-green/30 text-brand-green"
                >
                  Create
                </Button>
                <Button
                  onClick={() => setShowThresholdModal(false)}
                  className="flex-1 bg-secondary hover:bg-secondary/80"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PQAConsole;
