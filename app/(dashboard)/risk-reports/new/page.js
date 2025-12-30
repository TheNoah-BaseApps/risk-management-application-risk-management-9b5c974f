'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function NewRiskReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    report_id: '',
    risk_id: '',
    report_date: new Date().toISOString().split('T')[0],
    reporter_name: '',
    report_summary: '',
    report_type: '',
    attached_documents: '',
    distribution_list: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/risk-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          report_date: new Date(formData.report_date).toISOString()
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Risk report created successfully');
        router.push('/risk-reports');
      } else {
        toast.error(data.error || 'Failed to create risk report');
      }
    } catch (error) {
      console.error('Error creating risk report:', error);
      toast.error('Error creating risk report');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/risk-reports')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Risk Report</h1>
          <p className="text-gray-600 mt-1">Add a new risk report to the system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Report Information</CardTitle>
            <CardDescription>Enter the details for the new risk report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="report_id">Report ID *</Label>
                <Input
                  id="report_id"
                  value={formData.report_id}
                  onChange={(e) => handleChange('report_id', e.target.value)}
                  placeholder="REP-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk_id">Risk ID *</Label>
                <Input
                  id="risk_id"
                  value={formData.risk_id}
                  onChange={(e) => handleChange('risk_id', e.target.value)}
                  placeholder="RISK-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporter_name">Reporter Name *</Label>
                <Input
                  id="reporter_name"
                  value={formData.reporter_name}
                  onChange={(e) => handleChange('reporter_name', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report_date">Report Date *</Label>
                <Input
                  id="report_date"
                  type="date"
                  value={formData.report_date}
                  onChange={(e) => handleChange('report_date', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="report_type">Report Type *</Label>
                <Select
                  value={formData.report_type}
                  onValueChange={(value) => handleChange('report_type', value)}
                  required
                >
                  <SelectTrigger id="report_type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Initial Report">Initial Report</SelectItem>
                    <SelectItem value="Progress Update">Progress Update</SelectItem>
                    <SelectItem value="Final Report">Final Report</SelectItem>
                    <SelectItem value="Incident Report">Incident Report</SelectItem>
                    <SelectItem value="Pending Review">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attached_documents">Attached Documents</Label>
                <Input
                  id="attached_documents"
                  value={formData.attached_documents}
                  onChange={(e) => handleChange('attached_documents', e.target.value)}
                  placeholder="document1.pdf, document2.pdf"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report_summary">Report Summary *</Label>
              <Textarea
                id="report_summary"
                value={formData.report_summary}
                onChange={(e) => handleChange('report_summary', e.target.value)}
                placeholder="Enter detailed report summary..."
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distribution_list">Distribution List</Label>
              <Textarea
                id="distribution_list"
                value={formData.distribution_list}
                onChange={(e) => handleChange('distribution_list', e.target.value)}
                placeholder="user1@example.com, user2@example.com"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/risk-reports')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Report'}
          </Button>
        </div>
      </form>
    </div>
  );
}