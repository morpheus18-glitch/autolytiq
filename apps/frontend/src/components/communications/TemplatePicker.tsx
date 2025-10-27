import { useMemo, useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TemplateDefinition } from '@/stores/communications-store';
import { Sparkles, Stars } from 'lucide-react';

export interface TemplatePickerProps {
  channel: 'sms' | 'email';
  templates: TemplateDefinition[];
  triggerLabel?: string;
  onSelect: (template: TemplateDefinition) => void;
  onCreateTemplate?: () => void;
}

export function TemplatePicker({
  channel,
  templates,
  triggerLabel,
  onSelect,
  onCreateTemplate,
}: TemplatePickerProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const unique = new Set<string>();
    templates
      .filter((template) => template.channel === channel)
      .forEach((template) => unique.add(template.category));
    return ['All', ...Array.from(unique).sort()];
  }, [channel, templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      if (template.channel !== channel) return false;
      if (category !== 'All' && template.category !== category) return false;
      return true;
    });
  }, [templates, channel, category]);

  const handleSelect = (template: TemplateDefinition) => {
    onSelect(template);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <Stars className="h-4 w-4" />
          {triggerLabel ?? `${channel.toUpperCase()} Templates`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="start">
        <div className="border-b border-border/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{channel.toUpperCase()} templates</p>
              <p className="text-xs text-muted-foreground">
                AI-ranked snippets tuned for response rates. Select to insert instantly.
              </p>
            </div>
            {onCreateTemplate ? (
              <Button size="sm" variant="ghost" onClick={onCreateTemplate}>
                <Sparkles className="mr-2 h-4 w-4" />
                New
              </Button>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((current) => (
              <Button
                key={current}
                type="button"
                size="sm"
                className="h-8 px-3 text-xs"
                variant={category === current ? 'default' : 'outline'}
                onClick={() => setCategory(current)}
              >
                {current}
              </Button>
            ))}
          </div>
        </div>
        <Command>
          <CommandInput placeholder="Search templates..." />
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            No templates found. Try another filter.
          </CommandEmpty>
          <CommandGroup>
            <ScrollArea className="max-h-[320px]">
              {filteredTemplates.map((template) => (
                <CommandItem
                  key={template.id}
                  value={`${template.name}-${template.category}`}
                  className="cursor-pointer flex-col items-start gap-2 border-b border-border/40 py-3 text-left"
                  onSelect={() => handleSelect(template)}
                >
                  <div className="flex w-full items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{template.name}</p>
                      <Badge variant="secondary" className="mt-1">
                        {template.category}
                      </Badge>
                    </div>
                    {template.subject ? (
                      <span className="text-xs text-muted-foreground">Subject: {template.subject}</span>
                    ) : null}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3 whitespace-pre-line">
                    {template.body}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.variables.map((variable) => (
                      <Badge key={variable} variant="outline" className="text-[10px] uppercase tracking-wide">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default TemplatePicker;
