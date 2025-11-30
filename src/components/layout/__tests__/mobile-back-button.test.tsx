import { render, screen, fireEvent } from '@testing-library/react';
import { MobileBackButton } from '../mobile-back-button';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));

describe('MobileBackButton Component', () => {
  const mockRouter = {
    back: vi.fn(),
    push: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('renders back button', () => {
    render(<MobileBackButton />);

    const button = screen.getByLabelText('Go back');
    expect(button).toBeDefined();
  });

  it('calls router.back when history exists', () => {
    // Mock window.history.length
    Object.defineProperty(window, 'history', {
      value: { length: 5 },
      writable: true
    });

    render(<MobileBackButton />);

    const button = screen.getByLabelText('Go back');
    fireEvent.click(button);

    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('uses fallback href when no history', () => {
    // Mock window.history.length to 1 (no history)
    Object.defineProperty(window, 'history', {
      value: { length: 1 },
      writable: true
    });

    render(<MobileBackButton fallbackHref="/collections" />);

    const button = screen.getByLabelText('Go back');
    fireEvent.click(button);

    // Should use fallback
    expect(mockRouter.push).toHaveBeenCalledWith('/collections');
  });
});
