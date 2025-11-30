import { describe, it, expect, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { supabase } from '../../supabase';
import type { DeliverySettings } from '@/types/order-management';

/**
 * Property Test: Delivery settings persistence and application
 * Feature: order-management-system, Property 10: Delivery settings persistence and application
 * Validates: Requirements 3C.2, 3C.4, 3C.5
 * 
 * This test verifies that:
 * 1. Delivery settings updates are persisted correctly
 * 2. New values are immediately available for retrieval
 * 3. All fields are stored and retrieved accurately
 * 4. Free shipping threshold changes are applied correctly
 */

describe('Delivery Settings Persistence - Property Test', () => {
  let createdSettingsIds: string[] = [];

  afterEach(async () => {
    // Clean up created settings
    if (createdSettingsIds.length > 0) {
      await supabase.from('delivery_settings').delete().in('id', createdSettingsIds);
      createdSettingsIds = [];
    }
  });

  it('should persist delivery settings with all fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          businessPincode: fc.string({ minLength: 6, maxLength: 6 }).map(s => s.replace(/[^0-9]/g, '0')),
          businessCity: fc.constantFrom('Mumbai', 'Delhi', 'Bangalore', 'Chennai'),
          businessState: fc.constantFrom('Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu'),
          businessLatitude: fc.double({ min: -90, max: 90 }),
          businessLongitude: fc.double({ min: -180, max: 180 }),
          localDeliveryCharge: fc.integer({ min: 0, max: 200 }),
          cityDeliveryCharge: fc.integer({ min: 0, max: 300 }),
          stateDeliveryCharge: fc.integer({ min: 0, max: 500 }),
          nationalDeliveryCharge: fc.integer({ min: 0, max: 1000 }),
          freeShippingThreshold: fc.integer({ min: 0, max: 10000 }),
          freeShippingEnabled: fc.boolean(),
          updatedBy: fc.uuid(),
        }),
        async (spec) => {
          // Skip test if database is not available
          try {
            await supabase.from('delivery_settings').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create delivery settings
          const settingsData: Partial<DeliverySettings> = {
            business_pincode: spec.businessPincode,
            business_city: spec.businessCity,
            business_state: spec.businessState,
            business_latitude: spec.businessLatitude,
            business_longitude: spec.businessLongitude,
            local_delivery_charge: spec.localDeliveryCharge,
            city_delivery_charge: spec.cityDeliveryCharge,
            state_delivery_charge: spec.stateDeliveryCharge,
            national_delivery_charge: spec.nationalDeliveryCharge,
            free_shipping_threshold: spec.freeShippingThreshold,
            free_shipping_enabled: spec.freeShippingEnabled,
            updated_at: new Date().toISOString(),
            updated_by: spec.updatedBy,
          };

          const { data: created, error: createError } = await supabase
            .from('delivery_settings')
            .insert(settingsData)
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          createdSettingsIds.push(created.id);

          // Property 1: All fields should be persisted correctly
          expect(created.business_pincode).toBe(spec.businessPincode);
          expect(created.business_city).toBe(spec.businessCity);
          expect(created.business_state).toBe(spec.businessState);
          expect(created.business_latitude).toBeCloseTo(spec.businessLatitude, 5);
          expect(created.business_longitude).toBeCloseTo(spec.businessLongitude, 5);
          expect(created.local_delivery_charge).toBe(spec.localDeliveryCharge);
          expect(created.city_delivery_charge).toBe(spec.cityDeliveryCharge);
          expect(created.state_delivery_charge).toBe(spec.stateDeliveryCharge);
          expect(created.national_delivery_charge).toBe(spec.nationalDeliveryCharge);
          expect(created.free_shipping_threshold).toBe(spec.freeShippingThreshold);
          expect(created.free_shipping_enabled).toBe(spec.freeShippingEnabled);
          expect(created.updated_by).toBe(spec.updatedBy);

          // Property 2: Settings should be immediately retrievable
          const { data: fetched, error: fetchError } = await supabase
            .from('delivery_settings')
            .select('*')
            .eq('id', created.id)
            .single();

          if (fetchError) {
            throw fetchError;
          }

          expect(fetched).toBeDefined();
          expect(fetched.business_pincode).toBe(spec.businessPincode);
          expect(fetched.free_shipping_threshold).toBe(spec.freeShippingThreshold);
        }
      ),
      { numRuns: 10, timeout: 30000 }
    );
  }, 35000);

  it('should update existing delivery settings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          initialPincode: fc.string({ minLength: 6, maxLength: 6 }).map(s => s.replace(/[^0-9]/g, '0')),
          updatedPincode: fc.string({ minLength: 6, maxLength: 6 }).map(s => s.replace(/[^0-9]/g, '1')),
          initialThreshold: fc.integer({ min: 500, max: 2000 }),
          updatedThreshold: fc.integer({ min: 2001, max: 5000 }),
          initialEnabled: fc.boolean(),
          updatedEnabled: fc.boolean(),
          businessCity: fc.constantFrom('Mumbai', 'Delhi'),
          businessState: fc.constantFrom('Maharashtra', 'Delhi'),
          latitude: fc.double({ min: 10, max: 30 }),
          longitude: fc.double({ min: 70, max: 90 }),
          localCharge: fc.integer({ min: 50, max: 100 }),
          cityCharge: fc.integer({ min: 100, max: 200 }),
          stateCharge: fc.integer({ min: 150, max: 300 }),
          nationalCharge: fc.integer({ min: 200, max: 500 }),
          adminId: fc.uuid(),
        }),
        async (spec) => {
          // Skip test if database is not available
          try {
            await supabase.from('delivery_settings').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create initial settings
          const initialData: Partial<DeliverySettings> = {
            business_pincode: spec.initialPincode,
            business_city: spec.businessCity,
            business_state: spec.businessState,
            business_latitude: spec.latitude,
            business_longitude: spec.longitude,
            local_delivery_charge: spec.localCharge,
            city_delivery_charge: spec.cityCharge,
            state_delivery_charge: spec.stateCharge,
            national_delivery_charge: spec.nationalCharge,
            free_shipping_threshold: spec.initialThreshold,
            free_shipping_enabled: spec.initialEnabled,
            updated_at: new Date().toISOString(),
            updated_by: spec.adminId,
          };

          const { data: created, error: createError } = await supabase
            .from('delivery_settings')
            .insert(initialData)
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          createdSettingsIds.push(created.id);

          // Update settings
          const updateData: Partial<DeliverySettings> = {
            business_pincode: spec.updatedPincode,
            free_shipping_threshold: spec.updatedThreshold,
            free_shipping_enabled: spec.updatedEnabled,
            updated_at: new Date().toISOString(),
          };

          const { data: updated, error: updateError } = await supabase
            .from('delivery_settings')
            .update(updateData)
            .eq('id', created.id)
            .select()
            .single();

          if (updateError) {
            throw updateError;
          }

          // Property 1: Updated fields should reflect new values
          expect(updated.business_pincode).toBe(spec.updatedPincode);
          expect(updated.free_shipping_threshold).toBe(spec.updatedThreshold);
          expect(updated.free_shipping_enabled).toBe(spec.updatedEnabled);

          // Property 2: Unchanged fields should remain the same
          expect(updated.business_city).toBe(spec.businessCity);
          expect(updated.business_state).toBe(spec.businessState);
          expect(updated.local_delivery_charge).toBe(spec.localCharge);

          // Property 3: Updated timestamp should be more recent
          expect(new Date(updated.updated_at).getTime()).toBeGreaterThanOrEqual(
            new Date(created.updated_at).getTime()
          );
        }
      ),
      { numRuns: 10, timeout: 30000 }
    );
  }, 35000);

  it('should handle free shipping threshold changes correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          threshold1: fc.integer({ min: 0, max: 1000 }),
          threshold2: fc.integer({ min: 1001, max: 5000 }),
          threshold3: fc.integer({ min: 5001, max: 10000 }),
          businessPincode: fc.string({ minLength: 6, maxLength: 6 }).map(s => s.replace(/[^0-9]/g, '0')),
          businessCity: fc.constantFrom('Mumbai', 'Delhi'),
          businessState: fc.constantFrom('Maharashtra', 'Delhi'),
          latitude: fc.double({ min: 10, max: 30 }),
          longitude: fc.double({ min: 70, max: 90 }),
          localCharge: fc.integer({ min: 50, max: 100 }),
          cityCharge: fc.integer({ min: 100, max: 200 }),
          stateCharge: fc.integer({ min: 150, max: 300 }),
          nationalCharge: fc.integer({ min: 200, max: 500 }),
          adminId: fc.uuid(),
        }),
        async (spec) => {
          // Skip test if database is not available
          try {
            await supabase.from('delivery_settings').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create settings with first threshold
          const initialData: Partial<DeliverySettings> = {
            business_pincode: spec.businessPincode,
            business_city: spec.businessCity,
            business_state: spec.businessState,
            business_latitude: spec.latitude,
            business_longitude: spec.longitude,
            local_delivery_charge: spec.localCharge,
            city_delivery_charge: spec.cityCharge,
            state_delivery_charge: spec.stateCharge,
            national_delivery_charge: spec.nationalCharge,
            free_shipping_threshold: spec.threshold1,
            free_shipping_enabled: true,
            updated_at: new Date().toISOString(),
            updated_by: spec.adminId,
          };

          const { data: created, error: createError } = await supabase
            .from('delivery_settings')
            .insert(initialData)
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          createdSettingsIds.push(created.id);

          // Property 1: Initial threshold should be set correctly
          expect(created.free_shipping_threshold).toBe(spec.threshold1);

          // Update to second threshold
          const { data: updated1, error: update1Error } = await supabase
            .from('delivery_settings')
            .update({ free_shipping_threshold: spec.threshold2 })
            .eq('id', created.id)
            .select()
            .single();

          if (update1Error) {
            throw update1Error;
          }

          // Property 2: Threshold should update correctly
          expect(updated1.free_shipping_threshold).toBe(spec.threshold2);

          // Update to third threshold
          const { data: updated2, error: update2Error } = await supabase
            .from('delivery_settings')
            .update({ free_shipping_threshold: spec.threshold3 })
            .eq('id', created.id)
            .select()
            .single();

          if (update2Error) {
            throw update2Error;
          }

          // Property 3: Threshold should update again correctly
          expect(updated2.free_shipping_threshold).toBe(spec.threshold3);

          // Property 4: Final fetch should return the latest threshold
          const { data: final, error: finalError } = await supabase
            .from('delivery_settings')
            .select('*')
            .eq('id', created.id)
            .single();

          if (finalError) {
            throw finalError;
          }

          expect(final.free_shipping_threshold).toBe(spec.threshold3);
        }
      ),
      { numRuns: 10, timeout: 30000 }
    );
  }, 35000);

  it('should handle disabling free shipping', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          threshold: fc.integer({ min: 500, max: 5000 }),
          businessPincode: fc.string({ minLength: 6, maxLength: 6 }).map(s => s.replace(/[^0-9]/g, '0')),
          businessCity: fc.constantFrom('Mumbai', 'Delhi'),
          businessState: fc.constantFrom('Maharashtra', 'Delhi'),
          latitude: fc.double({ min: 10, max: 30 }),
          longitude: fc.double({ min: 70, max: 90 }),
          localCharge: fc.integer({ min: 50, max: 100 }),
          cityCharge: fc.integer({ min: 100, max: 200 }),
          stateCharge: fc.integer({ min: 150, max: 300 }),
          nationalCharge: fc.integer({ min: 200, max: 500 }),
          adminId: fc.uuid(),
        }),
        async (spec) => {
          // Skip test if database is not available
          try {
            await supabase.from('delivery_settings').select('id').limit(1);
          } catch (error) {
            console.log('Skipping test - database not available');
            return;
          }

          // Create settings with free shipping enabled
          const initialData: Partial<DeliverySettings> = {
            business_pincode: spec.businessPincode,
            business_city: spec.businessCity,
            business_state: spec.businessState,
            business_latitude: spec.latitude,
            business_longitude: spec.longitude,
            local_delivery_charge: spec.localCharge,
            city_delivery_charge: spec.cityCharge,
            state_delivery_charge: spec.stateCharge,
            national_delivery_charge: spec.nationalCharge,
            free_shipping_threshold: spec.threshold,
            free_shipping_enabled: true,
            updated_at: new Date().toISOString(),
            updated_by: spec.adminId,
          };

          const { data: created, error: createError } = await supabase
            .from('delivery_settings')
            .insert(initialData)
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          createdSettingsIds.push(created.id);

          // Property 1: Free shipping should be enabled initially
          expect(created.free_shipping_enabled).toBe(true);

          // Disable free shipping
          const { data: updated, error: updateError } = await supabase
            .from('delivery_settings')
            .update({ free_shipping_enabled: false })
            .eq('id', created.id)
            .select()
            .single();

          if (updateError) {
            throw updateError;
          }

          // Property 2: Free shipping should be disabled after update
          expect(updated.free_shipping_enabled).toBe(false);

          // Property 3: Threshold should remain unchanged
          expect(updated.free_shipping_threshold).toBe(spec.threshold);

          // Re-enable free shipping
          const { data: reEnabled, error: reEnableError } = await supabase
            .from('delivery_settings')
            .update({ free_shipping_enabled: true })
            .eq('id', created.id)
            .select()
            .single();

          if (reEnableError) {
            throw reEnableError;
          }

          // Property 4: Free shipping should be enabled again
          expect(reEnabled.free_shipping_enabled).toBe(true);
        }
      ),
      { numRuns: 10, timeout: 30000 }
    );
  }, 35000);
});
