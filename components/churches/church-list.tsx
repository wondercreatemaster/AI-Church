"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPinOff } from "lucide-react";
import { ChurchCard } from "./church-card";
import { Button } from "@/components/ui/button";

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
}

interface ChurchListProps {
  churches: Church[];
  isLoading?: boolean;
  selectedChurchId?: number | string;
  onSelectChurch?: (church: Church) => void;
  sortBy?: string;
  onSortChange?: (value: string) => void;
}

export function ChurchList({
  churches,
  isLoading = false,
  selectedChurchId,
  onSelectChurch,
  sortBy = "distance",
  onSortChange,
}: ChurchListProps) {
  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white border-r border-gray-200 p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // Empty State
  if (churches.length === 0) {
    return (
      <div className="bg-white border-r border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <MapPinOff className="w-16 h-16 text-gray-300 mb-6" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Churches Found</h3>
        <p className="text-gray-600 mb-6 max-w-sm">
          We couldn&apos;t find any Orthodox churches within your search area. Try expanding your search
          radius.
        </p>
        <Button variant="outline">Expand Search Radius</Button>
      </div>
    );
  }

  // Results
  return (
    <div className="bg-white border-r border-gray-200">
      {/* Results Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <span className="text-sm text-gray-600">
          {churches.length} {churches.length === 1 ? "church" : "churches"} found
        </span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="distance">By Distance</SelectItem>
            <SelectItem value="name">By Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Church Cards - Scrollable with max height */}
      <div className="overflow-y-auto p-4 max-h-[calc(100vh-280px)]">
        {churches.map((church) => (
          <ChurchCard
            key={church.id}
            church={church}
            isSelected={selectedChurchId === church.id}
            onClick={() => onSelectChurch?.(church)}
          />
        ))}
      </div>
    </div>
  );
}

