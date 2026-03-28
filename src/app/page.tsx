"use client";

import { useEffect, useState, useCallback } from "react";
import { ListingSidebar } from "@/components/listing-sidebar";
import { MapView } from "@/components/map-dynamic";

interface Listing {
  id: string;
  title: string | null;
  price: number | null;
  surface: number | null;
  rooms: number | null;
  address: string | null;
  status: string;
  latitude: number | null;
  longitude: number | null;
}

export default function Dashboard() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [centerOnId, setCenterOnId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const fetchListings = useCallback(async () => {
    try {
      const res = await fetch("/api/listings");
      const data = await res.json();
      setListings(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleCardSelect = (id: string) => {
    setSelectedId(id);
    setCenterOnId(id);
  };

  const handleMarkerClick = (id: string) => {
    setSelectedId(id);
  };

  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      {/* Left panel - sidebar */}
      <div className={`w-full md:w-[40%] lg:w-[38%] flex flex-col bg-white border-r border-[#E5E5E5] ${mobileView === "map" ? "hidden md:flex" : "flex"}`}>
        <ListingSidebar
          listings={listings}
          selectedId={selectedId}
          onSelect={handleCardSelect}
          onRefresh={fetchListings}
          loading={loading}
        />
      </div>

      {/* Right panel - map */}
      <div className={`flex-1 relative ${mobileView === "list" ? "hidden md:block" : "block"}`}>
        <MapView
          listings={listings}
          selectedId={selectedId}
          onMarkerClick={handleMarkerClick}
          centerOnId={centerOnId}
        />
      </div>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
        className="md:hidden fixed bottom-6 right-6 z-50 bg-[#1A1A1A] text-white rounded-full px-5 py-3 shadow-lg font-medium text-sm flex items-center gap-2 active:scale-95 transition-transform"
      >
        {mobileView === "list" ? (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m0 0l3-3m-3 3l-3-3m12-3V15m0 0l3-3m-3 3l-3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            Carte
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Liste
          </>
        )}
      </button>
    </div>
  );
}
