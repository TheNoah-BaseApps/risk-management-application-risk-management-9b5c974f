'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Clock, Plus, Pencil, Trash2, Eye, Search, Filter } from 'lucide-react';

export default function RiskValidationsPage() {
  const router = useRouter();
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedValidation, setSelectedValidation] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0
  });

  const [formData, setFormData] = useState({
    validation_id: '',
    validated_by: '',
    validation_date: '',
    validation_status: '',
    validation_notes: '',
    validation_method: '',
    validation_score: '',
    validation_reviewer: '',
    validation_reference: '',
    validation_audit_log: ''
  });

  useEffect(() => {
    fetchValidations();
  }, [statusFilter]);

  const fetchValidations = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/risk-validations', window.location.origin);
      if (statusFilter) url.searchParams.append('status', statusFilter);

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setValidations(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to fetch validations');
      }
    } catch (error) {
      console.error('Error fetching validations:', error);
      toast.error('Error loading validations');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      approved: data.filter(v => v.validation_status === 'Approved').length,
      rejected: data.filter(v => v.validation_status === 'Rejected').length,
      pending: data.filter(v => v.validation_status === 'Pending Review').length
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditModalOpen 
        ? `/api/risk-validations/${selectedValidation.id}`
        : '/api/risk-validations';
      
      const method = isEditModalOpen ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          validation_score: parseInt(formData.validation_score)
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(isEditModalOpen ? 'Validation updated successfully' : 'Validation created successfully');
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        resetForm();
        fetchValidations();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving validation:', error);
      toast.error('Error saving validation');
    }
  };

  const handleEdit = (validation) => {
    setSelectedValidation(validation);
    setFormData({
      validation_id: validation.validation_id,
      validated_by: validation.validated_by,
      validation_date: validation.validation_date.split('T')[0],
      validation_status: validation.validation_status,
      validation_notes: validation.validation_notes || '',
      validation_method: validation.validation_method,
      validation_score: validation.validation_score.toString(),
      validation_reviewer: validation.validation_reviewer,
      validation_reference: validation.validation_reference || '',
      validation_audit_log: validation.validation_audit_log || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/risk-validations/${selectedValidation.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Validation deleted successfully');
        setIsDeleteDialogOpen(false);
        setSelectedValidation(null);
        fetchValidations();
      } else {
        toast.error(data.error || 'Failed to delete validation');
      }
    } catch (error) {
      console.error('Error deleting validation:', error);
      toast.error('Error deleting validation');
    }
  };

  const resetForm = () => {
    setFormData({
      validation_id: '',
      validated_by: '',
      validation_date: '',
      validation_status: '',
      validation_notes: '',
      validation_method: '',
      validation_score: '',
      validation_reviewer: '',
      validation_reference: '',
      validation_audit_log: ''
    });
    setSelectedValidation(null);
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Approved': 'default',
      'Rejected': 'destructive',
      'Pending Review': 'secondary'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const filteredValidations = validations.filter(v => {
    const matchesSearch = searchTerm === '' || 
      v.validation_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.validated_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.validation_reviewer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading validations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Validations</h1>
          <p className="text-gray-600 mt-1">Manage and track risk validation activities</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Validation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Validations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Approved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              Rejected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              Pending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by ID, validator, or reviewer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
                <SelectItem value="Pending Review">Pending Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Validations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Records</CardTitle>
          <CardDescription>
            {filteredValidations.length} validation{filteredValidations.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredValidations.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No validations found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first validation record.</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Validation
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Validation ID</TableHead>
                  <TableHead>Validated By</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredValidations.map((validation) => (
                  <TableRow key={validation.id}>
                    <TableCell className="font-medium">{validation.validation_id}</TableCell>
                    <TableCell>{validation.validated_by}</TableCell>
                    <TableCell>{new Date(validation.validation_date).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(validation.validation_status)}</TableCell>
                    <TableCell>{validation.validation_method}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{validation.validation_score}/100</Badge>
                    </TableCell>
                    <TableCell>{validation.validation_reviewer}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(validation)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedValidation(validation);
                            setIsDeleteDialogOpen(true);
                          }}
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
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? 'Edit Validation' : 'Add New Validation'}</DialogTitle>
            <DialogDescription>
              {isEditModalOpen ? 'Update validation details below.' : 'Enter validation details below.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validation_id">Validation ID *</Label>
                <Input
                  id="validation_id"
                  value={formData.validation_id}
                  onChange={(e) => setFormData({...formData, validation_id: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="validated_by">Validated By *</Label>
                <Input
                  id="validated_by"
                  value={formData.validated_by}
                  onChange={(e) => setFormData({...formData, validated_by: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="validation_date">Validation Date *</Label>
                <Input
                  id="validation_date"
                  type="date"
                  value={formData.validation_date}
                  onChange={(e) => setFormData({...formData, validation_date: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="validation_status">Status *</Label>
                <Select
                  value={formData.validation_status}
                  onValueChange={(value) => setFormData({...formData, validation_status: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Pending Review">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="validation_method">Validation Method *</Label>
                <Input
                  id="validation_method"
                  value={formData.validation_method}
                  onChange={(e) => setFormData({...formData, validation_method: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="validation_score">Validation Score (0-100) *</Label>
                <Input
                  id="validation_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.validation_score}
                  onChange={(e) => setFormData({...formData, validation_score: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="validation_reviewer">Reviewer *</Label>
                <Input
                  id="validation_reviewer"
                  value={formData.validation_reviewer}
                  onChange={(e) => setFormData({...formData, validation_reviewer: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="validation_reference">Reference</Label>
                <Input
                  id="validation_reference"
                  value={formData.validation_reference}
                  onChange={(e) => setFormData({...formData, validation_reference: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="validation_notes">Validation Notes</Label>
              <Textarea
                id="validation_notes"
                value={formData.validation_notes}
                onChange={(e) => setFormData({...formData, validation_notes: e.target.value})}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="validation_audit_log">Audit Log</Label>
              <Textarea
                id="validation_audit_log"
                value={formData.validation_audit_log}
                onChange={(e) => setFormData({...formData, validation_audit_log: e.target.value})}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditModalOpen ? 'Update Validation' : 'Create Validation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the validation record for{' '}
              <strong>{selectedValidation?.validation_id}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedValidation(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}