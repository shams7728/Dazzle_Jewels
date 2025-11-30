/**
 * Search and sort utilities for the Advanced Search and Filtering System
 */

import { SearchableProduct, SortOption } from '@/types';

/**
 * Calculate relevance score for a product based on search query
 * @param product - The product to score
 * @param query - The search query
 * @returns Relevance score (higher is more relevant)
 */
function calculateRelevanceScore(product: SearchableProduct, query: string): number {
  if (!query) return 0;

  const lowerQuery = query.toLowerCase();
  const lowerTitle = product.title.toLowerCase();
  const lowerDescription = (product.description || '').toLowerCase();

  let score = 0;

  // Exact title match gets highest score
  if (lowerTitle === lowerQuery) {
    score += 100;
  }

  // Title starts with query
  if (lowerTitle.startsWith(lowerQuery)) {
    score += 50;
  }

  // Title contains query
  if (lowerTitle.includes(lowerQuery)) {
    score += 25;
  }

  // Description contains query
  if (lowerDescription.includes(lowerQuery)) {
    score += 10;
  }

  // Bonus for featured products
  if (product.is_featured) {
    score += 5;
  }

  // Bonus for products with good ratings
  if (product.averageRating >= 4) {
    score += 3;
  }

  return score;
}

/**
 * Search products by keyword in title and description
 * @param products - Array of products to search
 * @param query - Search query string
 * @returns Filtered products matching the query with relevance scores
 */
export function searchProducts(
  products: SearchableProduct[],
  query: string
): SearchableProduct[] {
  if (!query || query.trim().length === 0) {
    return products;
  }

  const lowerQuery = query.toLowerCase().trim();
  const terms = lowerQuery.split(' ').filter((term) => term.length > 0);

  // Filter products that match any search term
  const matchingProducts = products.filter((product) => {
    const lowerTitle = product.title.toLowerCase();
    const lowerDescription = (product.description || '').toLowerCase();

    // Check if any term matches title or description
    return terms.some(
      (term) => lowerTitle.includes(term) || lowerDescription.includes(term)
    );
  });

  // Calculate relevance scores
  return matchingProducts.map((product) => ({
    ...product,
    relevanceScore: calculateRelevanceScore(product, lowerQuery),
  }));
}

/**
 * Sort products by price in ascending order
 * @param products - Array of products to sort
 * @returns Sorted products (lowest price first)
 */
export function sortByPriceAsc(products: SearchableProduct[]): SearchableProduct[] {
  return [...products].sort((a, b) => a.effectivePrice - b.effectivePrice);
}

/**
 * Sort products by price in descending order
 * @param products - Array of products to sort
 * @returns Sorted products (highest price first)
 */
export function sortByPriceDesc(products: SearchableProduct[]): SearchableProduct[] {
  return [...products].sort((a, b) => b.effectivePrice - a.effectivePrice);
}

/**
 * Sort products by creation date (newest first)
 * @param products - Array of products to sort
 * @returns Sorted products (newest first)
 */
export function sortByNewest(products: SearchableProduct[]): SearchableProduct[] {
  return [...products].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA; // Descending order (newest first)
  });
}

/**
 * Calculate popularity score based on ratings and featured status
 * @param product - The product to score
 * @returns Popularity score
 */
function calculatePopularityScore(product: SearchableProduct): number {
  let score = 0;

  // Rating contribution (0-25 points)
  score += product.averageRating * 5;

  // Review count contribution (0-20 points, capped)
  score += Math.min(product.reviewCount, 20);

  // Featured products get bonus (15 points)
  if (product.is_featured) {
    score += 15;
  }

  // In-stock products get bonus (10 points)
  if (product.isInStock) {
    score += 10;
  }

  return score;
}

/**
 * Sort products by popularity (combination of ratings, reviews, and featured status)
 * @param products - Array of products to sort
 * @returns Sorted products (most popular first)
 */
export function sortByPopularity(products: SearchableProduct[]): SearchableProduct[] {
  return [...products].sort((a, b) => {
    const scoreA = calculatePopularityScore(a);
    const scoreB = calculatePopularityScore(b);
    return scoreB - scoreA; // Descending order (most popular first)
  });
}

/**
 * Sort products by relevance score
 * @param products - Array of products to sort
 * @returns Sorted products (most relevant first)
 */
export function sortByRelevance(products: SearchableProduct[]): SearchableProduct[] {
  return [...products].sort((a, b) => {
    const scoreA = a.relevanceScore || 0;
    const scoreB = b.relevanceScore || 0;
    return scoreB - scoreA; // Descending order (most relevant first)
  });
}

/**
 * Apply sorting to products based on sort option
 * @param products - Array of products to sort
 * @param sortBy - Sort option value
 * @returns Sorted products
 */
export function applySorting(
  products: SearchableProduct[],
  sortBy: SortOption['value']
): SearchableProduct[] {
  switch (sortBy) {
    case 'price_asc':
      return sortByPriceAsc(products);
    case 'price_desc':
      return sortByPriceDesc(products);
    case 'newest':
      return sortByNewest(products);
    case 'popular':
      return sortByPopularity(products);
    case 'relevance':
    default:
      return sortByRelevance(products);
  }
}

/**
 * Get sort options for the dropdown
 * @returns Array of sort options
 */
export function getSortOptions(): SortOption[] {
  return [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'popular', label: 'Most Popular' },
  ];
}
