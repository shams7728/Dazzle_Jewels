import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
        return NextResponse.json(
            { error: "Missing coordinates" },
            { status: 400 }
        );
    }

    // Validate coordinates
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        return NextResponse.json(
            { error: "Invalid latitude. Must be between -90 and 90" },
            { status: 400 }
        );
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        return NextResponse.json(
            { error: "Invalid longitude. Must be between -180 and 180" },
            { status: 400 }
        );
    }

    try {
        // Use Nominatim (OpenStreetMap's free geocoding service)
        // No API key required!
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
                headers: {
                    "User-Agent": "DazzleJewelry-Checkout/1.0", // Required by Nominatim
                },
            }
        );

        if (!response.ok) {
            throw new Error("Geocoding request failed");
        }

        const data = await response.json();

        if (data.error) {
            return NextResponse.json(
                { error: "Location not found" },
                { status: 404 }
            );
        }

        // Extract address components
        const addressData = data.address || {};
        
        // Build street address
        const streetParts = [
            addressData.house_number,
            addressData.road || addressData.street,
        ].filter(Boolean);
        
        const address = streetParts.join(" ") || 
                       addressData.neighbourhood || 
                       addressData.suburb || 
                       data.display_name?.split(",")[0] || 
                       "";

        const city = addressData.city || 
                    addressData.town || 
                    addressData.village || 
                    addressData.municipality || 
                    "";

        const state = addressData.state || 
                     addressData.region || 
                     "";

        const zipCode = addressData.postcode || "";

        return NextResponse.json({
            address,
            city,
            state,
            zipCode,
            fullAddress: data.display_name,
        });
    } catch (error) {
        console.error("Geocoding error:", error);
        return NextResponse.json(
            { error: "Geocoding service unavailable" },
            { status: 500 }
        );
    }
}
