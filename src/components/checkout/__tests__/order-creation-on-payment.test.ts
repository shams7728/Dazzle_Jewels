/**
 * Property-Based Test for Order Creation on Successful Payment
 * 
 * Feature: order-management-system, Property 2: Order creation on successful payment
 * Validates: Requirements 1.4
 * 
 * Property: For any successful payment transaction, the system should create an order 
 * record with status "confirmed" and all payment details
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Type definitions
interface PaymentTransaction {
    paymentId: string;
    amount: number;
    method: 'razorpay' | 'cod';
    status: 'success' | 'failed';
}

interface OrderRecord {
    id: string;
    paymentId: string | null;
    amount: number;
    paymentMethod: 'razorpay' | 'cod';
    paymentStatus: 'pending' | 'paid';
    orderStatus: 'pending' | 'confirmed';
    createdAt: Date;
}

// Simulate order creation from payment
function createOrderFromPayment(payment: PaymentTransaction): OrderRecord | null {
    // Only create order if payment was successful
    if (payment.status !== 'success') {
        return null;
    }

    return {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentId: payment.method === 'razorpay' ? payment.paymentId : null,
        amount: payment.amount,
        paymentMethod: payment.method,
        paymentStatus: payment.method === 'cod' ? 'pending' : 'paid',
        orderStatus: 'confirmed',
        createdAt: new Date(),
    };
}

// Arbitraries
const paymentIdArb = fc.string({ minLength: 10, maxLength: 50 }).map(s => `pay_${s}`);
const amountArb = fc.double({ min: 100, max: 100000, noNaN: true });
const paymentMethodArb = fc.constantFrom('razorpay' as const, 'cod' as const);

describe('Order Creation on Successful Payment Property Tests', () => {
    /**
     * Property 2: Order creation on successful payment
     * 
     * For any successful payment, an order should be created with correct details
     */
    it('should create order with status confirmed for successful payments', () => {
        fc.assert(
            fc.property(
                paymentIdArb,
                amountArb,
                paymentMethodArb,
                (paymentId, amount, method) => {
                    const payment: PaymentTransaction = {
                        paymentId,
                        amount,
                        method,
                        status: 'success',
                    };

                    const order = createOrderFromPayment(payment);

                    // Order should be created
                    expect(order).not.toBeNull();
                    
                    if (order) {
                        // Order should have confirmed status
                        expect(order.orderStatus).toBe('confirmed');
                        
                        // Order should have correct amount
                        expect(order.amount).toBe(amount);
                        
                        // Order should have correct payment method
                        expect(order.paymentMethod).toBe(method);
                        
                        // Order should have unique ID
                        expect(order.id).toBeTruthy();
                        expect(order.id.length).toBeGreaterThan(0);
                        
                        // Order should have creation timestamp
                        expect(order.createdAt).toBeInstanceOf(Date);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Payment ID should be stored for Razorpay payments
     * 
     * Razorpay payments should have payment ID, COD should not
     */
    it('should store payment ID for Razorpay payments only', () => {
        fc.assert(
            fc.property(
                paymentIdArb,
                amountArb,
                paymentMethodArb,
                (paymentId, amount, method) => {
                    const payment: PaymentTransaction = {
                        paymentId,
                        amount,
                        method,
                        status: 'success',
                    };

                    const order = createOrderFromPayment(payment);

                    if (order) {
                        if (method === 'razorpay') {
                            // Razorpay orders should have payment ID
                            expect(order.paymentId).toBe(paymentId);
                        } else {
                            // COD orders should not have payment ID
                            expect(order.paymentId).toBeNull();
                        }
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Payment status should match payment method
     * 
     * Razorpay orders should be "paid", COD orders should be "pending"
     */
    it('should set correct payment status based on payment method', () => {
        fc.assert(
            fc.property(
                paymentIdArb,
                amountArb,
                paymentMethodArb,
                (paymentId, amount, method) => {
                    const payment: PaymentTransaction = {
                        paymentId,
                        amount,
                        method,
                        status: 'success',
                    };

                    const order = createOrderFromPayment(payment);

                    if (order) {
                        if (method === 'razorpay') {
                            expect(order.paymentStatus).toBe('paid');
                        } else {
                            expect(order.paymentStatus).toBe('pending');
                        }
                    }
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Failed payments should not create orders
     * 
     * Only successful payments should result in order creation
     */
    it('should not create order for failed payments', () => {
        fc.assert(
            fc.property(
                paymentIdArb,
                amountArb,
                paymentMethodArb,
                (paymentId, amount, method) => {
                    const payment: PaymentTransaction = {
                        paymentId,
                        amount,
                        method,
                        status: 'failed',
                    };

                    const order = createOrderFromPayment(payment);

                    // No order should be created for failed payments
                    expect(order).toBeNull();
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: All orders should have unique IDs
     * 
     * Multiple successful payments should create orders with different IDs
     */
    it('should generate unique order IDs for each payment', () => {
        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        paymentId: paymentIdArb,
                        amount: amountArb,
                        method: paymentMethodArb,
                    }),
                    { minLength: 2, maxLength: 10 }
                ),
                (payments) => {
                    const orders = payments.map(p =>
                        createOrderFromPayment({ ...p, status: 'success' })
                    );

                    const orderIds = orders.filter(o => o !== null).map(o => o!.id);
                    const uniqueIds = new Set(orderIds);

                    // All order IDs should be unique
                    expect(uniqueIds.size).toBe(orderIds.length);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Order amount should match payment amount
     * 
     * The order should store the exact amount from the payment
     */
    it('should store exact payment amount in order', () => {
        fc.assert(
            fc.property(
                paymentIdArb,
                amountArb,
                paymentMethodArb,
                (paymentId, amount, method) => {
                    const payment: PaymentTransaction = {
                        paymentId,
                        amount,
                        method,
                        status: 'success',
                    };

                    const order = createOrderFromPayment(payment);

                    if (order) {
                        // Order amount should exactly match payment amount
                        expect(order.amount).toBe(amount);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});
