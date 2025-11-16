import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, ChevronRight, Package, Settings, Link as LinkIcon, List, Hash, FileText, Tag } from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { Button, Badge } from './ui';

/**
 * Global search page for searching across all device data
 * Searches: devices, parameters, assemblies, connections, enums
 */
const SearchPage = ({ API_BASE, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [deviceTypeFilter, setDeviceTypeFilter] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const suggestionsTimeoutRef = useRef(null);

  // Advanced filters
  const [vendorFilter, setVendorFilter] = useState(null);
  const [availableVendors, setAvailableVendors] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [hasParametersFilter, setHasParametersFilter] = useState(false);
  const [hasAssembliesFilter, setHasAssembliesFilter] = useState(false);
  const [allDevices, setAllDevices] = useState([]);

  // Fetch all devices on mount
  useEffect(() => {
    const fetchAllDevices = async () => {
      setSearching(true);
      try {
        const [ioddResponse, edsResponse] = await Promise.all([
          axios.get(`${API_BASE}/api/iodd`),
          axios.get(`${API_BASE}/api/eds`)
        ]);

        const ioddDevices = ioddResponse.data.map(d => ({
          ...d,
          type: 'IODD',
          id: d.id,
          product_name: d.product_name,
          vendor_name: d.manufacturer,
          has_parameters: d.parameter_count > 0,
          has_assemblies: false
        }));

        const edsDevices = edsResponse.data.map(d => ({
          ...d,
          type: 'EDS',
          id: d.id,
          product_name: d.product_name,
          vendor_name: d.vendor_name,
          has_parameters: d.parameter_count > 0,
          has_assemblies: d.assembly_count > 0
        }));

        const devices = [...ioddDevices, ...edsDevices];
        setAllDevices(devices);

        // Extract unique vendors
        const vendors = [...new Set(devices.map(d => d.vendor_name).filter(Boolean))].sort();
        setAvailableVendors(vendors);

        // Set initial results to show all devices
        setResults({
          query: '',
          total_results: devices.length,
          eds_devices: edsDevices,
          iodd_devices: ioddDevices,
          parameters: [],
          assemblies: [],
          connections: [],
          enums: []
        });
      } catch (error) {
        console.error('Failed to fetch devices:', error);
      } finally {
        setSearching(false);
      }
    };

    fetchAllDevices();
  }, [API_BASE]);

  // Fetch search suggestions as user types
  useEffect(() => {
    if (searchQuery.length >= 1) {
      // Debounce suggestions
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }

      suggestionsTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await axios.get(`${API_BASE}/api/search/suggestions`, {
            params: { q: searchQuery, limit: 10 }
          });
          setSuggestions(response.data.suggestions);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
        }
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (suggestionsTimeoutRef.current) {
        clearTimeout(suggestionsTimeoutRef.current);
      }
    };
  }, [searchQuery, API_BASE]);

  // Apply client-side filters
  const applyFilters = (devices) => {
    let filtered = [...devices];

    // Device type filter
    if (deviceTypeFilter) {
      filtered = filtered.filter(d => d.type === deviceTypeFilter);
    }

    // Vendor filter
    if (vendorFilter) {
      filtered = filtered.filter(d => d.vendor_name === vendorFilter);
    }

    // Has parameters filter
    if (hasParametersFilter) {
      filtered = filtered.filter(d => d.has_parameters);
    }

    // Has assemblies filter
    if (hasAssembliesFilter) {
      filtered = filtered.filter(d => d.has_assemblies);
    }

    return filtered;
  };

  // Handle filter changes
  useEffect(() => {
    if (allDevices.length > 0 && !searchQuery) {
      // Apply filters to local devices when not searching
      const filtered = applyFilters(allDevices);
      const edsDevices = filtered.filter(d => d.type === 'EDS');
      const ioddDevices = filtered.filter(d => d.type === 'IODD');

      setResults({
        query: '',
        total_results: filtered.length,
        eds_devices: edsDevices,
        iodd_devices: ioddDevices,
        parameters: [],
        assemblies: [],
        connections: [],
        enums: []
      });
    }
  }, [deviceTypeFilter, vendorFilter, hasParametersFilter, hasAssembliesFilter, allDevices]);

  const handleSearch = async (query = searchQuery) => {
    if (query.length < 2) {
      // If clearing search, show all devices with current filters
      const filtered = applyFilters(allDevices);
      const edsDevices = filtered.filter(d => d.type === 'EDS');
      const ioddDevices = filtered.filter(d => d.type === 'IODD');

      setResults({
        query: '',
        total_results: filtered.length,
        eds_devices: edsDevices,
        iodd_devices: ioddDevices,
        parameters: [],
        assemblies: [],
        connections: [],
        enums: []
      });
      return;
    }

    setSearching(true);
    setShowSuggestions(false);

    try {
      const params = { q: query, limit: 50 };
      if (deviceTypeFilter) {
        params.device_type = deviceTypeFilter;
      }

      const response = await axios.get(`${API_BASE}/api/search`, { params });
      setResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults(null);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    handleSearch(suggestion.text);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    searchInputRef.current?.focus();

    // Reapply filters to show all devices
    const filtered = applyFilters(allDevices);
    const edsDevices = filtered.filter(d => d.type === 'EDS');
    const ioddDevices = filtered.filter(d => d.type === 'IODD');

    setResults({
      query: '',
      total_results: filtered.length,
      eds_devices: edsDevices,
      iodd_devices: ioddDevices,
      parameters: [],
      assemblies: [],
      connections: [],
      enums: []
    });
  };

  const clearAllFilters = () => {
    setDeviceTypeFilter(null);
    setVendorFilter(null);
    setHasParametersFilter(false);
    setHasAssembliesFilter(false);
    setSearchQuery('');

    // Show all devices
    const edsDevices = allDevices.filter(d => d.type === 'EDS');
    const ioddDevices = allDevices.filter(d => d.type === 'IODD');

    setResults({
      query: '',
      total_results: allDevices.length,
      eds_devices: edsDevices,
      iodd_devices: ioddDevices,
      parameters: [],
      assemblies: [],
      connections: [],
      enums: []
    });
  };

  const hasActiveFilters = deviceTypeFilter || vendorFilter || hasParametersFilter || hasAssembliesFilter;

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'eds_devices':
      case 'iodd_devices':
        return <Package className="w-5 h-5 text-blue-400" />;
      case 'parameters':
        return <Settings className="w-5 h-5 text-green-400" />;
      case 'assemblies':
        return <List className="w-5 h-5 text-purple-400" />;
      case 'connections':
        return <LinkIcon className="w-5 h-5 text-orange-400" />;
      case 'enums':
        return <Hash className="w-5 h-5 text-pink-400" />;
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getCategoryTitle = (category) => {
    switch (category) {
      case 'eds_devices':
        return 'EDS Devices';
      case 'iodd_devices':
        return 'IODD Devices';
      case 'parameters':
        return 'Parameters';
      case 'assemblies':
        return 'Assemblies';
      case 'connections':
        return 'Connections';
      case 'enums':
        return 'Enum Values';
      default:
        return category;
    }
  };

  const handleResultClick = (item, category) => {
    // Navigate to appropriate page based on result type
    if (category === 'eds_devices') {
      onNavigate('eds', item.id);
    } else if (category === 'iodd_devices') {
      onNavigate('iodd', item.id);
    } else if (category === 'parameters' || category === 'assemblies' || category === 'connections' || category === 'enums') {
      // Navigate to the parent device
      if (item.device_type === 'EDS') {
        onNavigate('eds', item.device_id);
      } else if (item.device_type === 'IODD') {
        onNavigate('iodd', item.device_id);
      }
    }
  };

  const highlightMatch = (text, query) => {
    if (!text || !query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-orange-500/30 text-orange-300">{part}</mark> : part
    );
  };

  const renderResultItem = (item, category) => {
    return (
      <div
        key={`${category}-${item.id}`}
        onClick={() => handleResultClick(item, category)}
        className="p-4 bg-secondary/50 border border-border rounded-lg hover:bg-secondary hover:border-border transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Device Name/Parameter Name */}
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-foreground font-medium truncate">
                {highlightMatch(
                  item.product_name || item.param_name || item.assembly_name || item.connection_name || item.param_name,
                  searchQuery
                )}
              </h4>
              {item.type && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  item.type === 'EDS' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                }`}>
                  {item.type}
                </span>
              )}
            </div>

            {/* Vendor/Device Info */}
            {(item.vendor_name || item.device_vendor) && (
              <p className="text-sm text-muted-foreground mb-1">
                {highlightMatch(item.vendor_name || item.device_vendor, searchQuery)}
                {(item.product_code || item.device_product_code) &&
                  ` • ${item.product_code || item.device_product_code}`}
              </p>
            )}

            {/* Parameter Details */}
            {category === 'parameters' && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Parameter #{item.param_number} • {item.device_name}</p>
                {item.description && (
                  <p className="text-muted-foreground">{highlightMatch(item.description, searchQuery)}</p>
                )}
                {(item.units || item.min_value || item.max_value) && (
                  <p>
                    {item.units && <span>Unit: {item.units}</span>}
                    {item.min_value != null && <span> • Min: {item.min_value}</span>}
                    {item.max_value != null && <span> • Max: {item.max_value}</span>}
                  </p>
                )}
              </div>
            )}

            {/* Assembly Details */}
            {category === 'assemblies' && (
              <div className="text-sm text-muted-foreground">
                <p>Assembly #{item.assembly_number} • {item.device_name}</p>
                {item.description && (
                  <p className="text-muted-foreground mt-1">{highlightMatch(item.description, searchQuery)}</p>
                )}
              </div>
            )}

            {/* Connection Details */}
            {category === 'connections' && (
              <div className="text-sm text-muted-foreground">
                <p>Connection #{item.connection_number} • {item.device_name}</p>
                <p className="text-muted-foreground">Type: {item.connection_type}</p>
              </div>
            )}

            {/* Enum Details */}
            {category === 'enums' && (
              <div className="text-sm text-muted-foreground">
                <p>Parameter #{item.param_number} • {item.device_name}</p>
                {item.enum_values && (
                  <p className="text-muted-foreground mt-1">{highlightMatch(item.enum_values, searchQuery)}</p>
                )}
              </div>
            )}

            {/* Generic Description */}
            {item.description && !['parameters', 'assemblies'].includes(category) && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {highlightMatch(item.description, searchQuery)}
              </p>
            )}
          </div>

          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-orange-400 transition-colors flex-shrink-0 ml-3" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Search className="w-8 h-8 text-orange-500" />
            Global Search
          </h1>
          <p className="text-muted-foreground">
            Search across all devices, parameters, assemblies, connections, and more
          </p>
        </div>

        {/* Search Bar */}
        <Card className="bg-card border-border mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Search devices, parameters, assemblies..."
                    className="w-full pl-10 pr-10 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}

                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-secondary border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-4 py-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                        >
                          <span className="text-foreground">{suggestion.text}</span>
                          <span className="text-xs text-muted-foreground capitalize">{suggestion.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleSearch()}
                  disabled={searching || searchQuery.length < 2}
                  className="bg-orange-600 hover:bg-orange-700 px-6"
                >
                  {searching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {/* Device Type Filter */}
              <div className="flex items-center gap-3 mt-4">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filter by type:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeviceTypeFilter(null)}
                    className={`px-3 py-1 text-sm rounded ${
                      deviceTypeFilter === null
                        ? 'bg-orange-600 text-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setDeviceTypeFilter('EDS')}
                    className={`px-3 py-1 text-sm rounded ${
                      deviceTypeFilter === 'EDS'
                        ? 'bg-blue-600 text-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    EDS
                  </button>
                  <button
                    onClick={() => setDeviceTypeFilter('IODD')}
                    className={`px-3 py-1 text-sm rounded ${
                      deviceTypeFilter === 'IODD'
                        ? 'bg-green-600 text-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    IODD
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Advanced filters:</span>
                  </div>

                  {/* Vendor Filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Vendor:</span>
                    <select
                      value={vendorFilter || ''}
                      onChange={(e) => setVendorFilter(e.target.value || null)}
                      className="px-3 py-1 text-sm bg-secondary border border-border rounded text-foreground focus:outline-none focus:border-orange-500"
                    >
                      <option value="">All Vendors</option>
                      {availableVendors.map(vendor => (
                        <option key={vendor} value={vendor}>{vendor}</option>
                      ))}
                    </select>
                  </div>

                  {/* Has Parameters Filter */}
                  <label className="flex items-center gap-2 px-3 py-1 bg-secondary border border-border rounded cursor-pointer hover:bg-muted">
                    <input
                      type="checkbox"
                      checked={hasParametersFilter}
                      onChange={(e) => setHasParametersFilter(e.target.checked)}
                      className="w-4 h-4 text-orange-600 bg-muted border-border rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-foreground">Has Parameters</span>
                  </label>

                  {/* Has Assemblies Filter */}
                  <label className="flex items-center gap-2 px-3 py-1 bg-secondary border border-border rounded cursor-pointer hover:bg-muted">
                    <input
                      type="checkbox"
                      checked={hasAssembliesFilter}
                      onChange={(e) => setHasAssembliesFilter(e.target.checked)}
                      className="w-4 h-4 text-orange-600 bg-muted border-border rounded focus:ring-orange-500"
                    />
                    <span className="text-sm text-foreground">Has Assemblies</span>
                  </label>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button
                      onClick={clearAllFilters}
                      variant="outline"
                      className="text-xs h-8"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear Filters
                    </Button>
                  )}
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-xs text-muted-foreground">Active:</span>
                    {deviceTypeFilter && (
                      <Badge variant="outline" className="text-xs">
                        Type: {deviceTypeFilter}
                        <button
                          onClick={() => setDeviceTypeFilter(null)}
                          className="ml-1 hover:text-red-400"
                        >
                          <X className="w-3 h-3 inline" />
                        </button>
                      </Badge>
                    )}
                    {vendorFilter && (
                      <Badge variant="outline" className="text-xs">
                        Vendor: {vendorFilter}
                        <button
                          onClick={() => setVendorFilter(null)}
                          className="ml-1 hover:text-red-400"
                        >
                          <X className="w-3 h-3 inline" />
                        </button>
                      </Badge>
                    )}
                    {hasParametersFilter && (
                      <Badge variant="outline" className="text-xs">
                        Has Parameters
                        <button
                          onClick={() => setHasParametersFilter(false)}
                          className="ml-1 hover:text-red-400"
                        >
                          <X className="w-3 h-3 inline" />
                        </button>
                      </Badge>
                    )}
                    {hasAssembliesFilter && (
                      <Badge variant="outline" className="text-xs">
                        Has Assemblies
                        <button
                          onClick={() => setHasAssembliesFilter(false)}
                          className="ml-1 hover:text-red-400"
                        >
                          <X className="w-3 h-3 inline" />
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {results.query ? (
                  <>{results.total_results} result{results.total_results !== 1 ? 's' : ''} for "{results.query}"</>
                ) : (
                  <>{results.total_results} device{results.total_results !== 1 ? 's' : ''} {hasActiveFilters ? '(filtered)' : ''}</>
                )}
              </h2>
              {results.has_more && (
                <span className="text-sm text-orange-400">
                  Showing first 50 results per category
                </span>
              )}
            </div>

            {/* No Results */}
            {results.total_results === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try different keywords or check your spelling
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Results by Category */}
            {Object.entries(results).map(([category, items]) => {
              if (category === 'query' || category === 'total_results' || category === 'has_more') return null;
              if (!Array.isArray(items) || items.length === 0) return null;

              return (
                <Card key={category} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-foreground">
                      {getCategoryIcon(category)}
                      {getCategoryTitle(category)}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({items.length} result{items.length !== 1 ? 's' : ''})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {items.map((item) => renderResultItem(item, category))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Loading State */}
        {!results && searching && (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading devices...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
