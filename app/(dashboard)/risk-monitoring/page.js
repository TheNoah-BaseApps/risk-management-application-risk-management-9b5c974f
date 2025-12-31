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
import { toast } from 'sonner';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';

export default function RiskMonitoringPage() {
  const router = useRouter();
  const [monitoringRecords, setMonitoringRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIssueDetected, setFilterIssueDetected] = useState('all');

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    issuesDetected: 0,
    responseTriggered: 0,
    recentChecks: 0,
  });

  // Form state
  const [formData, setFormData] = useState({
    monitoring_id: '',
    risk_id: '',
    monitoring_date: '',
    monitored_by: '',
    monitoring_method: '',
    issue_detected: false,
    response_triggered: false,
    status_after_check: '',
  });

  useEffect(() => {
    fetchMonitoringRecords();
  }, []);

  const fetchMonitoringRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/risk-monitoring');
      const data = await response.json();

      if (data.success) {
        setMonitoringRecords(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to fetch monitoring records');
      }
    } catch (error) {
      console.error('Error fetching monitoring records:', error);
      toast.error('Error loading monitoring records');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records) => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    setStats({
      total: records.length,
      issuesDetected: records.filter((r) => r.issue_detected).length,
      responseTriggered: records.filter((r) => r.response_triggered).length,
      recentChecks: records.filter(
        (r) => new Date(r.monitoring_date) >= sevenDaysAgo
      ).length,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/risk-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Monitoring record created successfully');
        setShowAddModal(false);
        resetForm();
        fetchMonitoringRecords();
      } else {
        toast.error(data.error || 'Failed to create monitoring record');
      }
    } catch (error) {
      console.error('Error creating monitoring record:', error);
      toast.error('Error creating monitoring record');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/risk-monitoring/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Monitoring record updated successfully');
        setShowEditModal(false);
        setSelectedRecord(null);
        resetForm();
        fetchMonitoringRecords();
      } else {
        toast.error(data.error || 'Failed to update monitoring record');
      }
    } catch (error) {
      console.error('Error updating monitoring record:', error);
      toast.error('Error updating monitoring record');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this monitoring record?')) return;

    try {
      const response = await fetch(`/api/risk-monitoring/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Monitoring record deleted successfully');
        fetchMonitoringRecords();
      } else {
        toast.error(data.error || 'Failed to delete monitoring record');
      }
    } catch (error) {
      console.error('Error deleting monitoring record:', error);
      toast.error('Error deleting monitoring record');
    }
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setFormData({
      monitoring_id: record.monitoring_id,
      risk_id: record.risk_id,
      monitoring_date: record.monitoring_date.split('T')[0],
      monitored_by: record.monitored_by,
      monitoring_method: record.monitoring_method,
      issue_detected: record.issue_detected,
      response_triggered: record.response_triggered,
      status_after_check: record.status_after_check,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      monitoring_id: '',
      risk_id: '',
      monitoring_date: '',
      monitored_by: '',
      monitoring_method: '',
      issue_detected: false,
      response_triggered: false,
      status_after_check: '',
    });
  };

  const filteredRecords = monitoringRecords.filter((record) => {
    const matchesSearch =
      record.monitoring_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.risk_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.monitored_by.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterIssueDetected === 'all' ||
      (filterIssueDetected === 'detected' && record.issue_detected) ||
      (filterIssueDetected === 'none' && !record.issue_detected);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading monitoring records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Monitoring</h1>
          <p className="text-gray-600 mt-1">
            Track and monitor risk activities and issue detection
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Monitoring Record
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Checks
            </CardTitle>
            <Activity className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-500 mt-1">All monitoring records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Issues Detected
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.issuesDetected}</div>
            <p className="text-xs text-gray-500 mt-1">Detected issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Responses Triggered
            </CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.responseTriggered}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Recent Checks
            </CardTitle>
            <Clock className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.recentChecks}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by monitoring ID, risk ID, or monitor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterIssueDetected} onValueChange={setFilterIssueDetected}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="detected">Issues Detected</SelectItem>
                <SelectItem value="none">No Issues</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No monitoring records found
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first monitoring record
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Monitoring Record
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Monitoring ID</TableHead>
                  <TableHead>Risk ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Monitored By</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Issue Detected</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.monitoring_id}</TableCell>
                    <TableCell>{record.risk_id}</TableCell>
                    <TableCell>
                      {new Date(record.monitoring_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{record.monitored_by}</TableCell>
                    <TableCell>{record.monitoring_method}</TableCell>
                    <TableCell>
                      {record.issue_detected ? (
                        <Badge variant="destructive">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.response_triggered ? (
                        <Badge variant="default">Triggered</Badge>
                      ) : (
                        <Badge variant="outline">None</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.status_after_check}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(record)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
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

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Monitoring Record</DialogTitle>
            <DialogDescription>
              Create a new risk monitoring record with detailed information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monitoring_id">Monitoring ID *</Label>
                <Input
                  id="monitoring_id"
                  value={formData.monitoring_id}
                  onChange={(e) =>
                    setFormData({ ...formData, monitoring_id: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk_id">Risk ID *</Label>
                <Input
                  id="risk_id"
                  value={formData.risk_id}
                  onChange={(e) =>
                    setFormData({ ...formData, risk_id: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monitoring_date">Monitoring Date *</Label>
                <Input
                  id="monitoring_date"
                  type="date"
                  value={formData.monitoring_date}
                  onChange={(e) =>
                    setFormData({ ...formData, monitoring_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monitored_by">Monitored By *</Label>
                <Input
                  id="monitored_by"
                  value={formData.monitored_by}
                  onChange={(e) =>
                    setFormData({ ...formData, monitored_by: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monitoring_method">Monitoring Method *</Label>
              <Input
                id="monitoring_method"
                value={formData.monitoring_method}
                onChange={(e) =>
                  setFormData({ ...formData, monitoring_method: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issue_detected">Issue Detected *</Label>
                <Select
                  value={formData.issue_detected.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, issue_detected: value === 'true' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="response_triggered">Response Triggered *</Label>
                <Select
                  value={formData.response_triggered.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, response_triggered: value === 'true' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status_after_check">Status After Check *</Label>
              <Input
                id="status_after_check"
                value={formData.status_after_check}
                onChange={(e) =>
                  setFormData({ ...formData, status_after_check: e.target.value })
                }
                placeholder="e.g., Active, Resolved, Under Review"
                required
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Create Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Monitoring Record</DialogTitle>
            <DialogDescription>
              Update monitoring record information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_monitoring_id">Monitoring ID</Label>
                <Input
                  id="edit_monitoring_id"
                  value={formData.monitoring_id}
                  onChange={(e) =>
                    setFormData({ ...formData, monitoring_id: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_risk_id">Risk ID</Label>
                <Input
                  id="edit_risk_id"
                  value={formData.risk_id}
                  onChange={(e) =>
                    setFormData({ ...formData, risk_id: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_monitoring_date">Monitoring Date</Label>
                <Input
                  id="edit_monitoring_date"
                  type="date"
                  value={formData.monitoring_date}
                  onChange={(e) =>
                    setFormData({ ...formData, monitoring_date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_monitored_by">Monitored By</Label>
                <Input
                  id="edit_monitored_by"
                  value={formData.monitored_by}
                  onChange={(e) =>
                    setFormData({ ...formData, monitored_by: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_monitoring_method">Monitoring Method</Label>
              <Input
                id="edit_monitoring_method"
                value={formData.monitoring_method}
                onChange={(e) =>
                  setFormData({ ...formData, monitoring_method: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_issue_detected">Issue Detected</Label>
                <Select
                  value={formData.issue_detected.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, issue_detected: value === 'true' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_response_triggered">Response Triggered</Label>
                <Select
                  value={formData.response_triggered.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, response_triggered: value === 'true' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_status_after_check">Status After Check</Label>
              <Input
                id="edit_status_after_check"
                value={formData.status_after_check}
                onChange={(e) =>
                  setFormData({ ...formData, status_after_check: e.target.value })
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRecord(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}