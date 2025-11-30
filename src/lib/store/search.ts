import { create } from 'zustand';
import { 
  SearchFilters, 
  SortOption, 
  SearchableProduct, 
  SearchSuggestion,
  Product,
  Review,
  Category
} from '@/types';
import { applyAllFilters, getEffectivePrice, isProductInStock, getProductMaterials, getProductColors } from '@/lib/utils/filters';
import { searchProducts, applySorting } from '@/lib/utils/search-sort';
import { fetchProducts, fetchCategories, fetchReviews, fetchAllSearchData } from '@/lib/api/search-data';
import { validateSearchFilters, sanitizeFilters, validatePriceRange, validateRating } from '@/lib/utils/validation';
import { showErrorToast, showWarningToast } from '@/lib/utils/toast';
import { sanitizeSearchQuery } from '@/lib/utils/search';

interface SearchStore {
  // State
  isOpen: boolean;
  query: string;
  filters: SearchFilters;
  sortBy: SortOption['value'];
  products: SearchableProduct[];
  allProducts: Product[]; // Raw products from database
  categories: Category[]; // Cached categories
  reviews: Review[]; // Cached reviews
  suggestions: SearchSuggestion[];
  isLoading: boolean;
  error: string | null;
  isOffline: boolean; // Track offline state
  lastSuccessfulFetch: number | null; // Timestamp of last successful fetch

  // Actions
  setIsOpen: (isOpen: boolean) => void;
  setQuery: (query: string) => void;
  updateFilter: <K extends keyof SearchFilters>(
    filterType: K,
    value: SearchFilters[K]
  ) => void;
  clearFilter: (filterType: keyof SearchFilters) => void;
  clearAllFilters: () => void;
  setSortBy: (sortBy: SortOption['value']) => void;
  setAllProducts: (products: Product[], reviews?: Review[]) => void;
  setCategories: (categories: Category[]) => void;
  setReviews: (reviews: Review[]) => void;
  setSuggestions: (suggestions: SearchSuggestion[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Data fetching actions
  fetchAllData: () => Promise<void>;
  fetchProductsData: () => Promise<void>;
  fetchCategoriesData: () => Promise<void>;
  fetchReviewsData: () => Promise<void>;
  
  // Computed getters
  getFilteredProducts: () => SearchableProduct[];
  getActiveFilterCount: () => number;
  getResultCount: () => number;
}

const initialFilters: SearchFilters = {
  query: '',
  priceRange: { min: 0, max: 100000 },
  materials: [],
  colors: [],
  categories: [],
  minRating: null,
  availability: 'all',
};

/**
 * Convert raw Product to SearchableProduct with computed fields
 */
function convertToSearchableProduct(
  product: Product,
  reviews: Review[] = []
): SearchableProduct {
  // Calculate effective price
  const firstVariant = product.variants?.[0];
  const effectivePrice = getEffectivePrice(product, firstVariant);

  // Calculate average rating and review count
  const productReviews = reviews.filter((r) => r.product_id === product.id);
  const reviewCount = productReviews.length;
  const averageRating =
    reviewCount > 0
      ? productReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  // Check stock availability
  const inStock = isProductInStock(product);

  // Get available materials and colors
  const availableMaterials = getProductMaterials(product);
  const availableColors = getProductColors(product);

  return {
    ...product,
    effectivePrice,
    averageRating,
    reviewCount,
    isInStock: inStock,
    availableMaterials,
    availableColors,
  };
}

// Memoization cache for expensive computations
let memoizedFilteredProducts: SearchableProduct[] | null = null;
let memoizedFilterKey: string | null = null;
let memoizedSortedProducts: SearchableProduct[] | null = null;
let memoizedSortKey: string | null = null;

/**
 * Generate a cache key for filter state
 */
function generateFilterKey(
  query: string,
  filters: SearchFilters,
  productsLength: number
): string {
  return JSON.stringify({
    query,
    filters,
    productsLength,
  });
}

/**
 * Generate a cache key for sort state
 */
function generateSortKey(
  filteredProductsLength: number,
  sortBy: SortOption['value']
): string {
  return `${filteredProductsLength}-${sortBy}`;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  // Initial State
  isOpen: false,
  query: '',
  filters: initialFilters,
  sortBy: 'relevance',
  products: [],
  allProducts: [],
  categories: [],
  reviews: [],
  suggestions: [],
  isLoading: false,
  error: null,
  isOffline: false,
  lastSuccessfulFetch: null,

  // Actions
  setIsOpen: (isOpen) => set({ isOpen }),

  setQuery: (query) => {
    // Sanitize the search query
    const sanitizedQuery = sanitizeSearchQuery(query);
    
    // Warn user if query was modified
    if (sanitizedQuery !== query && query.length > 0) {
      showWarningToast('Search query was sanitized for safety');
    }
    
    set({ query: sanitizedQuery });
    // Update filters.query as well for consistency
    set((state) => ({
      filters: { ...state.filters, query: sanitizedQuery },
    }));
  },

  updateFilter: (filterType, value) => {
    set((state) => {
      const newFilters = {
        ...state.filters,
        [filterType]: value,
      };

      // Validate specific filter types
      if (filterType === 'priceRange') {
        const validation = validatePriceRange(value as { min: number; max: number });
        if (!validation.isValid) {
          showErrorToast(validation.errors[0]);
          return state; // Don't update if invalid
        }
      }

      if (filterType === 'minRating') {
        const validation = validateRating(value as number | null);
        if (!validation.isValid) {
          showErrorToast(validation.errors[0]);
          return state; // Don't update if invalid
        }
      }

      // Validate complete filter state
      const validation = validateSearchFilters(newFilters);
      if (!validation.isValid) {
        // Sanitize and use corrected values
        const sanitized = sanitizeFilters(newFilters);
        showWarningToast('Filter values were adjusted to valid ranges');
        return { filters: sanitized };
      }

      return { filters: newFilters };
    });
  },

  clearFilter: (filterType) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [filterType]: initialFilters[filterType],
      },
    }));
  },

  clearAllFilters: () => {
    const sanitizedFilters = sanitizeFilters({ ...initialFilters, query: get().query });
    set({
      filters: sanitizedFilters,
      query: get().query, // Keep the search query
    });
  },

  setSortBy: (sortBy) => set({ sortBy }),

  setAllProducts: (products, reviews = []) => {
    // Convert to searchable products
    const searchableProducts = products.map((p) =>
      convertToSearchableProduct(p, reviews)
    );
    
    // Invalidate memoization cache when products change
    memoizedFilteredProducts = null;
    memoizedFilterKey = null;
    memoizedSortedProducts = null;
    memoizedSortKey = null;
    
    set({ allProducts: products, products: searchableProducts });
  },

  setCategories: (categories) => set({ categories }),

  setReviews: (reviews) => set({ reviews }),

  setSuggestions: (suggestions) => set({ suggestions }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // Data fetching actions
  fetchAllData: async () => {
    const currentState = get();
    set({ isLoading: true, error: null, isOffline: false });
    
    try {
      const result = await fetchAllSearchData();
      
      if (result.error) {
        // If we have cached data, use it and mark as offline
        if (currentState.allProducts.length > 0) {
          set({ 
            error: 'Using cached data - connection issue', 
            isLoading: false,
            isOffline: true 
          });
          return;
        }
        
        set({ error: result.error.message, isLoading: false, isOffline: true });
        return;
      }

      // Update categories
      if (result.categories) {
        set({ categories: result.categories });
      }

      // Update reviews
      if (result.reviews) {
        set({ reviews: result.reviews });
      }

      // Update products with reviews for rating calculation
      if (result.products) {
        const searchableProducts = result.products.map((p) =>
          convertToSearchableProduct(p, result.reviews || [])
        );
        set({ 
          allProducts: result.products, 
          products: searchableProducts,
          lastSuccessfulFetch: Date.now(),
          isOffline: false
        });
      }

      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      
      // If we have cached data, use it
      if (currentState.allProducts.length > 0) {
        set({ 
          error: 'Using cached data - connection issue', 
          isLoading: false,
          isOffline: true 
        });
      } else {
        set({ error: errorMessage, isLoading: false, isOffline: true });
      }
    }
  },

  fetchProductsData: async () => {
    const currentState = get();
    set({ isLoading: true, error: null, isOffline: false });
    
    try {
      const result = await fetchProducts();
      
      if (result.error) {
        // If we have cached data, use it
        if (currentState.allProducts.length > 0) {
          set({ 
            error: 'Using cached data - connection issue', 
            isLoading: false,
            isOffline: true 
          });
          return;
        }
        
        set({ error: result.error.message, isLoading: false, isOffline: true });
        return;
      }

      if (result.data) {
        const { reviews } = get();
        const searchableProducts = result.data.map((p) =>
          convertToSearchableProduct(p, reviews)
        );
        set({ 
          allProducts: result.data, 
          products: searchableProducts,
          isLoading: false,
          lastSuccessfulFetch: Date.now(),
          isOffline: false
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      
      // If we have cached data, use it
      if (currentState.allProducts.length > 0) {
        set({ 
          error: 'Using cached data - connection issue', 
          isLoading: false,
          isOffline: true 
        });
      } else {
        set({ error: errorMessage, isLoading: false, isOffline: true });
      }
    }
  },

  fetchCategoriesData: async () => {
    try {
      const result = await fetchCategories();
      
      if (result.error) {
        console.error('Error fetching categories:', result.error);
        return;
      }

      if (result.data) {
        set({ categories: result.data });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  },

  fetchReviewsData: async () => {
    try {
      const result = await fetchReviews();
      
      if (result.error) {
        console.error('Error fetching reviews:', result.error);
        return;
      }

      if (result.data) {
        set({ reviews: result.data });
        
        // Recalculate searchable products with new reviews
        const { allProducts } = get();
        if (allProducts.length > 0) {
          const searchableProducts = allProducts.map((p) =>
            convertToSearchableProduct(p, result.data || [])
          );
          set({ products: searchableProducts });
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  },

  // Computed getters with memoization
  getFilteredProducts: () => {
    const state = get();
    
    // Generate cache key for current filter state
    const currentFilterKey = generateFilterKey(
      state.query,
      state.filters,
      state.products.length
    );

    // Check if we can use cached filtered products
    if (memoizedFilterKey === currentFilterKey && memoizedFilteredProducts) {
      // Apply sorting with memoization
      const currentSortKey = generateSortKey(
        memoizedFilteredProducts.length,
        state.sortBy
      );

      if (memoizedSortKey === currentSortKey && memoizedSortedProducts) {
        return memoizedSortedProducts;
      }

      // Sort and cache
      const sorted = applySorting(memoizedFilteredProducts, state.sortBy);
      memoizedSortedProducts = sorted;
      memoizedSortKey = currentSortKey;
      return sorted;
    }

    // Compute filtered products
    let filtered = state.products;

    // Apply search if query exists
    if (state.query && state.query.trim().length > 0) {
      filtered = searchProducts(filtered, state.query);
    }

    // Apply all filters
    filtered = applyAllFilters(filtered, state.filters);

    // Cache filtered results
    memoizedFilteredProducts = filtered;
    memoizedFilterKey = currentFilterKey;

    // Apply sorting with memoization
    const currentSortKey = generateSortKey(filtered.length, state.sortBy);
    const sorted = applySorting(filtered, state.sortBy);
    memoizedSortedProducts = sorted;
    memoizedSortKey = currentSortKey;

    return sorted;
  },

  getActiveFilterCount: () => {
    const { filters } = get();
    let count = 0;

    if (filters.priceRange.min > 0 || filters.priceRange.max < 100000) count++;
    if (filters.materials.length > 0) count++;
    if (filters.colors.length > 0) count++;
    if (filters.categories.length > 0) count++;
    if (filters.minRating !== null) count++;
    if (filters.availability !== 'all') count++;

    return count;
  },

  getResultCount: () => {
    return get().getFilteredProducts().length;
  },
}));
