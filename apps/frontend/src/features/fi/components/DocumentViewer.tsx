import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@repo/ui';
import { ZoomIn, ZoomOut, Printer, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DocumentViewerProps {
  open: boolean;
  title: string;
  url: string;
  onOpenChange: (open: boolean) => void;
}

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.2;

export function DocumentViewer({ open, title, url, onOpenChange }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1);

  const safeUrl = useMemo(() => {
    if (!url) return '';
    try {
      return new URL(url).toString();
    } catch {
      return '';
    }
  }, [url]);

  const adjustZoom = (delta: number) => {
    setZoom((current) => {
      const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, parseFloat((current + delta).toFixed(2))));
      return next;
    });
  };

  const handlePrint = () => {
    if (!safeUrl) return;
    const printWindow = window.open(safeUrl, '_blank', 'noopener');
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        printWindow.focus();
        printWindow.print();
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border px-6 py-4">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          <div className="flex items-center gap-2">
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => adjustZoom(-ZOOM_STEP)}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom out</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => adjustZoom(ZOOM_STEP)}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Zoom in</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handlePrint}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Print</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        <div className="relative h-full bg-muted/30">
          {safeUrl ? (
            <div className="h-full overflow-auto p-4">
              <div
                className={cn('mx-auto origin-top-left transition-transform', {
                  'shadow-md': zoom > 1,
                })}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
              >
                <iframe
                  title={title}
                  src={safeUrl}
                  className="h-[80vh] w-[60vw] rounded-lg border border-border bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Unable to load document.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentViewer;
