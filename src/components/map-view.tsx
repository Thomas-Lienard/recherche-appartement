"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { STATUS_MAP_COLORS, type ListingStatus } from "@/lib/constants";

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

interface MapViewProps {
  listings: MapListing[];
  className?: string;
}

export function MapViewInner({ listings, className }: MapViewProps) {
  const geoListings = listings.filter((l) => l.latitude && l.longitude);

  // Center on France by default, or on first listing
  const center: [number, number] = geoListings.length
    ? [geoListings[0].latitude!, geoListings[0].longitude!]
    : [48.8566, 2.3522];

  useEffect(() => {
    // Fix leaflet icon issue - not needed with CircleMarker but keeping for reference
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={geoListings.length === 1 ? 14 : 12}
      className={className || "h-[600px] w-full rounded-xl"}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geoListings.map((listing) => (
        <CircleMarker
          key={listing.id}
          center={[listing.latitude!, listing.longitude!]}
          radius={10}
          fillColor={
            STATUS_MAP_COLORS[listing.status as ListingStatus] || "#6b7280"
          }
          fillOpacity={0.8}
          color="white"
          weight={2}
        >
          <Popup>
            <div className="min-w-[180px]">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-semibold text-sm">
                  {listing.title || "Sans titre"}
                </span>
              </div>
              <StatusBadge status={listing.status} />
              <div className="flex gap-3 mt-2 text-xs text-gray-600">
                {listing.price && (
                  <span>{listing.price.toLocaleString("fr-FR")} EUR</span>
                )}
                {listing.surface && <span>{listing.surface} m2</span>}
                {listing.rooms && <span>{listing.rooms} p.</span>}
              </div>
              {listing.address && (
                <p className="text-xs text-gray-500 mt-1">{listing.address}</p>
              )}
              <Link
                href={`/listings/${listing.id}`}
                className="text-xs text-emerald-600 hover:text-emerald-700 mt-2 block"
              >
                Voir le detail →
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
