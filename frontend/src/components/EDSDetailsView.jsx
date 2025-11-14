import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ArrowLeft, Download, FileText, Server, ArrowUpRight, ArrowDownRight,
  Users, Activity, Clock, Package, Code, Database, FileCode, ChevronDown, ChevronRight, Info, Filter, Boxes, Network, Cpu
} from 'lucide-react';
import AssembliesSection from './AssembliesSection';
import PortsSection from './PortsSection';
import ModulesSection from './ModulesSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { decodeTriggerTransport, decodeConnectionParams, getConnectionSummary } from '@/utils/edsConnectionDecoder';
import ParameterCard from './ParameterCard';
import { groupParametersByCategory, getSortedCategories, getCategoryBadgeColor, getCategoryIconColor } from '../utils/edsParameterCategorizer';

const EDSDetailsView = ({ selectedEds: initialEds, onBack, onExportJSON, onExportZIP, API_BASE }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [availableRevisions, setAvailableRevisions] = useState([]);
  const [selectedRevisionId, setSelectedRevisionId] = useState(initialEds.id);
  const [selectedEds, setSelectedEds] = useState(initialEds);
  const [loadingRevision, setLoadingRevision] = useState(false);
  const [groups, setGroups] = useState([]);

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

  // Load a different revision when selected
  const handleRevisionChange = async (revisionId) => {
    if (revisionId === selectedRevisionId) return;

    setLoadingRevision(true);
    try {
      const response = await axios.get(`${API_BASE}/api/eds/${revisionId}`);
      setSelectedEds(response.data);
      setSelectedRevisionId(revisionId);
    } catch (error) {
      console.error('Failed to load revision:', error);
    } finally {
      setLoadingRevision(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'parameters', label: `Parameters (${selectedEds.parameters?.length || 0})`, icon: Database },
    { id: 'connections', label: `Connections (${selectedEds.connections?.length || 0})`, icon: Activity },
    { id: 'assemblies', label: 'Assemblies', icon: Boxes },
    { id: 'ports', label: 'Ports', icon: Network },
    { id: 'modules', label: 'Modules', icon: Cpu },
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
          className="text-slate-400 hover:text-white"
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
              <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-slate-300">
                <SelectValue>
                  {loadingRevision ? 'Loading...' : `Revision: v${selectedEds.major_revision}.${selectedEds.minor_revision}`}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {availableRevisions.map((rev) => (
                  <SelectItem
                    key={rev.id}
                    value={rev.id.toString()}
                    className="text-slate-300 focus:bg-slate-700"
                  >
                    {rev.revision_string}
                    {rev.import_date && ` (${new Date(rev.import_date).toLocaleDateString()})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button
            onClick={onExportJSON}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button
            onClick={onExportZIP}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export ZIP
          </Button>
        </div>
      </div>

      {/* Product Header Card */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
              <img
                src={`${API_BASE}/api/eds/${selectedEds.id}/icon`}
                alt={selectedEds.product_name || 'Device'}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <FileText className="w-8 h-8 text-purple-400" style={{display: 'none'}} />
            </div>
            <div className="flex-1">
              <CardTitle className="text-white text-2xl">{selectedEds.product_name || 'Unknown Product'}</CardTitle>
              <CardDescription className="text-slate-400 mt-1 flex items-center gap-2">
                <span>{selectedEds.vendor_name || 'Unknown Vendor'}</span>
                <span>•</span>
                <span>{selectedEds.catalog_number || 'N/A'}</span>
                <span>•</span>
                <span>Rev {selectedEds.major_revision}.{selectedEds.minor_revision}</span>
              </CardDescription>
            </div>
            {/* Quick stats */}
            <div className="hidden md:flex gap-4">
              {selectedEds.capacity && selectedEds.capacity.max_msg_connections && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{selectedEds.capacity.max_msg_connections}</div>
                  <div className="text-xs text-slate-500">Msg Conn</div>
                </div>
              )}
              {selectedEds.capacity && selectedEds.capacity.max_io_producers && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{selectedEds.capacity.max_io_producers}</div>
                  <div className="text-xs text-slate-500">IO Prod</div>
                </div>
              )}
              {selectedEds.capacity && selectedEds.capacity.max_io_consumers && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{selectedEds.capacity.max_io_consumers}</div>
                  <div className="text-xs text-slate-500">IO Cons</div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-slate-800">
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
                    ? 'border-purple-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700'
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
        {activeTab === 'parameters' && <ParametersTab selectedEds={selectedEds} groups={groups} />}
        {activeTab === 'connections' && <ConnectionsTab selectedEds={selectedEds} />}
        {activeTab === 'assemblies' && <AssembliesSection edsId={selectedEds.id} />}
        {activeTab === 'ports' && <PortsSection edsId={selectedEds.id} />}
        {activeTab === 'modules' && <ModulesSection edsId={selectedEds.id} />}
        {activeTab === 'capacity' && <CapacityTab selectedEds={selectedEds} />}
        {activeTab === 'raw' && <RawContentTab selectedEds={selectedEds} />}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ selectedEds }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center">
              <Clock className="w-4 h-4 mr-2 text-purple-400" />
              File History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-slate-500">Created</p>
              <p className="text-sm text-white">{selectedEds.create_date || 'N/A'} {selectedEds.create_time || ''}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Modified</p>
              <p className="text-sm text-white">{selectedEds.mod_date || 'N/A'} {selectedEds.mod_time || ''}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">File Revision</p>
              <p className="text-sm text-white">{selectedEds.file_revision || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center">
              <FileText className="w-4 h-4 mr-2 text-blue-400" />
              Device Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-slate-500">Class 1</p>
              <p className="text-sm text-white">{selectedEds.class1 || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Class 2</p>
              <p className="text-sm text-white">{selectedEds.class2 || 'N/A'}</p>
            </div>
            {selectedEds.class3 && (
              <div>
                <p className="text-xs text-slate-500">Class 3</p>
                <p className="text-sm text-white">{selectedEds.class3}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center">
              <Database className="w-4 h-4 mr-2 text-green-400" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-slate-500">Parameters</p>
              <p className="text-sm text-white">{selectedEds.parameters?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Connections</p>
              <p className="text-sm text-white">{selectedEds.connections?.length || 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Ports</p>
              <p className="text-sm text-white">{selectedEds.ports?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {selectedEds.description && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">{selectedEds.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Home URL */}
      {selectedEds.home_url && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">Manufacturer Website</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={selectedEds.home_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
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
const ParametersTab = ({ selectedEds, groups }) => {
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
          className="flex-1 min-w-[300px] px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-slate-800 text-slate-300">
            {totalFiltered} / {totalParams}
          </Badge>

          <Button
            onClick={exportToJSON}
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>

          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>

          {groups && groups.length > 0 && (
            <Button
              onClick={() => setGroupingMode(groupingMode === 'auto' ? 'eds_groups' : 'auto')}
              variant="outline"
              size="sm"
              className={`border-slate-700 hover:bg-slate-800 ${
                groupingMode === 'eds_groups'
                  ? 'bg-blue-900/30 text-blue-300 border-blue-700'
                  : 'text-slate-300'
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
        <Card className="bg-slate-900 border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">Filter by category:</span>
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
                      : 'bg-slate-800/50 text-slate-500 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm">{category.name}</span>
                  <Badge variant="secondary" className="text-xs bg-slate-900/50">
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
              <Card key={category.id} className="bg-slate-900 border-slate-800">
                <CardHeader
                  className="cursor-pointer hover:bg-slate-800/50 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 ${getCategoryIconColor(category.color)}`} />
                      <div>
                        <CardTitle className="text-white text-base">
                          {category.name}
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm mt-1">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getCategoryBadgeColor(category.color)}>
                        {parameters.length} {parameters.length === 1 ? 'parameter' : 'parameters'}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-3 border-t border-slate-800 pt-4">
                    {parameters.map((param, index) => (
                      <ParameterCard
                        key={index}
                        param={param}
                        category={category}
                        usedByConnections={[]}
                      />
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-slate-900 border-slate-800 p-8">
          <div className="text-center text-slate-500">
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
              <Card key={index} className="bg-slate-900 border-slate-800">
                <CardHeader className="cursor-pointer hover:bg-slate-800/50 transition-colors" onClick={() => toggleConnection(index)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-green-400" />
                      <div>
                        <CardTitle className="text-white text-base">
                          {conn.connection_name || `Connection ${conn.connection_number || index + 1}`}
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-sm mt-1">
                          {summary}
                        </CardDescription>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 border-t border-slate-800 pt-4">
                    {/* Trigger/Transport Breakdown */}
                    {triggerDecoded && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-purple-400" />
                          <h4 className="text-sm font-semibold text-purple-300">Trigger/Transport</h4>
                          <Badge variant="outline" className="ml-auto text-xs font-mono">{triggerDecoded.rawValue}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                            <div className="text-xs text-slate-500 mb-1">Transport Classes (bits 0-15)</div>
                            <div className="text-sm text-slate-200">{triggerDecoded.transportClasses.description}</div>
                            <div className="text-xs text-slate-600 mt-1 font-mono">{triggerDecoded.transportClasses.hex}</div>
                          </div>

                          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                            <div className="text-xs text-slate-500 mb-1">Trigger Types (bits 16-23)</div>
                            <div className="text-sm text-slate-200">{triggerDecoded.triggers.description}</div>
                            <div className="flex gap-2 mt-2">
                              {triggerDecoded.triggers.cyclic && <Badge className="text-xs bg-green-900/50 text-green-300">Cyclic</Badge>}
                              {triggerDecoded.triggers.changeOfState && <Badge className="text-xs bg-blue-900/50 text-blue-300">COS</Badge>}
                              {triggerDecoded.triggers.application && <Badge className="text-xs bg-purple-900/50 text-purple-300">App</Badge>}
                            </div>
                          </div>

                          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                            <div className="text-xs text-slate-500 mb-1">Application Types (bits 24-27)</div>
                            <div className="text-sm text-slate-200">{triggerDecoded.applicationTypes.description}</div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {triggerDecoded.applicationTypes.listenOnly && <Badge className="text-xs bg-yellow-900/50 text-yellow-300">Listen-Only</Badge>}
                              {triggerDecoded.applicationTypes.inputOnly && <Badge className="text-xs bg-orange-900/50 text-orange-300">Input-Only</Badge>}
                              {triggerDecoded.applicationTypes.exclusiveOwner && <Badge className="text-xs bg-red-900/50 text-red-300">Exclusive Owner</Badge>}
                              {triggerDecoded.applicationTypes.redundantOwner && <Badge className="text-xs bg-pink-900/50 text-pink-300">Redundant Owner</Badge>}
                            </div>
                          </div>

                          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                            <div className="text-xs text-slate-500 mb-1">Direction (bit 31)</div>
                            <div className="text-sm text-slate-200">{triggerDecoded.direction.description}</div>
                            <Badge className={`text-xs mt-2 ${triggerDecoded.direction.isServer ? 'bg-indigo-900/50 text-indigo-300' : 'bg-cyan-900/50 text-cyan-300'}`}>
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
                          <Database className="w-4 h-4 text-blue-400" />
                          <h4 className="text-sm font-semibold text-blue-300">Connection Parameters</h4>
                          <Badge variant="outline" className="ml-auto text-xs font-mono">{paramsDecoded.rawValue}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-6">
                          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                            <div className="text-xs text-slate-500 mb-1">Size Support (bits 0-3)</div>
                            <div className="text-sm text-slate-200">{paramsDecoded.sizeSupport.description}</div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {paramsDecoded.sizeSupport.oToTFixed && <Badge className="text-xs bg-emerald-900/50 text-emerald-300">O→T Fixed</Badge>}
                              {paramsDecoded.sizeSupport.oToTVariable && <Badge className="text-xs bg-teal-900/50 text-teal-300">O→T Var</Badge>}
                              {paramsDecoded.sizeSupport.tToOFixed && <Badge className="text-xs bg-sky-900/50 text-sky-300">T→O Fixed</Badge>}
                              {paramsDecoded.sizeSupport.tToOVariable && <Badge className="text-xs bg-blue-900/50 text-blue-300">T→O Var</Badge>}
                            </div>
                          </div>

                          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                            <div className="text-xs text-slate-500 mb-1">Real-Time Format (bits 8-14)</div>
                            <div className="text-sm text-slate-200">{paramsDecoded.realTimeFormat.description}</div>
                          </div>

                          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                            <div className="text-xs text-slate-500 mb-1">Connection Types (bits 16-23)</div>
                            <div className="text-sm text-slate-200">{paramsDecoded.connectionTypes.description}</div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div className="text-xs">
                                <div className="text-slate-500 mb-1">O→T:</div>
                                {paramsDecoded.connectionTypes.oToT.multicast && <Badge className="text-xs bg-violet-900/50 text-violet-300 mr-1">Multicast</Badge>}
                                {paramsDecoded.connectionTypes.oToT.pointToPoint && <Badge className="text-xs bg-fuchsia-900/50 text-fuchsia-300">P2P</Badge>}
                              </div>
                              <div className="text-xs">
                                <div className="text-slate-500 mb-1">T→O:</div>
                                {paramsDecoded.connectionTypes.tToO.multicast && <Badge className="text-xs bg-violet-900/50 text-violet-300 mr-1">Multicast</Badge>}
                                {paramsDecoded.connectionTypes.tToO.pointToPoint && <Badge className="text-xs bg-fuchsia-900/50 text-fuchsia-300">P2P</Badge>}
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                            <div className="text-xs text-slate-500 mb-1">Priority Levels (bits 24-31)</div>
                            <div className="text-sm text-slate-200">{paramsDecoded.priority.description}</div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div className="text-xs">
                                <div className="text-slate-500 mb-1">O→T:</div>
                                {paramsDecoded.priority.oToT.low && <Badge className="text-xs bg-gray-900/50 text-gray-300 mr-1">Low</Badge>}
                                {paramsDecoded.priority.oToT.high && <Badge className="text-xs bg-amber-900/50 text-amber-300 mr-1">High</Badge>}
                                {paramsDecoded.priority.oToT.scheduled && <Badge className="text-xs bg-red-900/50 text-red-300">Sched</Badge>}
                              </div>
                              <div className="text-xs">
                                <div className="text-slate-500 mb-1">T→O:</div>
                                {paramsDecoded.priority.tToO.low && <Badge className="text-xs bg-gray-900/50 text-gray-300 mr-1">Low</Badge>}
                                {paramsDecoded.priority.tToO.high && <Badge className="text-xs bg-amber-900/50 text-amber-300 mr-1">High</Badge>}
                                {paramsDecoded.priority.tToO.scheduled && <Badge className="text-xs bg-red-900/50 text-red-300">Sched</Badge>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Help String */}
                    {conn.help_string && (
                      <div className="bg-blue-950/20 rounded-lg p-3 border border-blue-900/30">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-blue-400 mt-0.5" />
                          <div>
                            <div className="text-xs text-blue-400 font-semibold mb-1">Description</div>
                            <p className="text-sm text-slate-300">{conn.help_string}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Assembly References */}
                    {(conn.o_to_t_params || conn.t_to_o_params) && (
                      <div className="bg-green-950/20 rounded-lg p-3 border border-green-900/30">
                        <div className="flex items-start gap-2">
                          <Package className="w-4 h-4 text-green-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs text-green-400 font-semibold mb-2">Assembly References</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              {conn.o_to_t_params && (
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">O→T (Output)</div>
                                  <div className="font-mono text-xs text-green-300">
                                    {conn.o_to_t_params}
                                  </div>
                                </div>
                              )}
                              {conn.t_to_o_params && (
                                <div>
                                  <div className="text-xs text-slate-500 mb-1">T→O (Input)</div>
                                  <div className="font-mono text-xs text-cyan-300">
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
                      <details className="text-xs text-slate-500">
                        <summary className="cursor-pointer hover:text-slate-400">Show raw bit descriptions</summary>
                        <div className="mt-2 p-3 bg-slate-950 rounded border border-slate-800 font-mono whitespace-pre-wrap">
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
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-8 text-center text-slate-500">
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
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300 mb-1">Max Message Connections</p>
                <p className="text-3xl font-bold text-white">{capacity?.max_msg_connections ?? 'N/A'}</p>
              </div>
              <Server className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300 mb-1">Max I/O Producers</p>
                <p className="text-3xl font-bold text-white">{capacity?.max_io_producers ?? 'N/A'}</p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300 mb-1">Max I/O Consumers</p>
                <p className="text-3xl font-bold text-white">{capacity?.max_io_consumers ?? 'N/A'}</p>
              </div>
              <ArrowDownRight className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border-cyan-800/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-300 mb-1">Max Config Tool Conn</p>
                <p className="text-3xl font-bold text-white">{capacity?.max_cx_per_config_tool ?? 'N/A'}</p>
              </div>
              <Users className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TSpecs */}
      {capacity?.tspecs && capacity.tspecs.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-purple-400" />
              Bandwidth Specifications (TSpecs)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capacity.tspecs.map((tspec, index) => (
                <div key={index} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-purple-900/50 text-purple-300 border-purple-800">
                      {tspec.tspec_name}
                    </Badge>
                    <span className="text-sm text-slate-400">{tspec.direction}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-slate-500">Data Size</p>
                      <p className="text-white font-semibold">{tspec.data_size} bytes</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Rate</p>
                      <p className="text-white font-semibold">{tspec.rate} ms</p>
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
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-8 text-center text-slate-500">
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
        <h3 className="text-lg font-semibold text-white">Raw EDS File Content</h3>
        <Button
          onClick={handleCopy}
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <Code className="w-4 h-4 mr-2" />
          {copied ? 'Copied!' : 'Copy to Clipboard'}
        </Button>
      </div>

      <Card className="bg-slate-950 border-slate-800">
        <CardContent className="p-0">
          <div className="relative">
            <pre className="p-6 overflow-auto max-h-[70vh] text-xs leading-relaxed">
              <code className="text-slate-300 font-mono">
                {selectedEds.eds_content || '// No raw content available'}
              </code>
            </pre>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-slate-500">
        This is the raw EDS file content as it was uploaded. Line count: {selectedEds.eds_content?.split('\n').length || 0}
      </p>
    </div>
  );
};

export default EDSDetailsView;
