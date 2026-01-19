import { NextRequest, NextResponse } from "next/server";

// Church result interface
export interface ChurchResult {
  id: string;
  name: string;
  jurisdiction?: string;
  address: string;
  phone?: string;
  website?: string;
  distance?: string;
  coordinates: { lat: number; lng: number };
  placeId: string;
  rating?: number;
  userRatingsTotal?: number;
}

// Calculate distance between two coordinates in miles
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Extract jurisdiction from church name
function extractJurisdiction(name: string): string | undefined {
  const jurisdictionMap: Record<string, string> = {
    "greek orthodox": "Greek Orthodox",
    "antiochian": "Antiochian",
    "oca": "OCA",
    "rocor": "ROCOR",
    "russian orthodox": "Russian Orthodox",
    "serbian orthodox": "Serbian Orthodox",
    "romanian orthodox": "Romanian Orthodox",
    "coptic": "Coptic Orthodox",
    "ethiopian": "Ethiopian Orthodox",
    "armenian": "Armenian Apostolic",
    "syriac": "Syriac Orthodox",
  };

  const lowerName = name.toLowerCase();
  for (const [key, value] of Object.entries(jurisdictionMap)) {
    if (lowerName.includes(key)) {
      return value;
    }
  }
  return undefined;
}

// Geocode a text address to coordinates
async function geocodeAddress(
  address: string,
  apiKey: string
): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Search for Orthodox churches using Google Places API
async function searchChurches(
  location: { lat: number; lng: number },
  radiusMiles: number,
  apiKey: string
): Promise<ChurchResult[]> {
  try {
    const radiusMeters = radiusMiles * 1609.34; // Convert miles to meters
    
    // Use Places API (New) - Text Search
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=Orthodox+Church&location=${location.lat},${location.lng}&radius=${radiusMeters}&key=${apiKey}`
    );
    
    const data = await response.json();

    if (data.status === "OK" && data.results) {
      const churches: ChurchResult[] = data.results
        .filter((place: any) => {
          // Filter for churches only
          const types = place.types || [];
          return types.includes("church") || types.includes("place_of_worship");
        })
        .map((place: any) => {
          const distance = calculateDistance(
            location.lat,
            location.lng,
            place.geometry.location.lat,
            place.geometry.location.lng
          );

          return {
            id: place.place_id,
            name: place.name,
            jurisdiction: extractJurisdiction(place.name),
            address: place.formatted_address,
            phone: place.formatted_phone_number,
            website: place.website,
            distance: `${distance.toFixed(1)} mi`,
            coordinates: {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng,
            },
            placeId: place.place_id,
            rating: place.rating,
            userRatingsTotal: place.user_ratings_total,
          };
        })
        .sort((a: ChurchResult, b: ChurchResult) => {
          // Sort by distance
          const distA = parseFloat(a.distance || "999");
          const distB = parseFloat(b.distance || "999");
          return distA - distB;
        });

      return churches;
    }

    return [];
  } catch (error) {
    console.error("Church search error:", error);
    return [];
  }
}

// Get additional church details from Places API
async function getChurchDetails(
  placeId: string,
  apiKey: string
): Promise<{ phone?: string; website?: string }> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status === "OK" && data.result) {
      return {
        phone: data.result.formatted_phone_number,
        website: data.result.website,
      };
    }
    return {};
  } catch (error) {
    console.error("Church details error:", error);
    return {};
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get("location");
    const radius = searchParams.get("radius") || "25";

    if (!location) {
      return NextResponse.json(
        { error: "Location parameter is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    // Parse location - could be "lat,lng" or text address
    let coordinates: { lat: number; lng: number } | null = null;

    // Check if location is lat,lng format
    const latLngMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (latLngMatch) {
      coordinates = {
        lat: parseFloat(latLngMatch[1]),
        lng: parseFloat(latLngMatch[2]),
      };
    } else {
      // Geocode text address
      coordinates = await geocodeAddress(location, apiKey);
    }

    if (!coordinates) {
      return NextResponse.json(
        { error: "Could not geocode location" },
        { status: 400 }
      );
    }

    // Search for churches
    const churches = await searchChurches(
      coordinates,
      parseFloat(radius),
      apiKey
    );

    // Enrich with additional details for top 5 churches
    const enrichedChurches = await Promise.all(
      churches.slice(0, 10).map(async (church) => {
        const details = await getChurchDetails(church.placeId, apiKey);
        return {
          ...church,
          phone: church.phone || details.phone,
          website: church.website || details.website,
        };
      })
    );

    return NextResponse.json({
      success: true,
      location: coordinates,
      churches: enrichedChurches,
      total: churches.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search for churches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Support POST for more complex requests
  try {
    const body = await request.json();
    const { location, radius = 25 } = body;

    if (!location) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key not configured" },
        { status: 500 }
      );
    }

    // Parse location
    let coordinates: { lat: number; lng: number } | null = null;

    if (typeof location === "object" && location.lat && location.lng) {
      coordinates = location;
    } else if (typeof location === "string") {
      const latLngMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      if (latLngMatch) {
        coordinates = {
          lat: parseFloat(latLngMatch[1]),
          lng: parseFloat(latLngMatch[2]),
        };
      } else {
        coordinates = await geocodeAddress(location, apiKey);
      }
    }

    if (!coordinates) {
      return NextResponse.json(
        { error: "Could not parse or geocode location" },
        { status: 400 }
      );
    }

    // Search for churches
    const churches = await searchChurches(coordinates, radius, apiKey);

    // Enrich with additional details
    const enrichedChurches = await Promise.all(
      churches.slice(0, 10).map(async (church) => {
        const details = await getChurchDetails(church.placeId, apiKey);
        return {
          ...church,
          phone: church.phone || details.phone,
          website: church.website || details.website,
        };
      })
    );

    return NextResponse.json({
      success: true,
      location: coordinates,
      churches: enrichedChurches,
      total: churches.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search for churches" },
      { status: 500 }
    );
  }
}

