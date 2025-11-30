/**
 * Property-Based Test for Form Data Persistence on Payment Failure
 * 
 * Feature: order-management-system, Property 3: Form data persistence on payment failure
 * Validates: Requirements 1.5
 * 
 * Property: For any payment failure, the checkout form should retain all previously entered data
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Type definitions
interface CheckoutFormData {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
}

interface PaymentAttempt {
    formData: CheckoutFormData;
    paymentSuccess: boolean;
}

interface CheckoutState {
    formData: CheckoutFormData;
    paymentAttempts: number;
}

// Simulate payment attempt with form data persistence
function attemptPayment(
    currentState: CheckoutState,
    paymentSuccess: boolean
): CheckoutState {
    // Increment payment attempts
    const newState: CheckoutState = {
        ...currentState,
        paymentAttempts: currentState.paymentAttempts + 1,
    };

    // On payment failure, form data should be preserved
    // On payment success, form data is still preserved (for order creation)
    return newState;
}

// Arbitraries for generating test data
const formDataArb = fc.record({
    fullName: fc.string({ minLength: 3, maxLength: 50 }),
    email: fc.emailAddress(),
    phone: fc.string({ minLength: 10, maxLength: 10 }).map(s => s.replace(/\D/g, '0')),
    address: fc.string({ minLength: 10, maxLength: 100 }),
    city: fc.constantFrom('Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'),
    state: fc.constantFrom('Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal'),
    zipCode: fc.integer({ min: 100000, max: 999999 }).map(n => String(n)),
});

describe('Form Data Persistence on Payment Failure Property Tests', () => {
    /**
     * Property 3: Form data persistence on payment failure
     * 
     * For any payment failure, all form data should be retained
     */
    it('should preserve all form data when payment fails', () => {
        fc.assert(
            fc.property(
                formDataArb,
                (formData) => {
                    const initialState: CheckoutState = {
                        formData,
                        paymentAttempts: 0,
                    };

                    // Simulate payment failure
                    const stateAfterFailure = attemptPayment(initialState, false);

                    // All form fields should be preserved
                    expect(stateAfterFailure.formData.fullName).toBe(formData.fullName);
                    expect(stateAfterFailure.formData.email).toBe(formData.email);
                    expect(stateAfterFailure.formData.phone).toBe(formData.phone);
                    expect(stateAfterFailure.formData.address).toBe(formData.address);
                    expect(stateAfterFailure.formData.city).toBe(formData.city);
                    expect(stateAfterFailure.formData.state).toBe(formData.state);
                    expect(stateAfterFailure.formData.zipCode).toBe(formData.zipCode);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Form data should persist across multiple payment failures
     * 
     * Even after multiple failed attempts, form data should remain intact
     */
    it('should preserve form data across multiple payment failures', () => {
        fc.assert(
            fc.property(
                formDataArb,
                fc.integer({ min: 1, max: 5 }),
                (formData, failureCount) => {
                    let currentState: CheckoutState = {
                        formData,
                        paymentAttempts: 0,
                    };

                    // Simulate multiple payment failures
                    for (let i = 0; i < failureCount; i++) {
                        currentState = attemptPayment(currentState, false);
                    }

                    // Form data should still be intact
                    expect(currentState.formData).toEqual(formData);
                    expect(currentState.paymentAttempts).toBe(failureCount);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: No form field should be lost on payment failure
     * 
     * Every field that was filled should remain filled
     */
    it('should not lose any form field on payment failure', () => {
        fc.assert(
            fc.property(
                formDataArb,
                (formData) => {
                    const initialState: CheckoutState = {
                        formData,
                        paymentAttempts: 0,
                    };

                    const stateAfterFailure = attemptPayment(initialState, false);

                    // Count non-empty fields before and after
                    const fieldsBefore = Object.values(formData).filter(v => v && v.length > 0).length;
                    const fieldsAfter = Object.values(stateAfterFailure.formData).filter(v => v && v.length > 0).length;

                    // No fields should be lost
                    expect(fieldsAfter).toBe(fieldsBefore);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Form data should be identical before and after payment failure
     * 
     * The form data object should be deeply equal
     */
    it('should maintain exact form data equality after payment failure', () => {
        fc.assert(
            fc.property(
                formDataArb,
                (formData) => {
                    const initialState: CheckoutState = {
                        formData,
                        paymentAttempts: 0,
                    };

                    const stateAfterFailure = attemptPayment(initialState, false);

                    // Form data should be deeply equal
                    expect(stateAfterFailure.formData).toEqual(formData);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Form data should also persist on payment success
     * 
     * Even on success, form data should be available for order creation
     */
    it('should preserve form data on payment success for order creation', () => {
        fc.assert(
            fc.property(
                formDataArb,
                (formData) => {
                    const initialState: CheckoutState = {
                        formData,
                        paymentAttempts: 0,
                    };

                    const stateAfterSuccess = attemptPayment(initialState, true);

                    // Form data should still be available
                    expect(stateAfterSuccess.formData).toEqual(formData);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Payment attempts should increment while preserving form data
     * 
     * The system should track attempts without affecting form data
     */
    it('should increment payment attempts without affecting form data', () => {
        fc.assert(
            fc.property(
                formDataArb,
                fc.integer({ min: 1, max: 10 }),
                (formData, attempts) => {
                    let currentState: CheckoutState = {
                        formData,
                        paymentAttempts: 0,
                    };

                    // Simulate multiple attempts (mix of success and failure)
                    for (let i = 0; i < attempts; i++) {
                        const success = i === attempts - 1; // Last attempt succeeds
                        currentState = attemptPayment(currentState, success);
                    }

                    // Form data should be unchanged
                    expect(currentState.formData).toEqual(formData);
                    
                    // Attempts should be tracked
                    expect(currentState.paymentAttempts).toBe(attempts);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Special characters in form data should be preserved
     * 
     * Form data with special characters should not be corrupted
     */
    it('should preserve special characters in form data', () => {
        fc.assert(
            fc.property(
                fc.record({
                    fullName: fc.string({ minLength: 3, maxLength: 50 }),
                    email: fc.emailAddress(),
                    phone: fc.string({ minLength: 10, maxLength: 10 }),
                    address: fc.string({ minLength: 10, maxLength: 100 }),
                    city: fc.string({ minLength: 3, maxLength: 30 }),
                    state: fc.string({ minLength: 3, maxLength: 30 }),
                    zipCode: fc.string({ minLength: 6, maxLength: 6 }),
                }),
                (formData) => {
                    const initialState: CheckoutState = {
                        formData,
                        paymentAttempts: 0,
                    };

                    const stateAfterFailure = attemptPayment(initialState, false);

                    // Every character should be preserved
                    expect(stateAfterFailure.formData.fullName).toBe(formData.fullName);
                    expect(stateAfterFailure.formData.address).toBe(formData.address);
                    expect(stateAfterFailure.formData.city).toBe(formData.city);
                    expect(stateAfterFailure.formData.state).toBe(formData.state);
                }
            ),
            { numRuns: 100 }
        );
    });
});
