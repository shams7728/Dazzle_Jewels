"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useSearchStore } from '@/lib/store/search';
import { getSortOptions } from '@/lib/utils/search-sort';
import { cn } from '@/lib/utils';

export function SortDropdown() {
  const { sortBy, setSortBy } = useSearchStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = getSortOptions();
  const currentOption = sortOptions.find((opt) => opt.value === sortBy);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (value: typeof sortBy) => {
    setSortBy(value);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          'bg-neutral-800 border border-neutral-700',
          'text-white text-sm',
          'hover:bg-neutral-700 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-yellow-500'
        )}
        aria-label="Sort options"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-neutral-400">Sort:</span>
        <span>{currentOption?.label || 'Relevance'}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-neutral-400 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full right-0 mt-2 z-20',
            'w-56 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl',
            'animate-in fade-in-0 slide-in-from-top-2 duration-200',
            'overflow-hidden'
          )}
          role="listbox"
        >
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3',
                'text-left text-sm transition-colors',
                'hover:bg-neutral-700',
                'border-b border-neutral-700 last:border-b-0',
                sortBy === option.value
                  ? 'bg-yellow-500/10 text-yellow-500'
                  : 'text-white'
              )}
              role="option"
              aria-selected={sortBy === option.value}
            >
              <span>{option.label}</span>
              {sortBy === option.value && (
                <Check className="w-4 h-4 text-yellow-500" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
