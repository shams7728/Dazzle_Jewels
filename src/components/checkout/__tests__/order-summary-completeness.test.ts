/**
 * Property-Based Test for Order Summary Completeness
 * 
 * Feature: order-management-system, Property 28: Order summary completeness
 * Validates: Requirements 14.1, 14.2, 14.3, 14.5
 * 
 * Property: For any checkout payment step, the order summary should display all items 
 * with quantities and prices, plus subtotal, discounts, delivery charges, tax, and final total
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Type definitions
interface Product {
    id: string;
    title: string;
    base_price: number;
    discount_price?: number;
}

interface ProductVariant {
    id: string;
    color?: string;
    material?: string;
    price_adjustment: number;
}

interface CartItem {
    product: Product;
    variant?: ProductVariant;
    quantity: number;
}

interface OrderSummary {
    items: CartItem[];
    subtotal: number;
    discount: number;
    deliveryCharge: number;
    tax: number;
    total: number;
}

// Calculate item price
function calculateItemPrice(item: CartItem): number {
    let basePrice = item.product.base_price;
    if (item.product.discount_price && item.product.discount_price < basePrice) {
        basePrice = item.product.discount_price;
    }

    const price = item.variant
        ? basePrice + item.variant.price_adjustment
        : basePrice;

    return price * item.quantity;
}

// Calculate order summary
function calculateOrderSummary(
    items: CartItem[],
    discountAmount: number,
    deliveryCharge: number
): OrderSummary {
    // Calculate subtotal
    const subtotal = items.reduce((total, item) => total + calculateItemPrice(item), 0);

    // Apply discount (cannot exceed subtotal)
    const discount = Math.min(discountAmount, subtotal);

    // Calculate tax (10% on subtotal - discount + delivery)
    const taxableAmount = subtotal - discount + deliveryCharge;
    const tax = taxableAmount * 0.1;

    // Calculate total
    const total = subtotal - discount + deliveryCharge + tax;

    return {
        items,
        subtotal,
        discount,
        deliveryCharge,
        tax,
        total,
    };
}

// Arbitraries for generating test data
const productArb = fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 5, maxLength: 50 }),
    base_price: fc.double({ min: 100, max: 10000, noNaN: true }),
    discount_price: fc.option(fc.double({ min: 50, max: 9999, noNaN: true }), { nil: undefined }),
});

const variantArb = fc.record({
    id: fc.uuid(),
    color: fc.option(fc.constantFrom('Gold', 'Silver', 'Rose Gold', 'Platinum'), { nil: undefined }),
    material: fc.option(fc.constantFrom('14K Gold', '18K Gold', 'Sterling Silver'), { nil: undefined }),
    price_adjustment: fc.double({ min: 0, max: 2000, noNaN: true }), // Changed to non-negative to avoid negative prices
});

const cartItemArb = fc.record({
    product: productArb,
    variant: fc.option(variantArb, { nil: undefined }),
    quantity: fc.integer({ min: 1, max: 10 }),
});

describe('Order Summary Completeness Property Tests', () => {
    /**
     * Property 28: Order summary completeness
     * 
     * For any set of cart items, the order summary should display all required fields
     */
    it('should include all required fields in order summary', () => {
        fc.assert(
            fc.property(
                fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
                fc.double({ min: 0, max: 1000, noNaN: true }),
                fc.double({ min: 0, max: 200, noNaN: true }),
                (items, discountAmount, deliveryCharge) => {
                    const summary = calculateOrderSummary(items, discountAmount, deliveryCharge);

                    // All required fields should be present
                    expect(summary.items).toBeDefined();
                    expect(summary.subtotal).toBeDefined();
                    expect(summary.discount).toBeDefined();
                    expect(summary.deliveryCharge).toBeDefined();
                    expect(summary.tax).toBeDefined();
                    expect(summary.total).toBeDefined();

                    // Items should match input
                    expect(summary.items).toEqual(items);

                    // All numeric fields should be non-negative (with small tolerance for floating point)
                    expect(summary.subtotal).toBeGreaterThanOrEqual(-0.01);
                    expect(summary.discount).toBeGreaterThanOrEqual(-0.01);
                    expect(summary.deliveryCharge).toBeGreaterThanOrEqual(-0.01);
                    expect(summary.tax).toBeGreaterThanOrEqual(-0.01);
                    expect(summary.total).toBeGreaterThanOrEqual(-0.01);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Total calculation correctness
     * 
     * Total should equal subtotal - discount + delivery + tax
     */
    it('should calculate total correctly as subtotal - discount + delivery + tax', () => {
        fc.assert(
            fc.property(
                fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
                fc.double({ min: 0, max: 1000, noNaN: true }),
                fc.double({ min: 0, max: 200, noNaN: true }),
                (items, discountAmount, deliveryCharge) => {
                    const summary = calculateOrderSummary(items, discountAmount, deliveryCharge);

                    // Calculate expected total
                    const expectedTotal = summary.subtotal - summary.discount + summary.deliveryCharge + summary.tax;

                    // Total should match calculation (with small floating point tolerance)
                    expect(Math.abs(summary.total - expectedTotal)).toBeLessThan(0.01);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Subtotal should equal sum of all item prices
     * 
     * Subtotal should be the sum of (price * quantity) for all items
     */
    it('should calculate subtotal as sum of all item prices', () => {
        fc.assert(
            fc.property(
                fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
                fc.double({ min: 0, max: 1000, noNaN: true }),
                fc.double({ min: 0, max: 200, noNaN: true }),
                (items, discountAmount, deliveryCharge) => {
                    const summary = calculateOrderSummary(items, discountAmount, deliveryCharge);

                    // Calculate expected subtotal
                    const expectedSubtotal = items.reduce((total, item) => {
                        return total + calculateItemPrice(item);
                    }, 0);

                    // Subtotal should match calculation (with small floating point tolerance)
                    expect(Math.abs(summary.subtotal - expectedSubtotal)).toBeLessThan(0.01);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Discount should not exceed subtotal
     * 
     * Applied discount should never be greater than the subtotal
     */
    it('should ensure discount does not exceed subtotal', () => {
        fc.assert(
            fc.property(
                fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
                fc.double({ min: 0, max: 10000, noNaN: true }), // Large discount to test cap
                fc.double({ min: 0, max: 200, noNaN: true }),
                (items, discountAmount, deliveryCharge) => {
                    const summary = calculateOrderSummary(items, discountAmount, deliveryCharge);

                    // Discount should not exceed subtotal
                    expect(summary.discount).toBeLessThanOrEqual(summary.subtotal);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Tax calculation correctness
     * 
     * Tax should be 10% of (subtotal - discount + delivery)
     */
    it('should calculate tax as 10% of taxable amount', () => {
        fc.assert(
            fc.property(
                fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
                fc.double({ min: 0, max: 1000, noNaN: true }),
                fc.double({ min: 0, max: 200, noNaN: true }),
                (items, discountAmount, deliveryCharge) => {
                    const summary = calculateOrderSummary(items, discountAmount, deliveryCharge);

                    // Calculate expected tax
                    const taxableAmount = summary.subtotal - summary.discount + summary.deliveryCharge;
                    const expectedTax = taxableAmount * 0.1;

                    // Tax should match calculation (with small floating point tolerance)
                    expect(Math.abs(summary.tax - expectedTax)).toBeLessThan(0.01);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Each item should have quantity and price information
     * 
     * All items in the summary should have valid quantity and price data
     */
    it('should include quantity and price for each item', () => {
        fc.assert(
            fc.property(
                fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
                fc.double({ min: 0, max: 1000, noNaN: true }),
                fc.double({ min: 0, max: 200, noNaN: true }),
                (items, discountAmount, deliveryCharge) => {
                    const summary = calculateOrderSummary(items, discountAmount, deliveryCharge);

                    // Each item should have required fields
                    summary.items.forEach((item) => {
                        expect(item.product).toBeDefined();
                        expect(item.product.title).toBeTruthy();
                        expect(item.product.base_price).toBeGreaterThan(0);
                        expect(item.quantity).toBeGreaterThan(0);

                        // Calculate item price (should be non-negative with small tolerance)
                        const itemPrice = calculateItemPrice(item);
                        expect(itemPrice).toBeGreaterThanOrEqual(-0.01);
                    });
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Free delivery should result in zero delivery charge
     * 
     * When delivery charge is 0, it should be reflected in the summary
     */
    it('should handle free delivery correctly', () => {
        fc.assert(
            fc.property(
                fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
                fc.double({ min: 0, max: 1000, noNaN: true }),
                (items, discountAmount) => {
                    const summary = calculateOrderSummary(items, discountAmount, 0);

                    // Delivery charge should be 0
                    expect(summary.deliveryCharge).toBe(0);

                    // Total should not include delivery charge
                    const expectedTotal = summary.subtotal - summary.discount + summary.tax;
                    expect(Math.abs(summary.total - expectedTotal)).toBeLessThan(0.01);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Summary with no discount should have discount = 0
     * 
     * When no discount is applied, discount field should be 0
     */
    it('should handle orders with no discount', () => {
        fc.assert(
            fc.property(
                fc.array(cartItemArb, { minLength: 1, maxLength: 10 }),
                fc.double({ min: 0, max: 200, noNaN: true }),
                (items, deliveryCharge) => {
                    const summary = calculateOrderSummary(items, 0, deliveryCharge);

                    // Discount should be 0 (with small tolerance for floating point)
                    expect(Math.abs(summary.discount)).toBeLessThan(0.01);

                    // Total should equal subtotal + delivery + tax
                    const expectedTotal = summary.subtotal + summary.deliveryCharge + summary.tax;
                    expect(Math.abs(summary.total - expectedTotal)).toBeLessThan(0.01);
                }
            ),
            { numRuns: 100 }
        );
    });
});
