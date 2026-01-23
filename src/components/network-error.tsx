'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { retryWithBackoff } from '@/lib/utils/retry';

interface NetworkErrorProps {
  error?: Error;
  onRetry?: () => Promise<void>;
  title?: string;
  message?: string;
  showRetryButton?: boolean;
}

/**
 * Network Error component with retry functionality
 * Displays user-friendly error messages and allows retry with exponential backoff
 */
export function NetworkError({
  error,
  onRetry,
  title = 'Connection Error',
  message,
  showRetryButton = true,
}: NetworkErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [retryError, setRetryError] = useState<string | null>(null);

  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    setRetryError(null);

    try {
      await retryWithBackoff(onRetry, {
        maxRetries: 3,
        initialDelay: 1000,
        onRetry: (error, attempt) => {
          setRetryCount(attempt);
          console.log(`Retry attempt ${attempt}:`, error.message);
        },
      });

      // Success - component should re-render with data
      setRetryCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setRetryError(errorMessage);
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const isNetworkError = error?.message.toLowerCase().includes('network') ||
    error?.message.toLowerCase().includes('fetch') ||
    error?.message.toLowerCase().includes('connection');

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
      <div className="rounded-full bg-red-500/10 p-6 mb-4">
        {isNetworkError ? (
          <WifiOff className="h-12 w-12 text-red-500" />
        ) : (
          <AlertCircle className="h-12 w-12 text-red-500" />
        )}
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>

      <p className="text-muted-foreground max-w-md mb-2">
        {message || error?.message || 'Unable to load data. Please check your connection and try again.'}
      </p>

      {retryCount > 0 && (
        <p className="text-sm text-primary mb-4">
          Retry attempt {retryCount} of 3...
        </p>
      )}

      {retryError && (
        <p className="text-sm text-destructive mb-4">
          {retryError}
        </p>
      )}

      {showRetryButton && onRetry && (
        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Try Again'}
        </Button>
      )}

      {isNetworkError && (
        <div className="mt-8 p-4 bg-muted/50 border border-border rounded-lg max-w-md">
          <h3 className="text-foreground font-semibold mb-2 text-sm">Troubleshooting tips:</h3>
          <ul className="text-xs text-muted-foreground space-y-1 text-left">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Check your internet connection
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Refresh the page
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              Try again in a few moments
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Compact network error for smaller sections
 */
export function CompactNetworkError({
  onRetry,
  message = 'Failed to load',
}: {
  onRetry?: () => void;
  message?: string;
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 text-center border border-border rounded-lg bg-muted/50">
      <div className="flex flex-col items-center gap-3">
        <WifiOff className="h-6 w-6 text-destructive" />
        <p className="text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            size="sm"
            variant="outline"
            className="border-border hover:bg-muted"
          >
            <RefreshCw className={`mr-2 h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry'}
          </Button>
        )}
      </div>
    </div>
  );
}
