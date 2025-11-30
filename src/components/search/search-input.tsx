"use client";

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useSearchStore } from '@/lib/store/search';
import { debounce, sanitizeSearchQuery } from '@/lib/utils/search';
import { cn } from '@/lib/utils';

function SearchInputComponent() {
  const { query, setQuery, suggestions, isLoading } = useSearchStore();
  const [localQuery, setLocalQuery] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Debounced search function (memoized)
  const debouncedSearch = useRef(
    debounce((searchQuery: string) => {
      const sanitized = sanitizeSearchQuery(searchQuery);
      setQuery(sanitized);
      
      // Fetch suggestions if query is at least 2 characters
      if (sanitized.length >= 2) {
        // TODO: Implement suggestion fetching in a later task
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300)
  ).current;

  // Handle input change (memoized)
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    debouncedSearch(value);
    setSelectedIndex(-1);
  }, [debouncedSearch]);

  // Handle clear button (memoized)
  const handleClear = useCallback(() => {
    setLocalQuery('');
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, [setQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion click (memoized)
  const handleSuggestionClick = useCallback((suggestion: { text: string; type: string }) => {
    setLocalQuery(suggestion.text);
    setQuery(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  }, [setQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Sync local query with store query
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search for jewelry, rings, necklaces..."
          className={cn(
            'w-full pl-12 pr-12 py-3 rounded-lg',
            'bg-neutral-800 border-2 border-neutral-600',
            'text-white placeholder-neutral-500',
            'focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent',
            'transition-all duration-200',
            'touch-manipulation' // Mobile optimization
          )}
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          role="combobox"
          aria-expanded={showSuggestions}
          inputMode="search" // Mobile keyboard optimization
        />
        
        {/* Loading or Clear Button */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-neutral-400 animate-spin" />
          ) : localQuery.length > 0 ? (
            <button
              onClick={handleClear}
              className="text-neutral-400 hover:text-white transition-colors touch-manipulation active:scale-90"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id="search-suggestions"
          className={cn(
            'absolute top-full left-0 right-0 mt-2 z-10',
            'bg-neutral-800 border-2 border-neutral-600 rounded-lg shadow-xl',
            'max-h-80 overflow-y-auto',
            'animate-in fade-in-0 slide-in-from-top-2 duration-200'
          )}
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                'w-full px-4 py-3 text-left flex items-center gap-3',
                'hover:bg-neutral-700 transition-colors',
                'border-b border-neutral-700 last:border-b-0',
                'touch-manipulation active:scale-[0.98]', // Mobile optimization
                selectedIndex === index && 'bg-neutral-700'
              )}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <Search className="h-4 w-4 text-neutral-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-white truncate">{suggestion.text}</div>
                {suggestion.type === 'product' && (
                  <div className="text-xs text-neutral-400">Product</div>
                )}
                {suggestion.type === 'category' && (
                  <div className="text-xs text-neutral-400">Category</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No suggestions message */}
      {showSuggestions && localQuery.length >= 2 && suggestions.length === 0 && !isLoading && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-2 z-10',
            'bg-neutral-800 border-2 border-neutral-600 rounded-lg shadow-xl',
            'px-4 py-6 text-center text-neutral-400',
            'animate-in fade-in-0 slide-in-from-top-2 duration-200'
          )}
        >
          No suggestions found
        </div>
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export const SearchInput = memo(SearchInputComponent);
