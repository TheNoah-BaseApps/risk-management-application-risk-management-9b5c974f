'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DatePicker from '@/components/ui/DatePicker';
import UserSelector from '@/components/ui/UserSelector';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AssignmentForm({ onSuccess, assignment = null, defaultRiskId = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [risks, setRisks] = useState([]);
  const [loadingRisks, setLoadingRisks] = useState(true);

  const normalizeSelectValue = (value) => (!value || value === "" ? undefined : value);

  const [formData, setFormData] = useState({
    risk_id: normalizeSelectValue(assignment?.risk_id || defaultRiskId),
    assigned_to: normalizeSelectValue(assignment?.assigned_to),
    priority_level: normalizeSelectValue(assignment?.priority_level),
    deadline_date: assignment?.deadline_date || '',
    assignment_status: normalizeSelectValue(assignment?.assignment_status) || 'Pending',
    notes: assignment?.notes || '',
  });

  const priorities = ['Critical', 'High', 'Medium', 'Low'];
  const statuses = ['Pending', 'In Progress', 'Under Review', 'Completed', 'Cancelled'];

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const response = await fetch('/api/risks?status=Identified,Assigned,In Mitigation', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setRisks(data.data || []);
        }
      } catch (err) {
        console.error('Fetch risks error:', err);
      } finally {
        setLoadingRisks(false);
      }
    };

    fetchRisks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation for required Select fields
    if (!formData.risk_id) {
      setError('Please select a risk');
      setLoading(false);
      return;
    }

    if (!formData.assigned_to) {
      setError('Please assign to a user');
      setLoading(false);
      return;
    }

    if (!formData.priority_level) {
      setError('Please select a priority level');
      setLoading(false);
      return;
    }

    if (!formData.deadline_date) {
      setError('Please select a deadline date');
      setLoading(false);
      return;
    }

    // Validation
    const deadlineDate = new Date(formData.deadline_date);
    if (deadlineDate <= new Date()) {
      setError('Deadline must be in the future');
      setLoading(false);
      return;
    }

    try {
      const url = assignment ? `/api/assignments/${assignment.id}` : '/api/assignments';
      const method = assignment ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          assignment ? 'Assignment updated successfully' : 'Assignment created successfully'
        );
        onSuccess?.();
      } else {
        setError(data.error || 'Failed to save assignment');
      }
    } catch (err) {
      console.error('Assignment form error:', err);
      setError('An error occurred while saving the assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    const normalizedValue = normalizeSelectValue(value);
    setFormData({ ...formData, [field]: normalizedValue });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="risk_id">Risk *</Label>
        <Select
          value={normalizeSelectValue(formData.risk_id)}
          onValueChange={(value) => handleChange('risk_id', value)}
          required
          disabled={loadingRisks || !!defaultRiskId}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingRisks ? 'Loading risks...' : 'Select risk'} />
          </SelectTrigger>
          <SelectContent>
            {risks.map((risk) => (
              <SelectItem key={risk.id} value={risk.id}>
                {risk.risk_id} - {risk.risk_category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Assign To *</Label>
          <UserSelector
            value={normalizeSelectValue(formData.assigned_to)}
            onChange={(value) => handleChange('assigned_to', value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority_level">Priority Level *</Label>
          <Select
            value={normalizeSelectValue(formData.priority_level)}
            onValueChange={(value) => handleChange('priority_level', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Deadline Date *</Label>
          <DatePicker
            value={formData.deadline_date}
            onChange={(value) => handleChange('deadline_date', value)}
            required
          />
        </div>

        {assignment && (
          <div className="space-y-2">
            <Label htmlFor="assignment_status">Status</Label>
            <Select
              value={normalizeSelectValue(formData.assignment_status)}
              onValueChange={(value) => handleChange('assignment_status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes or instructions"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {assignment ? 'Updating...' : 'Creating...'}
            </>
          ) : assignment ? (
            'Update Assignment'
          ) : (
            'Create Assignment'
          )}
        </Button>
      </div>
    </form>
  );
}