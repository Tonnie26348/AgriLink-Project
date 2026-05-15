import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
          <div className="max-w-md w-full space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-destructive/10 rounded-full">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
              <p className="text-muted-foreground">
                We apologize for the inconvenience. Our team has been notified of this technical issue.
              </p>
            </div>

            {process.env.NODE_ENV === "development" && (
              <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto text-left max-h-40">
                {this.state.error?.message}
              </pre>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry Page
              </Button>
              <Button onClick={this.handleReset} className="gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground pt-4">
              If the problem persists, please contact AgriLink support.
            </p>
          </div>
        </div>
      );
    }

    return this.children;
  }
}

export default ErrorBoundary;
