"use client";

import { useEffect, useState, useCallback } from "react";
import { Nav } from "@/components/nav";
import { ListingTable } from "@/components/listing-table";
import { AddListingDialog } from "@/components/add-listing-dialog";
import type { ListingRow } from "@/components/listing-table-columns";

export default function Dashboard() {
  const [listings, setListings] = useState<ListingRow[]>([]);
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

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Mes annonces
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {listings.length} annonce{listings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <AddListingDialog onCreated={fetchListings} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          </div>
        ) : (
          <ListingTable data={listings} />
        )}
      </main>
    </>
  );
}
