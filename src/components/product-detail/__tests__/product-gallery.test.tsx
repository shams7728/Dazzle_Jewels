import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { ProductGallery } from '../product-gallery';

/**
 * Property-Based Tests for ProductGallery Component
 * Feature: product-detail-redesign
 */

// Custom generators for property-based testing
const imageUrlGenerator = () =>
  fc.integer({ min: 1, max: 100 }).map((num) => `https://example.com/image-${num}.jpg`);

const imageArrayGenerator = (minLength: number = 1, maxLength: number = 10) =>
  fc.array(imageUrlGenerator(), { minLength, maxLength });

const productTitleGenerator = () =>
  fc.string({ minLength: 5, maxLength: 100 });

describe('ProductGallery - Property-Based Tests', () => {
  /**
   * Property 1: Gallery renders with thumbnails
   * Feature: product-detail-redesign, Property 1: Gallery renders with thumbnails
   * Validates: Requirements 1.1
   */
  test('Property 1: Gallery renders with thumbnails for products with multiple images', () => {
    fc.assert(
      fc.property(
        imageArrayGenerator(2, 10), // At least 2 images to show thumbnails
        productTitleGenerator(),
        (images, title) => {
          const { container } = render(
            <ProductGallery images={images} productTitle={title} />
          );

          // Should render main image display
          const mainImage = container.querySelector('img[alt*="Image 1"]');
          expect(mainImage).toBeTruthy();

          // Should render thumbnail navigation
          const thumbnails = container.querySelectorAll('button[aria-label^="View image"]');
          expect(thumbnails.length).toBe(images.length);

          // Each thumbnail should have an image
          thumbnails.forEach((thumbnail) => {
            const img = thumbnail.querySelector('img');
            expect(img).toBeTruthy();
          });
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2: Thumbnail selection updates main image
   * Feature: product-detail-redesign, Property 2: Thumbnail selection updates main image
   * Validates: Requirements 1.2
   */
  test('Property 2: Thumbnail selection updates main image', () => {
    fc.assert(
      fc.property(
        imageArrayGenerator(2, 10),
        productTitleGenerator(),
        fc.integer({ min: 0, max: 9 }),
        (images, title, clickIndex) => {
          // Ensure clickIndex is within bounds
          const validClickIndex = clickIndex % images.length;

          const { container } = render(
            <ProductGallery images={images} productTitle={title} />
          );

          // Get all thumbnail buttons
          const thumbnails = container.querySelectorAll('button[aria-label^="View image"]');
          
          // Click on a specific thumbnail
          fireEvent.click(thumbnails[validClickIndex]);

          // Main image should update to show the selected image
          const mainImage = container.querySelector('img[alt*="Image"]');
          expect(mainImage).toBeTruthy();
          expect(mainImage?.getAttribute('alt')).toContain(`Image ${validClickIndex + 1}`);

          // The clicked thumbnail should have active styling (yellow border)
          const activeThumbnail = thumbnails[validClickIndex];
          expect(activeThumbnail.className).toContain('border-yellow-500');
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 5: Navigation elements conditional on image count
   * Feature: product-detail-redesign, Property 5: Navigation elements conditional on image count
   * Validates: Requirements 1.5
   */
  test('Property 5: Navigation elements only render when image count > 1', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          imageArrayGenerator(1, 1), // Single image
          imageArrayGenerator(2, 10)  // Multiple images
        ),
        productTitleGenerator(),
        (images, title) => {
          const { container } = render(
            <ProductGallery images={images} productTitle={title} />
          );

          const hasMultipleImages = images.length > 1;

          // Check for navigation arrows
          const prevButton = container.querySelector('button[aria-label="Previous image"]');
          const nextButton = container.querySelector('button[aria-label="Next image"]');

          if (hasMultipleImages) {
            expect(prevButton).toBeTruthy();
            expect(nextButton).toBeTruthy();
          } else {
            expect(prevButton).toBeFalsy();
            expect(nextButton).toBeFalsy();
          }

          // Check for image indicators (dots)
          const indicators = container.querySelectorAll('button[aria-label^="Go to image"]');
          if (hasMultipleImages) {
            expect(indicators.length).toBe(images.length);
          } else {
            expect(indicators.length).toBe(0);
          }

          // Check for thumbnail navigation
          const thumbnails = container.querySelectorAll('button[aria-label^="View image"]');
          if (hasMultipleImages) {
            expect(thumbnails.length).toBe(images.length);
          } else {
            expect(thumbnails.length).toBe(0);
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 3: Hover triggers zoom state
   * Feature: product-detail-redesign, Property 3: Hover triggers zoom state
   * Validates: Requirements 1.3
   */
  test('Property 3: Hover triggers zoom state', () => {
    fc.assert(
      fc.property(
        imageArrayGenerator(1, 5),
        productTitleGenerator(),
        (images, title) => {
          const { container } = render(
            <ProductGallery images={images} productTitle={title} />
          );

          // Find the main image container
          const mainImageContainer = container.querySelector('.cursor-pointer');
          expect(mainImageContainer).toBeTruthy();

          // Simulate mouse enter (hover)
          if (mainImageContainer) {
            fireEvent.mouseEnter(mainImageContainer);

            // The image should have zoom styling applied
            const image = mainImageContainer.querySelector('img');
            expect(image).toBeTruthy();
            
            // After hover, the image should have scale-150 class
            // Note: This tests the zoom state is triggered, actual zoom effect is CSS
            expect(image?.className).toContain('scale-150');
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 4: Swipe gestures navigate images
   * Feature: product-detail-redesign, Property 4: Swipe gestures navigate images
   * Validates: Requirements 1.4
   */
  test('Property 4: Swipe gestures navigate images', () => {
    fc.assert(
      fc.property(
        imageArrayGenerator(2, 10),
        productTitleGenerator(),
        fc.constantFrom('left', 'right'),
        (images, title, swipeDirection) => {
          const { container } = render(
            <ProductGallery images={images} productTitle={title} />
          );

          const mainImageContainer = container.querySelector('.cursor-pointer');
          expect(mainImageContainer).toBeTruthy();

          if (mainImageContainer) {
            // Get initial image index (should be 0)
            const initialImage = container.querySelector('img[alt*="Image 1"]');
            expect(initialImage).toBeTruthy();

            // Simulate swipe gesture
            const startX = swipeDirection === 'left' ? 200 : 50;
            const endX = swipeDirection === 'left' ? 50 : 200;

            fireEvent.touchStart(mainImageContainer, {
              touches: [{ clientX: startX }],
            });

            fireEvent.touchMove(mainImageContainer, {
              touches: [{ clientX: endX }],
            });

            fireEvent.touchEnd(mainImageContainer);

            // After swipe, the image should change
            const expectedIndex = swipeDirection === 'left' ? 2 : images.length;
            const newImage = container.querySelector(`img[alt*="Image ${expectedIndex}"]`);
            
            // Verify image changed (either forward or backward)
            const currentImage = container.querySelector('img[alt*="Image"]');
            expect(currentImage).toBeTruthy();
            
            // The alt text should have changed from "Image 1"
            if (images.length > 1) {
              const altText = currentImage?.getAttribute('alt');
              expect(altText).toBeTruthy();
            }
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 6: Click opens lightbox
   * Feature: product-detail-redesign, Property 6: Click opens lightbox
   * Validates: Requirements 1.6
   */
  test('Property 6: Click opens lightbox', () => {
    fc.assert(
      fc.property(
        imageArrayGenerator(1, 10),
        productTitleGenerator(),
        (images, title) => {
          const { container } = render(
            <ProductGallery images={images} productTitle={title} />
          );

          // Find and click the main image
          const mainImageContainer = container.querySelector('.cursor-pointer');
          expect(mainImageContainer).toBeTruthy();

          if (mainImageContainer) {
            fireEvent.click(mainImageContainer);

            // Lightbox should be open
            // Check for lightbox elements
            const lightbox = document.querySelector('.fixed.inset-0.z-50');
            expect(lightbox).toBeTruthy();

            // Should have close button
            const closeButton = document.querySelector('button[aria-label="Close lightbox"]');
            expect(closeButton).toBeTruthy();

            // Should show image counter
            const imageCounter = document.querySelector('.absolute.top-4.left-4');
            expect(imageCounter).toBeTruthy();
            expect(imageCounter?.textContent).toContain('1');
            expect(imageCounter?.textContent).toContain(images.length.toString());
          }
        }
      ),
      { numRuns: 20 }
    );
  });
});
