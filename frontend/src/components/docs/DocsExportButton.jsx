import React, { useState } from 'react';
import { Download, FileArchive, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Progress } from '../ui';
import { exportDocumentation } from '../../utils/docsExporter';

/**
 * DocsExportButton - Export documentation as offline HTML package
 *
 * Features:
 * - One-click documentation export
 * - Progress tracking dialog
 * - ZIP file download
 * - Success/error handling
 */
const DocsExportButton = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
    message: ''
  });
  const [exportResult, setExportResult] = useState(null);

  const handleExport = async () => {
    setIsExporting(true);
    setShowDialog(true);
    setExportResult(null);
    setProgress({ current: 0, total: 0, percentage: 0, message: 'Initializing...' });

    const result = await exportDocumentation((progressData) => {
      setProgress(progressData);
    });

    setExportResult(result);
    setIsExporting(false);
  };

  const handleClose = () => {
    setShowDialog(false);
    setTimeout(() => {
      setExportResult(null);
      setProgress({ current: 0, total: 0, percentage: 0, message: '' });
    }, 300);
  };

  return (
    <>
      <Button
        onClick={handleExport}
        disabled={isExporting}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export Docs
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileArchive className="w-5 h-5 text-brand-green" />
              {isExporting ? 'Exporting Documentation' : exportResult?.success ? 'Export Complete' : 'Export Failed'}
            </DialogTitle>
            <DialogDescription>
              {isExporting
                ? 'Creating offline HTML documentation package...'
                : exportResult?.success
                ? 'Your documentation package is ready!'
                : 'An error occurred during export'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isExporting && (
              <>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{progress.message}</span>
                    <span className="text-brand-green font-medium">{progress.percentage}%</span>
                  </div>
                  <Progress value={progress.percentage} className="h-2" />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing {progress.current} of {progress.total} pages</span>
                </div>
              </>
            )}

            {exportResult?.success && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-brand-green/10 border border-brand-green/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">Download Started</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      File: <code className="text-brand-green">{exportResult.filename}</code>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-surface rounded-lg">
                    <div className="text-2xl font-bold text-brand-green">{exportResult.pages}</div>
                    <div className="text-xs text-muted-foreground mt-1">Pages Exported</div>
                  </div>
                  <div className="p-3 bg-surface rounded-lg">
                    <div className="text-2xl font-bold text-brand-green">HTML</div>
                    <div className="text-xs text-muted-foreground mt-1">Format</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">Package Contents:</p>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li className="flex items-center gap-2">
                      <span className="text-brand-green">✓</span>
                      All {exportResult.pages - 1} documentation pages
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-brand-green">✓</span>
                      Table of contents index
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-brand-green">✓</span>
                      Embedded styles (dark theme)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-brand-green">✓</span>
                      Navigation sidebar
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-brand-green">✓</span>
                      Offline ready (no internet required)
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-surface/50 rounded border border-border">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">How to use:</strong> Extract the ZIP file and open <code className="text-brand-green">index.html</code> in any web browser. All pages work offline without internet connection.
                  </p>
                </div>
              </div>
            )}

            {exportResult?.success === false && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Export Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {exportResult.error || 'An unexpected error occurred. Please try again.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {!isExporting && (
            <div className="flex justify-end gap-2">
              <Button onClick={handleClose} variant="outline">
                Close
              </Button>
              {exportResult?.success === false && (
                <Button onClick={handleExport}>
                  Try Again
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocsExportButton;
