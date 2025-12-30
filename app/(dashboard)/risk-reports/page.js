'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from 'sonner';

export default function RiskReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    pending: 0,
    completed: 0
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/risk-reports');
      const data = await response.json();

      if (data.success) {
        setReports(data.data);
        calculateStats(data.data);
      } else {
        toast.error('Failed to load risk reports');
      }
    } catch (error) {
      console.error('Error fetching risk reports:', error);
      toast.error('Error loading risk reports');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reportsData) => {
    const now = new Date();
    const thisMonth = reportsData.filter(r => {
      const reportDate = new Date(r.report_date);
      return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
    }).length;

    setStats({
      total: reportsData.length,
      thisMonth,
      pending: reportsData.filter(r => r.report_type === 'Pending Review').length,
      completed: reportsData.filter(r => r.report_type === 'Final Report').length
    });
  };

  const handleDelete = async () => {
    if (!reportToDelete) return;

    try {
      const response = await fetch(`/api/risk-reports/${reportToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Risk report deleted successfully');
        fetchReports();
        setDeleteDialogOpen(false);
        setReportToDelete(null);
      } else {
        toast.error(data.error || 'Failed to delete risk report');
      }
    } catch (error) {
      console.error('Error deleting risk report:', error);
      toast.error('Error deleting risk report');
    }
  };

  const filteredReports = reports.filter(report =>
    report.report_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.reporter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.report_summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getReportTypeBadge = (type) => {
    const variants = {
      'Initial Report': 'secondary',
      'Progress Update': 'default',
      'Final Report': 'success',
      'Incident Report': 'destructive',
      'Pending Review': 'warning'
    };
    return <Badge variant={variants[type] || 'secondary'}>{type}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading risk reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Reports</h1>
          <p className="text-gray-600 mt-1">Manage and track all risk reporting activities</p>
        </div>
        <Link href="/risk-reports/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Report
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-gray-600 mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-gray-600 mt-1">Current month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-gray-600 mt-1">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-gray-600 mt-1">Final reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No risk reports found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first risk report</p>
              <Link href="/risk-reports/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Risk ID</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.report_id}</TableCell>
                    <TableCell>{report.risk_id}</TableCell>
                    <TableCell>{report.reporter_name}</TableCell>
                    <TableCell>
                      {new Date(report.report_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getReportTypeBadge(report.report_type)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {report.report_summary}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/risk-reports/${report.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/risk-reports/${report.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReportToDelete(report);
                            setDeleteDialogOpen(true);
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Risk Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete report "{reportToDelete?.report_id}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}