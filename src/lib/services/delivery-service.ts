import { supabase } from '../supabase';
import type { DeliverySettings } from '@/types/order-management';

/**
 * DeliveryService - Handles delivery charge calculation
 * 
 * Features:
 * - Pincode validation
 * - Distance calculation from business location
 * - Zone-based delivery charge calculation
 * - Free shipping threshold logic
 */
export class DeliveryService {
  private cachedSettings: DeliverySettings | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Calculate delivery charges based on pincode
   */
  async calculateDeliveryCharge(
    pincode: string,
    orderSubtotal: number
  ): Promise<{ charge: number; isFreeShipping: boolean; zone: string }> {
    // Validate pincode format
    if (!this.isValidPincode(pincode)) {
      throw new Error('Invalid pincode format');
    }

    // Get delivery settings
    const settings = await this.getDeliverySettings();

    // Check free shipping threshold
    if (settings.free_shipping_enabled && orderSubtotal >= settings.free_shipping_threshold) {
      return {
        charge: 0,
        isFreeShipping: true,
        zone: 'free_shipping',
      };
    }

    // Calculate zone and charge
    const { zone, charge } = await this.calculateZoneCharge(pincode, settings);

    return {
      charge,
      isFreeShipping: false,
      zone,
    };
  }

  /**
   * Validate pincode format (Indian pincodes are 6 digits)
   */
  isValidPincode(pincode: string): boolean {
    return /^\d{6}$/.test(pincode);
  }

  /**
   * Calculate zone-based delivery charge
   */
  private async calculateZoneCharge(
    pincode: string,
    settings: DeliverySettings
  ): Promise<{ zone: string; charge: number }> {
    // Get pincode details (state, city, etc.)
    const pincodeDetails = await this.getPincodeDetails(pincode);

    // Determine zone based on location
    if (pincodeDetails.state === settings.business_state) {
      if (pincodeDetails.city === settings.business_city) {
        // Check if it's local (within 10km)
        const distance = this.calculateDistance(
          settings.business_latitude,
          settings.business_longitude,
          pincodeDetails.latitude,
          pincodeDetails.longitude
        );

        if (distance <= 10) {
          return { zone: 'local', charge: settings.local_delivery_charge };
        }

        return { zone: 'city', charge: settings.city_delivery_charge };
      }

      return { zone: 'state', charge: settings.state_delivery_charge };
    }

    return { zone: 'national', charge: settings.national_delivery_charge };
  }

  /**
   * Get pincode details (city, state, coordinates)
   * In production, this would call a pincode API service
   */
  private async getPincodeDetails(pincode: string): Promise<{
    city: string;
    state: string;
    latitude: number;
    longitude: number;
  }> {
    // For now, return mock data
    // In production, integrate with India Post API or similar service
    // Example: https://api.postalpincode.in/pincode/{pincode}
    
    // Mock implementation - returns Mumbai coordinates for all pincodes
    // This should be replaced with actual API integration
    return {
      city: 'Mumbai',
      state: 'Maharashtra',
      latitude: 19.0760,
      longitude: 72.8777,
    };
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get delivery settings with caching
   */
  async getDeliverySettings(): Promise<DeliverySettings> {
    const now = Date.now();

    // Return cached settings if still valid
    if (this.cachedSettings && now - this.cacheTimestamp < this.CACHE_TTL) {
      return this.cachedSettings;
    }

    // Fetch from database
    const { data: settings, error } = await supabase
      .from('delivery_settings')
      .select('*')
      .limit(1)
      .single();

    if (error || !settings) {
      throw new Error('Failed to fetch delivery settings');
    }

    // Update cache
    this.cachedSettings = settings;
    this.cacheTimestamp = now;

    return settings;
  }

  /**
   * Update delivery settings (admin only)
   */
  async updateDeliverySettings(
    updates: Partial<DeliverySettings>,
    updatedBy: string
  ): Promise<DeliverySettings> {
    const { data, error } = await supabase
      .from('delivery_settings')
      .update({
        ...updates,
        updated_by: updatedBy,
      })
      .eq('id', (await this.getDeliverySettings()).id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update delivery settings: ${error.message}`);
    }

    // Clear cache
    this.cachedSettings = null;

    return data;
  }

  /**
   * Clear settings cache (useful for testing)
   */
  clearCache(): void {
    this.cachedSettings = null;
    this.cacheTimestamp = 0;
  }
}

// Export singleton instance
export const deliveryService = new DeliveryService();
