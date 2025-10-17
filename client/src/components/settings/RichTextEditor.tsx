import { useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface RichTextEditorProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  variables?: string[];
  description?: string;
  className?: string;
}

interface FormattingAction {
  label: string;
  prefix: string;
  suffix: string;
}

const ACTIONS: FormattingAction[] = [
  { label: 'Bold', prefix: '<strong>', suffix: '</strong>' },
  { label: 'Italic', prefix: '<em>', suffix: '</em>' },
  { label: 'Underline', prefix: '<u>', suffix: '</u>' },
  { label: 'Link', prefix: '<a href="">', suffix: '</a>' },
  { label: 'Bullet List', prefix: '<ul>\n  <li>', suffix: '</li>\n</ul>' },
  { label: 'Numbered List', prefix: '<ol>\n  <li>', suffix: '</li>\n</ol>' },
];

const DEFAULT_VARIABLES = ['{{customerName}}', '{{vehicleName}}', '{{dealNumber}}'];

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  variables,
  description,
  className,
}: RichTextEditorProps): JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const variableTokens = useMemo(() => variables ?? DEFAULT_VARIABLES, [variables]);

  const insertAtSelection = useCallback(
    (prefix: string, suffix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      const { selectionStart, selectionEnd } = textarea;
      const before = value.slice(0, selectionStart);
      const selected = value.slice(selectionStart, selectionEnd);
      const after = value.slice(selectionEnd);
      const nextValue = `${before}${prefix}${selected || ''}${suffix}${after}`;
      onChange(nextValue);

      requestAnimationFrame(() => {
        const cursorPosition = selectionStart + prefix.length + (selected.length || 0);
        textarea.focus();
        textarea.setSelectionRange(cursorPosition, cursorPosition);
      });
    },
    [onChange, value],
  );

  const insertVariable = useCallback(
    (token: string) => {
      insertAtSelection(token, '');
    },
    [insertAtSelection],
  );

  return (
    <div className={cn('space-y-2', className)}>
      {label ? <Label className="text-sm font-medium text-foreground">{label}</Label> : null}
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        {ACTIONS.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled}
            onClick={() => insertAtSelection(action.prefix, action.suffix)}
          >
            {action.label}
          </Button>
        ))}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {variableTokens.map((token) => (
            <Button
              key={token}
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => insertVariable(token)}
            >
              {token}
            </Button>
          ))}
        </div>
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-[240px]"
      />
    </div>
  );
}

export default RichTextEditor;
