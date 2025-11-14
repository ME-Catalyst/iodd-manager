import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Bug, Filter, Download, ArrowLeft, Clock, AlertCircle, CheckCircle2,
  XCircle, AlertTriangle, MessageSquare, Calendar, User, Tag, Package,
  ChevronRight, Search, X, Send, Trash2, FileArchive
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Input } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { format } from 'date-fns';
import TicketAttachments from './TicketAttachments';

/**
 * Comprehensive Ticket Management Page
 * Lists all tickets with filtering, search, and detail view
 */
const TicketsPage = ({ API_BASE, toast }) => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    device_type: 'all',
    category: 'all',
    search: ''
  });
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fetch tickets on mount and when filters change
  useEffect(() => {
    fetchTickets();
  }, [filters.status, filters.priority, filters.device_type, filters.category]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.device_type && filters.device_type !== 'all') params.append('device_type', filters.device_type);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);

      const response = await axios.get(`${API_BASE}/api/tickets?${params.toString()}`);
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const response = await axios.get(`${API_BASE}/api/tickets/${ticketId}`);
      setSelectedTicket(response.data);
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ticket details',
        variant: 'destructive',
      });
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await axios.post(`${API_BASE}/api/tickets/${selectedTicket.id}/comments`, {
        comment_text: commentText,
        created_by: 'User' // In a real app, this would come from auth
      });
      setSelectedTicket(response.data);
      setCommentText('');
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateTicket = async (ticketId, updates) => {
    try {
      const response = await axios.patch(`${API_BASE}/api/tickets/${ticketId}`, updates);
      setSelectedTicket(response.data);
      fetchTickets(); // Refresh the list
      toast({
        title: 'Success',
        description: 'Ticket updated successfully',
      });
    } catch (error) {
      console.error('Failed to update ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to update ticket',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;

    try {
      await axios.delete(`${API_BASE}/api/tickets/${ticketId}`);
      setSelectedTicket(null);
      fetchTickets();
      toast({
        title: 'Success',
        description: 'Ticket deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete ticket',
        variant: 'destructive',
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.device_type && filters.device_type !== 'all') params.append('device_type', filters.device_type);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);

      const response = await axios.get(`${API_BASE}/api/tickets/export/csv?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tickets-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: 'Success',
        description: 'Tickets exported successfully',
      });
    } catch (error) {
      console.error('Failed to export tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to export tickets',
        variant: 'destructive',
      });
    }
  };

  const handleExportWithAttachments = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.device_type && filters.device_type !== 'all') params.append('device_type', filters.device_type);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);

      const response = await axios.get(`${API_BASE}/api/tickets/export-with-attachments?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tickets-with-attachments-${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({
        title: 'Success',
        description: 'Tickets with attachments exported successfully',
      });
    } catch (error) {
      console.error('Failed to export tickets with attachments:', error);
      toast({
        title: 'Error',
        description: 'Failed to export tickets with attachments',
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      device_type: '',
      category: '',
      search: ''
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-blue-900/30 text-blue-300 border-blue-700/50',
      medium: 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50',
      high: 'bg-orange-900/30 text-orange-300 border-orange-700/50',
      critical: 'bg-red-900/30 text-red-300 border-red-700/50'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-900/30 text-blue-300 border-blue-700/50',
      in_progress: 'bg-purple-900/30 text-purple-300 border-purple-700/50',
      resolved: 'bg-green-900/30 text-green-300 border-green-700/50',
      closed: 'bg-slate-900/30 text-slate-300 border-slate-700/50',
      wont_fix: 'bg-red-900/30 text-red-300 border-red-700/50'
    };
    return colors[status] || colors.open;
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: AlertCircle,
      in_progress: Clock,
      resolved: CheckCircle2,
      closed: XCircle,
      wont_fix: AlertTriangle
    };
    return icons[status] || AlertCircle;
  };

  // Filter tickets by search query
  const filteredTickets = tickets.filter(ticket => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      ticket.title?.toLowerCase().includes(searchLower) ||
      ticket.description?.toLowerCase().includes(searchLower) ||
      ticket.ticket_number?.toLowerCase().includes(searchLower) ||
      ticket.device_name?.toLowerCase().includes(searchLower)
    );
  });

  if (selectedTicket) {
    return <TicketDetailView
      ticket={selectedTicket}
      onBack={() => setSelectedTicket(null)}
      onUpdate={handleUpdateTicket}
      onDelete={handleDeleteTicket}
      onAddComment={handleAddComment}
      commentText={commentText}
      setCommentText={setCommentText}
      submittingComment={submittingComment}
      getPriorityColor={getPriorityColor}
      getStatusColor={getStatusColor}
      getStatusIcon={getStatusIcon}
    />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bug className="w-8 h-8 text-orange-500" />
            Ticket Management
          </h1>
          <p className="text-slate-400 mt-1">
            Track and manage device issues and feature requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={handleExportWithAttachments}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <FileArchive className="w-4 h-4 mr-2" />
            Export with Attachments (ZIP)
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Tickets</p>
                <p className="text-2xl font-bold text-white">{tickets.length}</p>
              </div>
              <Bug className="w-8 h-8 text-slate-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Open</p>
                <p className="text-2xl font-bold text-blue-400">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">In Progress</p>
                <p className="text-2xl font-bold text-purple-400">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Resolved</p>
                <p className="text-2xl font-bold text-green-400">
                  {tickets.filter(t => t.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
            {(filters.status || filters.priority || filters.device_type || filters.category || filters.search) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Status Filter */}
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-slate-300">All Statuses</SelectItem>
                <SelectItem value="open" className="text-slate-300">Open</SelectItem>
                <SelectItem value="in_progress" className="text-slate-300">In Progress</SelectItem>
                <SelectItem value="resolved" className="text-slate-300">Resolved</SelectItem>
                <SelectItem value="closed" className="text-slate-300">Closed</SelectItem>
                <SelectItem value="wont_fix" className="text-slate-300">Won't Fix</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select value={filters.priority} onValueChange={(value) => setFilters({ ...filters, priority: value })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-slate-300">All Priorities</SelectItem>
                <SelectItem value="low" className="text-slate-300">Low</SelectItem>
                <SelectItem value="medium" className="text-slate-300">Medium</SelectItem>
                <SelectItem value="high" className="text-slate-300">High</SelectItem>
                <SelectItem value="critical" className="text-slate-300">Critical</SelectItem>
              </SelectContent>
            </Select>

            {/* Device Type Filter */}
            <Select value={filters.device_type} onValueChange={(value) => setFilters({ ...filters, device_type: value })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="All Device Types" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-slate-300">All Device Types</SelectItem>
                <SelectItem value="EDS" className="text-slate-300">EDS</SelectItem>
                <SelectItem value="IODD" className="text-slate-300">IODD</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all" className="text-slate-300">All Categories</SelectItem>
                <SelectItem value="data_issue" className="text-slate-300">Data Issue</SelectItem>
                <SelectItem value="parser_bug" className="text-slate-300">Parser Bug</SelectItem>
                <SelectItem value="missing_feature" className="text-slate-300">Missing Feature</SelectItem>
                <SelectItem value="documentation" className="text-slate-300">Documentation</SelectItem>
                <SelectItem value="other" className="text-slate-300">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">
            Tickets ({filteredTickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="text-slate-400">Loading tickets...</div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <Bug className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-400">No tickets found</p>
              <p className="text-sm text-slate-500 mt-2">
                {filters.search || (filters.status !== 'all') || (filters.priority !== 'all') || (filters.device_type !== 'all') || (filters.category !== 'all')
                  ? 'Try adjusting your filters'
                  : 'Create your first ticket from a device detail page'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTickets.map((ticket) => {
                const StatusIcon = getStatusIcon(ticket.status);
                return (
                  <div
                    key={ticket.id}
                    onClick={() => fetchTicketDetails(ticket.id)}
                    className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono text-slate-500">{ticket.ticket_number}</span>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                          {ticket.device_type && (
                            <Badge className="bg-purple-900/30 text-purple-300 border-purple-700/50">
                              {ticket.device_type}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-white font-semibold mb-1 group-hover:text-orange-400 transition-colors">
                          {ticket.title}
                        </h3>
                        {ticket.description && (
                          <p className="text-sm text-slate-400 line-clamp-2 mb-2">
                            {ticket.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          {ticket.device_name && (
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {ticket.device_name}
                            </span>
                          )}
                          {ticket.category && (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {ticket.category.replace('_', ' ')}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Ticket Detail View Component
const TicketDetailView = ({
  ticket,
  onBack,
  onUpdate,
  onDelete,
  onAddComment,
  commentText,
  setCommentText,
  submittingComment,
  getPriorityColor,
  getStatusColor,
  getStatusIcon
}) => {
  const StatusIcon = getStatusIcon(ticket.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tickets
        </Button>
        <Button
          variant="ghost"
          onClick={() => onDelete(ticket.id)}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Ticket
        </Button>
      </div>

      {/* Ticket Header */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-mono text-slate-500">{ticket.ticket_number}</span>
                <Badge className={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </Badge>
                <Badge className={getStatusColor(ticket.status)}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {ticket.status.replace('_', ' ')}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{ticket.title}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Updated {format(new Date(ticket.updated_at), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 whitespace-pre-wrap">
                {ticket.description || 'No description provided'}
              </p>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments ({ticket.comments?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comment List */}
              {ticket.comments && ticket.comments.length > 0 ? (
                <div className="space-y-4">
                  {ticket.comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-300">
                          {comment.created_by || 'Anonymous'}
                        </span>
                        <span className="text-xs text-slate-500">
                          {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <p className="text-slate-300 whitespace-pre-wrap">{comment.comment_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">No comments yet</p>
              )}

              {/* Add Comment Form */}
              <form onSubmit={onAddComment} className="space-y-3">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={submittingComment || !commentText.trim()}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submittingComment ? 'Adding...' : 'Add Comment'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Attachments */}
          <TicketAttachments
            ticket={ticket}
            API_BASE={API_BASE}
            toast={toast}
            onAttachmentsChange={() => fetchTicketDetails(ticket.id)}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={ticket.status}
                onValueChange={(value) => onUpdate(ticket.id, { status: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="open" className="text-slate-300">Open</SelectItem>
                  <SelectItem value="in_progress" className="text-slate-300">In Progress</SelectItem>
                  <SelectItem value="resolved" className="text-slate-300">Resolved</SelectItem>
                  <SelectItem value="closed" className="text-slate-300">Closed</SelectItem>
                  <SelectItem value="wont_fix" className="text-slate-300">Won't Fix</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Priority Management */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Priority</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={ticket.priority}
                onValueChange={(value) => onUpdate(ticket.id, { priority: value })}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="low" className="text-slate-300">Low</SelectItem>
                  <SelectItem value="medium" className="text-slate-300">Medium</SelectItem>
                  <SelectItem value="high" className="text-slate-300">High</SelectItem>
                  <SelectItem value="critical" className="text-slate-300">Critical</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Device Information */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Device Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500">Type:</span>
                <span className="ml-2 text-white font-medium">{ticket.device_type}</span>
              </div>
              {ticket.device_name && (
                <div>
                  <span className="text-slate-500">Device:</span>
                  <span className="ml-2 text-white">{ticket.device_name}</span>
                </div>
              )}
              {ticket.vendor_name && (
                <div>
                  <span className="text-slate-500">Vendor:</span>
                  <span className="ml-2 text-white">{ticket.vendor_name}</span>
                </div>
              )}
              {ticket.product_code && (
                <div>
                  <span className="text-slate-500">Product Code:</span>
                  <span className="ml-2 text-white font-mono">{ticket.product_code}</span>
                </div>
              )}
              {ticket.eds_reference && (
                <div>
                  <span className="text-slate-500">EDS Reference:</span>
                  <span className="ml-2 text-white font-mono">{ticket.eds_reference}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {ticket.category && (
                <div>
                  <span className="text-slate-500">Category:</span>
                  <span className="ml-2 text-white capitalize">{ticket.category.replace('_', ' ')}</span>
                </div>
              )}
              {ticket.resolved_at && (
                <div>
                  <span className="text-slate-500">Resolved:</span>
                  <span className="ml-2 text-white">
                    {format(new Date(ticket.resolved_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;
