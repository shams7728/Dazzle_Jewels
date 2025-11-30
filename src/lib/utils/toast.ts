/**
 * Simple toast notification utility
 * This is a minimal implementation for error notifications
 */

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

const DEFAULT_DURATION = 5000; // 5 seconds

/**
 * Show a toast notification
 * @param message - The message to display
 * @param options - Toast configuration options
 */
export function showToast(message: string, options: ToastOptions = {}): void {
  const {
    type = 'info',
    duration = DEFAULT_DURATION,
    position = 'top-right',
  } = options;

  // Create toast element
  const toast = document.createElement('div');
  toast.className = getToastClasses(type, position);
  toast.textContent = message;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');

  // Add to document
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add('opacity-100', 'translate-y-0');
  }, 10);

  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-2');
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, duration);
}

/**
 * Get Tailwind classes for toast styling
 */
function getToastClasses(type: ToastType, position: string): string {
  const baseClasses = [
    'fixed',
    'z-50',
    'px-4',
    'py-3',
    'rounded-lg',
    'shadow-lg',
    'transition-all',
    'duration-300',
    'opacity-0',
    'translate-y-2',
    'max-w-md',
    'text-sm',
    'font-medium',
  ];

  // Position classes
  const positionClasses: Record<string, string[]> = {
    'top-right': ['top-4', 'right-4'],
    'top-center': ['top-4', 'left-1/2', '-translate-x-1/2'],
    'bottom-right': ['bottom-4', 'right-4'],
    'bottom-center': ['bottom-4', 'left-1/2', '-translate-x-1/2'],
  };

  // Type-specific classes
  const typeClasses: Record<ToastType, string[]> = {
    success: ['bg-green-500', 'text-white'],
    error: ['bg-red-500', 'text-white'],
    warning: ['bg-yellow-500', 'text-white'],
    info: ['bg-blue-500', 'text-white'],
  };

  return [
    ...baseClasses,
    ...positionClasses[position],
    ...typeClasses[type],
  ].join(' ');
}

/**
 * Show an error toast
 */
export function showErrorToast(message: string): void {
  showToast(message, { type: 'error' });
}

/**
 * Show a success toast
 */
export function showSuccessToast(message: string): void {
  showToast(message, { type: 'success' });
}

/**
 * Show an info toast
 */
export function showInfoToast(message: string): void {
  showToast(message, { type: 'info' });
}

/**
 * Show a warning toast
 */
export function showWarningToast(message: string): void {
  showToast(message, { type: 'warning' });
}
