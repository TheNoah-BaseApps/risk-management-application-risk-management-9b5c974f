'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import RiskList from '@/components/risks/RiskList';
import FilterPanel from '@/components/ui/FilterPanel';
import SearchBar from '@/components/ui/SearchBar';
import { Plus } from 'lucide-react';

export default function RisksPage() {
  const router = useRouter();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: '',
  });

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/risks?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch risks');
      }

      const data = await response.json();
      setRisks(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Fetch risks error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const filterOptions = {
    category: [
      { value: '', label: 'All Categories' },
      { value: 'Technical', label: 'Technical' },
      { value: 'Financial', label: 'Financial' },
      { value: 'Operational', label: 'Operational' },
      { value: 'Strategic', label: 'Strategic' },
      { value: 'Compliance', label: 'Compliance' },
      { value: 'Security', label: 'Security' },
      { value: 'Other', label: 'Other' },
    ],
    status: [
      { value: '', label: 'All Statuses' },
      { value: 'Identified', label: 'Identified' },
      { value: 'Assigned', label: 'Assigned' },
      { value: 'In Mitigation', label: 'In Mitigation' },
      { value: 'Resolved', label: 'Resolved' },
      { value: 'Closed', label: 'Closed' },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Management</h1>
          <p className="text-gray-600 mt-2">Identify, track, and manage organizational risks</p>
        </div>
        <Button onClick={() => router.push('/risks/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Identify New Risk
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search risks..."
            value={filters.search}
            onChange={(value) => handleFilterChange('search', value)}
          />
        </div>
        <FilterPanel filters={filters} options={filterOptions} onChange={handleFilterChange} />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <RiskList risks={risks} onRefresh={fetchRisks} />
      )}
    </div>
  );
}