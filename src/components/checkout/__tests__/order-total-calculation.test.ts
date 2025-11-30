/**
 * Property-Based Test for Order Total Calculation
 * 
 * Feature: order-management-system, Property 4 (extended): Order total calculation
 * Validates: Total = subtotal - discount + delivery + tax
 * 
 * Property: For any order, the total should equal subtotal - discount + delivery + tax
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Type definitions
interface OrderCalculation {
    subtotal: number;
    discount: number;
    deliveryCharge: number;
    tax: number;
    total: number;
}

// Calculate order total
function calculateOrderTotal(
    subtotal: number,
    discount: number,
    deliveryCharge: number,
    taxRate: number = 0.1
): OrderCalculation {
    // Ensure discount doesn't exceed subtotal
    const actualDiscount = Math.min(discount, subtotal);
    
    // Calculate taxable amount
    const taxableAmount = subtotal - actualDiscount + deliveryCharge;
    
    // Calculate tax
    const tax = taxableAmount * taxRate;
    
    // Calculate total
    const total = subtotal - actualDiscount + deliveryCharge + tax;
    
    return {
        subtotal,
        discount: actualDiscount,
        deliveryCharge,
        tax,
        total,
    };
}

describe('Order Total Calculation Property Tests', () => {
    /**
     * Property 4 (extended): Order total calculation
     * 
     * For any order values, total should equal subtotal - discount + delivery + tax
     */
    it('should calculate total as subtotal - discount + delivery + tax', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0, max: 100000, noNaN: true }), // subtotal
                fc.double({ min: 0, max: 10000, noNaN: true }),  // discount
                fc.double({ min: 0, max: 500, noNaN: true }),    // delivery
                (subtotal, discount, deliveryCharge) => {
                    const result = calculateOrderTotal(subtotal, discount, deliveryCharge);
                    
                    // Calculate expected total
                    const expectedTotal = result.subtotal - result.discount + result.deliveryCharge + result.tax;
                    
                    // Total should match the formula (with small floating point tolerance)
                    expect(Math.abs(result.total - expectedTotal)).toBeLessThan(0.01);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Total should never be negative
     * 
     * Even with discounts, the total should always be non-negative
     */
    it('should never produce a negative total', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0, max: 100000, noNaN: true }),
                fc.double({ min: 0, max: 10000, noNaN: true }),
                fc.double({ min: 0, max: 500, noNaN: true }),
                (subtotal, discount, deliveryCharge) => {
                    const result = calculateOrderTotal(subtotal, discount, deliveryCharge);
                    
                    // Total should be non-negative (with small tolerance for floating point)
                    expect(result.total).toBeGreaterThanOrEqual(-0.01);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Discount should not exceed subtotal
     * 
     * Applied discount should be capped at subtotal amount
     */
    it('should cap discount at subtotal amount', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0, max: 100000, noNaN: true }),
                fc.double({ min: 0, max: 200000, noNaN: true }), // Potentially larger than subtotal
                fc.double({ min: 0, max: 500, noNaN: true }),
                (subtotal, discount, deliveryCharge) => {
                    const result = calculateOrderTotal(subtotal, discount, deliveryCharge);
                    
                    // Applied discount should not exceed subtotal
                    expect(result.discount).toBeLessThanOrEqual(result.subtotal + 0.01);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Tax should be calculated on taxable amount
     * 
     * Tax should be 10% of (subtotal - discount + delivery)
     */
    it('should calculate tax on taxable amount (subtotal - discount + delivery)', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0, max: 100000, noNaN: true }),
                fc.double({ min: 0, max: 10000, noNaN: true }),
                fc.double({ min: 0, max: 500, noNaN: true }),
                (subtotal, discount, deliveryCharge) => {
                    const result = calculateOrderTotal(subtotal, discount, deliveryCharge);
                    
                    // Calculate expected tax
                    const taxableAmount = result.subtotal - result.discount + result.deliveryCharge;
                    const expectedTax = taxableAmount * 0.1;
                    
                    // Tax should match calculation (with small floating point tolerance)
                    expect(Math.abs(result.tax - expectedTax)).toBeLessThan(0.01);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Zero discount should result in total = subtotal + delivery + tax
     * 
     * When no discount is applied, total should be subtotal + delivery + tax
     */
    it('should calculate correctly with zero discount', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0, max: 100000, noNaN: true }),
                fc.double({ min: 0, max: 500, noNaN: true }),
                (subtotal, deliveryCharge) => {
                    const result = calculateOrderTotal(subtotal, 0, deliveryCharge);
                    
                    // Discount should be 0
                    expect(Math.abs(result.discount)).toBeLessThan(0.01);
                    
                    // Total should equal subtotal + delivery + tax
                    const expectedTotal = result.subtotal + result.deliveryCharge + result.tax;
                    expect(Math.abs(result.total - expectedTotal)).toBeLessThan(0.01);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Free delivery should not include delivery charge in total
     * 
     * When delivery is free, total should be subtotal - discount + tax
     */
    it('should calculate correctly with free delivery', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0, max: 100000, noNaN: true }),
                fc.double({ min: 0, max: 10000, noNaN: true }),
                (subtotal, discount) => {
                    const result = calculateOrderTotal(subtotal, discount, 0);
                    
                    // Delivery charge should be 0
                    expect(result.deliveryCharge).toBe(0);
                    
                    // Total should equal subtotal - discount + tax
                    const expectedTotal = result.subtotal - result.discount + result.tax;
                    expect(Math.abs(result.total - expectedTotal)).toBeLessThan(0.01);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Adding delivery charge should increase total
     * 
     * For the same subtotal and discount, adding delivery should increase total
     */
    it('should increase total when delivery charge is added', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 100, max: 100000, noNaN: true }),
                fc.double({ min: 0, max: 1000, noNaN: true }),
                fc.double({ min: 1, max: 500, noNaN: true }), // Non-zero delivery
                (subtotal, discount, deliveryCharge) => {
                    const withoutDelivery = calculateOrderTotal(subtotal, discount, 0);
                    const withDelivery = calculateOrderTotal(subtotal, discount, deliveryCharge);
                    
                    // Total with delivery should be greater
                    expect(withDelivery.total).toBeGreaterThan(withoutDelivery.total);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Adding discount should decrease total
     * 
     * For the same subtotal and delivery, adding discount should decrease total
     */
    it('should decrease total when discount is added', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 100, max: 100000, noNaN: true }),
                fc.double({ min: 1, max: 1000, noNaN: true }), // Non-zero discount
                fc.double({ min: 0, max: 500, noNaN: true }),
                (subtotal, discount, deliveryCharge) => {
                    const withoutDiscount = calculateOrderTotal(subtotal, 0, deliveryCharge);
                    const withDiscount = calculateOrderTotal(subtotal, discount, deliveryCharge);
                    
                    // Total with discount should be less (or equal if discount was capped)
                    expect(withDiscount.total).toBeLessThanOrEqual(withoutDiscount.total + 0.01);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Calculation should be deterministic
     * 
     * Same inputs should always produce same outputs
     */
    it('should produce consistent results for same inputs', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0, max: 100000, noNaN: true }),
                fc.double({ min: 0, max: 10000, noNaN: true }),
                fc.double({ min: 0, max: 500, noNaN: true }),
                (subtotal, discount, deliveryCharge) => {
                    const result1 = calculateOrderTotal(subtotal, discount, deliveryCharge);
                    const result2 = calculateOrderTotal(subtotal, discount, deliveryCharge);
                    
                    // Both calculations should produce identical results
                    expect(Math.abs(result1.total - result2.total)).toBeLessThan(0.01);
                    expect(Math.abs(result1.tax - result2.tax)).toBeLessThan(0.01);
                    expect(Math.abs(result1.discount - result2.discount)).toBeLessThan(0.01);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: All components should be non-negative
     * 
     * Subtotal, discount, delivery, tax, and total should all be non-negative
     */
    it('should ensure all components are non-negative', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 0, max: 100000, noNaN: true }),
                fc.double({ min: 0, max: 10000, noNaN: true }),
                fc.double({ min: 0, max: 500, noNaN: true }),
                (subtotal, discount, deliveryCharge) => {
                    const result = calculateOrderTotal(subtotal, discount, deliveryCharge);
                    
                    // All components should be non-negative (with small tolerance)
                    expect(result.subtotal).toBeGreaterThanOrEqual(-0.01);
                    expect(result.discount).toBeGreaterThanOrEqual(-0.01);
                    expect(result.deliveryCharge).toBeGreaterThanOrEqual(-0.01);
                    expect(result.tax).toBeGreaterThanOrEqual(-0.01);
                    expect(result.total).toBeGreaterThanOrEqual(-0.01);
                }
            ),
            { numRuns: 100 }
        );
    });
});
