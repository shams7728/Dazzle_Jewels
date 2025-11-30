import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");

    if (!address) {
        return NextResponse.json(
            { error: "Missing address parameter" },
            { status: 400 }
        );
    }

    try {
        // Use Nominatim (OpenStreetMap's free geocoding service) for forward geocoding
        // No API key required!
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=1`,
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

        if (!data || data.length === 0) {
            return NextResponse.json(
                { error: "Address not found" },
                { status: 404 }
            );
        }

        // Get the first (best) result
        const result = data[0];

        return NextResponse.json({
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            displayName: result.display_name,
        });
    } catch (error) {
        console.error("Forward geocoding error:", error);
        return NextResponse.json(
            { error: "Geocoding service unavailable" },
            { status: 503 }
        );
    }
}
