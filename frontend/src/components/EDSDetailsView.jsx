import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ArrowLeft, Download, FileText, Server, ArrowUpRight, ArrowDownRight,
  Users, Activity, Clock, Package, Code, Database, FileCode, ChevronDown, ChevronRight, Info, Filter, Boxes, Network, Cpu, GitCompare, AlertTriangle, Layers
} from 'lucide-react';
import AssembliesSection from './AssembliesSection';
import PortsSection from './PortsSection';
import ModulesSection from './ModulesSection';
import NetworkConfigTab from './NetworkConfigTab';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Switch } from '@/components/ui';
import { Label } from '@/components/ui';
import { decodeTriggerTransport, decodeConnectionParams, getConnectionSummary } from '@/utils/edsConnectionDecoder';
import ParameterCard from './ParameterCard';
import { groupParametersByCategory, getSortedCategories, getCategoryBadgeColor, getCategoryIconColor } from '../utils/edsParameterCategorizer';
import TicketButton from './TicketButton';
import TicketModal from './TicketModal';
import PQAAnalysisModal from './PQAAnalysisModal';

const EDSDetailsView = ({ selectedEds: initialEds, onBack, onExportJSON, onExportZIP, API_BASE }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [availableRevisions, setAvailableRevisions] = useState([]);
  const [selectedRevisionId, setSelectedRevisionId] = useState(initialEds.id);
  const [selectedEds, setSelectedEds] = useState(initialEds);
  const [loadingRevision, setLoadingRevision] = useState(false);
  const [groups, setGroups] = useState([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonRevisionId, setComparisonRevisionId] = useState(null);
  const [comparisonEds, setComparisonEds] = useState(null);
  const [previousRevisionData, setPreviousRevisionData] = useState(null);
  const [parameterDiffs, setParameterDiffs] = useState(new Map());

  // PQA (Parser Quality Assurance) metrics
  const [pqaMetrics, setPqaMetrics] = useState(null);
  const [loadingPqa, setLoadingPqa] = useState(false);
  const [showPqaModal, setShowPqaModal] = useState(false);

  // Fetch available revisions for this device
  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/eds/device/${initialEds.vendor_code}/${initialEds.product_code}/revisions`
        );
        setAvailableRevisions(response.data);
      } catch (error) {
        console.error('Failed to fetch revisions:', error);
        // If fetch fails, just show current revision
        setAvailableRevisions([{
          id: initialEds.id,
          major_revision: initialEds.major_revision,
          minor_revision: initialEds.minor_revision,
          revision_string: `v${initialEds.major_revision}.${initialEds.minor_revision}`
        }]);
      }
    };

    fetchRevisions();
  }, [API_BASE, initialEds.vendor_code, initialEds.product_code]);

  // Fetch parameter groups for this EDS file
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/eds/${selectedEds.id}/groups`);
        setGroups(response.data.groups || []);
      } catch (error) {
        console.error('Failed to fetch groups:', error);
        setGroups([]);
      }
    };

    fetchGroups();
  }, [API_BASE, selectedEds.id]);

  // Fetch PQA metrics for this EDS file
  useEffect(() => {
    const fetchPqaMetrics = async () => {
      setLoadingPqa(true);
      try {
        const response = await axios.get(`${API_BASE}/api/pqa/metrics/${selectedEds.id}?file_type=EDS`);
        setPqaMetrics(response.data);
      } catch (error) {
        // PQA metrics might not exist for all devices - that's ok
        if (error.response?.status !== 404) {
          console.error('Failed to fetch PQA metrics:', error);
        }
        setPqaMetrics(null);
      } finally {
        setLoadingPqa(false);
      }
    };

    fetchPqaMetrics();
  }, [API_BASE, selectedEds.id]);

  // Load a different revision when selected
  const handleRevisionChange = async (revisionId) => {
    if (revisionId === selectedRevisionId) return;

    setLoadingRevision(true);
    try {
      // If comparison mode is on, load the previous revision for comparison
      if (comparisonMode) {
        // Store current revision as "previous" before switching
        setPreviousRevisionData(selectedEds);
      }

      const response = await axios.get(`${API_BASE}/api/eds/${revisionId}`);
      setSelectedEds(response.data);
      setSelectedRevisionId(revisionId);

      // Compute differences if in comparison mode
      if (comparisonMode && previousRevisionData) {
        computeParameterDifferences(previousRevisionData, response.data);
      }
    } catch (error) {
      console.error('Failed to load revision:', error);
    } finally {
      setLoadingRevision(false);
    }
  };

  // Compute differences between two revisions
  const computeParameterDifferences = (prevRevision, currentRevision) => {
    const diffs = new Map();

    // Create maps for quick lookup
    const prevParams = new Map(
      (prevRevision.parameters || []).map(p => [p.param_number, p])
    );
    const currParams = new Map(
      (currentRevision.parameters || []).map(p => [p.param_number, p])
    );

    // Check for added and modified parameters
    currParams.forEach((param, paramNumber) => {
      if (!prevParams.has(paramNumber)) {
        diffs.set(paramNumber, { type: 'added', current: param });
      } else {
        const prevParam = prevParams.get(paramNumber);
        const changes = findParameterChanges(prevParam, param);
        if (changes.length > 0) {
          diffs.set(paramNumber, { type: 'modified', current: param, previous: prevParam, changes });
        }
      }
    });

    // Check for removed parameters
    prevParams.forEach((param, paramNumber) => {
      if (!currParams.has(paramNumber)) {
        diffs.set(paramNumber, { type: 'removed', previous: param });
      }
    });

    setParameterDiffs(diffs);
  };

  // Find specific changes between two parameters
  const findParameterChanges = (prev, curr) => {
    const changes = [];
    const fieldsToCompare = [
      'param_name', 'data_type', 'default_value', 'min_value', 'max_value',
      'units', 'description', 'help_string_2'
    ];

    fieldsToCompare.forEach(field => {
      if (prev[field] !== curr[field]) {
        changes.push({
          field,
          previous: prev[field],
          current: curr[field]
        });
      }
    });

    return changes;
  };

  // Toggle comparison mode
  const toggleComparisonMode = (enabled) => {
    setComparisonMode(enabled);
    if (!enabled) {
      // Clear comparison data when disabled
      setPreviousRevisionData(null);
      setParameterDiffs(new Map());
    } else if (selectedRevisionId !== initialEds.id) {
      // If we have a different revision selected, set initial as previous
      setPreviousRevisionData(initialEds);
      computeParameterDifferences(initialEds, selectedEds);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    ...(comparisonMode && comparisonEds ? [{ id: 'differences', label: `Differences (${parameterDiffs.size})`, icon: AlertTriangle }] : []),
    { id: 'parameters', label: `Parameters (${selectedEds.parameters?.length || 0})`, icon: Database },
    { id: 'connections', label: `Connections (${selectedEds.connections?.length || 0})`, icon: Activity },
    { id: 'assemblies', label: 'Assemblies', icon: Boxes },
    { id: 'ports', label: 'Ports', icon: Network },
    { id: 'modules', label: 'Modules', icon: Cpu },
    { id: 'network', label: 'Network Config', icon: Network },
    { id: 'capacity', label: 'Capacity & Performance', icon: Server },
    { id: 'raw', label: 'Raw EDS Content', icon: FileCode },
  ];

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to EDS Files
        </Button>
        <div className="flex gap-2">
          {/* Revision Selector */}
          {availableRevisions.length > 1 && (
            <Select
              value={selectedRevisionId.toString()}
              onValueChange={(value) => handleRevisionChange(parseInt(value))}
            >
              <SelectTrigger className="w-[200px] bg-secondary border-border text-foreground">
                <SelectValue>
                  {loadingRevision ? 'Loading...' : `Revision: v${selectedEds.major_revision}.${selectedEds.minor_revision}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-secondary border-border">
                {availableRevisions.map((rev) => (
                  <SelectItem
                    key={rev.id}
                    value={rev.id.toString()}
                    className="text-foreground focus:bg-muted"
                  >
                    <div className="flex items-center gap-2">
                      <span>{rev.revision_string}</span>
                      {rev.variant_label && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          rev.variant_label === 'Extended'
                            ? 'bg-brand-green/20 text-brand-green'
                            : 'bg-secondary/50 text-foreground-secondary'
                        }`}>
                          {rev.variant_label}
                        </span>
                      )}
                      {rev.assembly_count && (
                        <span className="text-xs text-muted-foreground">
                          ({rev.assembly_count} asm)
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {/* Comparison Mode Toggle */}
          {availableRevisions.length > 1 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary border border-border rounded-md">
              <GitCompare className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="comparison-mode" className="text-sm text-foreground cursor-pointer">
                Compare Revisions
              </Label>
              <Switch
                id="comparison-mode"
                checked={comparisonMode}
                onCheckedChange={(enabled) => {
                  setComparisonMode(enabled);
                  if (!enabled) {
                    setComparisonRevisionId(null);
                    setComparisonEds(null);
                    setPreviousRevisionData(null);
                    setParameterDiffs(new Map());
                  }
                }}
              />
            </div>
          )}

          {/* Second Revision Selector (for comparison) */}
          {comparisonMode && availableRevisions.length > 1 && (
            <Select
              value={comparisonRevisionId?.toString() || ""}
              onValueChange={async (value) => {
                const revId = parseInt(value);
                setComparisonRevisionId(revId);

                // Fetch the comparison revision data
                try {
                  const response = await axios.get(`${API_BASE}/api/eds/${revId}`);
                  setComparisonEds(response.data);

                  // Compute parameter differences
                  computeParameterDifferences(selectedEds, response.data);
                } catch (error) {
                  console.error('Failed to fetch comparison revision:', error);
                }
              }}
            >
              <SelectTrigger className="w-[200px] bg-background border-border text-foreground">
                <SelectValue placeholder="Select revision to compare" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {availableRevisions
                  .filter(rev => rev.id !== selectedRevisionId)
                  .map((rev) => (
                  <SelectItem
                    key={rev.id}
                    value={rev.id.toString()}
                    className="text-foreground focus:bg-muted"
                  >
                    {rev.revision_string}
                    {rev.mod_date && ` (${rev.mod_date})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={onExportJSON}
            variant="outline"
            className="border-border text-foreground hover:bg-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button
            onClick={onExportZIP}
            className="bg-secondary hover:bg-accent text-foreground"
          >
            <Download className="w-4 h-4 mr-2" />
            Export ZIP
          </Button>
        </div>
      </div>

      {/* Product Header Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg bg-secondary border border-border flex items-center justify-center overflow-hidden">
              <img
                src={`${API_BASE}/api/eds/${selectedEds.id}/icon`}
                alt={selectedEds.product_name || 'Device'}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <FileText className="w-8 h-8 text-secondary" style={{display: 'none'}} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <CardTitle className="text-foreground text-2xl">{selectedEds.product_name || 'Unknown Product'}</CardTitle>
                    {selectedEds.variant_label && (
                      <Badge
                        className={`text-xs ${
                          selectedEds.variant_label === 'Extended'
                            ? 'bg-brand-green/20 text-brand-green border-brand-green'
                            : 'bg-secondary/50 text-foreground-secondary border-secondary'
                        }`}
                        title={`Feature Set: ${selectedEds.feature_set || 'Basic'}`}
                      >
                        {selectedEds.variant_label}
                      </Badge>
                    )}
                    {selectedEds.assembly_count && (
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1"
                        title={`${selectedEds.assembly_count} assemblies`}
                      >
                        <Layers className="w-3 h-3" />
                        {selectedEds.assembly_count}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                    <span>{selectedEds.vendor_name || 'Unknown Vendor'}</span>
                    <span>•</span>
                    <span>{selectedEds.catalog_number || 'N/A'}</span>
                    <span>•</span>
                    <span>Rev {selectedEds.major_revision}.{selectedEds.minor_revision}</span>
                    {selectedEds.features && selectedEds.features.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-brand-green">{selectedEds.features.join(', ')}</span>
                      </>
                    )}
                  </CardDescription>
                </div>
                {/* PQA Score Badge */}
                {pqaMetrics && (
                  <a
                    href={`/pqa/analysis/${pqaMetrics.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPqaModal(true);
                    }}
                    className="no-underline flex-shrink-0"
                    title="View Parser Quality Analysis"
                  >
                    <Badge
                      className={`
                        text-sm px-3 py-1 shadow-lg cursor-pointer transition-all hover:scale-105
                        ${pqaMetrics.passed_threshold
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-success border-success/50 shadow-success/20'
                          : pqaMetrics.critical_data_loss
                            ? 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-error border-error/50 shadow-error/20 animate-pulse'
                            : 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-warning border-warning/50 shadow-warning/20'
                        }
                      `}
                      style={pqaMetrics.critical_data_loss ? { animationDuration: '2s' } : {}}
                    >
                      {pqaMetrics.critical_data_loss && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                      PQA: {pqaMetrics.overall_score.toFixed(1)}%
                      {pqaMetrics.passed_threshold ? ' ✓' : ' !'}
                    </Badge>
                  </a>
                )}
                {loadingPqa && (
                  <Badge className="bg-muted text-muted-foreground border-border text-sm px-3 py-1 flex-shrink-0">
                    Loading PQA...
                  </Badge>
                )}
              </div>
            </div>
            {/* Quick stats */}
            <div className="hidden md:flex gap-4">
              {selectedEds.capacity && selectedEds.capacity.max_msg_connections && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">{selectedEds.capacity.max_msg_connections}</div>
                  <div className="text-xs text-muted-foreground">Msg Conn</div>
                </div>
              )}
              {selectedEds.capacity && selectedEds.capacity.max_io_producers && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{selectedEds.capacity.max_io_producers}</div>
                  <div className="text-xs text-muted-foreground">IO Prod</div>
                </div>
              )}
              {selectedEds.capacity && selectedEds.capacity.max_io_consumers && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{selectedEds.capacity.max_io_consumers}</div>
                  <div className="text-xs text-muted-foreground">IO Cons</div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-brand-green text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && <OverviewTab selectedEds={selectedEds} />}
        {activeTab === 'differences' && <DifferencesTab parameterDiffs={parameterDiffs} previousRevisionData={previousRevisionData} selectedEds={selectedEds} />}
        {activeTab === 'parameters' && <ParametersTab selectedEds={selectedEds} groups={groups} comparisonMode={comparisonMode} parameterDiffs={parameterDiffs} />}
        {activeTab === 'connections' && <ConnectionsTab selectedEds={selectedEds} />}
        {activeTab === 'assemblies' && <AssembliesSection edsId={selectedEds.id} />}
        {activeTab === 'ports' && <PortsSection edsId={selectedEds.id} />}
        {activeTab === 'modules' && <ModulesSection edsId={selectedEds.id} />}
        {activeTab === 'network' && <NetworkConfigTab selectedEds={selectedEds} API_BASE={API_BASE} />}
        {activeTab === 'capacity' && <CapacityTab selectedEds={selectedEds} />}
        {activeTab === 'raw' && <RawContentTab selectedEds={selectedEds} />}
      </div>

      {/* Ticket Button */}
      <TicketButton onClick={() => setShowTicketModal(true)} />

      {/* Ticket Modal */}
      <TicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        deviceType="EDS"
        deviceId={selectedEds.id}
        deviceName={selectedEds.product_name}
        vendorName={selectedEds.vendor_name}
        productCode={selectedEds.product_code}
      />
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ selectedEds }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm flex items-center">
              <Clock className="w-4 h-4 mr-2 text-secondary" />
              File History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm text-foreground">{selectedEds.create_date || 'N/A'} {selectedEds.create_time || ''}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Modified</p>
              <p className="text-sm text-foreground">{selectedEds.mod_date || 'N/A'} {selectedEds.mod_time || ''}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">File Revision</p>
              <p className="text-sm text-foreground">{selectedEds.file_revision || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm flex items-center">
              <FileText className="w-4 h-4 mr-2 text-primary" />
              Device Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Class 1</p>
              <p className="text-sm text-foreground">{selectedEds.class1 || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Class 2</p>
              <p className="text-sm text-foreground">{selectedEds.class2 || 'N/A'}</p>
            </div>
            {selectedEds.class3 && (
              <div>
                <p className="text-xs text-muted-foreground">Class 3</p>
                <p className="text-sm text-foreground">{selectedEds.class3}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-sm flex items-center">
              <Database className="w-4 h-4 mr-2 text-success" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Parameters</p>
              <p className="text-sm text-foreground">{selectedEds.parameters?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Connections</p>
              <p className="text-sm text-foreground">{selectedEds.connections?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ports</p>
              <p className="text-sm text-foreground">{selectedEds.ports?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {selectedEds.description && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-sm">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{selectedEds.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Home URL */}
      {selectedEds.home_url && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-sm">Manufacturer Website</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={selectedEds.home_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-green hover:text-accent underline"
            >
              {selectedEds.home_url}
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Parameters Tab Component
const ParametersTab = ({ selectedEds, groups, comparisonMode = false, parameterDiffs = new Map() }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [expandedCategories, setExpandedCategories] = useState(new Set(['network_timing', 'io_assembly', 'connection_points']));
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'flat'
  const [groupingMode, setGroupingMode] = useState(groups && groups.length > 0 ? 'eds_groups' : 'auto'); // 'auto' or 'eds_groups'

  // Group parameters by category (auto-categorization)
  const groupedParams = groupParametersByCategory(selectedEds.parameters || []);
  const sortedCategories = getSortedCategories(groupedParams, false);

  // Group parameters by EDS-defined groups
  const groupedByEdsGroups = React.useMemo(() => {
    if (!groups || groups.length === 0) return {};

    const result = {};
    const paramMap = new Map((selectedEds.parameters || []).map(p => [p.param_number, p]));

    groups.forEach(group => {
      const groupParams = (group.parameter_numbers || [])
        .map(num => paramMap.get(num))
        .filter(p => p !== undefined);

      if (groupParams.length > 0) {
        result[group.group_name] = groupParams;
      }
    });

    // Add ungrouped parameters
    const groupedParamNumbers = new Set(
      groups.flatMap(g => g.parameter_numbers || [])
    );
    const ungroupedParams = (selectedEds.parameters || []).filter(
      p => !groupedParamNumbers.has(p.param_number)
    );

    if (ungroupedParams.length > 0) {
      result['Ungrouped'] = ungroupedParams;
    }

    return result;
  }, [selectedEds.parameters, groups]);

  // Determine which grouping to use
  const categoriesToUse = groupingMode === 'eds_groups' ? groupedByEdsGroups : groupedParams;
  const sortedCategoriesToUse = groupingMode === 'eds_groups'
    ? Object.keys(groupedByEdsGroups)
    : sortedCategories;

  // Filter by search term
  const filterBySearch = (params) => {
    if (!searchTerm) return params;
    const term = searchTerm.toLowerCase();
    return params.filter(param =>
      param.param_name?.toLowerCase().includes(term) ||
      param.description?.toLowerCase().includes(term) ||
      param.help_string_2?.toLowerCase().includes(term)
    );
  };

  // Filter by selected categories
  const filterByCategories = (categories) => {
    if (selectedCategories.size === 0) return categories;
    return categories.filter(cat => selectedCategories.has(cat.category.id));
  };

  // Get filtered categories
  const filteredCategories = groupingMode === 'eds_groups'
    ? Object.entries(categoriesToUse)
        .filter(([name]) => selectedCategories.size === 0 || selectedCategories.has(name))
        .map(([name, params]) => ({
          category: {
            id: name,
            name: name,
            icon: Database, // Use generic icon for EDS groups
            color: 'blue',
            description: `EDS-defined parameter group`
          },
          parameters: filterBySearch(params)
        }))
        .filter(cat => cat.parameters.length > 0)
    : filterByCategories(sortedCategories).map(cat => ({
        ...cat,
        parameters: filterBySearch(cat.parameters)
      })).filter(cat => cat.parameters.length > 0);

  // Count total filtered parameters
  const totalFiltered = filteredCategories.reduce((sum, cat) => sum + cat.parameters.length, 0);
  const totalParams = selectedEds.parameters?.length || 0;

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Toggle category filter
  const toggleCategoryFilter = (categoryId) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  // Export parameters to JSON
  const exportToJSON = () => {
    const params = filteredCategories.flatMap(cat => cat.parameters);
    const dataStr = JSON.stringify(params, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedEds.product_name || 'device'}_parameters.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export parameters to CSV
  const exportToCSV = () => {
    const params = filteredCategories.flatMap(cat => cat.parameters);
    const headers = ['Number', 'Name', 'Type', 'Default', 'Min', 'Max', 'Units', 'Description'];
    const rows = params.map(p => [
      p.param_number || '',
      p.param_name || '',
      p.data_type || '',
      p.default_value || '',
      p.min_value || '',
      p.max_value || '',
      p.description || '',
      p.help_string_2 || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedEds.product_name || 'device'}_parameters.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder={`Search ${totalParams} parameters...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[300px] px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-green"
        />

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-secondary text-foreground">
            {totalFiltered} / {totalParams}
          </Badge>

          <Button
            onClick={exportToJSON}
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:bg-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>

          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="border-border text-foreground hover:bg-secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>

          {groups && groups.length > 0 && (
            <Button
              onClick={() => setGroupingMode(groupingMode === 'auto' ? 'eds_groups' : 'auto')}
              variant="outline"
              size="sm"
              className={`border-border hover:bg-secondary ${
                groupingMode === 'eds_groups'
                  ? 'bg-primary/30 text-primary border-primary'
                  : 'text-foreground'
              }`}
            >
              <Database className="w-4 h-4 mr-2" />
              {groupingMode === 'eds_groups' ? 'EDS Groups' : 'Auto Groups'}
            </Button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      {sortedCategories.length > 1 && (
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter by category:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sortedCategories.map(({ category, count }) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategories.size === 0 || selectedCategories.has(category.id);

              return (
                <button
                  key={category.id}
                  onClick={() => toggleCategoryFilter(category.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                    isSelected
                      ? `${getCategoryBadgeColor(category.color)} border-current`
                      : 'bg-secondary/50 text-muted-foreground border-border hover:border-border'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{category.name}</span>
                  <Badge variant="secondary" className="text-xs bg-card/50">
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Grouped Parameters */}
      {filteredCategories.length > 0 ? (
        <div className="space-y-4">
          {filteredCategories.map(({ category, parameters }) => {
            const IconComponent = category.icon;
            const isExpanded = expandedCategories.has(category.id);

            return (
              <Card key={category.id} className="bg-card border-border">
                <CardHeader
                  className="cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 ${getCategoryIconColor(category.color)}`} />
                      <div>
                        <CardTitle className="text-foreground text-base">
                          {category.name}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm mt-1">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getCategoryBadgeColor(category.color)}>
                        {parameters.length} {parameters.length === 1 ? 'parameter' : 'parameters'}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-3 border-t border-border pt-4">
                    {parameters.map((param, index) => {
                      const diff = comparisonMode ? parameterDiffs.get(param.param_number) : null;
                      return (
                        <ParameterCard
                          key={index}
                          param={param}
                          category={category}
                          usedByConnections={[]}
                          diff={diff}
                          comparisonMode={comparisonMode}
                        />
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-card border-border p-8">
          <div className="text-center text-muted-foreground">
            {searchTerm || selectedCategories.size > 0
              ? 'No parameters match your filters'
              : 'No parameters available'}
          </div>
        </Card>
      )}
    </div>
  );
};

// Connections Tab Component
const ConnectionsTab = ({ selectedEds }) => {
  const [expandedConnections, setExpandedConnections] = useState(new Set());

  const toggleConnection = (index) => {
    const newExpanded = new Set(expandedConnections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedConnections(newExpanded);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {selectedEds.connections && selectedEds.connections.length > 0 ? (
          selectedEds.connections.map((conn, index) => {
            const isExpanded = expandedConnections.has(index);
            const triggerDecoded = decodeTriggerTransport(conn.trigger_transport);
            const paramsDecoded = decodeConnectionParams(conn.connection_params);
            const summary = getConnectionSummary(conn.trigger_transport, conn.connection_params);

            return (
              <Card key={index} className="bg-card border-border">
                <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => toggleConnection(index)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-success" />
                      <div>
                        <CardTitle className="text-foreground text-base">
                          {conn.connection_name || `Connection ${conn.connection_number || index + 1}`}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm mt-1">
                          {summary}
                        </CardDescription>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 border-t border-border pt-4">
                    {/* Trigger/Transport Breakdown */}
                    {triggerDecoded && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-secondary" />
                          <h4 className="text-sm font-semibold text-foreground">Trigger/Transport</h4>
                          <Badge variant="outline" className="ml-auto text-xs font-mono">{triggerDecoded.rawValue}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                          <div className="bg-background rounded-lg p-3 border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Transport Classes (bits 0-15)</div>
                            <div className="text-sm text-foreground">{triggerDecoded.transportClasses.description}</div>
                            <div className="text-xs text-muted-foreground mt-1 font-mono">{triggerDecoded.transportClasses.hex}</div>
                          </div>

                          <div className="bg-background rounded-lg p-3 border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Trigger Types (bits 16-23)</div>
                            <div className="text-sm text-foreground">{triggerDecoded.triggers.description}</div>
                            <div className="flex gap-2 mt-2">
                              {triggerDecoded.triggers.cyclic && <Badge className="text-xs bg-success/50 text-success">Cyclic</Badge>}
                              {triggerDecoded.triggers.changeOfState && <Badge className="text-xs bg-primary/50 text-primary">COS</Badge>}
                              {triggerDecoded.triggers.application && <Badge className="text-xs bg-secondary/50 text-secondary">App</Badge>}
                            </div>
                          </div>

                          <div className="bg-background rounded-lg p-3 border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Application Types (bits 24-27)</div>
                            <div className="text-sm text-foreground">{triggerDecoded.applicationTypes.description}</div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {triggerDecoded.applicationTypes.listenOnly && <Badge className="text-xs bg-warning/20 text-warning">Listen-Only</Badge>}
                              {triggerDecoded.applicationTypes.inputOnly && <Badge className="text-xs bg-warning/20 text-warning">Input-Only</Badge>}
                              {triggerDecoded.applicationTypes.exclusiveOwner && <Badge className="text-xs bg-error/20 text-error">Exclusive Owner</Badge>}
                              {triggerDecoded.applicationTypes.redundantOwner && <Badge className="text-xs bg-accent/50 text-accent">Redundant Owner</Badge>}
                            </div>
                          </div>

                          <div className="bg-background rounded-lg p-3 border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Direction (bit 31)</div>
                            <div className="text-sm text-foreground">{triggerDecoded.direction.description}</div>
                            <Badge className={`text-xs mt-2 ${triggerDecoded.direction.isServer ? 'bg-secondary/50 text-secondary' : 'bg-brand-green/50 text-brand-green'}`}>
                              {triggerDecoded.direction.isServer ? 'Server' : 'Client'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Connection Parameters Breakdown */}
                    {paramsDecoded && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-primary" />
                          <h4 className="text-sm font-semibold text-foreground">Connection Parameters</h4>
                          <Badge variant="outline" className="ml-auto text-xs font-mono">{paramsDecoded.rawValue}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                          <div className="bg-background rounded-lg p-3 border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Size Support (bits 0-3)</div>
                            <div className="text-sm text-foreground">{paramsDecoded.sizeSupport.description}</div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {paramsDecoded.sizeSupport.oToTFixed && <Badge className="text-xs bg-success/50 text-success">O→T Fixed</Badge>}
                              {paramsDecoded.sizeSupport.oToTVariable && <Badge className="text-xs bg-brand-green/50 text-brand-green">O→T Var</Badge>}
                              {paramsDecoded.sizeSupport.tToOFixed && <Badge className="text-xs bg-primary/50 text-primary">T→O Fixed</Badge>}
                              {paramsDecoded.sizeSupport.tToOVariable && <Badge className="text-xs bg-primary/50 text-primary">T→O Var</Badge>}
                            </div>
                          </div>

                          <div className="bg-background rounded-lg p-3 border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Real-Time Format (bits 8-14)</div>
                            <div className="text-sm text-foreground">{paramsDecoded.realTimeFormat.description}</div>
                          </div>

                          <div className="bg-background rounded-lg p-3 border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Connection Types (bits 16-23)</div>
                            <div className="text-sm text-foreground">{paramsDecoded.connectionTypes.description}</div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div className="text-xs">
                                <div className="text-muted-foreground mb-1">O→T:</div>
                                {paramsDecoded.connectionTypes.oToT.multicast && <Badge className="text-xs bg-secondary/50 text-secondary mr-1">Multicast</Badge>}
                                {paramsDecoded.connectionTypes.oToT.pointToPoint && <Badge className="text-xs bg-accent/50 text-accent">P2P</Badge>}
                              </div>
                              <div className="text-xs">
                                <div className="text-muted-foreground mb-1">T→O:</div>
                                {paramsDecoded.connectionTypes.tToO.multicast && <Badge className="text-xs bg-secondary/50 text-secondary mr-1">Multicast</Badge>}
                                {paramsDecoded.connectionTypes.tToO.pointToPoint && <Badge className="text-xs bg-accent/50 text-accent">P2P</Badge>}
                              </div>
                            </div>
                          </div>

                          <div className="bg-background rounded-lg p-3 border border-border">
                            <div className="text-xs text-muted-foreground mb-1">Priority Levels (bits 24-31)</div>
                            <div className="text-sm text-foreground">{paramsDecoded.priority.description}</div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div className="text-xs">
                                <div className="text-muted-foreground mb-1">O→T:</div>
                                {paramsDecoded.priority.oToT.low && <Badge className="text-xs bg-muted text-muted-foreground mr-1">Low</Badge>}
                                {paramsDecoded.priority.oToT.high && <Badge className="text-xs bg-warning/20 text-warning mr-1">High</Badge>}
                                {paramsDecoded.priority.oToT.scheduled && <Badge className="text-xs bg-error/20 text-error">Sched</Badge>}
                              </div>
                              <div className="text-xs">
                                <div className="text-muted-foreground mb-1">T→O:</div>
                                {paramsDecoded.priority.tToO.low && <Badge className="text-xs bg-muted text-muted-foreground mr-1">Low</Badge>}
                                {paramsDecoded.priority.tToO.high && <Badge className="text-xs bg-warning/20 text-warning mr-1">High</Badge>}
                                {paramsDecoded.priority.tToO.scheduled && <Badge className="text-xs bg-error/20 text-error">Sched</Badge>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Help String */}
                    {conn.help_string && (
                      <div className="bg-surface rounded-lg p-3 border border-border">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-primary mt-0.5" />
                          <div>
                            <div className="text-xs text-primary font-semibold mb-1">Description</div>
                            <p className="text-sm text-foreground">{conn.help_string}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Assembly References */}
                    {(conn.o_to_t_params || conn.t_to_o_params) && (
                      <div className="bg-surface rounded-lg p-3 border border-border">
                        <div className="flex items-start gap-2">
                          <Package className="w-4 h-4 text-success mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs text-success font-semibold mb-2">Assembly References</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              {conn.o_to_t_params && (
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">O→T (Output)</div>
                                  <div className="font-mono text-xs text-success">
                                    {conn.o_to_t_params}
                                  </div>
                                </div>
                              )}
                              {conn.t_to_o_params && (
                                <div>
                                  <div className="text-xs text-muted-foreground mb-1">T→O (Input)</div>
                                  <div className="font-mono text-xs text-brand-green">
                                    {conn.t_to_o_params}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Raw Values for Reference */}
                    {conn.trigger_transport_comment && (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer hover:text-muted-foreground">Show raw bit descriptions</summary>
                        <div className="mt-2 p-3 bg-background rounded border border-border font-mono whitespace-pre-wrap">
                          {conn.trigger_transport_comment}
                        </div>
                      </details>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="p-8 text-center text-muted-foreground">
              No connections available
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Capacity Tab Component
const CapacityTab = ({ selectedEds }) => {
  const capacity = selectedEds.capacity;

  return (
    <div className="space-y-6">
      {/* Capacity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-secondary/20 to-secondary/10 border-secondary/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary mb-1">Max Message Connections</p>
                <p className="text-3xl font-bold text-foreground">{capacity?.max_msg_connections ?? 'N/A'}</p>
              </div>
              <Server className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/20 to-success/10 border-success/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-success mb-1">Max I/O Producers</p>
                <p className="text-3xl font-bold text-foreground">{capacity?.max_io_producers ?? 'N/A'}</p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary mb-1">Max I/O Consumers</p>
                <p className="text-3xl font-bold text-foreground">{capacity?.max_io_consumers ?? 'N/A'}</p>
              </div>
              <ArrowDownRight className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-brand-green/20 to-brand-green/10 border-brand-green/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-green mb-1">Max Config Tool Conn</p>
                <p className="text-3xl font-bold text-foreground">{capacity?.max_cx_per_config_tool ?? 'N/A'}</p>
              </div>
              <Users className="w-8 h-8 text-brand-green" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TSpecs */}
      {capacity?.tspecs && capacity.tspecs.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Activity className="w-5 h-5 mr-2 text-secondary" />
              Bandwidth Specifications (TSpecs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capacity.tspecs.map((tspec, index) => (
                <div key={index} className="p-4 bg-secondary rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-secondary/50 text-secondary border-secondary">
                      {tspec.tspec_name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{tspec.direction}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Data Size</p>
                      <p className="text-foreground font-semibold">{tspec.data_size} bytes</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Rate</p>
                      <p className="text-foreground font-semibold">{tspec.rate} ms</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No capacity data message */}
      {!capacity && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center text-muted-foreground">
            No capacity data available for this device
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Raw Content Tab Component
const RawContentTab = ({ selectedEds }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (selectedEds.eds_content) {
      navigator.clipboard.writeText(selectedEds.eds_content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Raw EDS File Content</h3>
        <Button
          onClick={handleCopy}
          variant="outline"
          className="border-border text-foreground hover:bg-secondary"
        >
          <Code className="w-4 h-4 mr-2" />
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
      </div>

      <Card className="bg-background border-border">
        <CardContent className="p-0">
          <div className="relative">
            <pre className="p-6 overflow-auto max-h-[70vh] text-xs leading-relaxed">
              <code className="text-foreground font-mono">
                {selectedEds.eds_content || '// No raw content available'}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        This is the raw EDS file content as it was uploaded. Line count: {selectedEds.eds_content?.split('\n').length || 0}
      </p>
    </div>
  );
};


// Differences Tab Component
const DifferencesTab = ({ parameterDiffs, previousRevisionData, selectedEds }) => {
  if (!previousRevisionData || parameterDiffs.size === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <h3 className="text-xl font-semibold mb-2 text-foreground">No Differences Found</h3>
          <p className="text-muted-foreground">
            {!previousRevisionData
              ? 'Enable comparison mode and select different revisions to view differences'
              : 'The selected revisions have identical parameters'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Organize differences by type
  const added = [];
  const removed = [];
  const modified = [];

  parameterDiffs.forEach((diff, paramNumber) => {
    if (diff.type === 'added') {
      added.push({ ...diff, paramNumber });
    } else if (diff.type === 'removed') {
      removed.push({ ...diff, paramNumber });
    } else if (diff.type === 'modified') {
      modified.push({ ...diff, paramNumber });
    }
  });

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/30">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Revision Comparison Summary
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            Comparing <strong>v{previousRevisionData.major_revision}.{previousRevisionData.minor_revision}</strong> with{' '}
            <strong>v{selectedEds.major_revision}.{selectedEds.minor_revision}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-success/10 border border-success/30 rounded-lg">
              <div className="text-3xl font-bold text-success">{added.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Added Parameters</div>
            </div>
            <div className="text-center p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <div className="text-3xl font-bold text-warning">{modified.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Modified Parameters</div>
            </div>
            <div className="text-center p-4 bg-error/10 border border-error/30 rounded-lg">
              <div className="text-3xl font-bold text-error">{removed.length}</div>
              <div className="text-sm text-muted-foreground mt-1">Removed Parameters</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Added Parameters */}
      {added.length > 0 && (
        <Card className="bg-card border-success/30">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Badge className="bg-success/20 text-success">+{added.length}</Badge>
              Added Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {added.map((diff, index) => (
              <div key={index} className="p-4 bg-success/5 border border-success/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">
                    {diff.current.param_name || `Parameter ${diff.paramNumber}`}
                  </span>
                  <Badge className="bg-success/20 text-success text-xs">NEW</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 text-foreground">{diff.current.data_type || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Default:</span>
                    <span className="ml-2 text-foreground">{diff.current.default_value ?? 'N/A'}</span>
                  </div>
                </div>
                {diff.current.description && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {diff.current.description}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Modified Parameters */}
      {modified.length > 0 && (
        <Card className="bg-card border-warning/30">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Badge className="bg-warning/20 text-warning">~{modified.length}</Badge>
              Modified Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {modified.map((diff, index) => (
              <div key={index} className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">
                    {diff.current.param_name || `Parameter ${diff.paramNumber}`}
                  </span>
                  <Badge className="bg-warning/20 text-warning text-xs">MODIFIED</Badge>
                </div>
                <div className="space-y-2">
                  {diff.changes.map((change, changeIndex) => (
                    <div key={changeIndex} className="text-sm">
                      <div className="text-muted-foreground font-medium mb-1 capitalize">
                        {change.field.replace(/_/g, ' ')}:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-error/10 border border-error/20 rounded">
                          <div className="text-xs text-error font-medium mb-1">Before:</div>
                          <div className="text-foreground break-words">{change.previous ?? 'N/A'}</div>
                        </div>
                        <div className="p-2 bg-success/10 border border-success/20 rounded">
                          <div className="text-xs text-success font-medium mb-1">After:</div>
                          <div className="text-foreground break-words">{change.current ?? 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Removed Parameters */}
      {removed.length > 0 && (
        <Card className="bg-card border-error/30">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Badge className="bg-error/20 text-error">-{removed.length}</Badge>
              Removed Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {removed.map((diff, index) => (
              <div key={index} className="p-4 bg-error/5 border border-error/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">
                    {diff.previous.param_name || `Parameter ${diff.paramNumber}`}
                  </span>
                  <Badge className="bg-error/20 text-error text-xs">REMOVED</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 text-foreground">{diff.previous.data_type || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Default:</span>
                    <span className="ml-2 text-foreground">{diff.previous.default_value ?? 'N/A'}</span>
                  </div>
                </div>
                {diff.previous.description && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {diff.previous.description}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* PQA Analysis Modal */}
      {pqaMetrics && (
        <PQAAnalysisModal
          isOpen={showPqaModal}
          onClose={() => setShowPqaModal(false)}
          metricId={pqaMetrics.id}
          API_BASE={API_BASE}
        />
      )}
    </div>
  );
};

export default EDSDetailsView;
