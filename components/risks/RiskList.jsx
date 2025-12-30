import RiskCard from './RiskCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileQuestion } from 'lucide-react';

export default function RiskList({ risks, onRefresh }) {
  if (!risks || risks.length === 0) {
    return (
      <div className="text-center py-12">
        <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No risks found</h3>
        <p className="text-gray-600">Start by identifying a new risk</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {risks.map((risk) => (
        <RiskCard key={risk.id} risk={risk} />
      ))}
    </div>
  );
}