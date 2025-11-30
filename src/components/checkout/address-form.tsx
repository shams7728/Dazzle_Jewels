"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin } from "lucide-react";
import { MapDisplay } from "./map-display";
import { cache, CacheKeys, CacheTTL } from "@/lib/utils/cache";

export interface ShippingAddress {
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

interface AddressFormProps {
    onAddressChange: (address: ShippingAddress) => void;
    initialAddress?: Partial<ShippingAddress>;
    onDeliveryChargeCalculated?: (charge: number) => void;
    orderSubtotal?: number;
}

export function AddressForm({
    onAddressChange,
    initialAddress = {},
    onDeliveryChargeCalculated,
    orderSubtotal = 0,
}: AddressFormProps) {
    const [formData, setFormData] = useState<ShippingAddress>({
        fullName: initialAddress.fullName || "",
        email: initialAddress.email || "",
        phone: initialAddress.phone || "",
        address: initialAddress.address || "",
        city: initialAddress.city || "",
        state: initialAddress.state || "",
        zipCode: initialAddress.zipCode || "",
        latitude: initialAddress.latitude,
        longitude: initialAddress.longitude,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});
    const [locatingGPS, setLocatingGPS] = useState(false);
    const [gpsError, setGpsError] = useState("");
    const [deliveryError, setDeliveryError] = useState("");
    const [mapError, setMapError] = useState("");

    const validateField = (name: keyof ShippingAddress, value: string): string => {
        switch (name) {
            case "email":
                if (!value) return "Email is required";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
                return "";
            case "phone":
                if (!value) return "Phone is required";
                if (!/^\d{10}$/.test(value.replace(/\D/g, ""))) return "Phone must be 10 digits";
                return "";
            case "zipCode":
                if (!value) return "Zip code is required";
                if (!/^\d{6}$/.test(value)) return "Invalid zip code format. Must be 6 digits.";
                // Additional validation for Indian pin codes
                const firstDigit = parseInt(value.charAt(0));
                if (firstDigit < 1 || firstDigit > 9) {
                    return "Invalid Indian pin code. First digit must be between 1-9.";
                }
                return "";
            case "fullName":
            case "address":
            case "city":
            case "state":
                if (!value.trim()) return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
                return "";
            default:
                return "";
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof ShippingAddress;
        
        const updated = { ...formData, [fieldName]: value };
        setFormData(updated);
        onAddressChange(updated);

        // Clear error for this field
        setErrors((prev) => ({ ...prev, [fieldName]: "" }));

        // Trigger delivery charge calculation when zipCode changes
        if (fieldName === "zipCode" && value.length === 6 && onDeliveryChargeCalculated) {
            calculateDeliveryCharge(value);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const fieldName = name as keyof ShippingAddress;
        const error = validateField(fieldName, value);
        
        if (error) {
            setErrors((prev) => ({ ...prev, [fieldName]: error }));
        }
    };

    const calculateDeliveryCharge = async (zipCode: string) => {
        // Clear previous delivery errors
        setDeliveryError("");
        
        try {
            // Validate zip code format first
            if (!/^\d{6}$/.test(zipCode)) {
                setDeliveryError("Please enter a valid 6-digit pin code to calculate delivery charges.");
                return;
            }

            // Call delivery calculation API with order subtotal for free shipping check
            const response = await fetch(`/api/checkout/calculate-delivery?pincode=${zipCode}&orderSubtotal=${orderSubtotal}`);
            
            if (!response.ok) {
                if (response.status === 400) {
                    const data = await response.json();
                    setDeliveryError(
                        data.error || "Invalid pin code. Please check and try again."
                    );
                    if (onDeliveryChargeCalculated) {
                        onDeliveryChargeCalculated(0);
                    }
                    return;
                }
                
                // For other errors, the API should return standard charge
                // If it doesn't, we'll handle it in the catch block
                throw new Error("Failed to calculate delivery charges");
            }

            const data = await response.json();
            
            if (onDeliveryChargeCalculated) {
                onDeliveryChargeCalculated(data.deliveryCharge || 0);
            }
            
            // Show info message if standard charge was used
            if (data.isStandardCharge) {
                setDeliveryError(
                    `Standard delivery charge of ₹${data.deliveryCharge} applied. Exact charges will be confirmed before order processing.`
                );
            } else if (data.isFreeShipping) {
                setDeliveryError("");
                // Could show a success message here if desired
            } else {
                setDeliveryError("");
            }
        } catch (error) {
            console.error("Error calculating delivery charge:", error);
            setDeliveryError(
                "Unable to calculate delivery charges at the moment. Standard delivery charges will be applied. You can proceed with checkout."
            );
            
            // Don't block checkout - set to 0 and let them proceed
            if (onDeliveryChargeCalculated) {
                onDeliveryChargeCalculated(0);
            }
        }
    };

    const handleLocateMe = async () => {
        setLocatingGPS(true);
        setGpsError("");

        if (!navigator.geolocation) {
            setGpsError(
                "Geolocation is not supported by your browser. Please enter your address manually below."
            );
            setLocatingGPS(false);
            return;
        }

        // Set a timeout for geolocation request
        const timeoutId = setTimeout(() => {
            setGpsError(
                "Location request is taking too long. Please enter your address manually or try again."
            );
            setLocatingGPS(false);
        }, 10000); // 10 second timeout

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                clearTimeout(timeoutId);
                const { latitude, longitude } = position.coords;

                try {
                    // Check cache first
                    const cacheKey = CacheKeys.geocode(latitude, longitude);
                    let data = cache.get<any>(cacheKey);
                    
                    if (!data) {
                        // Reverse geocode to get address
                        const response = await fetch(
                            `/api/checkout/geocode?lat=${latitude}&lng=${longitude}`,
                            { signal: AbortSignal.timeout(5000) } // 5 second timeout for API call
                        );

                        if (!response.ok) {
                            if (response.status === 404 || response.status === 503) {
                                throw new Error("Geocoding service temporarily unavailable");
                            }
                            throw new Error("Failed to get address from location");
                        }

                        data = await response.json();
                        
                        // Cache the geocoding result
                        cache.set(cacheKey, data, CacheTTL.geocode);
                    }

                    // Auto-fill address fields
                    const updatedAddress: ShippingAddress = {
                        ...formData,
                        address: data.address || formData.address,
                        city: data.city || formData.city,
                        state: data.state || formData.state,
                        zipCode: data.zipCode || formData.zipCode,
                        latitude,
                        longitude,
                    };

                    setFormData(updatedAddress);
                    onAddressChange(updatedAddress);

                    // Show success message
                    setGpsError("");

                    // Trigger delivery charge calculation if zipCode is available
                    if (data.zipCode && onDeliveryChargeCalculated) {
                        calculateDeliveryCharge(data.zipCode);
                    }
                } catch (error) {
                    console.error("Geocoding error:", error);
                    
                    // Still save coordinates even if reverse geocoding fails
                    const updatedAddress: ShippingAddress = {
                        ...formData,
                        latitude,
                        longitude,
                    };
                    setFormData(updatedAddress);
                    onAddressChange(updatedAddress);
                    
                    // Provide helpful fallback message
                    setGpsError(
                        "✓ Location captured, but we couldn't automatically fill your address. Please enter it manually below. Your location will still be used for delivery."
                    );
                }

                setLocatingGPS(false);
            },
            (error) => {
                clearTimeout(timeoutId);
                let errorMessage = "Failed to get your location. ";
                let suggestion = "";
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location permission denied. ";
                        suggestion = "Please enable location access in your browser settings, or enter your address manually below.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location information is unavailable. ";
                        suggestion = "This might be due to poor GPS signal. Please try again or enter your address manually.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timed out. ";
                        suggestion = "Please check your device's location settings and try again, or enter your address manually.";
                        break;
                    default:
                        suggestion = "Please enter your address manually below.";
                }
                
                setGpsError(errorMessage + suggestion);
                setLocatingGPS(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const isFormValid = () => {
        return (
            formData.fullName &&
            formData.email &&
            formData.phone &&
            formData.address &&
            formData.city &&
            formData.state &&
            formData.zipCode &&
            Object.values(errors).every((error) => !error)
        );
    };

    return (
        <div className="space-y-6">
            {/* Quick Location Helper */}
            <div className="rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900/80 to-neutral-900/50 p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-white mb-1">Quick Fill with GPS</p>
                        <p className="text-xs text-neutral-400">Auto-populate address fields using your current location</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleLocateMe}
                        disabled={locatingGPS}
                        className="min-h-[44px] shrink-0"
                    >
                        {locatingGPS ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Locating...
                            </>
                        ) : (
                            <>
                                <MapPin className="mr-2 h-4 w-4" />
                                Locate Me
                            </>
                        )}
                    </Button>
                </div>
                
                {gpsError && (
                    <div className={`mt-3 rounded-md border p-2.5 text-xs ${
                        gpsError.startsWith("✓") 
                            ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                            : "border-red-500/30 bg-red-500/10 text-red-400"
                    }`}>
                        {gpsError}
                    </div>
                )}
            </div>

            {/* Delivery Calculation Message */}
            {deliveryError && (
                <div className={`rounded-lg border p-3 text-sm ${
                    deliveryError.includes("Standard delivery charge") || deliveryError.includes("will be confirmed")
                        ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                        : deliveryError.includes("Invalid") || deliveryError.includes("Please")
                        ? "border-red-500/20 bg-red-500/10 text-red-400"
                        : "border-orange-500/20 bg-orange-500/10 text-orange-400"
                }`}>
                    <p className="font-medium">
                        {deliveryError.includes("Standard delivery charge") || deliveryError.includes("will be confirmed")
                            ? "ℹ️ Delivery Information"
                            : deliveryError.includes("Invalid") || deliveryError.includes("Please")
                            ? "❌ Validation Error"
                            : "⚠️ Delivery Notice"}
                    </p>
                    <p className="mt-1 text-xs opacity-90">{deliveryError}</p>
                </div>
            )}

            {/* Primary Address Section */}
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-black">
                        1
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Enter Delivery Address</h3>
                        <p className="text-xs text-neutral-400">This address will be used for delivery</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white">
                        Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={errors.fullName ? "border-red-500" : ""}
                        aria-invalid={!!errors.fullName}
                        aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    />
                    {errors.fullName && (
                        <p id="fullName-error" className="text-xs text-red-500">
                            {errors.fullName}
                        </p>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">
                            Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={errors.email ? "border-red-500" : ""}
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? "email-error" : undefined}
                        />
                        {errors.email && (
                            <p id="email-error" className="text-xs text-red-500">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white">
                            Phone <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={errors.phone ? "border-red-500" : ""}
                            aria-invalid={!!errors.phone}
                            aria-describedby={errors.phone ? "phone-error" : undefined}
                        />
                        {errors.phone && (
                            <p id="phone-error" className="text-xs text-red-500">
                                {errors.phone}
                            </p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address" className="text-white">
                        Street Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={errors.address ? "border-red-500" : ""}
                        aria-invalid={!!errors.address}
                        aria-describedby={errors.address ? "address-error" : undefined}
                    />
                    {errors.address && (
                        <p id="address-error" className="text-xs text-red-500">
                            {errors.address}
                        </p>
                    )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="city" className="text-white">
                            City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={errors.city ? "border-red-500" : ""}
                            aria-invalid={!!errors.city}
                            aria-describedby={errors.city ? "city-error" : undefined}
                        />
                        {errors.city && (
                            <p id="city-error" className="text-xs text-red-500">
                                {errors.city}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state" className="text-white">
                            State <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className={errors.state ? "border-red-500" : ""}
                            aria-invalid={!!errors.state}
                            aria-describedby={errors.state ? "state-error" : undefined}
                        />
                        {errors.state && (
                            <p id="state-error" className="text-xs text-red-500">
                                {errors.state}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="zipCode" className="text-white">
                            Zip Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            maxLength={6}
                            className={errors.zipCode ? "border-red-500" : ""}
                            aria-invalid={!!errors.zipCode}
                            aria-describedby={errors.zipCode ? "zipCode-error" : undefined}
                        />
                        {errors.zipCode && (
                            <p id="zipCode-error" className="text-xs text-red-500">
                                {errors.zipCode}
                            </p>
                        )}
                    </div>
                </div>
                </div>

                {/* Form Validation Status */}
                <div className="mt-3 flex items-center gap-2 text-xs">
                    {isFormValid() ? (
                        <>
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
                                <svg className="h-3 w-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-green-500 font-medium">Address verified - Ready to proceed</span>
                        </>
                    ) : (
                        <>
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-700">
                                <span className="text-neutral-400 text-xs">!</span>
                            </div>
                            <span className="text-neutral-400">Please complete all required fields above</span>
                        </>
                    )}
                </div>
            </div>

            {/* Map Visualization Section */}
            {(formData.zipCode.length === 6 || (formData.latitude && formData.longitude)) && (
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                                2
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Visual Confirmation</h3>
                                <p className="text-xs text-neutral-400">Verify your location on the map (optional)</p>
                            </div>
                        </div>
                        <div className="rounded-md bg-blue-500/10 px-2 py-1 text-xs text-blue-400 border border-blue-500/20">
                            For reference only
                        </div>
                    </div>
                    
                    <div className="rounded-lg border border-neutral-700/50 bg-neutral-900/50 p-3 mb-3">
                        <div className="flex items-start gap-2 text-xs text-neutral-300">
                            <svg className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p className="font-medium text-white mb-1">About the map</p>
                                <p className="text-neutral-400">
                                    The map shows an approximate location based on your address. 
                                    Your delivery will be made to the exact address you entered above. 
                                    You can adjust the pin if needed, but the written address takes priority.
                                </p>
                            </div>
                        </div>
                    </div>

                    <MapDisplay
                        address={formData}
                        onLocationAdjust={(lat, lng) => {
                            const updated = { ...formData, latitude: lat, longitude: lng };
                            setFormData(updated);
                            onAddressChange(updated);
                        }}
                        interactive={true}
                    />
                </div>
            )}
        </div>
    );
}
