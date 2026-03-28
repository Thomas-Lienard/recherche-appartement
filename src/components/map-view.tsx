"use client";

import { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
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

export interface MapViewProps {
  listings: MapListing[];
  className?: string;
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
  centerOnId?: string | null;
}

function AutoFitBounds({ listings }: { listings: MapListing[] }) {
  const map = useMap();
  const geoListings = useMemo(
    () => listings.filter((l) => l.latitude && l.longitude),
    [listings]
  );

  useEffect(() => {
    // Leaflet needs a valid container size before fitting bounds
    map.invalidateSize();

    if (geoListings.length === 0) return;
    if (geoListings.length === 1) {
      map.setView(
        [geoListings[0].latitude!, geoListings[0].longitude!],
        14
      );
      return;
    }
    const bounds = L.latLngBounds(
      geoListings.map((l) => [l.latitude!, l.longitude!] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, geoListings]);

  // Also handle resize/visibility changes
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (map.getContainer()) {
      observer.observe(map.getContainer());
    }
    return () => observer.disconnect();
  }, [map]);

  return null;
}

function MapController({ listings, centerOnId }: { listings: MapListing[]; centerOnId?: string | null }) {
  const map = useMap();

  useEffect(() => {
    if (!centerOnId) return;
    const listing = listings.find((l) => l.id === centerOnId);
    if (listing?.latitude && listing?.longitude) {
      map.flyTo([listing.latitude, listing.longitude], 15, { duration: 0.5 });
    }
  }, [map, centerOnId, listings]);

  return null;
}

export function MapViewInner({ listings, className, selectedId, onMarkerClick, centerOnId }: MapViewProps) {
  const geoListings = listings.filter((l) => l.latitude && l.longitude);

  const center: [number, number] = useMemo(() => {
    if (geoListings.length === 0) return [48.8566, 2.3522];
    const sumLat = geoListings.reduce((s, l) => s + l.latitude!, 0);
    const sumLng = geoListings.reduce((s, l) => s + l.longitude!, 0);
    return [sumLat / geoListings.length, sumLng / geoListings.length];
  }, [geoListings]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      className={className || "h-full w-full"}
      scrollWheelZoom={true}
    >
      <AutoFitBounds listings={listings} />
      <MapController listings={listings} centerOnId={centerOnId} />
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {geoListings.map((listing) => {
        const isSelected = listing.id === selectedId;
        return (
          <CircleMarker
            key={listing.id}
            center={[listing.latitude!, listing.longitude!]}
            radius={isSelected ? 14 : 10}
            fillColor={
              isSelected
                ? "#CDEA68"
                : STATUS_MAP_COLORS[listing.status as ListingStatus] || "#6b7280"
            }
            fillOpacity={isSelected ? 1 : 0.8}
            color={isSelected ? "#1A1A1A" : "white"}
            weight={isSelected ? 3 : 2}
            eventHandlers={{
              click: () => onMarkerClick?.(listing.id),
            }}
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
                  className="text-xs text-[#5F9530] hover:text-[#4A7A25] mt-2 block"
                >
                  Voir le detail →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
