import AssignmentCard from './AssignmentCard';
import { FileQuestion } from 'lucide-react';

export default function AssignmentList({ assignments, onRefresh }) {
  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
        <p className="text-gray-600">Create a new assignment to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <AssignmentCard key={assignment.id} assignment={assignment} />
      ))}
    </div>
  );
}