'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function RiskForm({ onSuccess, risk = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    risk_category: risk?.risk_category || undefined,
    risk_description: risk?.risk_description || '',
    risk_source: risk?.risk_source || undefined,
    risk_trigger: risk?.risk_trigger || '',
    status: risk?.status || 'Identified',
  });

  const categories = [
    'Technical',
    'Financial',
    'Operational',
    'Strategic',
    'Compliance',
    'Security',
    'Other',
  ];

  const sources = [
    'Internal Audit',
    'External Audit',
    'Customer Feedback',
    'Incident Report',
    'Project Review',
    'Regulatory Change',
    'Market Analysis',
    'Other',
  ];

  const statuses = ['Identified', 'Assigned', 'In Mitigation', 'Resolved', 'Closed'];

  const normalizeSelectValue = (value) => (!value || value === "" ? undefined : value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.risk_category) {
      setError('Risk category is required');
      setLoading(false);
      return;
    }

    if (!formData.risk_source) {
      setError('Risk source is required');
      setLoading(false);
      return;
    }

    if (formData.risk_description.length < 20) {
      setError('Risk description must be at least 20 characters');
      setLoading(false);
      return;
    }

    if (formData.risk_description.length > 1000) {
      setError('Risk description must not exceed 1000 characters');
      setLoading(false);
      return;
    }

    try {
      const url = risk ? `/api/risks/${risk.id}` : '/api/risks';
      const method = risk ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(risk ? 'Risk updated successfully' : 'Risk created successfully');
        onSuccess?.();
      } else {
        setError(data.error || 'Failed to save risk');
      }
    } catch (err) {
      console.error('Risk form error:', err);
      setError('An error occurred while saving the risk');
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="risk_category">Risk Category *</Label>
          <Select
            value={normalizeSelectValue(formData.risk_category)}
            onValueChange={(value) => handleChange('risk_category', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="risk_source">Risk Source *</Label>
          <Select
            value={normalizeSelectValue(formData.risk_source)}
            onValueChange={(value) => handleChange('risk_source', value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="risk_description">Risk Description *</Label>
        <Textarea
          id="risk_description"
          placeholder="Provide a detailed description of the risk (20-1000 characters)"
          value={formData.risk_description}
          onChange={(e) => handleChange('risk_description', e.target.value)}
          required
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-gray-500">
          {formData.risk_description.length}/1000 characters (minimum 20)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="risk_trigger">Risk Trigger</Label>
        <Input
          id="risk_trigger"
          placeholder="What event or condition triggers this risk?"
          value={formData.risk_trigger}
          onChange={(e) => handleChange('risk_trigger', e.target.value)}
        />
      </div>

      {risk && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={normalizeSelectValue(formData.status)}
            onValueChange={(value) => handleChange('status', value)}
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

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {risk ? 'Updating...' : 'Creating...'}
            </>
          ) : risk ? (
            'Update Risk'
          ) : (
            'Create Risk'
          )}
        </Button>
      </div>
    </form>
  );
}