'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DataTable } from '@/components/ui/data-table';
import { CheckCircle2, Plus, Edit, Trash2, Search, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RiskResolutionsPage() {
  const [resolutions, setResolutions] = useState([]);
  const [filteredResolutions, setFilteredResolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    successRate: 0
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState(null);
  const [formData, setFormData] = useState({
    resolution_id: '',
    risk_id: '',
    resolution_summary: '',
    resolution_date: '',
    resolved_by: '',
    final_status: 'Resolved',
    resolution_evidence: '',
    follow_up_action: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResolutions();
  }, []);

  useEffect(() => {
    filterResolutions();
  }, [resolutions, searchQuery, statusFilter]);

  async function fetchResolutions() {
    try {
      setLoading(true);
      const response = await fetch('/api/risk-resolutions');
      const data = await response.json();

      if (data.success) {
        setResolutions(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to fetch risk resolutions');
      }
    } catch (error) {
      console.error('Error fetching resolutions:', error);
      toast.error('Error loading risk resolutions');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const total = data.length;
    const resolved = data.filter(r => r.final_status === 'Resolved').length;
    const pending = data.filter(r => r.final_status === 'Pending' || r.final_status === 'Unresolved').length;
    const successRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    setStats({ total, resolved, pending, successRate });
  }

  function filterResolutions() {
    let filtered = [...resolutions];

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.resolution_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.risk_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.resolution_summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.resolved_by?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(r => r.final_status === statusFilter);
    }

    setFilteredResolutions(filtered);
  }

  function resetForm() {
    setFormData({
      resolution_id: '',
      risk_id: '',
      resolution_summary: '',
      resolution_date: '',
      resolved_by: '',
      final_status: 'Resolved',
      resolution_evidence: '',
      follow_up_action: ''
    });
  }

  function handleAddClick() {
    resetForm();
    setShowAddDialog(true);
  }

  function handleEditClick(resolution) {
    setSelectedResolution(resolution);
    setFormData({
      resolution_id: resolution.resolution_id,
      risk_id: resolution.risk_id,
      resolution_summary: resolution.resolution_summary,
      resolution_date: resolution.resolution_date ? resolution.resolution_date.split('T')[0] : '',
      resolved_by: resolution.resolved_by,
      final_status: resolution.final_status,
      resolution_evidence: resolution.resolution_evidence || '',
      follow_up_action: resolution.follow_up_action || ''
    });
    setShowEditDialog(true);
  }

  function handleDeleteClick(resolution) {
    setSelectedResolution(resolution);
    setShowDeleteDialog(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = showEditDialog
        ? `/api/risk-resolutions/${selectedResolution.id}`
        : '/api/risk-resolutions';
      const method = showEditDialog ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(showEditDialog ? 'Resolution updated successfully' : 'Resolution created successfully');
        setShowAddDialog(false);
        setShowEditDialog(false);
        fetchResolutions();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error saving resolution');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      const response = await fetch(`/api/risk-resolutions/${selectedResolution.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Resolution deleted successfully');
        setShowDeleteDialog(false);
        fetchResolutions();
      } else {
        toast.error(data.error || 'Failed to delete resolution');
      }
    } catch (error) {
      console.error('Error deleting resolution:', error);
      toast.error('Error deleting resolution');
    }
  }

  function getStatusBadge(status) {
    const statusConfig = {
      'Resolved': { variant: 'default', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      'Pending': { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
      'Partially Resolved': { variant: 'outline', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      'Unresolved': { variant: 'destructive', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
      'Escalated': { variant: 'secondary', className: 'bg-orange-100 text-orange-800 hover:bg-orange-100' }
    };

    const config = statusConfig[status] || statusConfig['Pending'];
    return <Badge variant={config.variant} className={config.className}>{status}</Badge>;
  }

  const columns = [
    {
      accessorKey: 'resolution_id',
      header: 'Resolution ID',
      cell: ({ row }) => <span className="font-medium">{row.getValue('resolution_id')}</span>
    },
    {
      accessorKey: 'risk_id',
      header: 'Risk ID',
      cell: ({ row }) => <span>{row.getValue('risk_id')}</span>
    },
    {
      accessorKey: 'resolution_summary',
      header: 'Summary',
      cell: ({ row }) => (
        <span className="max-w-xs truncate block" title={row.getValue('resolution_summary')}>
          {row.getValue('resolution_summary')}
        </span>
      )
    },
    {
      accessorKey: 'resolution_date',
      header: 'Resolution Date',
      cell: ({ row }) => {
        const date = row.getValue('resolution_date');
        return date ? new Date(date).toLocaleDateString() : '-';
      }
    },
    {
      accessorKey: 'resolved_by',
      header: 'Resolved By',
      cell: ({ row }) => <span>{row.getValue('resolved_by')}</span>
    },
    {
      accessorKey: 'final_status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('final_status'))
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditClick(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(row.original)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Resolutions</h1>
          <p className="text-gray-600 mt-1">Track and manage risk resolution records</p>
        </div>
        <Button onClick={handleAddClick} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Resolution
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resolutions</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Resolution Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resolutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Partially Resolved">Partially Resolved</SelectItem>
                  <SelectItem value="Unresolved">Unresolved</SelectItem>
                  <SelectItem value="Escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredResolutions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resolutions found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first risk resolution.'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={handleAddClick} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Resolution
                </Button>
              )}
            </div>
          ) : (
            <DataTable columns={columns} data={filteredResolutions} />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setShowEditDialog(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showEditDialog ? 'Edit' : 'Add'} Risk Resolution</DialogTitle>
            <DialogDescription>
              {showEditDialog ? 'Update the risk resolution details below.' : 'Enter the risk resolution details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resolution_id">Resolution ID *</Label>
                <Input
                  id="resolution_id"
                  value={formData.resolution_id}
                  onChange={(e) => setFormData({ ...formData, resolution_id: e.target.value })}
                  required
                  disabled={showEditDialog}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk_id">Risk ID *</Label>
                <Input
                  id="risk_id"
                  value={formData.risk_id}
                  onChange={(e) => setFormData({ ...formData, risk_id: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resolution_summary">Resolution Summary *</Label>
              <Textarea
                id="resolution_summary"
                value={formData.resolution_summary}
                onChange={(e) => setFormData({ ...formData, resolution_summary: e.target.value })}
                required
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resolution_date">Resolution Date *</Label>
                <Input
                  id="resolution_date"
                  type="date"
                  value={formData.resolution_date}
                  onChange={(e) => setFormData({ ...formData, resolution_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolved_by">Resolved By *</Label>
                <Input
                  id="resolved_by"
                  value={formData.resolved_by}
                  onChange={(e) => setFormData({ ...formData, resolved_by: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="final_status">Final Status *</Label>
              <Select
                value={formData.final_status}
                onValueChange={(value) => setFormData({ ...formData, final_status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Partially Resolved">Partially Resolved</SelectItem>
                  <SelectItem value="Unresolved">Unresolved</SelectItem>
                  <SelectItem value="Escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resolution_evidence">Resolution Evidence</Label>
              <Textarea
                id="resolution_evidence"
                value={formData.resolution_evidence}
                onChange={(e) => setFormData({ ...formData, resolution_evidence: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="follow_up_action">Follow-up Action</Label>
              <Textarea
                id="follow_up_action"
                value={formData.follow_up_action}
                onChange={(e) => setFormData({ ...formData, follow_up_action: e.target.value })}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setShowEditDialog(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  showEditDialog ? 'Update' : 'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the risk resolution record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}