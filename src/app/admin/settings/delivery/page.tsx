"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, MapPin, DollarSign, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { DeliverySettings } from "@/types/order-management";

export default function DeliverySettingsPage() {
  const [settings, setSettings] = useState<DeliverySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [businessPincode, setBusinessPincode] = useState('');
  const [businessCity, setBusinessCity] = useState('');
  const [businessState, setBusinessState] = useState('');
  const [businessLatitude, setBusinessLatitude] = useState('');
  const [businessLongitude, setBusinessLongitude] = useState('');
  const [localDeliveryCharge, setLocalDeliveryCharge] = useState('');
  const [cityDeliveryCharge, setCityDeliveryCharge] = useState('');
  const [stateDeliveryCharge, setStateDeliveryCharge] = useState('');
  const [nationalDeliveryCharge, setNationalDeliveryCharge] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('');
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('delivery_settings')
        .select('*')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (data) {
        setSettings(data);
        populateForm(data);
      }
    } catch (err: any) {
      console.error('Error fetching delivery settings:', err);
      setError('Failed to load delivery settings');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data: DeliverySettings) => {
    setBusinessPincode(data.business_pincode);
    setBusinessCity(data.business_city);
    setBusinessState(data.business_state);
    setBusinessLatitude(data.business_latitude.toString());
    setBusinessLongitude(data.business_longitude.toString());
    setLocalDeliveryCharge(data.local_delivery_charge.toString());
    setCityDeliveryCharge(data.city_delivery_charge.toString());
    setStateDeliveryCharge(data.state_delivery_charge.toString());
    setNationalDeliveryCharge(data.national_delivery_charge.toString());
    setFreeShippingThreshold(data.free_shipping_threshold.toString());
    setFreeShippingEnabled(data.free_shipping_enabled);
  };

  const validateForm = (): boolean => {
    if (!businessPincode || !businessCity || !businessState) {
      setError('Business location fields are required');
      return false;
    }

    if (!businessLatitude || !businessLongitude) {
      setError('Business coordinates are required');
      return false;
    }

    const lat = parseFloat(businessLatitude);
    const lng = parseFloat(businessLongitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Invalid coordinates');
      return false;
    }

    const charges = [localDeliveryCharge, cityDeliveryCharge, stateDeliveryCharge, nationalDeliveryCharge];
    for (const charge of charges) {
      const value = parseFloat(charge);
      if (isNaN(value) || value < 0) {
        setError('Delivery charges must be valid positive numbers');
        return false;
      }
    }

    const threshold = parseFloat(freeShippingThreshold);
    if (isNaN(threshold) || threshold < 0) {
      setError('Free shipping threshold must be a valid positive number');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Get current user ID (in a real app, this would come from auth context)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || 'admin';

      const settingsData: Partial<DeliverySettings> = {
        business_pincode: businessPincode,
        business_city: businessCity,
        business_state: businessState,
        business_latitude: parseFloat(businessLatitude),
        business_longitude: parseFloat(businessLongitude),
        local_delivery_charge: parseFloat(localDeliveryCharge),
        city_delivery_charge: parseFloat(cityDeliveryCharge),
        state_delivery_charge: parseFloat(stateDeliveryCharge),
        national_delivery_charge: parseFloat(nationalDeliveryCharge),
        free_shipping_threshold: parseFloat(freeShippingThreshold),
        free_shipping_enabled: freeShippingEnabled,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      };

      let result;
      if (settings) {
        // Update existing settings
        result = await supabase
          .from('delivery_settings')
          .update(settingsData)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Insert new settings
        result = await supabase
          .from('delivery_settings')
          .insert(settingsData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      setSettings(result.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving delivery settings:', err);
      setError(err.message || 'Failed to save delivery settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Delivery Settings</h1>
        <p className="text-neutral-400">Configure delivery charges and business location</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-4 text-red-500">
          <X className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-4 text-green-500">
          <Check className="h-5 w-5" />
          Settings saved successfully!
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Business Location */}
        <div className="rounded-xl border border-neutral-800 bg-black p-6">
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-white">Business Location</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-300">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={businessPincode}
                onChange={(e) => setBusinessPincode(e.target.value)}
                placeholder="400001"
                className="mt-1 w-full rounded-lg bg-neutral-900 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-300">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={businessCity}
                onChange={(e) => setBusinessCity(e.target.value)}
                placeholder="Mumbai"
                className="mt-1 w-full rounded-lg bg-neutral-900 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-300">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={businessState}
                onChange={(e) => setBusinessState(e.target.value)}
                placeholder="Maharashtra"
                className="mt-1 w-full rounded-lg bg-neutral-900 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Latitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={businessLatitude}
                  onChange={(e) => setBusinessLatitude(e.target.value)}
                  placeholder="19.0760"
                  className="mt-1 w-full rounded-lg bg-neutral-900 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Longitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  value={businessLongitude}
                  onChange={(e) => setBusinessLongitude(e.target.value)}
                  placeholder="72.8777"
                  className="mt-1 w-full rounded-lg bg-neutral-900 px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Charges */}
        <div className="rounded-xl border border-neutral-800 bg-black p-6">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold text-white">Delivery Charges by Zone</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-neutral-300">
                Local (Within 10km) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={localDeliveryCharge}
                  onChange={(e) => setLocalDeliveryCharge(e.target.value)}
                  placeholder="50"
                  className="w-full rounded-lg bg-neutral-900 py-2 pl-8 pr-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-300">
                City (Within City) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cityDeliveryCharge}
                  onChange={(e) => setCityDeliveryCharge(e.target.value)}
                  placeholder="100"
                  className="w-full rounded-lg bg-neutral-900 py-2 pl-8 pr-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-300">
                State (Within State) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={stateDeliveryCharge}
                  onChange={(e) => setStateDeliveryCharge(e.target.value)}
                  placeholder="150"
                  className="w-full rounded-lg bg-neutral-900 py-2 pl-8 pr-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-300">
                National (Other States) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={nationalDeliveryCharge}
                  onChange={(e) => setNationalDeliveryCharge(e.target.value)}
                  placeholder="200"
                  className="w-full rounded-lg bg-neutral-900 py-2 pl-8 pr-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Free Shipping */}
      <div className="rounded-xl border border-neutral-800 bg-black p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Free Shipping</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="freeShippingEnabled"
              checked={freeShippingEnabled}
              onChange={(e) => setFreeShippingEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-yellow-500 focus:ring-2 focus:ring-yellow-500"
            />
            <label htmlFor="freeShippingEnabled" className="text-sm font-medium text-neutral-300">
              Enable free shipping
            </label>
          </div>
          {freeShippingEnabled && (
            <div>
              <label className="text-sm font-medium text-neutral-300">
                Free Shipping Threshold <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  placeholder="1000"
                  className="w-full rounded-lg bg-neutral-900 py-2 pl-8 pr-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Orders above this amount will have free delivery
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-yellow-500 text-black hover:bg-yellow-400"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
