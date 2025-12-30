import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/ui/StatusBadge';
import PriorityIndicator from '@/components/ui/PriorityIndicator';
import { formatDate, isOverdue } from '@/lib/utils';
import { ExternalLink, AlertCircle } from 'lucide-react';

export default function AssignmentCard({ assignment }) {
  const router = useRouter();
  const overdue = isOverdue(assignment.deadline_date, assignment.assignment_status);

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/assignments/${assignment.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg font-mono">{assignment.assignment_id}</h3>
              {overdue && <AlertCircle className="h-4 w-4 text-red-500" />}
            </div>
            <p className="text-gray-700">Risk: {assignment.risk_id_code}</p>
          </div>
          <ExternalLink className="h-4 w-4 text-gray-400 ml-4 flex-shrink-0" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <span className="text-sm text-gray-500">Status:</span>{' '}
            <StatusBadge status={assignment.assignment_status} type="assignment" />
          </div>
          <div>
            <span className="text-sm text-gray-500">Priority:</span>{' '}
            <PriorityIndicator priority={assignment.priority_level} />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm border-t pt-3">
          <div>
            <span className="text-gray-500">Assigned to:</span>{' '}
            <span className="font-medium">{assignment.assigned_to_name}</span>
          </div>
          <div className={overdue ? 'text-red-600 font-medium' : 'text-gray-500'}>
            Deadline: {formatDate(assignment.deadline_date)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}