"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPinOff } from "lucide-react";
import { ChurchSearchForm } from "@/components/churches/church-search-form";
import { ChurchList } from "@/components/churches/church-list";
import { ChurchMap } from "@/components/churches/church-map";
import { toast } from "sonner";

interface Church {
  id: string | number;
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

function ChurchesPageContent() {
  const searchParams = useSearchParams();
  const [churches, setChurches] = useState<Church[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedChurchId, setSelectedChurchId] = useState<number | string | undefined>();
  const [sortBy, setSortBy] = useState("distance");
  const [locationError, setLocationError] = useState<string>("");
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<string>("");
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>();

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsRequestingLocation(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setUserLocation(locationString);
        setMapCenter({ lat: latitude, lng: longitude });
        setIsRequestingLocation(false);
        
        // Automatically search with user's location
        handleSearch(locationString, "25");
      },
      (error) => {
        setIsRequestingLocation(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enter your location manually.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable. Please enter your location manually.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please enter your location manually.");
            break;
          default:
            setLocationError("An error occurred. Please enter your location manually.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  // Request user location on mount or check for URL params
  useEffect(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    
    if (lat && lng) {
      // Location provided via URL params (from chat)
      const locationString = `${lat}, ${lng}`;
      setUserLocation(locationString);
      setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lng) });
      handleSearch(locationString, "25");
    } else {
      // Request user's current location
      requestUserLocation();
    }
  }, [searchParams, requestUserLocation]);

  const handleSearch = async (location: string, radius: string) => {
    setIsLoading(true);
    setHasSearched(true);
    setLocationError("");

    try {
      // Call the real API
      const response = await fetch(
        `/api/churches/search?location=${encodeURIComponent(location)}&radius=${radius}`
      );

      if (!response.ok) {
        throw new Error("Failed to search for churches");
      }

      const data = await response.json();

      if (data.success) {
        setChurches(data.churches);
        if (data.location) {
          setMapCenter(data.location);
        }
        if (data.churches.length === 0) {
          toast.info("No Orthodox churches found in this area. Try expanding your search radius.");
        }
      } else {
        throw new Error(data.error || "Failed to search for churches");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search for churches. Please try again.");
      setLocationError("Failed to search for churches. Please check your location and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChurch = (church: Church) => {
    setSelectedChurchId(church.id);
    // In a real app, this would center the map on the selected church
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // Sort churches based on selection
    const sorted = [...churches];
    if (value === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => {
        const distA = parseFloat(a.distance || "999");
        const distB = parseFloat(b.distance || "999");
        return distA - distB;
      });
    }
    setChurches(sorted);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white border-b p-6 md:p-8 flex-shrink-0">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/chat">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-orthodox-600">
              Find an Orthodox Church
            </h1>
            <p className="text-gray-600 mt-2">Connect with a parish near you</p>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="flex-shrink-0">
        <ChurchSearchForm 
          onSearch={handleSearch} 
          isLoading={isLoading} 
          defaultLocation={userLocation}
        />
      </div>

      {/* Results Section */}
      {hasSearched && (
        <>
          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-5 flex-1 overflow-hidden">
            {/* Church List - Left Side */}
            <div className="lg:col-span-2">
              <ChurchList
                churches={churches}
                isLoading={isLoading}
                selectedChurchId={selectedChurchId}
                onSelectChurch={handleSelectChurch}
                sortBy={sortBy}
                onSortChange={handleSortChange}
              />
            </div>

            {/* Map - Right Side */}
            <div className="lg:col-span-3 h-full">
              <ChurchMap churches={churches} center={mapCenter} />
            </div>
          </div>

          {/* Mobile Layout - Tabs */}
          <div className="lg:hidden flex-1 min-h-0">
            <Tabs defaultValue="list" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>
              <TabsContent value="list" className="flex-1 min-h-0 mt-0 h-full">
                <ChurchList
                  churches={churches}
                  isLoading={isLoading}
                  selectedChurchId={selectedChurchId}
                  onSelectChurch={handleSelectChurch}
                  sortBy={sortBy}
                  onSortChange={handleSortChange}
                />
              </TabsContent>
              <TabsContent value="map" className="flex-1 min-h-0 mt-0 h-full">
                <ChurchMap churches={churches} center={mapCenter} />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}

      {/* Initial State - Before Search */}
      {!hasSearched && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            {isRequestingLocation ? (
              /* Loading location state */
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-byzantine-100 rounded-full mb-4">
                    <svg className="animate-spin h-8 w-8 text-byzantine-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-display font-semibold text-gray-700 mb-3">
                  Requesting Your Location
                </h2>
                <p className="text-gray-600 mb-4">
                  Please allow location access to find Orthodox churches near you.
                </p>
                <p className="text-sm text-gray-500">
                  You can also enter your location manually in the search box above.
                </p>
              </>
            ) : locationError ? (
              /* Error state */
              <>
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <MapPinOff className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-display font-semibold text-gray-700 mb-3">
                  Location Access Required
                </h2>
                <p className="text-gray-600 mb-6">
                  {locationError}
                </p>
                <Button 
                  onClick={requestUserLocation}
                  className="bg-byzantine-500 hover:bg-byzantine-600 mb-4"
                >
                  Try Again
                </Button>
                <p className="text-sm text-gray-500">
                  Or enter your location in the search box above
                </p>
              </>
            ) : (
              /* Default initial state */
              <>
                <h2 className="text-2xl font-display font-semibold text-gray-700 mb-3">
                  Find Orthodox Churches Near You
                </h2>
                <p className="text-gray-600 mb-6">
                  Enter your location above to discover Orthodox parishes in your area. We&apos;ll show you
                  churches from various jurisdictions including Greek Orthodox, Antiochian, OCA, ROCOR,
                  and more.
                </p>
                <div className="bg-byzantine-50 border border-byzantine-200 rounded-lg p-4 text-sm text-gray-700">
                  <p className="font-semibold mb-2">What to expect:</p>
                  <ul className="text-left space-y-1">
                    <li>• Contact information and service times</li>
                    <li>• Distance from your location</li>
                    <li>• Jurisdiction and parish details</li>
                    <li>• Directions to each church</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChurchesPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-byzantine-100 rounded-full mb-4">
            <svg className="animate-spin h-8 w-8 text-byzantine-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ChurchesPageContent />
    </Suspense>
  );
}

