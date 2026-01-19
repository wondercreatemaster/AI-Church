"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  serviceTimes?: string[];
  rating?: number;
  userRatingsTotal?: number;
}

interface ChurchCardProps {
  church: Church;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ChurchCard({ church, isSelected = false, onClick }: ChurchCardProps) {
  const getJurisdictionColor = (jurisdiction: string) => {
    const colors: Record<string, string> = {
      "Greek Orthodox": "bg-blue-100 text-blue-700 border-blue-300",
      "Antiochian": "bg-green-100 text-green-700 border-green-300",
      "OCA": "bg-purple-100 text-purple-700 border-purple-300",
      "ROCOR": "bg-red-100 text-red-700 border-red-300",
      "Coptic": "bg-amber-100 text-amber-700 border-amber-300",
    };
    return colors[jurisdiction] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const handleGetDirections = () => {
    if (church.placeId) {
      // Use placeId for more accurate directions
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          church.address
        )}&destination_place_id=${church.placeId}`,
        "_blank"
      );
    } else {
      // Fallback to address-based search
      const encodedAddress = encodeURIComponent(church.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, "_blank");
    }
  };

  return (
    <Card
      className={`mb-4 p-4 border transition-all cursor-pointer hover:shadow-md ${
        isSelected ? "bg-byzantine-50 border-byzantine-500" : "border-gray-200 hover:border-byzantine-500"
      }`}
      onClick={onClick}
    >
      {/* Top Section */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-display font-semibold text-orthodox-600 mb-1">
            {church.name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {church.jurisdiction && (
              <Badge variant="outline" className={getJurisdictionColor(church.jurisdiction)}>
                {church.jurisdiction}
              </Badge>
            )}
            {church.distance && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {church.distance}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 mb-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{church.address}</span>
      </div>

      {/* Phone */}
      {church.phone && (
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <a href={`tel:${church.phone}`} className="hover:text-byzantine-600 transition-colors">
            {church.phone}
          </a>
        </div>
      )}

      {/* Website */}
      {church.website && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <ExternalLink className="w-4 h-4 flex-shrink-0" />
          <a
            href={church.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-byzantine-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Visit Website
          </a>
        </div>
      )}

      {/* Service Times Accordion - Only show if serviceTimes exist */}
      {church.serviceTimes && church.serviceTimes.length > 0 && (
        <Accordion type="single" collapsible className="mb-4">
          <AccordionItem value="times" className="border-none">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-2">
              Service Times
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1">
                {church.serviceTimes.map((time, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {time}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Get Directions Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={(e) => {
          e.stopPropagation();
          handleGetDirections();
        }}
      >
        <Navigation className="mr-2 h-4 w-4" />
        Get Directions
      </Button>
    </Card>
  );
}

