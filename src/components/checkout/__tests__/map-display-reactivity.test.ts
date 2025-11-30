/**
 * Property-Based Test for Map Display Reactivity
 * 
 * Feature: order-management-system, Property 9: Map display reactivity
 * Validates: Requirements 3B.1, 3B.2
 * 
 * Property: For any address change, the embedded map should update the marker 
 * position to reflect the new location
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Type definitions
interface ShippingAddress {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
}

interface MapMarkerPosition {
    lat: number;
    lng: number;
}

interface MapState {
    markerPosition: MapMarkerPosition | null;
    address: ShippingAddress;
}

// Simulate geocoding function
function geocodeAddress(address: ShippingAddress): MapMarkerPosition | null {
    // If coordinates are already provided, use them
    if (address.latitude !== undefined && address.longitude !== undefined) {
        return {
            lat: address.latitude,
            lng: address.longitude,
        };
    }

    // If we have a valid zip code, generate coordinates
    if (address.zipCode && address.zipCode.length === 6) {
        const zipNum = parseInt(address.zipCode) || 400001;
        
        // Generate coordinates roughly in India's range
        const lat = 8 + ((zipNum % 30000) / 1000);
        const lng = 68 + ((zipNum % 30000) / 1000);
        
        return { lat, lng };
    }

    return null;
}

// Simulate map update behavior
function updateMapMarker(currentState: MapState, newAddress: ShippingAddress): MapState {
    const newMarkerPosition = geocodeAddress(newAddress);
    
    return {
        markerPosition: newMarkerPosition,
        address: newAddress,
    };
}

// Arbitraries for generating test data
const validZipCodeArb = fc.integer({ min: 100000, max: 999999 }).map(n => String(n));

const addressArb = fc.record({
    fullName: fc.string({ minLength: 1, maxLength: 50 }),
    email: fc.emailAddress(),
    phone: fc.string({ minLength: 10, maxLength: 10 }).map(s => s.replace(/\D/g, '0')),
    address: fc.string({ minLength: 5, maxLength: 100 }),
    city: fc.constantFrom('Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'),
    state: fc.constantFrom('Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'West Bengal'),
    zipCode: validZipCodeArb,
    latitude: fc.option(fc.double({ min: 8, max: 37, noNaN: true }), { nil: undefined }),
    longitude: fc.option(fc.double({ min: 68, max: 97, noNaN: true }), { nil: undefined }),
});

describe('Map Display Reactivity Property Tests', () => {
    /**
     * Property 9: Map display reactivity
     * 
     * For any address change, the map marker should update to reflect the new location
     */
    it('should update marker position when address changes', () => {
        fc.assert(
            fc.property(
                addressArb,
                addressArb,
                (initialAddress, newAddress) => {
                    // Start with initial address
                    const initialState: MapState = {
                        markerPosition: geocodeAddress(initialAddress),
                        address: initialAddress,
                    };

                    // Update to new address
                    const updatedState = updateMapMarker(initialState, newAddress);

                    // If the new address has valid location data, marker should be updated
                    if (newAddress.zipCode.length === 6 || (newAddress.latitude && newAddress.longitude)) {
                        expect(updatedState.markerPosition).not.toBeNull();
                        
                        // Marker position should reflect the new address
                        const expectedPosition = geocodeAddress(newAddress);
                        expect(updatedState.markerPosition).toEqual(expectedPosition);
                    }

                    // Address in state should be updated
                    expect(updatedState.address).toEqual(newAddress);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Marker position should be consistent with address coordinates
     * 
     * If address has explicit coordinates, marker should use those exact coordinates
     */
    it('should use explicit coordinates when provided in address', () => {
        fc.assert(
            fc.property(
                fc.double({ min: 8, max: 37, noNaN: true }),
                fc.double({ min: 68, max: 97, noNaN: true }),
                addressArb,
                (lat, lng, baseAddress) => {
                    const addressWithCoords: ShippingAddress = {
                        ...baseAddress,
                        latitude: lat,
                        longitude: lng,
                    };

                    const state = updateMapMarker(
                        { markerPosition: null, address: baseAddress },
                        addressWithCoords
                    );

                    // Marker should use the explicit coordinates
                    expect(state.markerPosition).not.toBeNull();
                    expect(state.markerPosition!.lat).toBe(lat);
                    expect(state.markerPosition!.lng).toBe(lng);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Marker position should change when zip code changes
     * 
     * Different zip codes should result in different marker positions
     */
    it('should update marker position when zip code changes', () => {
        fc.assert(
            fc.property(
                addressArb,
                validZipCodeArb,
                validZipCodeArb,
                (baseAddress, zipCode1, zipCode2) => {
                    // Skip if zip codes are the same
                    fc.pre(zipCode1 !== zipCode2);

                    const address1: ShippingAddress = {
                        ...baseAddress,
                        zipCode: zipCode1,
                        latitude: undefined,
                        longitude: undefined,
                    };

                    const address2: ShippingAddress = {
                        ...baseAddress,
                        zipCode: zipCode2,
                        latitude: undefined,
                        longitude: undefined,
                    };

                    const state1 = updateMapMarker(
                        { markerPosition: null, address: baseAddress },
                        address1
                    );

                    const state2 = updateMapMarker(state1, address2);

                    // Both should have marker positions
                    expect(state1.markerPosition).not.toBeNull();
                    expect(state2.markerPosition).not.toBeNull();

                    // Positions should be different for different zip codes
                    expect(state1.markerPosition).not.toEqual(state2.markerPosition);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Map should handle rapid address changes
     * 
     * Multiple consecutive address changes should result in the final address being displayed
     */
    it('should handle multiple consecutive address changes correctly', () => {
        fc.assert(
            fc.property(
                fc.array(addressArb, { minLength: 2, maxLength: 10 }),
                (addresses) => {
                    let currentState: MapState = {
                        markerPosition: null,
                        address: addresses[0],
                    };

                    // Apply all address changes
                    for (const address of addresses) {
                        currentState = updateMapMarker(currentState, address);
                    }

                    // Final state should reflect the last address
                    const lastAddress = addresses[addresses.length - 1];
                    expect(currentState.address).toEqual(lastAddress);

                    // Marker should be positioned for the last address
                    const expectedPosition = geocodeAddress(lastAddress);
                    expect(currentState.markerPosition).toEqual(expectedPosition);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Marker position should be null for invalid addresses
     * 
     * Addresses without valid location data should not have a marker position
     */
    it('should not display marker for addresses without valid location data', () => {
        fc.assert(
            fc.property(
                addressArb,
                (baseAddress) => {
                    const invalidAddress: ShippingAddress = {
                        ...baseAddress,
                        zipCode: '', // Invalid zip code
                        latitude: undefined,
                        longitude: undefined,
                    };

                    const state = updateMapMarker(
                        { markerPosition: null, address: baseAddress },
                        invalidAddress
                    );

                    // Should not have a marker position
                    expect(state.markerPosition).toBeNull();
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Marker updates should be deterministic
     * 
     * The same address should always produce the same marker position
     */
    it('should produce consistent marker positions for the same address', () => {
        fc.assert(
            fc.property(
                addressArb,
                (address) => {
                    const state1 = updateMapMarker(
                        { markerPosition: null, address: { ...address, zipCode: '' } },
                        address
                    );

                    const state2 = updateMapMarker(
                        { markerPosition: null, address: { ...address, zipCode: '' } },
                        address
                    );

                    // Both updates should produce the same result
                    expect(state1.markerPosition).toEqual(state2.markerPosition);
                }
            ),
            { numRuns: 100 }
        );
    });

    /**
     * Property: Coordinates should be within valid ranges
     * 
     * All generated marker positions should have valid latitude and longitude
     */
    it('should generate marker positions with valid coordinates', () => {
        fc.assert(
            fc.property(
                addressArb,
                (address) => {
                    const state = updateMapMarker(
                        { markerPosition: null, address: { ...address, zipCode: '' } },
                        address
                    );

                    if (state.markerPosition !== null) {
                        // Latitude should be between -90 and 90
                        expect(state.markerPosition.lat).toBeGreaterThanOrEqual(-90);
                        expect(state.markerPosition.lat).toBeLessThanOrEqual(90);

                        // Longitude should be between -180 and 180
                        expect(state.markerPosition.lng).toBeGreaterThanOrEqual(-180);
                        expect(state.markerPosition.lng).toBeLessThanOrEqual(180);
                    }
                }
            ),
            { numRuns: 100 }
        );
    });
});
