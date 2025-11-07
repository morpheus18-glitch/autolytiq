import { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { RefreshCcw } from 'lucide-react';

interface PanelErrorBoundaryProps {
  children: ReactNode;
  title?: string;
}

interface PanelErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class PanelErrorBoundary extends Component<PanelErrorBoundaryProps, PanelErrorBoundaryState> {
  public state: PanelErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): PanelErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[PanelErrorBoundary] error captured', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="flex flex-col gap-3">
          <div>
            <AlertTitle>{this.props.title ?? 'Something went wrong'}</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground">
              {this.state.error?.message ?? 'An unexpected error occurred while rendering this panel.'}
            </AlertDescription>
          </div>
          <Button variant="outline" size="sm" className="w-fit" onClick={this.handleReset}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry panel
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default PanelErrorBoundary;
