import { useState } from 'react';
import { Button, type ButtonProps } from '@repo/ui';
import { useToast } from '@/hooks/use-toast';

export interface TestConnectionButtonProps extends ButtonProps {
  onTest: () => Promise<void>;
  successMessage?: string;
  errorMessage?: string;
}

export function TestConnectionButton({
  onTest,
  successMessage = 'Connection successful',
  errorMessage = 'Connection failed',
  children,
  ...buttonProps
}: TestConnectionButtonProps): JSX.Element {
  const [isTesting, setTesting] = useState(false);
  const { toast } = useToast();

  return (
    <Button
      type="button"
      {...buttonProps}
      disabled={isTesting || buttonProps.disabled}
      onClick={async () => {
        try {
          setTesting(true);
          await onTest();
          toast({ title: successMessage });
        } catch (error) {
          const message = error instanceof Error ? error.message : errorMessage;
          toast({ title: errorMessage, description: message, variant: 'destructive' });
        } finally {
          setTesting(false);
        }
      }}
    >
      {isTesting ? 'Testing…' : children ?? 'Test Connection'}
    </Button>
  );
}

export default TestConnectionButton;
