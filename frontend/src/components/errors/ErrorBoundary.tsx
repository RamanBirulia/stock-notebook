import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    // e.g., Sentry, LogRocket, etc.
    if (import.meta.env.PROD) {
      // logErrorToService(error, errorInfo, this.state.errorId);
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    });
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorDetails = {
      errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      error: error?.toString() || "Unknown error",
      stack: error?.stack || "No stack trace available",
      componentStack:
        errorInfo?.componentStack || "No component stack available",
    };

    const subject = `Error Report - Stock Notebook (${errorId})`;
    const body = `An error occurred in the Stock Notebook application.

Error Details:
- Error ID: ${errorDetails.errorId}
- Time: ${errorDetails.timestamp}
- Page: ${errorDetails.url}
- Browser: ${errorDetails.userAgent}

Error Message:
${errorDetails.error}

Stack Trace:
${errorDetails.stack}

Component Stack:
${errorDetails.componentStack}

Additional Information:
[Please describe what you were doing when the error occurred]
    `;

    window.open(
      `mailto:support@stock-notebook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <Card className="p-8 text-center">
              {/* Error Icon */}
              <div className="mb-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Something went wrong
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  An unexpected error occurred while loading this page.
                </p>
              </div>

              {/* Error Details in Development */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2">
                    Development Error Details:
                  </h3>
                  <div className="text-xs font-mono text-red-700 dark:text-red-300 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </div>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                        Stack Trace
                      </summary>
                      <div className="text-xs font-mono text-red-700 dark:text-red-300 whitespace-pre-wrap mt-2">
                        {this.state.error.stack}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {/* Error ID for Production */}
              {import.meta.env.PROD && (
                <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Error ID:{" "}
                    <span className="font-mono text-xs">
                      {this.state.errorId}
                    </span>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<RefreshCw className="w-5 h-5" />}
                  onClick={this.handleRefresh}
                >
                  Refresh Page
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Home className="w-5 h-5" />}
                  onClick={() => (window.location.href = "/")}
                >
                  Go Home
                </Button>
              </div>

              {/* Additional Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Bug className="w-4 h-4" />}
                    onClick={this.handleReportError}
                  >
                    Report Error
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={this.handleReset}
                  >
                    Try Again
                  </Button>
                </div>
              </div>

              {/* Help Text */}
              <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                <p>
                  If this problem persists, please contact our support team with
                  the error ID above.
                </p>
              </div>
            </Card>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
