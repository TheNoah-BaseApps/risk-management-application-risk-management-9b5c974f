'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RiskForm from '@/components/risks/RiskForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewRiskPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/risks');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Identify New Risk</h1>
          <p className="text-gray-600 mt-2">Capture detailed information about a new organizational risk</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Identification Form</CardTitle>
        </CardHeader>
        <CardContent>
          <RiskForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}