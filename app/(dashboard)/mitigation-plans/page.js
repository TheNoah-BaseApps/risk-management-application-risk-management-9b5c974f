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
import { Shield, Plus, Edit, Trash2, Search, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function MitigationPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEffectiveness, setFilterEffectiveness] = useState('');
  
  // Helper function to normalize Select values
  const normalizeSelectValue = (value) => value === "" || value === null ? undefined : value;
  
  // Form state
  const [formData, setFormData] = useState({
    mitigation_plan_id: '',
    risk_id: '',
    mitigation_action: '',
    action_owner: '',
    implementation_date: '',
    review_frequency: undefined,
    effectiveness: undefined,
    monitoring_plan: '',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterEffectiveness) params.append('effectiveness', filterEffectiveness);
      
      const response = await fetch(`/api/mitigation-plans?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.data);
      } else {
        toast.error('Failed to fetch mitigation plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Error loading mitigation plans');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = selectedPlan 
        ? `/api/mitigation-plans/${selectedPlan.id}`
        : '/api/mitigation-plans';
      
      const method = selectedPlan ? 'PUT' : 'POST';
      
      // Convert undefined back to empty string for backend compatibility
      const submitData = {
        ...formData,
        review_frequency: formData.review_frequency || '',
        effectiveness: formData.effectiveness || '',
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(selectedPlan ? 'Plan updated successfully' : 'Plan created successfully');
        setShowAddDialog(false);
        setShowEditDialog(false);
        resetForm();
        fetchPlans();
      } else {
        toast.error(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedPlan) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/mitigation-plans/${selectedPlan.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Plan deleted successfully');
        setShowDeleteDialog(false);
        setSelectedPlan(null);
        fetchPlans();
      } else {
        toast.error(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setFormData({
      mitigation_plan_id: '',
      risk_id: '',
      mitigation_action: '',
      action_owner: '',
      implementation_date: '',
      review_frequency: undefined,
      effectiveness: undefined,
      monitoring_plan: '',
    });
    setSelectedPlan(null);
  }

  function openEditDialog(plan) {
    setSelectedPlan(plan);
    setFormData({
      mitigation_plan_id: plan.mitigation_plan_id,
      risk_id: plan.risk_id,
      mitigation_action: plan.mitigation_action,
      action_owner: plan.action_owner,
      implementation_date: plan.implementation_date?.split('T')[0] || '',
      review_frequency: normalizeSelectValue(plan.review_frequency),
      effectiveness: normalizeSelectValue(plan.effectiveness),
      monitoring_plan: plan.monitoring_plan,
    });
    setShowEditDialog(true);
  }

  function openDeleteDialog(plan) {
    setSelectedPlan(plan);
    setShowDeleteDialog(true);
  }

  const filteredPlans = plans.filter((plan) => {
    const matchesSearch = 
      plan.mitigation_plan_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.risk_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.action_owner?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const stats = [
    {
      title: 'Total Plans',
      value: plans.length,
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'High Effectiveness',
      value: plans.filter(p => p.effectiveness === 'High').length,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Medium Effectiveness',
      value: plans.filter(p => p.effectiveness === 'Medium').length,
      icon: Shield,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Low Effectiveness',
      value: plans.filter(p => p.effectiveness === 'Low').length,
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const getEffectivenessBadge = (effectiveness) => {
    const variants = {
      High: 'default',
      Medium: 'secondary',
      Low: 'destructive',
    };
    return <Badge variant={variants[effectiveness] || 'outline'}>{effectiveness}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Mitigation Plans</h1>
          <p className="text-gray-600 mt-1">Manage mitigation actions and effectiveness tracking</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Mitigation Plan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="effectiveness">Effectiveness</Label>
              <Select value={filterEffectiveness} onValueChange={setFilterEffectiveness}>
                <SelectTrigger id="effectiveness">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterEffectiveness('');
                  fetchPlans();
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mitigation Plans</CardTitle>
          <CardDescription>
            {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mitigation plans found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first mitigation plan</p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Mitigation Plan
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan ID</TableHead>
                  <TableHead>Risk ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Implementation</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Effectiveness</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.mitigation_plan_id}</TableCell>
                    <TableCell>{plan.risk_id}</TableCell>
                    <TableCell className="max-w-xs truncate">{plan.mitigation_action}</TableCell>
                    <TableCell>{plan.action_owner}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {new Date(plan.implementation_date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>{plan.review_frequency}</TableCell>
                    <TableCell>{getEffectivenessBadge(plan.effectiveness)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(plan)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Mitigation Plan</DialogTitle>
            <DialogDescription>Create a new risk mitigation plan</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-plan-id">Plan ID *</Label>
                  <Input
                    id="add-plan-id"
                    value={formData.mitigation_plan_id}
                    onChange={(e) => setFormData({ ...formData, mitigation_plan_id: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="add-risk-id">Risk ID *</Label>
                  <Input
                    id="add-risk-id"
                    value={formData.risk_id}
                    onChange={(e) => setFormData({ ...formData, risk_id: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="add-action">Mitigation Action *</Label>
                <Textarea
                  id="add-action"
                  value={formData.mitigation_action}
                  onChange={(e) => setFormData({ ...formData, mitigation_action: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-owner">Action Owner *</Label>
                  <Input
                    id="add-owner"
                    value={formData.action_owner}
                    onChange={(e) => setFormData({ ...formData, action_owner: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="add-date">Implementation Date *</Label>
                  <Input
                    id="add-date"
                    type="date"
                    value={formData.implementation_date}
                    onChange={(e) => setFormData({ ...formData, implementation_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="add-frequency">Review Frequency *</Label>
                  <Input
                    id="add-frequency"
                    value={formData.review_frequency || ''}
                    onChange={(e) => setFormData({ ...formData, review_frequency: normalizeSelectValue(e.target.value) })}
                    placeholder="e.g., Monthly, Quarterly"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="add-effectiveness">Effectiveness *</Label>
                  <Select
                    value={formData.effectiveness}
                    onValueChange={(value) => setFormData({ ...formData, effectiveness: value })}
                    required
                  >
                    <SelectTrigger id="add-effectiveness">
                      <SelectValue placeholder="Select effectiveness" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="add-monitoring">Monitoring Plan *</Label>
                <Textarea
                  id="add-monitoring"
                  value={formData.monitoring_plan}
                  onChange={(e) => setFormData({ ...formData, monitoring_plan: e.target.value })}
                  required
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowAddDialog(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Plan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Mitigation Plan</DialogTitle>
            <DialogDescription>Update mitigation plan details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-plan-id">Plan ID</Label>
                  <Input
                    id="edit-plan-id"
                    value={formData.mitigation_plan_id}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="edit-risk-id">Risk ID</Label>
                  <Input
                    id="edit-risk-id"
                    value={formData.risk_id}
                    disabled
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-action">Mitigation Action *</Label>
                <Textarea
                  id="edit-action"
                  value={formData.mitigation_action}
                  onChange={(e) => setFormData({ ...formData, mitigation_action: e.target.value })}
                  required
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-owner">Action Owner *</Label>
                  <Input
                    id="edit-owner"
                    value={formData.action_owner}
                    onChange={(e) => setFormData({ ...formData, action_owner: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-date">Implementation Date *</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={formData.implementation_date}
                    onChange={(e) => setFormData({ ...formData, implementation_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-frequency">Review Frequency *</Label>
                  <Input
                    id="edit-frequency"
                    value={formData.review_frequency || ''}
                    onChange={(e) => setFormData({ ...formData, review_frequency: normalizeSelectValue(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-effectiveness">Effectiveness *</Label>
                  <Select
                    value={formData.effectiveness}
                    onValueChange={(value) => setFormData({ ...formData, effectiveness: value })}
                    required
                  >
                    <SelectTrigger id="edit-effectiveness">
                      <SelectValue placeholder="Select effectiveness" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-monitoring">Monitoring Plan *</Label>
                <Textarea
                  id="edit-monitoring"
                  value={formData.monitoring_plan}
                  onChange={(e) => setFormData({ ...formData, monitoring_plan: e.target.value })}
                  required
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowEditDialog(false); resetForm(); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Plan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this mitigation plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteDialog(false); setSelectedPlan(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}