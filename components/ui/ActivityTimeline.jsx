import { formatDate } from '@/lib/utils';
import { Circle } from 'lucide-react';

export default function ActivityTimeline({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activity history available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id || index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <Circle className="h-3 w-3 fill-blue-600 text-blue-600" />
            {index < activities.length - 1 && (
              <div className="w-px h-full bg-gray-200 mt-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="text-sm font-medium text-gray-900">
              {activity.update_type || activity.assignment_status || 'Update'}
            </p>
            {activity.comment && (
              <p className="text-sm text-gray-600 mt-1">{activity.comment}</p>
            )}
            {activity.previous_value && activity.new_value && (
              <p className="text-xs text-gray-500 mt-1">
                Changed from "{activity.previous_value}" to "{activity.new_value}"
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(activity.created_at || activity.assignment_date)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}