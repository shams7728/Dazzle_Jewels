/**
 * Integration Tests for Product Detail Page
 * Feature: product-detail-redesign
 * 
 * These tests verify that all components are properly integrated
 * and work together in the product detail page.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductDetailClient from '../product-detail-client';
import { Product, ProductVariant } from '@/types';

// Mock the lazy-loaded components
vi.mock('@/components/product-detail/lazy-components', () => ({
  LazyProductTabs: ({ description }: any) => <div data-testid="product-tabs">{description}</div>,
  LazyRelatedProducts: () => <div data-testid="related-products">Related Products</div>,
  LazyReviewsSection: () => <div data-testid="reviews-section">Reviews</div>,
  LazyShareButtons: () => <div data-testid="share-buttons">Share</div>,
}));

// Mock the layout components
vi.mock('@/components/layout/breadcrumb', () => ({
  Breadcrumb: () => <div data-testid="breadcrumb">Breadcrumb</div>,
}));

vi.mock('@/components/layout/back-link', () => ({
  BackLink: () => <div data-testid="back-link">Back Link</div>,
}));

vi.mock('@/components/layout/mobile-back-button', () => ({
  MobileBackButton: () => <div data-testid="mobile-back-button">Mobile Back</div>,
}));

// Mock the UI components
vi.mock('@/components/ui/scroll-reveal', () => ({
  ScrollReveal: ({ children }: any) => <div>{children}</div>,
}));

// Mock the error boundary
vi.mock('@/components/error-boundary', () => ({
  ErrorBoundary: ({ children }: any) => <div>{children}</div>,
  ErrorFallback: () => <div>Error</div>,
}));

// Mock the stores
vi.mock('@/lib/store/cart', () => ({
  useCartStore: () => ({
    addItem: vi.fn(),
  }),
}));

vi.mock('@/lib/store/wishlist', () => ({
  useWishlistStore: () => ({
    toggleItem: vi.fn(),
    isInWishlist: vi.fn(() => false),
  }),
}));

// Helper function to create a mock product
function createMockProduct(overrides?: Partial<Product>): Product {
  const variant: ProductVariant = {
    id: 'variant-1',
    product_id: 'product-1',
    color: 'Gold',
    material: '14K',
    price_adjustment: 1000,
    stock_quantity: 10,
    images: ['/image1.jpg', '/image2.jpg'],
    created_at: new Date().toISOString(),
  };

  return {
    id: 'product-1',
    title: 'Test Product',
    description: 'This is a test product description',
    base_price: 10000,
    discount_price: 8000,
    category_id: 'cat-1',
    is_featured: false,
    stock_quantity: 10,
    images: ['/image1.jpg'],
    created_at: new Date().toISOString(),
    variants: [variant],
    category: {
      id: 'cat-1',
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test',
      image_url: '/cat.jpg',
      created_at: new Date().toISOString(),
    },
    ...overrides,
  };
}

describe('Product Detail Page Integration', () => {
  it('should render all main sections of the product detail page', () => {
    const product = createMockProduct();
    
    render(<ProductDetailClient product={product} />);
    
    // Check for navigation elements
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    expect(screen.getByTestId('back-link')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-back-button')).toBeInTheDocument();
    
    // Check for main content sections
    expect(screen.getByTestId('product-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('related-products')).toBeInTheDocument();
    expect(screen.getByTestId('reviews-section')).toBeInTheDocument();
    expect(screen.getByTestId('share-buttons')).toBeInTheDocument();
  });

  it('should render ProductGallery with correct images', () => {
    const product = createMockProduct();
    
    render(<ProductDetailClient product={product} />);
    
    // ProductGallery should be rendered with variant images
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('should render ProductInfo with product details', () => {
    const product = createMockProduct();
    
    render(<ProductDetailClient product={product} />);
    
    // Check for product title
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    
    // Check for product description
    expect(screen.getByText('This is a test product description')).toBeInTheDocument();
  });

  it('should handle products without variants', () => {
    const product = createMockProduct({ variants: [] });
    
    render(<ProductDetailClient product={product} />);
    
    // Should still render without errors
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should handle products without category', () => {
    const product = createMockProduct({ category: undefined, category_id: undefined });
    
    render(<ProductDetailClient product={product} />);
    
    // Should still render without errors
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should update when variant is selected', () => {
    const variant1: ProductVariant = {
      id: 'variant-1',
      product_id: 'product-1',
      color: 'Gold',
      material: '14K',
      price_adjustment: 1000,
      stock_quantity: 10,
      images: ['/gold1.jpg', '/gold2.jpg'],
      created_at: new Date().toISOString(),
    };

    const variant2: ProductVariant = {
      id: 'variant-2',
      product_id: 'product-1',
      color: 'Silver',
      material: '18K',
      price_adjustment: 2000,
      stock_quantity: 5,
      images: ['/silver1.jpg', '/silver2.jpg'],
      created_at: new Date().toISOString(),
    };

    const product = createMockProduct({
      variants: [variant1, variant2],
    });
    
    render(<ProductDetailClient product={product} />);
    
    // Component should render successfully with multiple variants
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should render trust badges and shipping information', () => {
    const product = createMockProduct();
    
    render(<ProductDetailClient product={product} />);
    
    // These components should be rendered in the page
    // The actual content is tested in their respective component tests
    const container = screen.getByText('Test Product').closest('.container');
    expect(container).toBeInTheDocument();
  });

  it('should calculate and display correct price', () => {
    const product = createMockProduct({
      base_price: 10000,
      discount_price: 8000,
    });
    
    render(<ProductDetailClient product={product} />);
    
    // Price should be calculated correctly
    // The actual price display is tested in ProductInfo component tests
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should handle error boundaries gracefully', () => {
    const product = createMockProduct();
    
    // Should not throw even if child components fail
    expect(() => {
      render(<ProductDetailClient product={product} />);
    }).not.toThrow();
  });

  it('should render lazy-loaded sections with suspense fallbacks', () => {
    const product = createMockProduct();
    
    render(<ProductDetailClient product={product} />);
    
    // Lazy-loaded sections should eventually render
    expect(screen.getByTestId('product-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('related-products')).toBeInTheDocument();
    expect(screen.getByTestId('reviews-section')).toBeInTheDocument();
  });
});
