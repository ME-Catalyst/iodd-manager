import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Card, CardContent, Button, Input, Label, Dialog, DialogContent,
  DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui';
import {
  Upload, Trash2, Search, Filter, Grid3x3, List, Package,
  ChevronLeft, ChevronRight, FolderOpen
} from 'lucide-react';
import DeviceListItem from '@/components/devices/DeviceListItem';
import DeviceGridCard from '@/components/devices/DeviceGridCard';

const DeviceListPage = ({ devices, onDeviceSelect, onUpload, onUploadFolder, API_BASE, toast, onDevicesChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    vendors: [],
    hasImages: false,
    ioddVersion: [],
  });
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

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
  }, [searchQuery, filters]);

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
              <div className="p-4 border border-border rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">Advanced Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({ vendors: [], hasImages: false, ioddVersion: [] })}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-foreground text-sm mb-2">Vendor</Label>
                    <div className="space-y-2 mt-2">
                      {vendors.map((vendor) => (
                        <label key={vendor} className="flex items-center space-x-2 text-sm text-foreground">
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
                            className="rounded border-border bg-muted"
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

export default DeviceListPage;
