"use client";

import { useEffect, useState, useCallback } from "react";
import { Nav } from "@/components/nav";
import { MapView } from "@/components/map-dynamic";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUSES } from "@/lib/constants";

interface MapListing {
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

export default function MapPage() {
  const [listings, setListings] = useState<MapListing[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

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

  const filtered =
    statusFilter === "all"
      ? listings
      : listings.filter((l) => l.status === statusFilter);

  return (
    <>
      <Nav />
      <main className="flex flex-col flex-1">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Carte</h1>
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 px-4 sm:px-6 pb-4">
          {loading ? (
            <div className="flex items-center justify-center h-[600px]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            </div>
          ) : (
            <MapView
              listings={filtered}
              className="h-[calc(100vh-10rem)] w-full rounded-xl"
            />
          )}
        </div>
      </main>
    </>
  );
}
