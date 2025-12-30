'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { CheckCircle2, XCircle, AlertCircle, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function RiskResolutionsPage() {
  const router = useRouter();
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    pending: 0,
    partiallyResolved: 0
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
    const pending = data.filter(r => r.final_status === 'Pending').length;
    const partiallyResolved = data.filter(r => r.final_status === 'Partially Resolved').length;

    setStats({ total, resolved, pending, partiallyResolved });
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
    setShowAddModal(true);
  }

  function handleEditClick(resolution) {
    setSelectedResolution(resolution);
    setFormData({
      resolution_id: resolution.resolution_id,
      risk_id: resolution.risk_id,
      resolution_summary: resolution.resolution_summary,
      resolution_date: resolution.resolution_date.split('T')[0],
      resolved_by: resolution.resolved_by,
      final_status: resolution.final_status,
      resolution_evidence: resolution.resolution_evidence || '',
      follow_up_action: resolution.follow_up_action || ''
    });
    setShowEditModal(true);
  }

  function handleDeleteClick(resolution) {
    setSelectedResolution(resolution);
    setShowDeleteDialog(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = showEditModal
        ? `/api/risk-resolutions/${selectedResolution.id}`
        : '/api/risk-resolutions';
      const method = showEditModal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(showEditModal ? 'Resolution updated successfully' : 'Resolution created successfully');
        setShowAddModal(false);
        setShowEditModal(false);
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
    const variants = {
      'Resolved': 'default',
      'Pending': 'secondary',
      'Partially Resolved': 'outline'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  }

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
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partially Resolved</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.partiallyResolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resolution Records</CardTitle>
        </CardHeader>
        <CardContent>
          {resolutions.length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resolutions found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first risk resolution.</p>
              <Button onClick={handleAddClick} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Resolution
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resolution ID</TableHead>
                  <TableHead>Risk ID</TableHead>
                  <TableHead>Resolved By</TableHead>
                  <TableHead>Resolution Date</TableHead>
                  <TableHead>Final Status</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolutions.map((resolution) => (
                  <TableRow key={resolution.id}>
                    <TableCell className="font-medium">{resolution.resolution_id}</TableCell>
                    <TableCell>{resolution.risk_id}</TableCell>
                    <TableCell>{resolution.resolved_by}</TableCell>
                    <TableCell>{new Date(resolution.resolution_date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(resolution.final_status)}</TableCell>
                    <TableCell className="max-w-xs truncate">{resolution.resolution_summary}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(resolution)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(resolution)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setShowEditModal(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{showEditModal ? 'Edit' : 'Add'} Risk Resolution</DialogTitle>
            <DialogDescription>
              {showEditModal ? 'Update the risk resolution details below.' : 'Enter the risk resolution details below.'}
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
                  disabled={showEditModal}
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
              <select
                id="final_status"
                value={formData.final_status}
                onChange={(e) => setFormData({ ...formData, final_status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Resolved">Resolved</option>
                <option value="Pending">Pending</option>
                <option value="Partially Resolved">Partially Resolved</option>
              </select>
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
                  setShowAddModal(false);
                  setShowEditModal(false);
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
                  showEditModal ? 'Update' : 'Create'
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