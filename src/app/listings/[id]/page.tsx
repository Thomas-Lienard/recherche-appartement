"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/nav";
import { ListingForm, type ListingFormData } from "@/components/listing-form";
import { PhotoGallery } from "@/components/photo-gallery";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Listing extends ListingFormData {
  id: string;
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
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ListingFormData>({});
  const [saving, setSaving] = useState(false);
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
      setFormData(data);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        toast.error("Erreur de sauvegarde");
        return;
      }
      const updated = await res.json();
      setListing(updated);
      setEditing(false);
      toast.success("Annonce mise a jour !");
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <>
        <Nav />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
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
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="text-gray-600"
          >
            ← Retour
          </Button>
          <div className="flex gap-2">
            {!editing && (
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
              >
                Modifier
              </Button>
            )}
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
            >
              Supprimer
            </Button>
          </div>
        </div>

        {editing ? (
          <Card className="p-6">
            <ListingForm
              data={formData}
              onChange={setFormData}
              onSubmit={handleSave}
              submitLabel="Sauvegarder"
              loading={saving}
            />
            <Button
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setFormData(listing);
              }}
              className="mt-2"
            >
              Annuler
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Photos */}
            <div>
              <PhotoGallery photos={photos} />
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {listing.title || "Sans titre"}
                  </h1>
                  <StatusBadge status={listing.status || "Nouveau"} />
                </div>
                {listing.price && (
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {listing.price.toLocaleString("fr-FR")} EUR
                  </p>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                {listing.surface && (
                  <div>
                    <span className="text-gray-500">Surface</span>
                    <p className="font-medium">{listing.surface} m2</p>
                  </div>
                )}
                {listing.rooms && (
                  <div>
                    <span className="text-gray-500">Pieces</span>
                    <p className="font-medium">{listing.rooms}</p>
                  </div>
                )}
                {listing.source && (
                  <div>
                    <span className="text-gray-500">Source</span>
                    <p className="font-medium capitalize">{listing.source}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Ajoutee le</span>
                  <p className="font-medium">
                    {new Date(listing.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              {listing.address && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm text-gray-500">Adresse</span>
                    <p className="font-medium mt-1">{listing.address}</p>
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 mt-2"
                      >
                        Voir sur Google Maps →
                      </a>
                    )}
                  </div>
                </>
              )}

              {listing.contactEmail && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm text-gray-500">
                      Email de contact
                    </span>
                    <p className="font-medium mt-1">{listing.contactEmail}</p>
                  </div>
                </>
              )}

              {listing.description && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm text-gray-500">Description</span>
                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                      {listing.description}
                    </p>
                  </div>
                </>
              )}

              {listing.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm text-gray-500">
                      Notes personnelles
                    </span>
                    <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                      {listing.notes}
                    </p>
                  </div>
                </>
              )}

              {listing.url && (
                <>
                  <Separator />
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    Voir l&apos;annonce originale →
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
