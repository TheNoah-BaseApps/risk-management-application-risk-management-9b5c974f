'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error('Fetch profile error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Failed to load profile'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1">
                  <Badge>{user.role}</Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Member Since</label>
                <p className="mt-1 text-gray-900">{formatDate(user.created_at)}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">User ID</label>
              <p className="mt-1 text-gray-900 font-mono text-sm">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {user.role === 'Admin' && (
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Full access to all features</li>
                <li>Create, edit, and delete risks</li>
                <li>Assign risks to team members</li>
                <li>Manage user accounts</li>
                <li>Generate reports</li>
              </ul>
            )}
            {user.role === 'Risk Manager' && (
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Create and identify risks</li>
                <li>Assign risks to team members</li>
                <li>Update risk statuses</li>
                <li>Generate reports</li>
              </ul>
            )}
            {user.role === 'Team Member' && (
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Create and identify risks</li>
                <li>Update own assignments</li>
                <li>View all risks and assignments</li>
              </ul>
            )}
            {user.role === 'Viewer' && (
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>View risks and assignments</li>
                <li>Read-only access</li>
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}