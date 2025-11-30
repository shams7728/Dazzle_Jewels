/**
 * Data fetching utilities for the search system
 * Handles fetching products, categories, and reviews from Supabase
 */

import { supabase } from '@/lib/supabase';
import { Product, Category, Review } from '@/types';
import { retryWithBackoff, isRetryableError } from '@/lib/utils/retry';
import { showErrorToast } from '@/lib/utils/toast';

/**
 * Fetch all products with their variants
 * Used for populating the search store
 */
export async function fetchProducts(): Promise<{
  data: Product[] | null;
  error: Error | null;
}> {
  try {
    const result = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            category:categories(*),
            variants:product_variants(*)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch products: ${error.message}`);
        }

        return data;
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        onRetry: (error, attempt) => {
          console.warn(`Retrying fetchProducts (attempt ${attempt}):`, error.message);
          if (attempt === 1) {
            showErrorToast('Connection issue. Retrying...');
          }
        },
      }
    );

    return { data: result, error: null };
  } catch (error) {
    console.error('Error fetching products:', error);
    const errorObj = error instanceof Error ? error : new Error('Unknown error');
    
    // Show error toast for network errors
    if (isRetryableError(errorObj)) {
      showErrorToast('Unable to load products. Please check your connection.');
    } else {
      showErrorToast('Failed to load products. Please try again.');
    }
    
    return {
      data: null,
      error: errorObj,
    };
  }
}

/**
 * Fetch all categories
 * Used for category filter options
 */
export async function fetchCategories(): Promise<{
  data: Category[] | null;
  error: Error | null;
}> {
  try {
    const result = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          throw new Error(`Failed to fetch categories: ${error.message}`);
        }

        return data;
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        onRetry: (error, attempt) => {
          console.warn(`Retrying fetchCategories (attempt ${attempt}):`, error.message);
        },
      }
    );

    return { data: result, error: null };
  } catch (error) {
    console.error('Error fetching categories:', error);
    const errorObj = error instanceof Error ? error : new Error('Unknown error');
    
    // Show error toast for network errors
    if (isRetryableError(errorObj)) {
      showErrorToast('Unable to load categories. Please check your connection.');
    }
    
    return {
      data: null,
      error: errorObj,
    };
  }
}

/**
 * Fetch all reviews for rating calculations
 * Used for computing average ratings per product
 */
export async function fetchReviews(): Promise<{
  data: Review[] | null;
  error: Error | null;
}> {
  try {
    const result = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(`Failed to fetch reviews: ${error.message}`);
        }

        return data;
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        onRetry: (error, attempt) => {
          console.warn(`Retrying fetchReviews (attempt ${attempt}):`, error.message);
        },
      }
    );

    return { data: result, error: null };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    const errorObj = error instanceof Error ? error : new Error('Unknown error');
    
    // Show error toast for network errors
    if (isRetryableError(errorObj)) {
      showErrorToast('Unable to load reviews. Please check your connection.');
    }
    
    return {
      data: null,
      error: errorObj,
    };
  }
}

/**
 * Fetch all data needed for search functionality
 * Combines products, categories, and reviews in a single call
 */
export async function fetchAllSearchData(): Promise<{
  products: Product[] | null;
  categories: Category[] | null;
  reviews: Review[] | null;
  error: Error | null;
}> {
  try {
    const [productsResult, categoriesResult, reviewsResult] = await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchReviews(),
    ]);

    // Check if any fetch failed
    const error =
      productsResult.error || categoriesResult.error || reviewsResult.error;

    if (error) {
      return {
        products: null,
        categories: null,
        reviews: null,
        error,
      };
    }

    return {
      products: productsResult.data,
      categories: categoriesResult.data,
      reviews: reviewsResult.data,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching all search data:', error);
    return {
      products: null,
      categories: null,
      reviews: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
