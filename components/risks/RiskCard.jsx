import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

export default function RiskCard({ risk }) {
  const router = useRouter();

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/risks/${risk.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg font-mono">{risk.risk_id}</h3>
              <Badge variant="outline">{risk.risk_category}</Badge>
            </div>
            <p className="text-gray-700 line-clamp-2">{risk.risk_description}</p>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400 ml-4 flex-shrink-0" />
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-gray-500">Status:</span>{' '}
              <StatusBadge status={risk.status} type="risk" />
            </div>
            <div>
              <span className="text-gray-500">Source:</span>{' '}
              <span className="font-medium">{risk.risk_source}</span>
            </div>
          </div>
          <div className="text-gray-500">
            Identified: {formatDate(risk.identification_date)}
          </div>
        </div>

        {risk.assignments_count > 0 && (
          <div className="mt-3 pt-3 border-t text-sm text-gray-600">
            {risk.assignments_count} assignment{risk.assignments_count > 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  );
}