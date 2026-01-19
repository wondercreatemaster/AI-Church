"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink, Map, Navigation } from "lucide-react";
import Link from "next/link";

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

interface ChurchResultsProps {
  churches: ChurchResult[];
  location: { lat: number; lng: number };
  total: number;
}

export function ChurchResults({ churches, location, total }: ChurchResultsProps) {
  const getDirectionsUrl = (church: ChurchResult) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      church.address
    )}&destination_place_id=${church.placeId}`;
  };

  const getViewOnMapUrl = () => {
    return `/churches?lat=${location.lat}&lng=${location.lng}`;
  };

  return (
    <div className="my-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-orthodox-600 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Orthodox Churches Near You
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Found {total} {total === 1 ? "church" : "churches"} in your area
          </p>
        </div>
        <Link href={getViewOnMapUrl()}>
          <Button variant="outline" size="sm" className="gap-2">
            <Map className="w-4 h-4" />
            View All on Map
          </Button>
        </Link>
      </div>

      {/* Church Cards */}
      <div className="space-y-3">
        {churches.map((church) => (
          <Card
            key={church.id}
            className="p-4 hover:shadow-md transition-shadow border-byzantine-200"
          >
            <div className="space-y-3">
              {/* Church Name & Jurisdiction */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-orthodox-600 text-base">
                    {church.name}
                  </h4>
                  {church.distance && (
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {church.distance}
                    </Badge>
                  )}
                </div>
                {church.jurisdiction && (
                  <Badge
                    variant="outline"
                    className="mt-2 text-xs bg-byzantine-50 border-byzantine-300"
                  >
                    {church.jurisdiction}
                  </Badge>
                )}
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-500" />
                <span>{church.address}</span>
              </div>

              {/* Phone */}
              {church.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <a
                    href={`tel:${church.phone}`}
                    className="text-byzantine-600 hover:underline"
                  >
                    {church.phone}
                  </a>
                </div>
              )}

              {/* Rating */}
              {church.rating && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-yellow-500">★</span>
                  <span>
                    {church.rating.toFixed(1)}
                    {church.userRatingsTotal && (
                      <span className="text-gray-500">
                        {" "}
                        ({church.userRatingsTotal} reviews)
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href={getDirectionsUrl(church)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    size="sm"
                    className="w-full sm:w-auto bg-byzantine-500 hover:bg-byzantine-600 gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </Button>
                </a>
                {church.website && (
                  <a
                    href={church.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Website
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Footer with encouragement */}
      <Card className="p-4 bg-byzantine-50 border-byzantine-200">
        <p className="text-sm text-gray-700">
          <strong className="text-orthodox-600">Next step:</strong> I encourage
          you to visit during Sunday Divine Liturgy (usually 9-11 AM). You&apos;re
          welcome to stand in the back and observe. Feel free to introduce
          yourself to the priest afterward—they&apos;re always happy to answer
          questions!
        </p>
      </Card>
    </div>
  );
}

