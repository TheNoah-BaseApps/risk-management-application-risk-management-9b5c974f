'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export default function RiskResponsesPage() {
  const router = useRouter();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingResponse, setEditingResponse] = useState(null);
  const [formData, setFormData] = useState({
    response_id: '',
    risk_id: '',
    response_strategy: '',
    response_details: '',
    response_date: '',
    responder_name: '',
    escalation_level: '',
    contingency_plan: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/risk-responses');
      const data = await response.json();

      if (data.success) {
        setResponses(data.data || []);
      } else {
        setError(data.error || 'Failed to load risk responses');
        toast.error('Failed to load risk responses');
      }
    } catch (err) {
      console.error('Error fetching risk responses:', err);
      setError('Failed to load risk responses');
      toast.error('Failed to load risk responses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingResponse
        ? `/api/risk-responses/${editingResponse.id}`
        : '/api/risk-responses';
      const method = editingResponse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingResponse
            ? 'Risk response updated successfully'
            : 'Risk response created successfully'
        );
        setIsModalOpen(false);
        resetForm();
        fetchData();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (err) {
      console.error('Error saving risk response:', err);
      toast.error('Failed to save risk response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this risk response?')) {
      return;
    }

    try {
      const response = await fetch(`/api/risk-responses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Risk response deleted successfully');
        fetchData();
      } else {
        toast.error(data.error || 'Failed to delete risk response');
      }
    } catch (err) {
      console.error('Error deleting risk response:', err);
      toast.error('Failed to delete risk response');
    }
  };

  const handleEdit = (response) => {
    setEditingResponse(response);
    setFormData({
      response_id: response.response_id || '',
      risk_id: response.risk_id || '',
      response_strategy: response.response_strategy || '',
      response_details: response.response_details || '',
      response_date: response.response_date
        ? response.response_date.split('T')[0]
        : '',
      responder_name: response.responder_name || '',
      escalation_level: response.escalation_level || '',
      contingency_plan: response.contingency_plan || '',
    });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      response_id: '',
      risk_id: '',
      response_strategy: '',
      response_details: '',
      response_date: '',
      responder_name: '',
      escalation_level: '',
      contingency_plan: '',
    });
    setEditingResponse(null);
  };

  const getStrategyBadge = (strategy) => {
    const variants = {
      Mitigate: 'default',
      Accept: 'secondary',
      Transfer: 'outline',
      Avoid: 'destructive',
    };
    return (
      <Badge variant={variants[strategy] || 'secondary'}>{strategy}</Badge>
    );
  };

  const getEscalationBadge = (level) => {
    const variants = {
      Low: 'secondary',
      Medium: 'default',
      High: 'destructive',
      Critical: 'destructive',
    };
    return <Badge variant={variants[level] || 'secondary'}>{level}</Badge>;
  };

  // Calculate stats
  const totalResponses = responses.length;
  const mitigateCount = responses.filter(
    (r) => r.response_strategy === 'Mitigate'
  ).length;
  const acceptCount = responses.filter(
    (r) => r.response_strategy === 'Accept'
  ).length;
  const transferCount = responses.filter(
    (r) => r.response_strategy === 'Transfer'
  ).length;
  const avoidCount = responses.filter(
    (r) => r.response_strategy === 'Avoid'
  ).length;
  const highEscalationCount = responses.filter(
    (r) => r.escalation_level === 'High' || r.escalation_level === 'Critical'
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading risk responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Responses</h1>
          <p className="text-gray-600 mt-1">
            Manage risk response strategies and mitigation plans
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Risk Response
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Total Responses
            </CardDescription>
            <CardTitle className="text-3xl">{totalResponses}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mitigate</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {mitigateCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Accept</CardDescription>
            <CardTitle className="text-3xl text-gray-600">
              {acceptCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Transfer</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {transferCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              High Escalation
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {highEscalationCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Response Records</CardTitle>
          <CardDescription>
            View and manage all risk response strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {responses.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No risk responses found
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first risk response
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add Risk Response
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Response ID</TableHead>
                    <TableHead>Risk ID</TableHead>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Responder</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Escalation Level</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map((response) => (
                    <TableRow key={response.id}>
                      <TableCell className="font-medium">
                        {response.response_id}
                      </TableCell>
                      <TableCell>{response.risk_id}</TableCell>
                      <TableCell>
                        {getStrategyBadge(response.response_strategy)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {response.responder_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {response.response_date
                            ? new Date(
                                response.response_date
                              ).toLocaleDateString()
                            : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getEscalationBadge(response.escalation_level)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(response)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(response.id)}
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
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResponse ? 'Edit Risk Response' : 'Add Risk Response'}
            </DialogTitle>
            <DialogDescription>
              {editingResponse
                ? 'Update the risk response details'
                : 'Create a new risk response record'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="response_id">
                    Response ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="response_id"
                    value={formData.response_id}
                    onChange={(e) =>
                      setFormData({ ...formData, response_id: e.target.value })
                    }
                    placeholder="RESP-001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk_id">
                    Risk ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="risk_id"
                    value={formData.risk_id}
                    onChange={(e) =>
                      setFormData({ ...formData, risk_id: e.target.value })
                    }
                    placeholder="RISK-001"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response_strategy">
                  Response Strategy <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.response_strategy}
                  onValueChange={(value) =>
                    setFormData({ ...formData, response_strategy: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mitigate">Mitigate</SelectItem>
                    <SelectItem value="Accept">Accept</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                    <SelectItem value="Avoid">Avoid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response_details">
                  Response Details <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="response_details"
                  value={formData.response_details}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      response_details: e.target.value,
                    })
                  }
                  placeholder="Describe the response plan and actions..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="response_date">
                    Response Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="response_date"
                    type="date"
                    value={formData.response_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        response_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responder_name">
                    Responder Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="responder_name"
                    value={formData.responder_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        responder_name: e.target.value,
                      })
                    }
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalation_level">
                  Escalation Level <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.escalation_level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, escalation_level: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select escalation level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contingency_plan">Contingency Plan</Label>
                <Textarea
                  id="contingency_plan"
                  value={formData.contingency_plan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contingency_plan: e.target.value,
                    })
                  }
                  placeholder="Backup plan if primary response fails..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {editingResponse ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{editingResponse ? 'Update Response' : 'Create Response'}</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}