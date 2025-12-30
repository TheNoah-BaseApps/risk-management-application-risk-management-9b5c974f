'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const normalizeSelectValue = (value) => (!value || value === "" ? undefined : value);

export default function UserSelector({ value, onChange, required = false }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data.data || []);
        }
      } catch (err) {
        console.error('Fetch users error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleValueChange = (newValue) => {
    const normalizedValue = normalizeSelectValue(newValue);
    onChange(normalizedValue);
  };

  return (
    <Select value={normalizeSelectValue(value)} onValueChange={handleValueChange} required={required} disabled={loading}>
      <SelectTrigger>
        <SelectValue placeholder={loading ? 'Loading users...' : 'Select user'} />
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={String(user.id)}>
            {user.name} ({user.role})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}