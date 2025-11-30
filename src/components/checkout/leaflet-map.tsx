"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Loader2 } from "lucide-react";

interface LeafletMapProps {
    coordinates: { lat: number; lng: number };
    interactive?: boolean;
    onLocationAdjust?: (lat: number, lng: number) => void;
}

export default function LeafletMap({
    coordinates,
    interactive = false,
    onLocationAdjust,
}: LeafletMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [locatingGPS, setLocatingGPS] = useState(false);
    const [gpsError, setGpsError] = useState<string | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Initialize map
        const map = L.map(containerRef.current, {
            center: [coordinates.lat, coordinates.lng],
            zoom: 15,
            zoomControl: true,
            dragging: interactive,
            touchZoom: interactive,
            scrollWheelZoom: interactive,
            doubleClickZoom: interactive,
            boxZoom: interactive,
            keyboard: interactive,
        });

        // Add OpenStreetMap tiles (free, no API key required)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        // Custom marker icon
        const customIcon = L.divIcon({
            className: "custom-marker",
            html: `
                <div style="position: relative;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#ef4444"/>
                    </svg>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        });

        // Add marker
        const marker = L.marker([coordinates.lat, coordinates.lng], {
            icon: customIcon,
            draggable: interactive,
        }).addTo(map);

        // Handle marker drag
        if (interactive && onLocationAdjust) {
            marker.on("dragend", () => {
                const position = marker.getLatLng();
                onLocationAdjust(position.lat, position.lng);
            });
        }

        // Handle map click
        if (interactive && onLocationAdjust) {
            map.on("click", (e) => {
                marker.setLatLng(e.latlng);
                onLocationAdjust(e.latlng.lat, e.latlng.lng);
            });
        }

        mapRef.current = map;
        markerRef.current = marker;

        // Cleanup
        return () => {
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, []);

    // Update marker position when coordinates change
    useEffect(() => {
        if (mapRef.current && markerRef.current) {
            const newLatLng = L.latLng(coordinates.lat, coordinates.lng);
            markerRef.current.setLatLng(newLatLng);
            mapRef.current.setView(newLatLng, mapRef.current.getZoom());
        }
    }, [coordinates.lat, coordinates.lng]);

    // Handle GPS location
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setGpsError("Geolocation not supported");
            setTimeout(() => setGpsError(null), 3000);
            return;
        }

        setLocatingGPS(true);
        setGpsError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                
                // Update map and marker
                if (mapRef.current && markerRef.current) {
                    const newLatLng = L.latLng(latitude, longitude);
                    markerRef.current.setLatLng(newLatLng);
                    mapRef.current.setView(newLatLng, 15);
                }

                // Notify parent component
                if (onLocationAdjust) {
                    onLocationAdjust(latitude, longitude);
                }

                setLocatingGPS(false);
            },
            (error) => {
                let errorMessage = "Location access denied";
                
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Location permission denied";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Location unavailable";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location request timeout";
                        break;
                }
                
                setGpsError(errorMessage);
                setLocatingGPS(false);
                setTimeout(() => setGpsError(null), 3000);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return (
        <div className="relative">
            <div
                ref={containerRef}
                className="h-64 w-full rounded-lg border border-neutral-800 overflow-hidden"
                style={{ background: "#1a1a1a" }}
            />
            
            {/* GPS Location Button */}
            {interactive && onLocationAdjust && (
                <button
                    onClick={handleGetLocation}
                    disabled={locatingGPS}
                    className="absolute left-4 top-4 z-[1000] flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500 text-black shadow-lg transition-all hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Get my current location"
                    aria-label="Get my current location"
                >
                    {locatingGPS ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Navigation className="h-5 w-5" />
                    )}
                </button>
            )}

            {/* GPS Error Message */}
            {gpsError && (
                <div className="absolute left-4 top-16 z-[1000] rounded-lg bg-red-500/90 px-3 py-2 text-xs text-white backdrop-blur-sm">
                    {gpsError}
                </div>
            )}

            {interactive && (
                <div className="absolute right-4 top-4 z-[1000] rounded-lg bg-black/80 px-3 py-2 text-xs text-neutral-300 backdrop-blur-sm">
                    {onLocationAdjust ? "Click or drag marker to adjust" : "Interactive mode"}
                </div>
            )}
            <div className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-green-500/20 px-3 py-2 text-xs text-green-500 backdrop-blur-sm">
                OpenStreetMap (Free)
            </div>
        </div>
    );
}
