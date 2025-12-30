'use client';

import { Input } from '@/components/ui/input';

export default function DatePicker({ value, onChange, required = false }) {
  return (
    <Input
      type="date"
      value={value ? new Date(value).toISOString().split('T')[0] : ''}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      min={new Date().toISOString().split('T')[0]}
    />
  );
}