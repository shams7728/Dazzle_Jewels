import { describe, test, expect } from 'vitest';
import {
  calculateEffectivePrice,
  calculateDiscountPercentage,
  formatPrice,
  transformImageUrl,
  getStockStatus,
  getAvailableColors,
  getAvailableMaterials,
  hasDiscount,
  getEstimatedDelivery,
} from '../product-detail';
import { Product, ProductVariant } from '@/types';

describe('Product Detail Utility Functions - Unit Tests', () => {
  // Test price calculation with variants
  describe('calculateEffectivePrice', () => {
    test('returns base price when no discount and no variant', () => {
      const product: Product = {
        id: '1',
        title: 'Test Product',
        base_price: 1000,
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_offer_item: false,
        created_at: new Date().toISOString(),
      };

      expect(calculateEffectivePrice(product)).toBe(1000);
    });

    test('returns discount price when available and no variant', () => {
      const product: Product = {
        id: '1',
        title: 'Test Product',
        base_price: 1000,
        discount_price: 800,
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_offer_item: false,
        created_at: new Date().toISOString(),
      };

      expect(calculateEffectivePrice(product)).toBe(800);
    });

    test('adds variant price adjustment to base price', () => {
      const product: Product = {
        id: '1',
        title: 'Test Product',
        base_price: 1000,
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_offer_item: false,
        created_at: new Date().toISOString(),
      };

      const variant: ProductVariant = {
        id: 'v1',
        product_id: '1',
        color: 'Gold',
        material: '18K',
        price_adjustment: 500,
        stock_quantity: 10,
        images: [],
        created_at: new Date().toISOString(),
      };

      expect(calculateEffectivePrice(product, variant)).toBe(1500);
    });

    test('adds variant price adjustment to discount price', () => {
      const product: Product = {
        id: '1',
        title: 'Test Product',
        base_price: 1000,
        discount_price: 800,
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_offer_item: false,
        created_at: new Date().toISOString(),
      };

      const variant: ProductVariant = {
        id: 'v1',
        product_id: '1',
        color: 'Gold',
        material: '18K',
        price_adjustment: 200,
        stock_quantity: 10,
        images: [],
        created_at: new Date().toISOString(),
      };

      expect(calculateEffectivePrice(product, variant)).toBe(1000);
    });

    test('handles negative variant price adjustment', () => {
      const product: Product = {
        id: '1',
        title: 'Test Product',
        base_price: 1000,
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_offer_item: false,
        created_at: new Date().toISOString(),
      };

      const variant: ProductVariant = {
        id: 'v1',
        product_id: '1',
        color: 'Silver',
        material: '14K',
        price_adjustment: -200,
        stock_quantity: 10,
        images: [],
        created_at: new Date().toISOString(),
      };

      expect(calculateEffectivePrice(product, variant)).toBe(800);
    });

    test('handles null variant', () => {
      const product: Product = {
        id: '1',
        title: 'Test Product',
        base_price: 1000,
        discount_price: 800,
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_offer_item: false,
        created_at: new Date().toISOString(),
      };

      expect(calculateEffectivePrice(product, null)).toBe(800);
    });
  });

  // Test discount percentage calculations
  describe('calculateDiscountPercentage', () => {
    test('calculates correct percentage for standard discount', () => {
      expect(calculateDiscountPercentage(1000, 800)).toBe(20);
    });

    test('calculates correct percentage for 50% discount', () => {
      expect(calculateDiscountPercentage(1000, 500)).toBe(50);
    });

    test('rounds to nearest integer', () => {
      expect(calculateDiscountPercentage(1000, 667)).toBe(33);
    });

    test('returns 0 when discount price equals base price', () => {
      expect(calculateDiscountPercentage(1000, 1000)).toBe(0);
    });

    test('returns 0 when discount price is higher than base price', () => {
      expect(calculateDiscountPercentage(1000, 1200)).toBe(0);
    });

    test('handles large discounts correctly', () => {
      expect(calculateDiscountPercentage(10000, 1000)).toBe(90);
    });

    test('handles small discounts correctly', () => {
      expect(calculateDiscountPercentage(1000, 990)).toBe(1);
    });
  });

  // Test image URL transformations
  describe('transformImageUrl', () => {
    test('returns original URL for non-Supabase URLs', () => {
      const url = 'https://example.com/image.jpg';
      expect(transformImageUrl(url)).toBe(url);
    });

    test('adds width parameter to Supabase URL', () => {
      const url = 'https://supabase.co/storage/image.jpg';
      const result = transformImageUrl(url, { width: 800 });
      expect(result).toContain('width=800');
    });

    test('adds height parameter to Supabase URL', () => {
      const url = 'https://supabase.co/storage/image.jpg';
      const result = transformImageUrl(url, { height: 600 });
      expect(result).toContain('height=600');
    });

    test('adds quality parameter to Supabase URL', () => {
      const url = 'https://supabase.co/storage/image.jpg';
      const result = transformImageUrl(url, { quality: 80 });
      expect(result).toContain('quality=80');
    });

    test('adds format parameter to Supabase URL', () => {
      const url = 'https://supabase.co/storage/image.jpg';
      const result = transformImageUrl(url, { format: 'webp' });
      expect(result).toContain('format=webp');
    });

    test('adds multiple parameters to Supabase URL', () => {
      const url = 'https://supabase.co/storage/image.jpg';
      const result = transformImageUrl(url, {
        width: 800,
        height: 600,
        quality: 80,
        format: 'webp',
      });
      expect(result).toContain('width=800');
      expect(result).toContain('height=600');
      expect(result).toContain('quality=80');
      expect(result).toContain('format=webp');
    });

    test('handles URL without options', () => {
      const url = 'https://supabase.co/storage/image.jpg';
      expect(transformImageUrl(url)).toBe(url);
    });
  });

  describe('getStockStatus', () => {
    test('returns out_of_stock for zero quantity', () => {
      expect(getStockStatus(0)).toBe('out_of_stock');
    });

    test('returns low_stock for quantity 1-5', () => {
      expect(getStockStatus(1)).toBe('low_stock');
      expect(getStockStatus(3)).toBe('low_stock');
      expect(getStockStatus(5)).toBe('low_stock');
    });

    test('returns in_stock for quantity above 5', () => {
      expect(getStockStatus(6)).toBe('in_stock');
      expect(getStockStatus(10)).toBe('in_stock');
      expect(getStockStatus(100)).toBe('in_stock');
    });
  });

  describe('getAvailableColors', () => {
    test('returns unique colors from variants', () => {
      const variants: ProductVariant[] = [
        {
          id: 'v1',
          product_id: '1',
          color: 'Gold',
          material: '18K',
          price_adjustment: 0,
          stock_quantity: 10,
          images: [],
          created_at: new Date().toISOString(),
        },
        {
          id: 'v2',
          product_id: '1',
          color: 'Silver',
          material: '18K',
          price_adjustment: 0,
          stock_quantity: 10,
          images: [],
          created_at: new Date().toISOString(),
        },
        {
          id: 'v3',
          product_id: '1',
          color: 'Gold',
          material: '22K',
          price_adjustment: 0,
          stock_quantity: 10,
          images: [],
          created_at: new Date().toISOString(),
        },
      ];

      const colors = getAvailableColors(variants);
      expect(colors).toHaveLength(2);
      expect(colors).toContain('Gold');
      expect(colors).toContain('Silver');
    });

    test('filters out undefined colors', () => {
      const variants: ProductVariant[] = [
        {
          id: 'v1',
          product_id: '1',
          color: 'Gold',
          material: '18K',
          price_adjustment: 0,
          stock_quantity: 10,
          images: [],
          created_at: new Date().toISOString(),
        },
        {
          id: 'v2',
          product_id: '1',
          material: '18K',
          price_adjustment: 0,
          stock_quantity: 10,
          images: [],
          created_at: new Date().toISOString(),
        },
      ];

      const colors = getAvailableColors(variants);
      expect(colors).toHaveLength(1);
      expect(colors).toContain('Gold');
    });

    test('returns empty array for variants without colors', () => {
      const variants: ProductVariant[] = [
        {
          id: 'v1',
          product_id: '1',
          material: '18K',
          price_adjustment: 0,
          stock_quantity: 10,
          images: [],
          created_at: new Date().toISOString(),
        },
      ];

      const colors = getAvailableColors(variants);
      expect(colors).toHaveLength(0);
    });
  });

  describe('getAvailableMaterials', () => {
    test('returns unique materials from variants', () => {
      const variants: ProductVariant[] = [
        {
          id: 'v1',
          product_id: '1',
          color: 'Gold',
          material: '18K',
          price_adjustment: 0,
          stock_quantity: 10,
          images: [],
          created_at: new Date().toISOString(),
        },
        {
          id: 'v2',
          product_id: '1',
          color: 'Gold',
          material: '22K',
          price_adjustment: 0,
          stock_quantity: 10,
          images: [],
          created_at: new Date().toISOString(),
        },
        {
          id: 'v3',
          product_id: '1',
          color: 'Silver',
          material: '18K',
          price_adjustment: 0,
          stock_quantity: 10,
          images: [],
          created_at: new Date().toISOString(),
        },
      ];

      const materials = getAvailableMaterials(variants);
      expect(materials).toHaveLength(2);
      expect(materials).toContain('18K');
      expect(materials).toContain('22K');
    });

    test('filters out undefined materials', () => {
      const variants: ProductVariant[] = [
        {
          id: 'v1',
          product_id: '1',
          color: 'Gold',
          material: '18K',
          price_adjustment: 0,
          stock_quantity: 10,
          images: [],
          created_at: new Date().toISOString(),
        },
        {
          id: 'v2',
          product_id: '1',
          color: 'Silver',
          price_adjustment: 0,
          stock_quantity: 10,
          images: [],
          created_at: new Date().toISOString(),
        },
      ];

      const materials = getAvailableMaterials(variants);
      expect(materials).toHaveLength(1);
      expect(materials).toContain('18K');
    });
  });

  describe('hasDiscount', () => {
    test('returns true when discount price is less than base price', () => {
      const product: Product = {
        id: '1',
        title: 'Test Product',
        base_price: 1000,
        discount_price: 800,
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_offer_item: false,
        created_at: new Date().toISOString(),
      };

      expect(hasDiscount(product)).toBe(true);
    });

    test('returns false when no discount price', () => {
      const product: Product = {
        id: '1',
        title: 'Test Product',
        base_price: 1000,
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_offer_item: false,
        created_at: new Date().toISOString(),
      };

      expect(hasDiscount(product)).toBe(false);
    });

    test('returns false when discount price equals base price', () => {
      const product: Product = {
        id: '1',
        title: 'Test Product',
        base_price: 1000,
        discount_price: 1000,
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_offer_item: false,
        created_at: new Date().toISOString(),
      };

      expect(hasDiscount(product)).toBe(false);
    });

    test('returns false when discount price is higher than base price', () => {
      const product: Product = {
        id: '1',
        title: 'Test Product',
        base_price: 1000,
        discount_price: 1200,
        is_featured: false,
        is_new_arrival: false,
        is_best_seller: false,
        is_offer_item: false,
        created_at: new Date().toISOString(),
      };

      expect(hasDiscount(product)).toBe(false);
    });
  });

  describe('formatPrice', () => {
    test('formats price with rupee symbol', () => {
      expect(formatPrice(1000)).toContain('₹');
    });

    test('formats price with Indian locale', () => {
      const formatted = formatPrice(100000);
      expect(formatted).toContain('₹');
      expect(formatted).toContain('1,00,000');
    });

    test('handles decimal prices', () => {
      const formatted = formatPrice(1234.56);
      expect(formatted).toContain('₹');
    });

    test('handles zero price', () => {
      expect(formatPrice(0)).toBe('₹0');
    });
  });

  describe('getEstimatedDelivery', () => {
    test('returns a date string', () => {
      const delivery = getEstimatedDelivery();
      expect(typeof delivery).toBe('string');
      expect(delivery.length).toBeGreaterThan(0);
    });

    test('returns future date with default 7 days', () => {
      const delivery = getEstimatedDelivery();
      // Should contain month name
      expect(delivery).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
    });

    test('accepts custom days parameter', () => {
      const delivery = getEstimatedDelivery(14);
      expect(typeof delivery).toBe('string');
      expect(delivery.length).toBeGreaterThan(0);
    });

    test('handles zero days', () => {
      const delivery = getEstimatedDelivery(0);
      expect(typeof delivery).toBe('string');
    });
  });
});
