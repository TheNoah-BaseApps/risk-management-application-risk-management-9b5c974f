'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityIndicator from '@/components/ui/PriorityIndicator';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ArrowLeft, Edit, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, isOverdue } from '@/lib/utils';

const normalizeAssignmentData = (assignment) => ({
  ...assignment,
  assignment_status: assignment.assignment_status || undefined,
  priority_level: assignment.priority_level || undefined,
  assigned_to: assignment.assigned_to || undefined,
});

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = params.id;
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const hasFetched = useRef(false);

  const fetchAssignmentDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assignment details');
      }

      const data = await response.json();
      const normalized = normalizeAssignmentData(data.data);
      setAssignment(normalized);
      setError(null);
    } catch (err) {
      console.error('Fetch assignment details error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    if (assignmentId && !hasFetched.current) {
      hasFetched.current = true;
      fetchAssignmentDetails();
    }
  }, [assignmentId, fetchAssignmentDetails]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Assignment deleted successfully');
        router.push('/assignments');
      } else {
        toast.error(data.error || 'Failed to delete assignment');
      }
    } catch (err) {
      console.error('Delete assignment error:', err);
      toast.error('An error occurred while deleting the assignment');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Assignment not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const overdue = isOverdue(assignment.deadline_date, assignment.assignment_status);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{assignment.assignment_id}</h1>
            <p className="text-gray-600 mt-1">Assignment Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/assignments/${assignment.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {overdue && (
        <Alert variant="destructive">
          <AlertDescription>
            This assignment is overdue. The deadline was {formatDate(assignment.deadline_date)}.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Assignment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1">
                <StatusBadge status={assignment.assignment_status} type="assignment" />
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Priority Level</label>
              <p className="mt-1">
                <PriorityIndicator priority={assignment.priority_level} />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Assigned To</label>
              <p className="mt-1 text-gray-900">{assignment.assigned_to_name || 'Unknown'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Assigned By</label>
              <p className="mt-1 text-gray-900">{assignment.assigned_by_name || 'Unknown'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Assignment Date</label>
              <p className="mt-1 text-gray-900">{formatDate(assignment.assignment_date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Deadline</label>
              <p className={`mt-1 font-medium ${overdue ? 'text-red-600' : 'text-gray-900'}`}>
                {formatDate(assignment.deadline_date)}
              </p>
            </div>
          </div>

          {assignment.notes && (
            <div>
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <p className="mt-1 text-gray-900">{assignment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Associated Risk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Risk ID</label>
                <p className="mt-1 text-gray-900 font-mono">{assignment.risk_id_code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <p className="mt-1">
                  <Badge variant="outline">{assignment.risk_category}</Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1">
                  <StatusBadge status={assignment.risk_status} type="risk" />
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push(`/risks/${assignment.risk_id}`)}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Risk
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Assignment"
        description="Are you sure you want to delete this assignment? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}