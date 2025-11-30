/**
 * Search utility functions for the Advanced Search and Filtering System
 */

/**
 * Debounce function to delay execution until after a specified wait time
 * @param func - The function to debounce
 * @param wait - The delay in milliseconds (default: 300ms)
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sanitize search query to prevent injection and ensure valid input
 * @param query - The raw search query
 * @returns Sanitized query string
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';
  
  // Remove special SQL/injection characters
  const sanitized = query.replace(/[;'"\\]/g, '');
  
  // Trim whitespace
  const trimmed = sanitized.trim();
  
  // Limit length to 100 characters
  return trimmed.slice(0, 100);
}

/**
 * Validate filter state to ensure all values are within acceptable ranges
 * @param filters - The filter state to validate
 * @returns True if valid, false otherwise
 */
export function validateFilters(filters: {
  priceRange: { min: number; max: number };
  minRating: number | null;
}): boolean {
  // Price range validation
  if (filters.priceRange.min < 0 || filters.priceRange.max < 0) {
    return false;
  }
  if (filters.priceRange.min > filters.priceRange.max) {
    return false;
  }

  // Rating validation
  if (filters.minRating !== null) {
    if (filters.minRating < 1 || filters.minRating > 5) {
      return false;
    }
  }

  return true;
}

/**
 * Highlight matching keywords in text with HTML markup
 * @param text - The text to highlight
 * @param keywords - The search keywords
 * @returns Text with highlighted keywords
 */
export function highlightKeywords(text: string, keywords: string): string {
  if (!keywords || !text) return text;

  const terms = keywords.split(' ').filter(term => term.length > 0);
  let highlighted = text;

  terms.forEach(term => {
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    highlighted = highlighted.replace(
      regex,
      '<mark class="bg-yellow-500/20 text-yellow-500 font-medium">$1</mark>'
    );
  });

  return highlighted;
}

/**
 * Escape special regex characters in a string
 * @param str - The string to escape
 * @returns Escaped string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
