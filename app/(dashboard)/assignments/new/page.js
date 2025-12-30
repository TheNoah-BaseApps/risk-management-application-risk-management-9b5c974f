'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AssignmentForm from '@/components/assignments/AssignmentForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const riskId = searchParams.get('riskId');

  const handleSuccess = () => {
    router.push('/assignments');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Assignment</h1>
          <p className="text-gray-600 mt-2">Assign a risk to a team member for mitigation</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Form</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignmentForm onSuccess={handleSuccess} defaultRiskId={riskId} />
        </CardContent>
      </Card>
    </div>
  );
}