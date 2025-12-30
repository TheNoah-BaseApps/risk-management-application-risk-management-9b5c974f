import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const normalizeSelectValue = (value) => (!value || value === "" ? undefined : value);

export default function FilterPanel({ filters, options, onChange }) {
  return (
    <div className="flex gap-4">
      {Object.keys(options).map((key) => (
        <div key={key} className="space-y-2 min-w-[200px]">
          <Label className="text-xs text-gray-600 uppercase">
            {key.replace('_', ' ')}
          </Label>
          <Select 
            value={normalizeSelectValue(filters[key])} 
            onValueChange={(value) => onChange(key, normalizeSelectValue(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options[key].map((option) => (
                <SelectItem 
                  key={option.value || 'all'} 
                  value={option.value || 'all'}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}