import { useCallback, useState } from 'react';
import { Button } from '@repo/ui';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface ImageUploaderProps {
  label?: string;
  currentImage?: string | null;
  onUpload: (file: File) => Promise<void> | void;
  onRemove?: () => Promise<void> | void;
  acceptedTypes?: string[];
  maxSize?: number;
  disabled?: boolean;
  description?: string;
}

const DEFAULT_ACCEPT = ['image/png', 'image/jpeg', 'image/svg+xml'];
const DEFAULT_MAX_SIZE = 2 * 1024 * 1024;

export function ImageUploader({
  label,
  currentImage,
  onUpload,
  onRemove,
  acceptedTypes = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  disabled = false,
  description,
}: ImageUploaderProps): JSX.Element {
  const { toast } = useToast();
  const [isDragging, setDragging] = useState(false);
  const [isUploading, setUploading] = useState(false);

  const acceptList = acceptedTypes.join(',');

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) {
        return;
      }

      const file = files[0];

      if (!acceptedTypes.includes(file.type)) {
        toast({
          title: 'Unsupported file type',
          description: `Please upload ${acceptedTypes.join(', ')} files only.`,
          variant: 'destructive',
        });
        return;
      }

      if (file.size > maxSize) {
        const sizeMb = (maxSize / (1024 * 1024)).toFixed(1);
        toast({
          title: 'File is too large',
          description: `Files must be smaller than ${sizeMb}MB.`,
          variant: 'destructive',
        });
        return;
      }

      try {
        setUploading(true);
        await onUpload(file);
        toast({ title: 'Upload complete', description: `${file.name} uploaded successfully.` });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed. Please try again.';
        toast({ title: 'Upload failed', description: message, variant: 'destructive' });
      } finally {
        setUploading(false);
      }
    },
    [acceptedTypes, disabled, maxSize, onUpload, toast],
  );

  return (
    <div className="space-y-2">
      {label ? <p className="text-sm font-medium text-foreground">{label}</p> : null}
      <label
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded border-2 border-dashed border-border bg-muted/30 px-6 py-8 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/10' : 'hover:bg-muted',
          disabled ? 'pointer-events-none opacity-60' : '',
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer?.files ?? null);
        }}
      >
        <input
          type="file"
          className="sr-only"
          accept={acceptList}
          disabled={disabled}
          onChange={(event) => void handleFiles(event.target.files)}
        />
        <div>
          <p className="text-sm text-muted-foreground">
            {description ?? 'Drag and drop an image here, or click to browse.'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {`Supported types: ${acceptedTypes.join(', ')} • Max size ${(maxSize / (1024 * 1024)).toFixed(1)}MB`}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={disabled || isUploading}>
          {isUploading ? 'Uploading…' : 'Select File'}
        </Button>
      </label>
      {currentImage ? (
        <div className="flex items-center justify-between rounded border border-border bg-card px-3 py-2 text-sm">
          <div className="flex items-center gap-3">
            <img src={currentImage} alt={label ?? 'Uploaded asset'} className="h-12 w-12 rounded object-contain" />
            <span className="text-muted-foreground">Current asset</span>
          </div>
          {onRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => {
                try {
                  const result = onRemove();
                  if (result instanceof Promise) {
                    result
                      .then(() => {
                        toast({ title: 'Asset removed' });
                      })
                      .catch((error) => {
                        const message =
                          error instanceof Error ? error.message : 'Unable to remove the selected asset.';
                        toast({ title: 'Removal failed', description: message, variant: 'destructive' });
                      });
                  } else {
                    toast({ title: 'Asset removed' });
                  }
                } catch (error) {
                  const message =
                    error instanceof Error ? error.message : 'Unable to remove the selected asset.';
                  toast({ title: 'Removal failed', description: message, variant: 'destructive' });
                }
              }}
            >
              Remove
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default ImageUploader;
