import { Badge } from '@/components/ui/badge';

export default function StatusBadge({ status, type = 'risk' }) {
  const getVariant = () => {
    if (type === 'risk') {
      switch (status) {
        case 'Identified':
          return 'default';
        case 'Assigned':
          return 'secondary';
        case 'In Mitigation':
          return 'outline';
        case 'Resolved':
          return 'success';
        case 'Closed':
          return 'success';
        default:
          return 'default';
      }
    } else if (type === 'assignment') {
      switch (status) {
        case 'Pending':
          return 'default';
        case 'In Progress':
          return 'secondary';
        case 'Under Review':
          return 'outline';
        case 'Completed':
          return 'success';
        case 'Cancelled':
          return 'destructive';
        default:
          return 'default';
      }
    }
    return 'default';
  };

  const getColor = () => {
    if (type === 'risk') {
      switch (status) {
        case 'Identified':
          return 'bg-blue-100 text-blue-800';
        case 'Assigned':
          return 'bg-purple-100 text-purple-800';
        case 'In Mitigation':
          return 'bg-yellow-100 text-yellow-800';
        case 'Resolved':
          return 'bg-green-100 text-green-800';
        case 'Closed':
          return 'bg-gray-100 text-gray-800';
        default:
          return '';
      }
    } else if (type === 'assignment') {
      switch (status) {
        case 'Pending':
          return 'bg-blue-100 text-blue-800';
        case 'In Progress':
          return 'bg-purple-100 text-purple-800';
        case 'Under Review':
          return 'bg-yellow-100 text-yellow-800';
        case 'Completed':
          return 'bg-green-100 text-green-800';
        case 'Cancelled':
          return 'bg-red-100 text-red-800';
        default:
          return '';
      }
    }
    return '';
  };

  return (
    <Badge variant={getVariant()} className={getColor()}>
      {status}
    </Badge>
  );
}