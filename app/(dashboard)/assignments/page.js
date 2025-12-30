'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import AssignmentList from '@/components/assignments/AssignmentList';
import FilterPanel from '@/components/ui/FilterPanel';
import SearchBar from '@/components/ui/SearchBar';
import { Plus } from 'lucide-react';

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
  });
  
  const hasFetched = useRef(false);

  const fetchAssignments = useCallback(async (currentFilters = filters) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (currentFilters.status) params.append('status', currentFilters.status);
      if (currentFilters.priority) params.append('priority', currentFilters.priority);
      if (currentFilters.search) params.append('search', currentFilters.search);

      const response = await fetch(`/api/assignments?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json();
      setAssignments(data.data?.assignments || []);
      setError(null);
    } catch (err) {
      console.error('Fetch assignments error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchAssignments();
    }
  }, [fetchAssignments]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchAssignments(newFilters);
  };

  const filterOptions = {
    status: [
      { value: '', label: 'All Statuses' },
      { value: 'Pending', label: 'Pending' },
      { value: 'In Progress', label: 'In Progress' },
      { value: 'Under Review', label: 'Under Review' },
      { value: 'Completed', label: 'Completed' },
      { value: 'Cancelled', label: 'Cancelled' },
    ],
    priority: [
      { value: '', label: 'All Priorities' },
      { value: 'Critical', label: 'Critical' },
      { value: 'High', label: 'High' },
      { value: 'Medium', label: 'Medium' },
      { value: 'Low', label: 'Low' },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Assignments</h1>
          <p className="text-gray-600 mt-2">Track and manage risk assignments</p>
        </div>
        <Button onClick={() => router.push('/assignments/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            placeholder="Search assignments..."
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
        <AssignmentList assignments={assignments} onRefresh={() => fetchAssignments(filters)} />
      )}
    </div>
  );
}