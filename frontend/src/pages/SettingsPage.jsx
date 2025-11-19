import React, { useState } from 'react';
import {
  Card, CardHeader, CardContent, CardTitle, CardDescription,
  Button,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui';
import {
  Settings, Trash2, AlertTriangle,
} from 'lucide-react';
import axios from 'axios';
import ThemeManager from '@/components/ThemeManager';

// ============================================================================
// Settings Page
// ============================================================================

const SettingsPage = ({ API_BASE, toast, onDevicesChange, recentDevices, setRecentDevices }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ioddResetDialogOpen, setIoddResetDialogOpen] = useState(false);
  const [edsResetDialogOpen, setEdsResetDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resettingIodd, setResettingIodd] = useState(false);
  const [resettingEds, setResettingEds] = useState(false);
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

  const handleResetIoddDatabase = async () => {
    setResettingIodd(true);
    try {
      const response = await axios.post(`${API_BASE}/api/admin/reset-iodd-database`);
      toast({
        title: 'IODD database reset',
        description: response.data.message || 'All IODD devices have been deleted successfully.',
      });
      setIoddResetDialogOpen(false);
      if (onDevicesChange) onDevicesChange();
    } catch (error) {
      console.error('Failed to reset IODD database:', error);
      toast({
        title: 'Reset failed',
        description: error.response?.data?.error || 'Failed to reset IODD database',
        variant: 'destructive',
      });
    } finally {
      setResettingIodd(false);
    }
  };

  const handleResetEdsDatabase = async () => {
    setResettingEds(true);
    try {
      const response = await axios.post(`${API_BASE}/api/admin/reset-eds-database`);
      toast({
        title: 'EDS database reset',
        description: response.data.message || 'All EDS files have been deleted successfully.',
      });
      setEdsResetDialogOpen(false);
      window.location.reload(); // Reload to refresh EDS list
    } catch (error) {
      console.error('Failed to reset EDS database:', error);
      toast({
        title: 'Reset failed',
        description: error.response?.data?.error || 'Failed to reset EDS database',
        variant: 'destructive',
      });
    } finally {
      setResettingEds(false);
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
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your Greenstack configuration</p>
      </div>

      {/* System Management */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            System Management
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage system data and refresh statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-border rounded-lg bg-secondary/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-foreground font-semibold mb-1">Reset Recent Devices</h3>
                <p className="text-sm text-foreground">
                  Clear the recent devices list from the sidebar.
                </p>
              </div>
              <Button
                onClick={handleResetRecentDevices}
                disabled={resettingRecent || !recentDevices || recentDevices.length === 0}
                className="bg-muted hover:bg-muted-foreground text-foreground ml-4"
              >
                {resettingRecent ? 'Clearing...' : 'Clear Recent'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Management */}
      <ThemeManager API_BASE={API_BASE} toast={toast} />

      {/* Danger Zone */}
      <Card className="bg-card border-error/30">
        <CardHeader>
          <CardTitle className="text-error flex items-center">
            <Trash2 className="w-5 h-5 mr-2" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Irreversible actions that can permanently delete data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-error/50 rounded-lg bg-error/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-foreground font-semibold mb-1">Reset IODD Database</h3>
                <p className="text-sm text-foreground mb-3">
                  Delete all IODD devices, parameters, and assets from the database.
                  <br />
                  <span className="text-error font-medium">This action cannot be undone!</span>
                </p>
              </div>
              <Button
                onClick={() => setIoddResetDialogOpen(true)}
                className="bg-error hover:bg-error/90 text-foreground ml-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset IODD DB
              </Button>
            </div>
          </div>

          <div className="p-4 border border-warning/50 rounded-lg bg-warning/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-foreground font-semibold mb-1">Reset EDS Database</h3>
                <p className="text-sm text-foreground mb-3">
                  Delete all EDS files, packages, and related data from the database.
                  <br />
                  <span className="text-warning font-medium">This action cannot be undone!</span>
                </p>
              </div>
              <Button
                onClick={() => setEdsResetDialogOpen(true)}
                className="bg-warning hover:bg-warning/90 text-foreground ml-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset EDS DB
              </Button>
            </div>
          </div>

          <div className="p-4 border border-error/50 rounded-lg bg-error/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-foreground font-semibold mb-1">Reset All Databases</h3>
                <p className="text-sm text-foreground mb-3">
                  Delete ALL data including IODD devices, EDS files, parameters, and assets.
                  <br />
                  <span className="text-error font-medium">This action cannot be undone!</span>
                </p>
              </div>
              <Button
                onClick={() => setDeleteDialogOpen(true)}
                className="bg-error hover:bg-error/90 text-foreground ml-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Reset All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-card border-error/50 text-foreground">
          <DialogHeader>
            <DialogTitle className="text-error flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Reset Database
            </DialogTitle>
            <DialogDescription className="text-foreground">
              <span className="font-semibold text-foreground">Are you absolutely sure?</span>
              <br />
              <br />
              This will permanently delete <span className="font-semibold text-error">ALL devices, parameters, and assets</span> from your database.
              <br />
              <br />
              <span className="text-error font-medium">This action cannot be undone!</span>
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
              onClick={handleResetDatabase}
              disabled={deleting}
              className="bg-error hover:bg-error/90 text-foreground"
            >
              {deleting ? 'Resetting...' : 'Yes, Reset Database'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* IODD Database Reset Confirmation Dialog */}
      <Dialog open={ioddResetDialogOpen} onOpenChange={setIoddResetDialogOpen}>
        <DialogContent className="bg-secondary border-error/50">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-error" />
              Reset IODD Database?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-foreground">
              This will permanently delete <span className="text-error font-semibold">ALL IODD devices</span> and related data from the system, including:
            </p>
            <ul className="list-disc list-inside text-foreground space-y-1 ml-4">
              <li>All IODD device definitions</li>
              <li>Parameters and process data</li>
              <li>Events and errors</li>
              <li>Device assets and icons</li>
              <li>UI menu configurations</li>
            </ul>
            <p className="text-error font-semibold">
              This action cannot be undone!
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={() => setIoddResetDialogOpen(false)}
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
              disabled={resettingIodd}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetIoddDatabase}
              disabled={resettingIodd}
              className="bg-error hover:bg-error/90 text-foreground"
            >
              {resettingIodd ? 'Resetting...' : 'Yes, Reset IODD Database'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDS Database Reset Confirmation Dialog */}
      <Dialog open={edsResetDialogOpen} onOpenChange={setEdsResetDialogOpen}>
        <DialogContent className="bg-secondary border-warning/50">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-warning" />
              Reset EDS Database?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-foreground">
              This will permanently delete <span className="text-warning font-semibold">ALL EDS files</span> and related data from the system, including:
            </p>
            <ul className="list-disc list-inside text-foreground space-y-1 ml-4">
              <li>All EDS file definitions</li>
              <li>EDS packages and metadata</li>
              <li>Parameters and connections</li>
              <li>Ports and capacity data</li>
              <li>Parsing diagnostics</li>
            </ul>
            <p className="text-warning font-semibold">
              This action cannot be undone!
            </p>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={() => setEdsResetDialogOpen(false)}
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
              disabled={resettingEds}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetEdsDatabase}
              disabled={resettingEds}
              className="bg-warning hover:bg-warning/90 text-foreground"
            >
              {resettingEds ? 'Resetting...' : 'Yes, Reset EDS Database'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
