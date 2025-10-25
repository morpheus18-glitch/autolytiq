import { useId } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  align?: 'left' | 'right';
}

export function ToggleSwitch({
  enabled,
  onChange,
  label,
  description,
  disabled = false,
  align = 'left',
}: ToggleSwitchProps): JSX.Element {
  const switchId = useId();

  return (
    <div className="flex items-center justify-between gap-4">
      <div className={align === 'right' ? 'order-2 text-right' : 'order-1 text-left'}>
        {label ? (
          <Label htmlFor={switchId} className="text-sm font-medium text-foreground">
            {label}
          </Label>
        ) : null}
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <Switch
        id={switchId}
        checked={enabled}
        disabled={disabled}
        onCheckedChange={onChange}
        className={align === 'right' ? 'order-1' : 'order-2'}
      />
    </div>
  );
}

export default ToggleSwitch;
