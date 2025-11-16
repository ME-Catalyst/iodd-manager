import React, { useState, useRef } from 'react';
import { Upload, Download, Trash2, Paperclip, FileText, Image, File as FileIcon } from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { Button } from './ui';

/**
 * Component for managing ticket attachments (upload, download, delete)
 */
const TicketAttachments = ({ ticket, API_BASE, toast, onAttachmentsChange }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (filename, contentType) => {
    if (!filename && !contentType) return <FileIcon className="w-5 h-5" />;

    const ext = filename ? filename.split('.').pop().toLowerCase() : '';
    const type = contentType || '';

    if (type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) {
      return <Image className="w-5 h-5 text-blue-400" />;
    }
    if (type.startsWith('text/') || ['txt', 'md', 'log', 'csv'].includes(ext)) {
      return <FileText className="w-5 h-5 text-green-400" />;
    }
    return <Paperclip className="w-5 h-5 text-muted-foreground" />;
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        await axios.post(`${API_BASE}/api/tickets/${ticket.id}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      toast({
        title: 'Success',
        description: `${files.length} file(s) uploaded successfully`,
      });

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent to refresh ticket data
      if (onAttachmentsChange) {
        onAttachmentsChange();
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/tickets/${ticket.id}/attachments/${attachment.id}/download`,
        { responseType: 'blob' }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (attachment) => {
    if (!confirm(`Delete ${attachment.filename}?`)) return;

    try {
      await axios.delete(`${API_BASE}/api/tickets/${ticket.id}/attachments/${attachment.id}`);

      toast({
        title: 'Success',
        description: 'Attachment deleted successfully',
      });

      // Notify parent to refresh ticket data
      if (onAttachmentsChange) {
        onAttachmentsChange();
      }
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete attachment',
        variant: 'destructive',
      });
    }
  };

  const attachments = ticket.attachments || [];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Paperclip className="w-5 h-5" />
            Attachments ({attachments.length})
          </CardTitle>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Paperclip className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No attachments yet</p>
            <p className="text-sm mt-1">Upload files to attach them to this ticket</p>
          </div>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-secondary/50 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(attachment.filename, attachment.content_type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate">{attachment.filename}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(attachment.file_size)} • {new Date(attachment.uploaded_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(attachment)}
                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-muted rounded transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(attachment)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-muted rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketAttachments;
