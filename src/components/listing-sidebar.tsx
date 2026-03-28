"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddListingDialog } from "@/components/add-listing-dialog";
import { ListingCard } from "@/components/listing-card";
import { STATUS_GROUPS } from "@/lib/constants";

interface ListingSidebarProps {
  listings: {
    id: string;
    title: string | null;
    price: number | null;
    surface: number | null;
    rooms: number | null;
    address: string | null;
    status: string;
    latitude: number | null;
    longitude: number | null;
  }[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

export function ListingSidebar({
  listings,
  selectedId,
  onSelect,
  onRefresh,
  loading,
}: ListingSidebarProps) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const filteredListings = useMemo(() => {
    let result = listings;

    // Tab filter
    const allowedStatuses = STATUS_GROUPS[activeTab];
    if (allowedStatuses) {
      result = result.filter((l) =>
        (allowedStatuses as string[]).includes(l.status)
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((l) => {
        const title = (l.title ?? "").toLowerCase();
        const address = (l.address ?? "").toLowerCase();
        const price = l.price != null ? String(l.price) : "";
        return title.includes(q) || address.includes(q) || price.includes(q);
      });
    }

    return result;
  }, [listings, activeTab, searchQuery]);

  // Scroll selected card into view
  useEffect(() => {
    if (selectedId && cardRefs.current[selectedId]) {
      cardRefs.current[selectedId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedId]);

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <span className="font-bold text-xl text-[#1A1A1A]">
          Appart Tracker
        </span>
        <div className="flex items-center gap-2">
          {session ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-xs"
            >
              {session.user?.name?.split(" ")[0] ?? "User"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => signIn("google")}
              className="text-xs"
            >
              Connexion Google
            </Button>
          )}
          {onRefresh && <AddListingDialog onCreated={onRefresh} />}
        </div>
      </div>

      {/* Search bar */}
      <div className="px-5 pb-3 relative">
        <svg
          className="absolute left-8 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <Input
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <div className="px-5 pb-3">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            {Object.keys(STATUS_GROUPS).map((tab) => (
              <TabsTrigger key={tab} value={tab} className="flex-1 text-xs">
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Count */}
      <div className="px-5 pb-2">
        <span className="text-xs text-muted-foreground">
          {filteredListings.length} annonce(s)
        </span>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#E5E5E5] border-t-[#CDEA68]" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-sm text-muted-foreground">
              Aucune annonce
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                ref={(el) => {
                  cardRefs.current[listing.id] = el;
                }}
                listing={listing}
                selected={listing.id === selectedId}
                onClick={() => onSelect?.(listing.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
