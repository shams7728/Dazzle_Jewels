"use client";

import { useEffect, useCallback, useRef, memo } from 'react';
import { X } from 'lucide-react';
import { useSearchStore } from '@/lib/store/search';
import { cn } from '@/lib/utils';
import { SearchInput } from './search-input';
import { FilterPanel } from './filter-panel';
import { ActiveFilters } from './active-filters';
import { SortDropdown } from './sort-dropdown';
import { SearchResults } from './search-results';

interface SearchModalProps {
  className?: string;
}

function SearchModalComponent({ className }: SearchModalProps) {
  const { isOpen, setIsOpen, fetchAllData, products } = useSearchStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch data on mount if not already loaded
  useEffect(() => {
    if (products.length === 0) {
      fetchAllData();
    }
  }, []);

  // Handle keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Close on Escape - only when modal is open
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Focus trap: keep focus within modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);

    // Focus first element when modal opens
    setTimeout(() => firstElement?.focus(), 100);

    return () => {
      modal.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-start justify-center bg-background/80 backdrop-blur-sm',
        'animate-in fade-in-0 duration-200',
        className
      )}
      onClick={() => setIsOpen(false)}
    >
      {/* Modal Content */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        className={cn(
          'relative w-full max-w-4xl mx-4 mt-20',
          'bg-background border border-border rounded-2xl shadow-2xl',
          'animate-in slide-in-from-top-4 duration-300',
          'max-h-[80vh] flex flex-col'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="search-modal-title" className="text-lg font-semibold text-foreground">Search Products</h2>
          <button
            ref={closeButtonRef}
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close search modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left Side - Filters (Desktop) / Top (Mobile) */}
          <div className="lg:w-80 border-b lg:border-b-0 lg:border-r border-border overflow-y-auto">
            <div className="p-4">
              <FilterPanel />
            </div>
          </div>

          {/* Right Side - Search and Results */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search Input and Controls */}
            <div className="p-4 space-y-4 border-b border-border">
              <SearchInput />

              {/* Active Filters and Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <ActiveFilters />
                </div>
                <div className="flex-shrink-0">
                  <SortDropdown />
                </div>
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-4">
              <SearchResults />
            </div>
          </div>
        </div>

        {/* Footer with keyboard shortcuts hint */}
        <div className="p-4 border-t border-border bg-muted/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-muted rounded border border-border">
                  ↑↓
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-muted rounded border border-border">
                  Enter
                </kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-muted rounded border border-border">
                  Esc
                </kbd>
                Close
              </span>
            </div>
            <span>
              Press{' '}
              <kbd className="px-2 py-1 bg-muted rounded border border-border">
                ⌘K
              </kbd>{' '}
              to open
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const SearchModal = memo(SearchModalComponent);
