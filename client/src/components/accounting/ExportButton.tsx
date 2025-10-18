import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportStatementRequest } from '@/lib/accountingApi';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  statement: 'pl' | 'balance-sheet' | 'cash-flow';
  startDate?: Date;
  endDate?: Date;
  disabled?: boolean;
}

export function ExportButton({ statement, startDate, endDate, disabled }: ExportButtonProps) {
  const { toast } = useToast();
  const [isExporting, setExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel' | 'quickbooks') => {
    if (isExporting) return;
    setExporting(true);
    try {
      const result = await exportStatementRequest(statement, format, {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      });
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = result.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast({ title: 'Export ready', description: `Downloaded ${result.filename}` });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unable to export statement',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isExporting} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => handleExport('pdf')}>PDF</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleExport('excel')}>Excel</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleExport('quickbooks')}>QuickBooks IIF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportButton;
