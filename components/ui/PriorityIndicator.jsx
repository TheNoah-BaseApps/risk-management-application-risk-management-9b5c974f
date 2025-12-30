import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

export default function PriorityIndicator({ priority }) {
  const getColor = () => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Badge variant="outline" className={`${getColor()} font-medium`}>
      {priority === 'Critical' && <AlertCircle className="mr-1 h-3 w-3" />}
      {priority}
    </Badge>
  );
}