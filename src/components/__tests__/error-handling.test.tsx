import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary, ErrorFallback } from '../error-boundary';
import { NetworkError } from '../network-error';

// Component that throws an error for testing
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('Error Handling Components', () => {
  describe('ErrorBoundary', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('renders error UI when child component throws', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('renders custom fallback when provided', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <ErrorBoundary fallback={<div>Custom error UI</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('calls onError callback when error occurs', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const onError = vi.fn();
      
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );
      
      expect(onError).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('ErrorFallback', () => {
    it('renders error message', () => {
      const error = new Error('Test error message');
      
      render(<ErrorFallback error={error} />);
      
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('renders custom title and message', () => {
      render(
        <ErrorFallback
          title="Custom Title"
          message="Custom message"
        />
      );
      
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom message')).toBeInTheDocument();
    });

    it('calls resetError when retry button is clicked', () => {
      const resetError = vi.fn();
      
      render(<ErrorFallback resetError={resetError} />);
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);
      
      expect(resetError).toHaveBeenCalled();
    });

    it('does not render retry button when resetError is not provided', () => {
      render(<ErrorFallback />);
      
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe('NetworkError', () => {
    it('renders network error message', () => {
      render(<NetworkError />);
      
      expect(screen.getByText('Connection Error')).toBeInTheDocument();
    });

    it('renders custom title and message', () => {
      render(
        <NetworkError
          title="Custom Network Error"
          message="Custom error message"
        />
      );
      
      expect(screen.getByText('Custom Network Error')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', async () => {
      const onRetry = vi.fn().mockResolvedValue(undefined);
      
      render(<NetworkError onRetry={onRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        expect(onRetry).toHaveBeenCalled();
      });
    });

    it('shows loading state during retry', async () => {
      const onRetry = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );
      
      render(<NetworkError onRetry={onRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);
      
      expect(screen.getByText('Retrying...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText('Retrying...')).not.toBeInTheDocument();
      });
    });

    it('displays troubleshooting tips for network errors', () => {
      const error = new Error('Network request failed');
      
      render(<NetworkError error={error} />);
      
      expect(screen.getByText('Troubleshooting tips:')).toBeInTheDocument();
      expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument();
    });

    it('hides retry button when showRetryButton is false', () => {
      render(<NetworkError showRetryButton={false} />);
      
      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });
  });
});
