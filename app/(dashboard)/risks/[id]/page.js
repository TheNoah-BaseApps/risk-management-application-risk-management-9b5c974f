'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/ui/StatusBadge';
import ActivityTimeline from '@/components/ui/ActivityTimeline';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ArrowLeft, Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

const normalizeRiskData = (risk) => ({
  ...risk,
  severity: risk.severity || undefined,
  status: risk.status || undefined,
  risk_category: risk.risk_category || undefined,
  impact_level: risk.impact_level || undefined,
  probability: risk.probability || undefined,
});

export default function RiskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const riskId = params.id;
  const [risk, setRisk] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasFetchedRisk = useRef(false);
  const hasFetchedUpdates = useRef(false);

  const fetchRiskDetails = useCallback(async () => {
    if (!riskId || hasFetchedRisk.current) return;
    
    hasFetchedRisk.current = true;
    setLoading(true);
    
    try {
      const response = await fetch(`/api/risks/${riskId}`, { credentials: 'include' });

      if (!response.ok) {
        throw new Error('Failed to fetch risk details');
      }

      const riskData = await response.json();
      const normalized = normalizeRiskData(riskData.data);
      setRisk(normalized);
      setError(null);
    } catch (err) {
      console.error('Fetch risk details error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [riskId]);

  const fetchUpdates = useCallback(async () => {
    if (!riskId || hasFetchedUpdates.current) return;
    
    hasFetchedUpdates.current = true;
    
    try {
      const response = await fetch(`/api/risks/${riskId}/updates`, { credentials: 'include' });
      
      if (response.ok) {
        const updatesData = await response.json();
        setUpdates(updatesData.data || []);
      }
    } catch (err) {
      console.error('Fetch updates error:', err);
    }
  }, [riskId]);

  useEffect(() => {
    if (riskId && !hasFetchedRisk.current) {
      fetchRiskDetails();
    }
  }, [riskId, fetchRiskDetails]);

  useEffect(() => {
    if (riskId && !hasFetchedUpdates.current) {
      fetchUpdates();
    }
  }, [riskId, fetchUpdates]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/risks/${riskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Risk deleted successfully');
        router.push('/risks');
      } else {
        toast.error(data.error || 'Failed to delete risk');
      }
    } catch (err) {
      console.error('Delete risk error:', err);
      toast.error('An error occurred while deleting the risk');
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

  if (error || !risk) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Risk not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{risk.risk_id}</h1>
            <p className="text-gray-600 mt-1">{risk.risk_category} Risk</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/assignments/new?riskId=${risk.id}`)}>
            <Users className="mr-2 h-4 w-4" />
            Assign Risk
          </Button>
          <Button variant="outline" onClick={() => router.push(`/risks/${risk.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-gray-900">{risk.risk_description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <p className="mt-1">
                    <Badge variant="outline">{risk.risk_category}</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1">
                    <StatusBadge status={risk.status} type="risk" />
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Risk Source</label>
                <p className="mt-1 text-gray-900">{risk.risk_source}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Risk Trigger</label>
                <p className="mt-1 text-gray-900">{risk.risk_trigger || 'Not specified'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Identified By</label>
                  <p className="mt-1 text-gray-900">{risk.identified_by_name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Identification Date</label>
                  <p className="mt-1 text-gray-900">{formatDate(risk.identification_date)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={updates} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {risk.assignments && risk.assignments.length > 0 ? (
                <div className="space-y-3">
                  {risk.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/assignments/${assignment.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{assignment.assignment_id}</span>
                        <StatusBadge status={assignment.assignment_status} type="assignment" />
                      </div>
                      <p className="text-sm text-gray-600">Assigned to: {assignment.assigned_to_name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Priority: <Badge variant="outline">{assignment.priority_level}</Badge>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-4">No assignments yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Risk"
        description="Are you sure you want to delete this risk? This action cannot be undone."
        loading={deleting}
      />
    </div>
  );
}