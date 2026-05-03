// ============================================================
// Error Boundary — Bắt lỗi render & hiển thị fallback
// ============================================================

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6 text-center space-y-4">
              <div className="h-14 w-14 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-destructive" />
              </div>
              <div>
                <h3>Đã xảy ra lỗi</h3>
                <p className="text-muted-foreground mt-1">
                  Có lỗi không mong muốn xảy ra. Vui lòng thử lại.
                </p>
              </div>
              {this.state.error && (
                <details className="text-left">
                  <summary className="text-muted-foreground cursor-pointer hover:text-foreground">
                    Chi tiết lỗi
                  </summary>
                  <pre className="mt-2 p-3 bg-muted rounded-lg overflow-auto text-destructive whitespace-pre-wrap">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              <Button onClick={this.handleReset} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
