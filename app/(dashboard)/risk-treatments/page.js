'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2, AlertCircle, CheckCircle2, Clock, XCircle, FileText } from 'lucide-react';

export default function RiskTreatmentsPage() {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchTreatments();
  }, []);

  async function fetchTreatments() {
    try {
      setLoading(true);
      const response = await fetch('/api/risk-treatments');
      const data = await response.json();
      
      if (data.success) {
        setTreatments(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to fetch treatments');
      }
    } catch (error) {
      console.error('Error fetching treatments:', error);
      toast.error('Error loading treatments');
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const total = data.length;
    const pending = data.filter(t => t.approval_status === 'Pending').length;
    const approved = data.filter(t => t.approval_status === 'Approved').length;
    const rejected = data.filter(t => t.approval_status === 'Rejected').length;
    setStats({ total, pending, approved, rejected });
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this treatment?')) return;

    try {
      const response = await fetch(`/api/risk-treatments/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Treatment deleted successfully');
        fetchTreatments();
      } else {
        toast.error(data.error || 'Failed to delete treatment');
      }
    } catch (error) {
      console.error('Error deleting treatment:', error);
      toast.error('Error deleting treatment');
    }
  }

  function handleEdit(treatment) {
    setSelectedTreatment(treatment);
    setIsEditModalOpen(true);
  }

  function getStatusBadge(status) {
    const variants = {
      'Pending': { icon: Clock, variant: 'secondary', text: 'Pending' },
      'Approved': { icon: CheckCircle2, variant: 'default', text: 'Approved' },
      'Rejected': { icon: XCircle, variant: 'destructive', text: 'Rejected' },
      'In Review': { icon: AlertCircle, variant: 'outline', text: 'In Review' }
    };

    const config = variants[status] || variants['Pending'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Treatments</h1>
          <p className="text-gray-600 mt-1">Manage risk treatment plans and approvals</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Treatment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Treatments</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="h-4 w-4 mr-1" />
              All records
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending Approval</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              Awaiting review
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.approved}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Active treatments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Rejected</CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.rejected}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-gray-600">
              <XCircle className="h-4 w-4 mr-1" />
              Not approved
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Records</CardTitle>
          <CardDescription>Complete list of all risk treatment plans</CardDescription>
        </CardHeader>
        <CardContent>
          {treatments.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No treatments found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first treatment plan</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Treatment
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Treatment ID</TableHead>
                    <TableHead>Risk ID</TableHead>
                    <TableHead>Treatment Option</TableHead>
                    <TableHead>Responsible Person</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treatments.map((treatment) => (
                    <TableRow key={treatment.id}>
                      <TableCell className="font-medium">{treatment.treatment_id}</TableCell>
                      <TableCell>{treatment.risk_id}</TableCell>
                      <TableCell>{treatment.treatment_option}</TableCell>
                      <TableCell>{treatment.responsible_person}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(treatment.start_date).toLocaleDateString()} - {new Date(treatment.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>${treatment.treatment_cost.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(treatment.approval_status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(treatment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(treatment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <TreatmentFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchTreatments}
        mode="create"
      />

      {/* Edit Modal */}
      {selectedTreatment && (
        <TreatmentFormModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTreatment(null);
          }}
          onSuccess={fetchTreatments}
          mode="edit"
          treatment={selectedTreatment}
        />
      )}
    </div>
  );
}

function TreatmentFormModal({ isOpen, onClose, onSuccess, mode, treatment }) {
  const [formData, setFormData] = useState({
    treatment_id: treatment?.treatment_id || '',
    risk_id: treatment?.risk_id || '',
    treatment_option: treatment?.treatment_option || '',
    responsible_person: treatment?.responsible_person || '',
    start_date: treatment?.start_date ? new Date(treatment.start_date).toISOString().split('T')[0] : '',
    end_date: treatment?.end_date ? new Date(treatment.end_date).toISOString().split('T')[0] : '',
    treatment_cost: treatment?.treatment_cost || '',
    approval_status: treatment?.approval_status || 'Pending',
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = mode === 'create' 
        ? '/api/risk-treatments' 
        : `/api/risk-treatments/${treatment.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          treatment_cost: parseInt(formData.treatment_cost),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Treatment ${mode === 'create' ? 'created' : 'updated'} successfully`);
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error submitting form');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Treatment' : 'Edit Treatment'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new risk treatment plan' 
              : 'Update treatment information'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="treatment_id">Treatment ID *</Label>
              <Input
                id="treatment_id"
                value={formData.treatment_id}
                onChange={(e) => setFormData({ ...formData, treatment_id: e.target.value })}
                required
                placeholder="TRT-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk_id">Risk ID *</Label>
              <Input
                id="risk_id"
                value={formData.risk_id}
                onChange={(e) => setFormData({ ...formData, risk_id: e.target.value })}
                required
                placeholder="RISK-001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment_option">Treatment Option *</Label>
            <Select
              value={formData.treatment_option}
              onValueChange={(value) => setFormData({ ...formData, treatment_option: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select treatment option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mitigate">Mitigate</SelectItem>
                <SelectItem value="Transfer">Transfer</SelectItem>
                <SelectItem value="Accept">Accept</SelectItem>
                <SelectItem value="Avoid">Avoid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible_person">Responsible Person *</Label>
            <Input
              id="responsible_person"
              value={formData.responsible_person}
              onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment_cost">Treatment Cost ($) *</Label>
            <Input
              id="treatment_cost"
              type="number"
              value={formData.treatment_cost}
              onChange={(e) => setFormData({ ...formData, treatment_cost: e.target.value })}
              required
              placeholder="10000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="approval_status">Approval Status *</Label>
            <Select
              value={formData.approval_status}
              onValueChange={(value) => setFormData({ ...formData, approval_status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="In Review">In Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                mode === 'create' ? 'Create Treatment' : 'Update Treatment'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}