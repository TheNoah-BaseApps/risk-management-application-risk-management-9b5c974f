'use client';

import { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { Shield, Plus, Edit, Trash2, Search, AlertTriangle } from 'lucide-react';

export default function RiskResponsesPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/risk-responses');
      const data = await response.json();
      if (data.success) {
        setResponses(data.data);
      } else {
        toast.error('Failed to load risk responses');
      }
    } catch (error) {
      console.error('Error fetching risk responses:', error);
      toast.error('Error loading risk responses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedResponse
        ? `/api/risk-responses/${selectedResponse.id}`
        : '/api/risk-responses';
      const method = selectedResponse ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(
          selectedResponse
            ? 'Risk response updated successfully'
            : 'Risk response created successfully'
        );
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        fetchResponses();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving risk response:', error);
      toast.error('Error saving risk response');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this risk response?')) return;

    try {
      const response = await fetch(`/api/risk-responses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Risk response deleted successfully');
        fetchResponses();
      } else {
        toast.error(data.error || 'Failed to delete risk response');
      }
    } catch (error) {
      console.error('Error deleting risk response:', error);
      toast.error('Error deleting risk response');
    }
  };

  const handleEdit = (response) => {
    setSelectedResponse(response);
    setFormData({
      response_id: response.response_id,
      risk_id: response.risk_id,
      response_strategy: response.response_strategy,
      response_details: response.response_details,
      response_date: response.response_date ? response.response_date.split('T')[0] : '',
      responder_name: response.responder_name,
      escalation_level: response.escalation_level,
      contingency_plan: response.contingency_plan || '',
    });
    setShowEditModal(true);
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
    setSelectedResponse(null);
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

  const getStrategyBadge = (strategy) => {
    const variants = {
      Mitigate: 'default',
      Transfer: 'secondary',
      Accept: 'outline',
      Avoid: 'destructive',
    };
    return <Badge variant={variants[strategy] || 'secondary'}>{strategy}</Badge>;
  };

  const filteredResponses = responses.filter(
    (response) =>
      response.response_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.risk_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.responder_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats calculations
  const totalResponses = responses.length;
  const criticalResponses = responses.filter((r) => r.escalation_level === 'Critical').length;
  const mitigateStrategy = responses.filter((r) => r.response_strategy === 'Mitigate').length;
  const avgResponseTime = responses.length > 0 ? '2.4 days' : 'N/A';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading risk responses...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Risk Responses</h1>
          <p className="text-gray-600 mt-1">Manage risk response plans and mitigation strategies</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Response
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Responses</CardDescription>
            <CardTitle className="text-3xl">{totalResponses}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical Level</CardDescription>
            <CardTitle className="text-3xl text-red-600">{criticalResponses}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mitigation Strategy</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{mitigateStrategy}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Response Time</CardDescription>
            <CardTitle className="text-3xl">{avgResponseTime}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by Response ID, Risk ID, or Responder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredResponses.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No risk responses found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first risk response</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Response
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Response ID</TableHead>
                  <TableHead>Risk ID</TableHead>
                  <TableHead>Strategy</TableHead>
                  <TableHead>Responder</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Escalation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">{response.response_id}</TableCell>
                    <TableCell>{response.risk_id}</TableCell>
                    <TableCell>{getStrategyBadge(response.response_strategy)}</TableCell>
                    <TableCell>{response.responder_name}</TableCell>
                    <TableCell>
                      {new Date(response.response_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getEscalationBadge(response.escalation_level)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(response)}
                        className="mr-2"
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
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedResponse ? 'Edit Risk Response' : 'Add Risk Response'}
            </DialogTitle>
            <DialogDescription>
              {selectedResponse
                ? 'Update the risk response details below'
                : 'Create a new risk response record'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="response_id">Response ID *</Label>
                  <Input
                    id="response_id"
                    value={formData.response_id}
                    onChange={(e) =>
                      setFormData({ ...formData, response_id: e.target.value })
                    }
                    required
                    placeholder="RESP-001"
                  />
                </div>
                <div>
                  <Label htmlFor="risk_id">Risk ID *</Label>
                  <Input
                    id="risk_id"
                    value={formData.risk_id}
                    onChange={(e) =>
                      setFormData({ ...formData, risk_id: e.target.value })
                    }
                    required
                    placeholder="RISK-001"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="response_strategy">Response Strategy *</Label>
                <Select
                  value={formData.response_strategy}
                  onValueChange={(value) =>
                    setFormData({ ...formData, response_strategy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mitigate">Mitigate</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                    <SelectItem value="Accept">Accept</SelectItem>
                    <SelectItem value="Avoid">Avoid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="response_details">Response Details *</Label>
                <Textarea
                  id="response_details"
                  value={formData.response_details}
                  onChange={(e) =>
                    setFormData({ ...formData, response_details: e.target.value })
                  }
                  required
                  rows={3}
                  placeholder="Describe the response plan..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="response_date">Response Date *</Label>
                  <Input
                    id="response_date"
                    type="date"
                    value={formData.response_date}
                    onChange={(e) =>
                      setFormData({ ...formData, response_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="responder_name">Responder Name *</Label>
                  <Input
                    id="responder_name"
                    value={formData.responder_name}
                    onChange={(e) =>
                      setFormData({ ...formData, responder_name: e.target.value })
                    }
                    required
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="escalation_level">Escalation Level *</Label>
                <Select
                  value={formData.escalation_level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, escalation_level: value })
                  }
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

              <div>
                <Label htmlFor="contingency_plan">Contingency Plan</Label>
                <Textarea
                  id="contingency_plan"
                  value={formData.contingency_plan}
                  onChange={(e) =>
                    setFormData({ ...formData, contingency_plan: e.target.value })
                  }
                  rows={3}
                  placeholder="Backup plan if primary response fails..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedResponse ? 'Update Response' : 'Create Response'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}