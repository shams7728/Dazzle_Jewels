/**
 * Validation utilities for search filters
 */

import { SearchFilters } from '@/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate price range filter
 * @param priceRange - The price range to validate
 * @returns Validation result
 */
export function validatePriceRange(priceRange: {
  min: number;
  max: number;
}): ValidationResult {
  const errors: string[] = [];

  // Check for negative values
  if (priceRange.min < 0) {
    errors.push('Minimum price cannot be negative');
  }

  if (priceRange.max < 0) {
    errors.push('Maximum price cannot be negative');
  }

  // Check if min is greater than max
  if (priceRange.min > priceRange.max) {
    errors.push('Minimum price cannot be greater than maximum price');
  }

  // Check for unreasonably large values (optional sanity check)
  const MAX_REASONABLE_PRICE = 10000000; // 10 million
  if (priceRange.max > MAX_REASONABLE_PRICE) {
    errors.push(`Maximum price cannot exceed ${MAX_REASONABLE_PRICE}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate rating filter
 * @param minRating - The minimum rating to validate
 * @returns Validation result
 */
export function validateRating(minRating: number | null): ValidationResult {
  const errors: string[] = [];

  if (minRating !== null) {
    // Check if rating is within valid range (1-5)
    if (minRating < 1) {
      errors.push('Rating cannot be less than 1');
    }

    if (minRating > 5) {
      errors.push('Rating cannot be greater than 5');
    }

    // Check if rating is a valid number
    if (isNaN(minRating)) {
      errors.push('Rating must be a valid number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate availability filter
 * @param availability - The availability value to validate
 * @returns Validation result
 */
export function validateAvailability(
  availability: string
): ValidationResult {
  const errors: string[] = [];
  const validValues = ['all', 'in_stock', 'out_of_stock'];

  if (!validValues.includes(availability)) {
    errors.push(
      `Availability must be one of: ${validValues.join(', ')}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate array filters (materials, colors, categories)
 * @param filterArray - The array to validate
 * @param filterName - Name of the filter for error messages
 * @returns Validation result
 */
export function validateArrayFilter(
  filterArray: string[],
  filterName: string
): ValidationResult {
  const errors: string[] = [];

  // Check if it's actually an array
  if (!Array.isArray(filterArray)) {
    errors.push(`${filterName} must be an array`);
    return { isValid: false, errors };
  }

  // Check for empty strings
  const hasEmptyStrings = filterArray.some((item) => item.trim() === '');
  if (hasEmptyStrings) {
    errors.push(`${filterName} cannot contain empty values`);
  }

  // Check for reasonable array length (prevent DoS)
  const MAX_FILTER_ITEMS = 100;
  if (filterArray.length > MAX_FILTER_ITEMS) {
    errors.push(
      `${filterName} cannot have more than ${MAX_FILTER_ITEMS} items`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate all search filters
 * @param filters - The complete filter state to validate
 * @returns Validation result with all errors
 */
export function validateSearchFilters(
  filters: SearchFilters
): ValidationResult {
  const allErrors: string[] = [];

  // Validate price range
  const priceValidation = validatePriceRange(filters.priceRange);
  if (!priceValidation.isValid) {
    allErrors.push(...priceValidation.errors);
  }

  // Validate rating
  const ratingValidation = validateRating(filters.minRating);
  if (!ratingValidation.isValid) {
    allErrors.push(...ratingValidation.errors);
  }

  // Validate availability
  const availabilityValidation = validateAvailability(filters.availability);
  if (!availabilityValidation.isValid) {
    allErrors.push(...availabilityValidation.errors);
  }

  // Validate materials array
  const materialsValidation = validateArrayFilter(
    filters.materials,
    'Materials'
  );
  if (!materialsValidation.isValid) {
    allErrors.push(...materialsValidation.errors);
  }

  // Validate colors array
  const colorsValidation = validateArrayFilter(filters.colors, 'Colors');
  if (!colorsValidation.isValid) {
    allErrors.push(...colorsValidation.errors);
  }

  // Validate categories array
  const categoriesValidation = validateArrayFilter(
    filters.categories,
    'Categories'
  );
  if (!categoriesValidation.isValid) {
    allErrors.push(...categoriesValidation.errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Sanitize and fix invalid filter values
 * @param filters - The filters to sanitize
 * @returns Sanitized filters
 */
export function sanitizeFilters(filters: SearchFilters): SearchFilters {
  const sanitized = { ...filters };

  // Fix price range
  if (sanitized.priceRange.min < 0) {
    sanitized.priceRange.min = 0;
  }
  if (sanitized.priceRange.max < 0) {
    sanitized.priceRange.max = 0;
  }
  if (sanitized.priceRange.min > sanitized.priceRange.max) {
    // Swap values
    [sanitized.priceRange.min, sanitized.priceRange.max] = [
      sanitized.priceRange.max,
      sanitized.priceRange.min,
    ];
  }

  // Fix rating
  if (sanitized.minRating !== null) {
    if (sanitized.minRating < 1) {
      sanitized.minRating = 1;
    }
    if (sanitized.minRating > 5) {
      sanitized.minRating = 5;
    }
    if (isNaN(sanitized.minRating)) {
      sanitized.minRating = null;
    }
  }

  // Fix availability
  const validAvailability = ['all', 'in_stock', 'out_of_stock'];
  if (!validAvailability.includes(sanitized.availability)) {
    sanitized.availability = 'all';
  }

  // Fix array filters - remove empty strings
  sanitized.materials = sanitized.materials.filter((m) => m.trim() !== '');
  sanitized.colors = sanitized.colors.filter((c) => c.trim() !== '');
  sanitized.categories = sanitized.categories.filter((c) => c.trim() !== '');

  return sanitized;
}
