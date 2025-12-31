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
} from '@/components/ui/dialog';
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
import { 
  Plus, 
  Search, 
  Loader2, 
  CheckCircle2, 
  Edit, 
  Trash2,
  ClipboardCheck,
  TrendingUp,
  Users,
  FileCheck
} from 'lucide-react';

export default function RiskEvaluationsPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    evaluation_id: '',
    risk_id: '',
    evaluation_date: '',
    evaluation_result: '',
    evaluator_name: '',
    evaluation_method: '',
    effectiveness: '',
    feedback_comment: '',
  });

  useEffect(() => {
    fetchEvaluations();
  }, []);

  async function fetchEvaluations() {
    try {
      setLoading(true);
      const response = await fetch('/api/risk-evaluations');
      const data = await response.json();
      
      if (data.success) {
        setEvaluations(data.data);
      } else {
        toast.error('Failed to fetch evaluations');
      }
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      toast.error('Error loading evaluations');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = showEditModal 
        ? `/api/risk-evaluations/${selectedEvaluation.id}`
        : '/api/risk-evaluations';
      
      const method = showEditModal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(showEditModal ? 'Evaluation updated successfully' : 'Evaluation created successfully');
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        fetchEvaluations();
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

  async function handleDelete() {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/risk-evaluations/${selectedEvaluation.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Evaluation deleted successfully');
        setShowDeleteDialog(false);
        setSelectedEvaluation(null);
        fetchEvaluations();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast.error('Error deleting evaluation');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setFormData({
      evaluation_id: '',
      risk_id: '',
      evaluation_date: '',
      evaluation_result: '',
      evaluator_name: '',
      evaluation_method: '',
      effectiveness: '',
      feedback_comment: '',
    });
  }

  function openEditModal(evaluation) {
    setSelectedEvaluation(evaluation);
    setFormData({
      evaluation_id: evaluation.evaluation_id,
      risk_id: evaluation.risk_id,
      evaluation_date: evaluation.evaluation_date?.split('T')[0] || '',
      evaluation_result: evaluation.evaluation_result,
      evaluator_name: evaluation.evaluator_name,
      evaluation_method: evaluation.evaluation_method,
      effectiveness: evaluation.effectiveness,
      feedback_comment: evaluation.feedback_comment || '',
    });
    setShowEditModal(true);
  }

  function openDeleteDialog(evaluation) {
    setSelectedEvaluation(evaluation);
    setShowDeleteDialog(true);
  }

  const filteredEvaluations = evaluations.filter(
    (evaluation) =>
      evaluation.evaluation_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.risk_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evaluation.evaluator_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const totalEvaluations = evaluations.length;
  const effectiveCount = evaluations.filter(e => e.effectiveness?.toLowerCase() === 'effective').length;
  const recentEvaluations = evaluations.filter(e => {
    const evalDate = new Date(e.evaluation_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return evalDate >= thirtyDaysAgo;
  }).length;

  const getEffectivenessBadge = (effectiveness) => {
    const colors = {
      'effective': 'bg-green-100 text-green-800',
      'partially effective': 'bg-yellow-100 text-yellow-800',
      'ineffective': 'bg-red-100 text-red-800',
    };
    return colors[effectiveness?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Risk Evaluations</h1>
          <p className="text-gray-600 mt-1">
            Track and manage risk evaluation activities
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Evaluation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Evaluations
            </CardTitle>
            <ClipboardCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvaluations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Effective
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{effectiveCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Recent (30 days)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEvaluations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Effectiveness Rate
            </CardTitle>
            <FileCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEvaluations > 0 ? Math.round((effectiveCount / totalEvaluations) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by evaluation ID, risk ID, or evaluator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation Records</CardTitle>
          <CardDescription>
            {filteredEvaluations.length} evaluation{filteredEvaluations.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredEvaluations.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No evaluations found
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first evaluation'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowAddModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Evaluation
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evaluation ID</TableHead>
                    <TableHead>Risk ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Evaluator</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Effectiveness</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvaluations.map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell className="font-medium">{evaluation.evaluation_id}</TableCell>
                      <TableCell>{evaluation.risk_id}</TableCell>
                      <TableCell>
                        {new Date(evaluation.evaluation_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{evaluation.evaluator_name}</TableCell>
                      <TableCell>{evaluation.evaluation_method}</TableCell>
                      <TableCell>{evaluation.evaluation_result}</TableCell>
                      <TableCell>
                        <Badge className={getEffectivenessBadge(evaluation.effectiveness)}>
                          {evaluation.effectiveness}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(evaluation)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(evaluation)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
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

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showEditModal ? 'Edit Evaluation' : 'Add New Evaluation'}
            </DialogTitle>
            <DialogDescription>
              {showEditModal ? 'Update evaluation details' : 'Create a new risk evaluation record'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="evaluation_id">Evaluation ID *</Label>
                <Input
                  id="evaluation_id"
                  value={formData.evaluation_id}
                  onChange={(e) => setFormData({ ...formData, evaluation_id: e.target.value })}
                  placeholder="EVAL-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk_id">Risk ID *</Label>
                <Input
                  id="risk_id"
                  value={formData.risk_id}
                  onChange={(e) => setFormData({ ...formData, risk_id: e.target.value })}
                  placeholder="RISK-001"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="evaluation_date">Evaluation Date *</Label>
                <Input
                  id="evaluation_date"
                  type="date"
                  value={formData.evaluation_date}
                  onChange={(e) => setFormData({ ...formData, evaluation_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evaluator_name">Evaluator Name *</Label>
                <Input
                  id="evaluator_name"
                  value={formData.evaluator_name}
                  onChange={(e) => setFormData({ ...formData, evaluator_name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="evaluation_method">Evaluation Method *</Label>
                <Input
                  id="evaluation_method"
                  value={formData.evaluation_method}
                  onChange={(e) => setFormData({ ...formData, evaluation_method: e.target.value })}
                  placeholder="Quantitative Analysis"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveness">Effectiveness *</Label>
                <select
                  id="effectiveness"
                  value={formData.effectiveness}
                  onChange={(e) => setFormData({ ...formData, effectiveness: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select effectiveness</option>
                  <option value="Effective">Effective</option>
                  <option value="Partially Effective">Partially Effective</option>
                  <option value="Ineffective">Ineffective</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evaluation_result">Evaluation Result *</Label>
              <Input
                id="evaluation_result"
                value={formData.evaluation_result}
                onChange={(e) => setFormData({ ...formData, evaluation_result: e.target.value })}
                placeholder="Risk is well controlled"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback_comment">Feedback Comment</Label>
              <Textarea
                id="feedback_comment"
                value={formData.feedback_comment}
                onChange={(e) => setFormData({ ...formData, feedback_comment: e.target.value })}
                placeholder="Additional feedback or comments..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {showEditModal ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  showEditModal ? 'Update Evaluation' : 'Create Evaluation'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the evaluation record for{' '}
              <strong>{selectedEvaluation?.evaluation_id}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}