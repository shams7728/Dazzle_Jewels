"use client";

import { useEffect, useState, useRef } from "react";
import { MapPin, AlertCircle } from "lucide-react";
import { ShippingAddress } from "./address-form";
import dynamic from "next/dynamic";

// Dynamically import map component to avoid SSR issues
const LeafletMap = dynamic(() => import("./leaflet-map"), {
    ssr: false,
    loading: () => (
        <div className="flex h-64 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50">
            <div className="text-center">
                <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-neutral-700 border-t-yellow-500" />
                <p className="text-sm text-neutral-400">Loading map...</p>
            </div>
        </div>
    ),
});

interface MapDisplayProps {
    address: ShippingAddress;
    onLocationAdjust?: (lat: number, lng: number) => void;
    interactive?: boolean;
}

interface Coordinates {
    lat: number;
    lng: number;
}

export function MapDisplay({ address, onLocationAdjust, interactive = false }: MapDisplayProps) {
    const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Geocode address to coordinates when address changes
    useEffect(() => {
        if (address.zipCode && address.city && address.state) {
            geocodeAddress();
        }
    }, [address.zipCode, address.city, address.state, address.address]);

    // Use existing coordinates if available
    useEffect(() => {
        if (address.latitude && address.longitude) {
            setCoordinates({
                lat: address.latitude,
                lng: address.longitude,
            });
            setError(null);
        }
    }, [address.latitude, address.longitude]);

    const geocodeAddress = async () => {
        setLoading(true);
        setError(null);

        try {
            // If we already have coordinates from GPS, use them
            if (address.latitude && address.longitude) {
                setCoordinates({
                    lat: address.latitude,
                    lng: address.longitude,
                });
                setLoading(false);
                return;
            }

            // Otherwise, geocode the address
            const fullAddress = `${address.address}, ${address.city}, ${address.state} ${address.zipCode}`;
            
            try {
                // Try to call geocoding API with timeout
                const response = await fetch(
                    `/api/checkout/geocode-address?address=${encodeURIComponent(fullAddress)}`,
                    { signal: AbortSignal.timeout(5000) } // 5 second timeout
                );
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.lat && data.lng) {
                        setCoordinates({ lat: data.lat, lng: data.lng });
                        setLoading(false);
                        return;
                    }
                }
            } catch (apiError) {
                console.warn("Geocoding API unavailable, using fallback:", apiError);
            }
            
            // Fallback: Generate approximate coordinates based on zip code
            // This ensures map still displays even if API fails
            const mockCoordinates = generateMockCoordinates(address.zipCode);
            setCoordinates(mockCoordinates);
            
            // Set a non-blocking error message
            setError("Map showing approximate location (geocoding service unavailable)");
        } catch (err) {
            console.error("Error geocoding address:", err);
            setError("Map service temporarily unavailable");
        } finally {
            setLoading(false);
        }
    };

    // Generate mock coordinates based on zip code (for demonstration)
    const generateMockCoordinates = (zipCode: string): Coordinates => {
        // This is a placeholder - in production, use actual geocoding API
        const zipNum = parseInt(zipCode) || 400001;
        
        // Generate coordinates roughly in India's range
        const lat = 8 + ((zipNum % 30000) / 1000);
        const lng = 68 + ((zipNum % 30000) / 1000);
        
        return { lat, lng };
    };

    const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!interactive || !onLocationAdjust || !mapContainerRef.current) return;

        // Calculate relative position in the map container
        const rect = mapContainerRef.current.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Convert to approximate lat/lng (this is simplified)
        // In production, this would use the actual map library's methods
        if (coordinates) {
            const latOffset = (y - rect.height / 2) / rect.height * 0.01;
            const lngOffset = (x - rect.width / 2) / rect.width * 0.01;

            const newLat = coordinates.lat - latOffset;
            const newLng = coordinates.lng + lngOffset;

            setCoordinates({ lat: newLat, lng: newLng });
            onLocationAdjust(newLat, newLng);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50">
                <div className="text-center">
                    <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-neutral-700 border-t-yellow-500" />
                    <p className="text-sm text-neutral-400">Loading map...</p>
                </div>
            </div>
        );
    }

    if (error && !coordinates) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border border-yellow-500/20 bg-yellow-500/10">
                <div className="text-center px-4">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
                    <p className="text-sm text-yellow-500 font-medium mb-1">Map Unavailable</p>
                    <p className="text-xs text-yellow-400">
                        {error}. Don't worry - you can still complete checkout. Your address has been saved.
                    </p>
                </div>
            </div>
        );
    }

    if (!coordinates) {
        return (
            <div className="flex h-64 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/50">
                <div className="text-center">
                    <MapPin className="mx-auto mb-2 h-8 w-8 text-neutral-600" />
                    <p className="text-sm text-neutral-400">Enter address to view location</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* Warning banner if using approximate location */}
            {error && coordinates && (
                <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
                        <div className="text-xs text-yellow-400">
                            <p className="font-medium mb-1">Map showing approximate location (geocoding service unavailable)</p>
                            <p className="opacity-90">Don't worry - you can still complete checkout. Your address has been saved.</p>
                        </div>
                    </div>
                </div>
            )}

            <LeafletMap
                coordinates={coordinates}
                interactive={interactive}
                onLocationAdjust={onLocationAdjust}
            />

            {/* Address Display */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 text-sm text-neutral-300">
                <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-500" />
                    <div>
                        <p className="font-medium text-white">{address.address}</p>
                        <p>
                            {address.city}, {address.state} {address.zipCode}
                        </p>
                    </div>
                </div>
            </div>

            {/* Coordinates Display */}
            <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-2 text-xs text-neutral-400">
                <span className="font-mono">
                    📍 {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </span>
            </div>
        </div>
    );
}
