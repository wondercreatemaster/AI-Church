"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Search, Crosshair } from "lucide-react";

interface ChurchSearchFormProps {
  onSearch: (location: string, radius: string) => void;
  isLoading?: boolean;
  defaultLocation?: string;
}

export function ChurchSearchForm({ onSearch, isLoading = false, defaultLocation = "" }: ChurchSearchFormProps) {
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("25");

  // Update location when defaultLocation changes
  React.useEffect(() => {
    if (defaultLocation) {
      setLocation(defaultLocation);
    }
  }, [defaultLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch(location.trim(), radius);
    }
  };

  const handleGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        (error) => {
          alert("Unable to get your location. Please enter it manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="bg-gradient-to-br from-byzantine-50 to-white p-6 md:p-8 border-b">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Location Input */}
          <div className="md:col-span-6">
            <Label htmlFor="location" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Your Location
            </Label>
            <div className="relative">
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State or ZIP code"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={handleGeolocation}
                title="Use my location"
              >
                <Crosshair className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Radius Selector */}
          <div className="md:col-span-3">
            <Label htmlFor="radius" className="text-sm font-medium text-gray-700 mb-2 block">
              Search Radius
            </Label>
            <Select value={radius} onValueChange={setRadius}>
              <SelectTrigger id="radius">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 miles</SelectItem>
                <SelectItem value="25">25 miles</SelectItem>
                <SelectItem value="50">50 miles</SelectItem>
                <SelectItem value="100">100 miles</SelectItem>
                <SelectItem value="any">Any distance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div className="md:col-span-3">
            <Button
              type="submit"
              size="lg"
              disabled={!location.trim() || isLoading}
              className="w-full bg-byzantine-500 hover:bg-byzantine-600"
            >
              <Search className="mr-2 h-4 w-4" />
              {isLoading ? "Searching..." : "Find Churches"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

