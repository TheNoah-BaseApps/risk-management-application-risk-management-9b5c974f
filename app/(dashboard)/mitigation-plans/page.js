'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Clock,
  User,
  TrendingUp,
  Loader2,
} from 'lucide-react';

export default function MitigationPlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mitigation_plan_id: '',
    risk_id: '',
    mitigation_action: '',
    action_owner: '',
    implementation_date: '',
    review_frequency: '',
    effectiveness: '',
    monitoring_plan: '',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mitigation-plans');
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      } else {
        toast.error('Failed to fetch mitigation plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to fetch mitigation plans');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/mitigation-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Mitigation plan created successfully');
        setShowAddModal(false);
        setFormData({
          mitigation_plan_id: '',
          risk_id: '',
          mitigation_action: '',
          action_owner: '',
          implementation_date: '',
          review_frequency: '',
          effectiveness: '',
          monitoring_plan: '',
        });
        fetchPlans();
      } else {
        toast.error(data.error || 'Failed to create mitigation plan');
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      toast.error('Failed to create mitigation plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/mitigation-plans/${selectedPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Mitigation plan updated successfully');
        setShowEditModal(false);
        setSelectedPlan(null);
        fetchPlans();
      } else {
        toast.error(data.error || 'Failed to update mitigation plan');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update mitigation plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);

    try {
      const response = await fetch(`/api/mitigation-plans/${selectedPlan.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Mitigation plan deleted successfully');
        setShowDeleteDialog(false);
        setSelectedPlan(null);
        fetchPlans();
      } else {
        toast.error(data.error || 'Failed to delete mitigation plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete mitigation plan');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      mitigation_plan_id: plan.mitigation_plan_id,
      risk_id: plan.risk_id,
      mitigation_action: plan.mitigation_action,
      action_owner: plan.action_owner,
      implementation_date: plan.implementation_date?.split('T')[0] || '',
      review_frequency: plan.review_frequency,
      effectiveness: plan.effectiveness,
      monitoring_plan: plan.monitoring_plan,
    });
    setShowEditModal(true);
  };

  const openDeleteDialog = (plan) => {
    setSelectedPlan(plan);
    setShowDeleteDialog(true);
  };

  const getEffectivenessBadge = (effectiveness) => {
    const variants = {
      High: 'default',
      Medium: 'secondary',
      Low: 'destructive',
    };
    return <Badge variant={variants[effectiveness] || 'outline'}>{effectiveness}</Badge>;
  };

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
      value: plans.filter((p) => p.effectiveness === 'High').length,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Plans',
      value: plans.filter((p) => new Date(p.implementation_date) <= new Date()).length,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Unique Owners',
      value: new Set(plans.map((p) => p.action_owner)).size,
      icon: User,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
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
          <h1 className="text-3xl font-bold text-gray-900">Risk Mitigation Plans</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage mitigation strategies and action plans for identified risks
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Mitigation Plan
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Mitigation Plans</CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No mitigation plans</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new mitigation plan.</p>
              <div className="mt-6">
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Mitigation Plan
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan ID</TableHead>
                  <TableHead>Risk ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Implementation Date</TableHead>
                  <TableHead>Review Frequency</TableHead>
                  <TableHead>Effectiveness</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.mitigation_plan_id}</TableCell>
                    <TableCell>{plan.risk_id}</TableCell>
                    <TableCell className="max-w-xs truncate">{plan.mitigation_action}</TableCell>
                    <TableCell>{plan.action_owner}</TableCell>
                    <TableCell>{new Date(plan.implementation_date).toLocaleDateString()}</TableCell>
                    <TableCell>{plan.review_frequency}</TableCell>
                    <TableCell>{getEffectivenessBadge(plan.effectiveness)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(plan)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Mitigation Plan</DialogTitle>
            <DialogDescription>
              Create a new risk mitigation plan with action details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mitigation_plan_id">Plan ID *</Label>
                <Input
                  id="mitigation_plan_id"
                  name="mitigation_plan_id"
                  value={formData.mitigation_plan_id}
                  onChange={handleInputChange}
                  required
                  placeholder="MP-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk_id">Risk ID *</Label>
                <Input
                  id="risk_id"
                  name="risk_id"
                  value={formData.risk_id}
                  onChange={handleInputChange}
                  required
                  placeholder="RISK-001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mitigation_action">Mitigation Action *</Label>
              <Textarea
                id="mitigation_action"
                name="mitigation_action"
                value={formData.mitigation_action}
                onChange={handleInputChange}
                required
                placeholder="Describe the mitigation action..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="action_owner">Action Owner *</Label>
                <Input
                  id="action_owner"
                  name="action_owner"
                  value={formData.action_owner}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="implementation_date">Implementation Date *</Label>
                <Input
                  id="implementation_date"
                  name="implementation_date"
                  type="date"
                  value={formData.implementation_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="review_frequency">Review Frequency *</Label>
                <Select
                  value={formData.review_frequency}
                  onValueChange={(value) => handleSelectChange('review_frequency', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="effectiveness">Effectiveness *</Label>
                <Select
                  value={formData.effectiveness}
                  onValueChange={(value) => handleSelectChange('effectiveness', value)}
                  required
                >
                  <SelectTrigger>
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
            <div className="space-y-2">
              <Label htmlFor="monitoring_plan">Monitoring Plan *</Label>
              <Textarea
                id="monitoring_plan"
                name="monitoring_plan"
                value={formData.monitoring_plan}
                onChange={handleInputChange}
                required
                placeholder="Describe the monitoring plan..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Plan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Mitigation Plan</DialogTitle>
            <DialogDescription>
              Update the mitigation plan details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_mitigation_plan_id">Plan ID *</Label>
                <Input
                  id="edit_mitigation_plan_id"
                  name="mitigation_plan_id"
                  value={formData.mitigation_plan_id}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_risk_id">Risk ID *</Label>
                <Input
                  id="edit_risk_id"
                  name="risk_id"
                  value={formData.risk_id}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_mitigation_action">Mitigation Action *</Label>
              <Textarea
                id="edit_mitigation_action"
                name="mitigation_action"
                value={formData.mitigation_action}
                onChange={handleInputChange}
                required
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_action_owner">Action Owner *</Label>
                <Input
                  id="edit_action_owner"
                  name="action_owner"
                  value={formData.action_owner}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_implementation_date">Implementation Date *</Label>
                <Input
                  id="edit_implementation_date"
                  name="implementation_date"
                  type="date"
                  value={formData.implementation_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_review_frequency">Review Frequency *</Label>
                <Select
                  value={formData.review_frequency}
                  onValueChange={(value) => handleSelectChange('review_frequency', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_effectiveness">Effectiveness *</Label>
                <Select
                  value={formData.effectiveness}
                  onValueChange={(value) => handleSelectChange('effectiveness', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_monitoring_plan">Monitoring Plan *</Label>
              <Textarea
                id="edit_monitoring_plan"
                name="monitoring_plan"
                value={formData.monitoring_plan}
                onChange={handleInputChange}
                required
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Plan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Mitigation Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this mitigation plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}