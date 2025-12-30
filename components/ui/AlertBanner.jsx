import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

export default function AlertBanner({ variant = 'default', title, message }) {
  const icons = {
    default: Info,
    destructive: AlertCircle,
    warning: AlertTriangle,
    success: CheckCircle,
  };

  const Icon = icons[variant] || Info;

  return (
    <Alert variant={variant}>
      <Icon className="h-4 w-4" />
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}