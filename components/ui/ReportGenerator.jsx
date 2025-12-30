'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DatePicker from '@/components/ui/DatePicker';
import { toast } from 'sonner';
import { FileDown, Loader2 } from 'lucide-react';

export default function ReportGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  const handleGenerate = async (format) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate);
      if (dateRange.endDate) params.append('endDate', dateRange.endDate);
      params.append('format', format);

      const response = await fetch(`/api/reports/risks?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      
      // For CSV format, create download
      if (format === 'csv' && data.csv) {
        const blob = new Blob([data.csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `risk-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('CSV report downloaded successfully');
      } else {
        // For JSON format, show data
        toast.success('Report generated successfully');
      }
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.message);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <DatePicker
            value={dateRange.startDate}
            onChange={(value) => setDateRange({ ...dateRange, startDate: value })}
          />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <DatePicker
            value={dateRange.endDate}
            onChange={(value) => setDateRange({ ...dateRange, endDate: value })}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => handleGenerate('json')} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Generate JSON Report
            </>
          )}
        </Button>
        <Button onClick={() => handleGenerate('csv')} disabled={loading} variant="outline">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileDown className="mr-2 h-4 w-4" />
              Download CSV Report
            </>
          )}
        </Button>
      </div>
    </div>
  );
}