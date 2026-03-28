"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";

interface ListingCardProps {
  listing: {
    id: string;
    title: string | null;
    price: number | null;
    surface: number | null;
    rooms: number | null;
    address: string | null;
    status: string;
    latitude: number | null;
    longitude: number | null;
  };
  selected?: boolean;
  onClick?: () => void;
}

export const ListingCard = forwardRef<HTMLDivElement, ListingCardProps>(
  ({ listing, selected, onClick }, ref) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          "bg-white rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer p-4",
          selected && "ring-2 ring-[#CDEA68]"
        )}
      >
        <Link href={`/listings/${listing.id}`} className="block space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium truncate text-sm">
              {listing.title ?? "Sans titre"}
            </span>
            <StatusBadge status={listing.status} />
          </div>

          <div className="font-bold text-sm">
            {listing.price != null
              ? `${listing.price.toLocaleString("fr-FR")} \u20AC`
              : "\u2014"}
          </div>

          <div className="text-xs text-muted-foreground truncate">
            {[
              listing.surface != null ? `${listing.surface} m\u00B2` : null,
              listing.rooms != null ? `${listing.rooms} p.` : null,
              listing.address,
            ]
              .filter(Boolean)
              .join(" \u00B7 ")}
          </div>
        </Link>
      </div>
    );
  }
);

ListingCard.displayName = "ListingCard";
