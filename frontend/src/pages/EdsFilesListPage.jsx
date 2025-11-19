import React, { useState, useMemo } from 'react';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription,
  Button, Badge, Input,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui';
import {
  Upload, Trash2, Search, Filter, ChevronRight, FileText, FolderOpen,
} from 'lucide-react';
import axios from 'axios';

// ============================================================================
// EDS Files List Page
// ============================================================================

const EdsFilesListPage = ({ edsFiles, onEdsSelect, onUpload, onUploadFolder, API_BASE, toast, onEdsFilesChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    vendors: [],
  });
  const [selectedEdsFiles, setSelectedEdsFiles] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const filteredEdsFiles = useMemo(() => {
    let result = edsFiles;

    if (searchQuery) {
      result = result.filter(e =>
        (e.product_name && e.product_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.vendor_name && e.vendor_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.catalog_number && e.catalog_number.toString().includes(searchQuery))
      );
    }

    if (filters.vendors.length > 0) {
      result = result.filter(e => filters.vendors.includes(e.vendor_name));
    }

    return result;
  }, [edsFiles, searchQuery, filters]);

  const vendors = useMemo(() => {
    const uniqueVendors = [...new Set(edsFiles.map(e => e.vendor_name).filter(Boolean))];
    return uniqueVendors.sort();
  }, [edsFiles]);

  const toggleEdsSelection = (edsId) => {
    setSelectedEdsFiles(prev =>
      prev.includes(edsId)
        ? prev.filter(id => id !== edsId)
        : [...prev, edsId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEdsFiles.length === filteredEdsFiles.length) {
      setSelectedEdsFiles([]);
    } else {
      setSelectedEdsFiles(filteredEdsFiles.map(e => e.id));
    }
  };

  const handleBatchDelete = async () => {
    setDeleting(true);
    const idsToDelete = [...selectedEdsFiles]; // Store before clearing
    console.log(`Deleting ${idsToDelete.length} EDS files:`, idsToDelete);

    try {
      const response = await axios.post(`${API_BASE}/api/eds/bulk-delete`, {
        eds_ids: idsToDelete
      });

      console.log('Delete response:', response.data);

      const deletedCount = response.data.deleted_count || idsToDelete.length;

      toast({
        title: 'EDS files deleted',
        description: `Successfully deleted ${deletedCount} EDS file(s).`,
      });

      setSelectedEdsFiles([]);
      setDeleteDialogOpen(false);

      // Refresh the EDS files list
      if (onEdsFilesChange) {
        await onEdsFilesChange();
      }
    } catch (error) {
      console.error('Failed to delete EDS files:', error);
      toast({
        title: 'Delete failed',
        description: error.response?.data?.detail || error.response?.data?.error || 'Failed to delete EDS files',
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
            <h2 className="text-2xl font-bold text-foreground">EDS Files</h2>
            <p className="text-muted-foreground mt-1">
              {selectedEdsFiles.length > 0 ? (
                <span>{selectedEdsFiles.length} selected of {filteredEdsFiles.length} file{filteredEdsFiles.length !== 1 ? 's' : ''}</span>
              ) : (
                <span>{filteredEdsFiles.length} EDS file{filteredEdsFiles.length !== 1 ? 's' : ''} found</span>
              )}
            </p>
          </div>
          {filteredEdsFiles.length > 0 && (
            <label htmlFor="select-all-eds-files" className="flex items-center space-x-2 text-foreground cursor-pointer">
              <input
                id="select-all-eds-files"
                type="checkbox"
                checked={selectedEdsFiles.length === filteredEdsFiles.length && filteredEdsFiles.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-border bg-secondary text-brand-green focus:ring-brand-green"
              />
              <span className="text-sm">Select all</span>
            </label>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {selectedEdsFiles.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              className="bg-error hover:bg-error/90"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </Button>
          )}
          <Button onClick={onUpload} className="bg-gradient-to-r from-brand-green to-brand-green hover:from-brand-green hover:to-brand-green">
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
          <Button onClick={onUploadFolder} className="bg-gradient-to-r from-secondary to-accent hover:from-secondary hover:to-accent">
            <FolderOpen className="w-4 h-4 mr-2" />
            Upload Folder
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <label htmlFor="eds-search" className="sr-only">Search EDS files</label>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            id="eds-search"
            placeholder="Search EDS files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
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
      </div>

      {/* EDS Files List */}
      <div className="space-y-2">
        {filteredEdsFiles.map((eds) => (
          <Card key={eds.id} className="bg-card border-border hover:border-border transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <input
                    id={`eds-file-${eds.id}`}
                    type="checkbox"
                    checked={selectedEdsFiles.includes(eds.id)}
                    onChange={() => toggleEdsSelection(eds.id)}
                    className="rounded border-border bg-secondary text-brand-green"
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${eds.product_name || 'device'}`}
                  />
                  <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center overflow-hidden">
                    <img
                      src={`${API_BASE}/api/eds/${eds.id}/icon`}
                      alt={eds.product_name || 'Device'}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        // Fallback to FileText icon if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <FileText className="w-6 h-6 text-secondary" style={{display: 'none'}} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {eds.product_name || 'Unknown Product'}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        v{eds.major_revision}.{eds.minor_revision}
                      </Badge>
                      {eds.revision_count > 1 && (
                        <Badge className="text-xs bg-secondary/50 text-foreground-secondary border-secondary">
                          {eds.revision_count} revisions
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {eds.vendor_name || 'Unknown Vendor'}
                      {eds.catalog_number && ` • Cat# ${eds.catalog_number}`}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdsSelect(eds)}
                  className="text-brand-green hover:text-brand-green"
                >
                  View Details
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEdsFiles.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No EDS files found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Upload your first EDS file to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={onUpload} className="bg-gradient-to-r from-brand-green to-brand-green">
                <Upload className="w-4 h-4 mr-2" />
                Upload EDS File
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete EDS Files</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete {selectedEdsFiles.length} EDS file(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
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
              {deleting ? 'Deleting...' : 'Delete Files'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EdsFilesListPage;
