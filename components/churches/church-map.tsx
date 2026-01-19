"use client";

import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink, Navigation } from "lucide-react";

interface Church {
  id: number | string;
  name: string;
  jurisdiction?: string;
  address: string;
  phone?: string;
  website?: string;
  distance?: string;
  coordinates: { lat: number; lng: number };
  placeId?: string;
}

interface ChurchMapProps {
  churches?: Church[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 40.7128, // NYC default
  lng: -74.006,
};

export function ChurchMap({ churches = [], center, zoom = 11 }: ChurchMapProps) {
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [mapCenter, setMapCenter] = useState(center || defaultCenter);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (center) {
      setMapCenter(center);
    } else if (churches.length > 0) {
      // Center on first church if no center provided
      setMapCenter(churches[0].coordinates);
    }
  }, [center, churches]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="h-full bg-gradient-to-br from-orthodox-50 to-orthodox-100 flex items-center justify-center p-8">
        <Card className="p-6 max-w-md text-center">
          <MapPin className="w-16 h-16 text-orthodox-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-orthodox-600 mb-2">
            Map Configuration Required
          </h3>
          <p className="text-sm text-gray-600">
            Please add your Google Maps API key to the environment variables to
            display the interactive map.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Add <code className="bg-gray-100 px-2 py-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code className="bg-gray-100 px-2 py-1 rounded">.env.local</code> file
          </p>
        </Card>
      </div>
    );
  }

  const getDirectionsUrl = (church: Church) => {
    if (church.placeId) {
      return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        church.address
      )}&destination_place_id=${church.placeId}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      church.address
    )}`;
  };

  return (
    <LoadScript 
      googleMapsApiKey={apiKey}
      onLoad={() => setIsLoaded(true)}
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Markers for each church */}
        {churches.map((church) => (
          <Marker
            key={church.id}
            position={church.coordinates}
            onClick={() => setSelectedChurch(church)}
            icon={{
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
                  <path fill="#7C3AED" stroke="#ffffff" stroke-width="2" d="M16 0C7.611 0 1 6.611 1 15c0 10 15 25 15 25s15-15 15-25c0-8.389-6.611-15-15-15z"/>
                  <circle cx="16" cy="15" r="6" fill="#ffffff"/>
                  <text x="16" y="18" font-family="Arial" font-size="12" fill="#7C3AED" text-anchor="middle">☦</text>
                </svg>
              `),
            }}
          />
        ))}

        {/* Info Window for selected church */}
        {selectedChurch && (
          <InfoWindow
            position={selectedChurch.coordinates}
            onCloseClick={() => setSelectedChurch(null)}
          >
            <div className="p-2 max-w-xs">
              <h3 className="font-semibold text-orthodox-600 mb-1">
                {selectedChurch.name}
              </h3>
              {selectedChurch.jurisdiction && (
                <Badge variant="outline" className="mb-2 text-xs">
                  {selectedChurch.jurisdiction}
                </Badge>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
                  <span className="text-gray-700">{selectedChurch.address}</span>
                </div>
                {selectedChurch.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a
                      href={`tel:${selectedChurch.phone}`}
                      className="text-byzantine-600 hover:underline"
                    >
                      {selectedChurch.phone}
                    </a>
                  </div>
                )}
                {selectedChurch.distance && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedChurch.distance}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 mt-3">
                <a
                  href={getDirectionsUrl(selectedChurch)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button size="sm" className="w-full text-xs bg-byzantine-500 hover:bg-byzantine-600 gap-1">
                    <Navigation className="w-3 h-3" />
                    Directions
                  </Button>
                </a>
                {selectedChurch.website && (
                  <a
                    href={selectedChurch.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button size="sm" variant="outline" className="w-full text-xs gap-1">
                      <ExternalLink className="w-3 h-3" />
                      Website
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </InfoWindow>
        )}

        {/* User location marker if center is provided */}
        {center && (
          <Marker
            position={center}
            icon={{
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
                  <circle cx="12" cy="12" r="4" fill="#ffffff"/>
                </svg>
              `),
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}

