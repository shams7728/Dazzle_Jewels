import { Product, ProductVariant } from '@/types';

/**
 * Calculate the effective price for a product with optional variant
 * @param product - The product object
 * @param variant - Optional variant with price adjustment
 * @returns The effective price
 */
export function calculateEffectivePrice(
  product: Product,
  variant?: ProductVariant | null
): number {
  const basePrice = product.discount_price ?? product.base_price;
  const variantAdjustment = variant?.price_adjustment ?? 0;
  return basePrice + variantAdjustment;
}

/**
 * Calculate the discount percentage for a product
 * @param basePrice - The original price
 * @param discountPrice - The discounted price
 * @returns The discount percentage rounded to nearest integer
 */
export function calculateDiscountPercentage(
  basePrice: number,
  discountPrice: number
): number {
  if (discountPrice >= basePrice) return 0;
  return Math.round(((basePrice - discountPrice) / basePrice) * 100);
}

/**
 * Format price in Indian Rupees
 * @param price - The price to format
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Transform image URL for optimization
 * @param url - The original image URL
 * @param options - Transformation options
 * @returns Transformed image URL
 */
export function transformImageUrl(
  url: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  }
): string {
  // If it's a Supabase storage URL, we can add transformation parameters
  if (url.includes('supabase')) {
    const urlObj = new URL(url);
    if (options?.width) urlObj.searchParams.set('width', options.width.toString());
    if (options?.height) urlObj.searchParams.set('height', options.height.toString());
    if (options?.quality) urlObj.searchParams.set('quality', options.quality.toString());
    if (options?.format) urlObj.searchParams.set('format', options.format);
    return urlObj.toString();
  }
  
  // For other URLs, return as-is
  return url;
}

/**
 * Get stock status based on quantity
 * @param stockQuantity - The stock quantity
 * @returns Stock status
 */
export function getStockStatus(
  stockQuantity: number
): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (stockQuantity === 0) return 'out_of_stock';
  if (stockQuantity <= 5) return 'low_stock';
  return 'in_stock';
}

/**
 * Get available colors from variants
 * @param variants - Array of product variants
 * @returns Array of unique colors
 */
export function getAvailableColors(variants: ProductVariant[]): string[] {
  const colors = variants
    .map((v) => v.color)
    .filter((color): color is string => !!color);
  return Array.from(new Set(colors));
}

/**
 * Get available materials from variants
 * @param variants - Array of product variants
 * @returns Array of unique materials
 */
export function getAvailableMaterials(variants: ProductVariant[]): string[] {
  const materials = variants
    .map((v) => v.material)
    .filter((material): material is string => !!material);
  return Array.from(new Set(materials));
}

/**
 * Check if product has discount
 * @param product - The product object
 * @returns True if product has a discount
 */
export function hasDiscount(product: Product): boolean {
  return !!(
    product.discount_price &&
    product.discount_price < product.base_price
  );
}

/**
 * Get estimated delivery date
 * @param daysToAdd - Number of days to add to current date
 * @returns Formatted delivery date string
 */
export function getEstimatedDelivery(daysToAdd: number = 7): string {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);
  
  return deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
