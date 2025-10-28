import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  presets?: string[];
  disabled?: boolean;
  className?: string;
}

const DEFAULT_PRESETS = ['#2563EB', '#7C3AED', '#0EA5E9', '#22C55E', '#F59E0B', '#EF4444'];

export function ColorPicker({
  label,
  value,
  onChange,
  presets,
  disabled = false,
  className,
}: ColorPickerProps): JSX.Element {
  const colors = useMemo(() => presets ?? DEFAULT_PRESETS, [presets]);

  return (
    <div className={cn('space-y-2', className)}>
      {label ? <Label className="text-sm font-medium text-foreground">{label}</Label> : null}
      <div className="flex items-center gap-3">
        <input
          type="color"
          className="h-10 w-16 cursor-pointer rounded border border-input bg-transparent"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label ?? 'Choose color'}
        />
        <input
          type="text"
          className="flex-1 rounded border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            type="button"
            key={color}
            className={cn(
              'h-8 w-8 rounded-full border border-border transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              color.toLowerCase() === value.toLowerCase() ? 'ring-2 ring-offset-2 ring-primary' : 'hover:scale-105',
            )}
            style={{ backgroundColor: color }}
            disabled={disabled}
            onClick={() => onChange(color)}
            aria-label={`Select ${color}`}
          />
        ))}
      </div>
    </div>
  );
}

export default ColorPicker;
