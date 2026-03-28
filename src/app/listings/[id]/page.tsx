"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { EditableField } from "@/components/editable-field";
import { PhotoGallery } from "@/components/photo-gallery";
import { StatusBadge } from "@/components/status-badge";
import { SendEmailDialog } from "@/components/send-email-dialog";
import { ScheduleVisitDialog } from "@/components/schedule-visit-dialog";
import { Button } from "@/components/ui/button";
import { STATUSES, CAVE_OPTIONS, PARKING_OPTIONS } from "@/lib/constants";
import { toast } from "sonner";

interface Listing {
  id: string;
  title?: string | null;
  price?: number | null;
  surface?: number | null;
  rooms?: number | null;
  address?: string | null;
  description?: string | null;
  notes?: string | null;
  contactEmail?: string | null;
  status?: string;
  cave?: string;
  parking?: string;
  reference?: string | null;
  url?: string | null;
  source?: string | null;
  photos?: string | string[];
  latitude?: number | null;
  longitude?: number | null;
  visitDate?: string | null;
  calendarEventId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchListing = useCallback(async () => {
    try {
      const res = await fetch(`/api/listings/${id}`);
      if (!res.ok) {
        router.push("/");
        return;
      }
      const data = await res.json();
      setListing(data);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const handleDelete = async () => {
    if (!confirm("Supprimer cette annonce ?")) return;
    try {
      await fetch(`/api/listings/${id}`, { method: "DELETE" });
      toast.success("Annonce supprimee");
      router.push("/");
    } catch {
      toast.error("Erreur");
    }
  };

  const handleFieldSaved = (field: string, newValue: string | number | null) => {
    if (listing) {
      setListing({ ...listing, [field]: newValue });
    }
  };

  if (loading) {
    return (
      <>
        <Nav />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E5E5] border-t-[#CDEA68]" />
        </div>
      </>
    );
  }

  if (!listing) return null;

  const photos: string[] = (() => {
    try {
      return typeof listing.photos === "string"
        ? JSON.parse(listing.photos)
        : listing.photos || [];
    } catch {
      return [];
    }
  })();

  const mapsUrl = listing.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`
    : null;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 flex-1">
        {/* Actions bar */}
        <div className="flex items-center justify-end mb-6">
          <Button
            variant="outline"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
            onClick={handleDelete}
          >
            Supprimer
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Photos */}
          <div>
            <PhotoGallery
              photos={photos}
              listingId={id}
              onPhotosChange={(newPhotos) =>
                setListing({ ...listing, photos: JSON.stringify(newPhotos) })
              }
            />
          </div>

          {/* Info */}
          <div className="space-y-5">
            {/* Title + Status */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <EditableField
                  value={listing.title}
                  field="title"
                  listingId={id}
                  type="text"
                  displayClassName="text-2xl font-bold text-[#1A1A1A]"
                  onSaved={(v) => handleFieldSaved("title", v)}
                />
                <EditableField
                  value={listing.status || "Nouveau"}
                  field="status"
                  listingId={id}
                  type="select"
                  options={STATUSES.map((s) => ({ value: s, label: s }))}
                  onSaved={(v) => handleFieldSaved("status", v)}
                />
              </div>
              <div className="mt-3">
                <EditableField
                  value={listing.price}
                  field="price"
                  listingId={id}
                  type="number"
                  suffix=" €"
                  displayClassName="text-3xl font-bold text-[#5F9530]"
                  onSaved={(v) => handleFieldSaved("price", v)}
                />
              </div>
            </div>

            {/* Details grid */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  value={listing.surface}
                  field="surface"
                  listingId={id}
                  type="number"
                  suffix=" m²"
                  label="Surface"
                  onSaved={(v) => handleFieldSaved("surface", v)}
                />
                <EditableField
                  value={listing.rooms}
                  field="rooms"
                  listingId={id}
                  type="number"
                  label="Pieces"
                  onSaved={(v) => handleFieldSaved("rooms", v)}
                />
                <EditableField
                  value={listing.cave || "non"}
                  field="cave"
                  listingId={id}
                  type="select"
                  options={CAVE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  label="Cave"
                  onSaved={(v) => handleFieldSaved("cave", v)}
                />
                <EditableField
                  value={listing.parking || "non"}
                  field="parking"
                  listingId={id}
                  type="select"
                  options={PARKING_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  label="Parking"
                  onSaved={(v) => handleFieldSaved("parking", v)}
                />
                <EditableField
                  value={listing.reference}
                  field="reference"
                  listingId={id}
                  type="text"
                  label="Reference"
                  onSaved={(v) => handleFieldSaved("reference", v)}
                />
                {listing.source && (
                  <div>
                    <span className="text-xs text-[#8A8A8A]">Source</span>
                    <p className="font-medium capitalize">{listing.source}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-[#8A8A8A]">Ajoutee le</span>
                  <p className="font-medium">
                    {new Date(listing.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <EditableField
                value={listing.address}
                field="address"
                listingId={id}
                type="text"
                label="Adresse"
                onSaved={(v) => handleFieldSaved("address", v)}
              />
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#5F9530] hover:text-[#4A7A25] mt-2"
                >
                  Voir sur Google Maps →
                </a>
              )}
            </div>

            {/* Contact email */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <EditableField
                value={listing.contactEmail}
                field="contactEmail"
                listingId={id}
                type="text"
                label="Email de contact"
                onSaved={(v) => handleFieldSaved("contactEmail", v)}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <SendEmailDialog listing={listing} />
              <ScheduleVisitDialog
                listing={{ id: listing.id, title: listing.title, address: listing.address }}
                onScheduled={fetchListing}
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <EditableField
                value={listing.description}
                field="description"
                listingId={id}
                type="textarea"
                label="Description"
                onSaved={(v) => handleFieldSaved("description", v)}
              />
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <EditableField
                value={listing.notes}
                field="notes"
                listingId={id}
                type="textarea"
                label="Notes personnelles"
                onSaved={(v) => handleFieldSaved("notes", v)}
              />
            </div>

            {/* Original listing link */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <EditableField
                value={listing.url}
                field="url"
                listingId={id}
                type="text"
                label="URL de l'annonce"
                onSaved={(v) => handleFieldSaved("url", v)}
              />
              {listing.url && (
                <a
                  href={listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[#5F9530] hover:text-[#4A7A25] mt-2"
                >
                  Voir l&apos;annonce originale →
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
