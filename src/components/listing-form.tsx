"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StatusSelect } from "@/components/status-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ListingFormData {
  title?: string;
  price?: number | null;
  surface?: number | null;
  rooms?: number | null;
  address?: string;
  description?: string;
  photos?: string[];
  contactEmail?: string;
  status?: string;
  notes?: string;
  cave?: string;
  parking?: string;
  reference?: string;
  url?: string;
  source?: string;
}

interface ListingFormProps {
  data: ListingFormData;
  onChange: (data: ListingFormData) => void;
  onSubmit: () => void;
  submitLabel?: string;
  loading?: boolean;
}

export function ListingForm({
  data,
  onChange,
  onSubmit,
  submitLabel = "Sauvegarder",
  loading = false,
}: ListingFormProps) {
  const set = (field: keyof ListingFormData, value: unknown) =>
    onChange({ ...data, [field]: value });

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          value={data.title || ""}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Appartement 3 pieces..."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Prix (EUR)</Label>
          <Input
            id="price"
            type="number"
            value={data.price ?? ""}
            onChange={(e) =>
              set("price", e.target.value ? parseFloat(e.target.value) : null)
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="surface">Surface (m2)</Label>
          <Input
            id="surface"
            type="number"
            value={data.surface ?? ""}
            onChange={(e) =>
              set("surface", e.target.value ? parseFloat(e.target.value) : null)
            }
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="rooms">Pieces</Label>
          <Input
            id="rooms"
            type="number"
            value={data.rooms ?? ""}
            onChange={(e) =>
              set("rooms", e.target.value ? parseInt(e.target.value) : null)
            }
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address">Adresse</Label>
        <Input
          id="address"
          value={data.address || ""}
          onChange={(e) => set("address", e.target.value)}
          placeholder="12 rue de la Paix, 75002 Paris"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Cave</Label>
          <Select
            value={data.cave || "non"}
            onValueChange={(v) => set("cave", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="non">Non / Non mentionne</SelectItem>
              <SelectItem value="compris">Compris</SelectItem>
              <SelectItem value="en_sus">En sus</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Parking / Garage</Label>
          <Select
            value={data.parking || "non"}
            onValueChange={(v) => set("parking", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="non">Non / Non mentionne</SelectItem>
              <SelectItem value="compris">Compris</SelectItem>
              <SelectItem value="en_sus">En sus</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="reference">Reference de l&apos;annonce</Label>
        <Input
          id="reference"
          value={data.reference || ""}
          onChange={(e) => set("reference", e.target.value)}
          placeholder="REF-12345"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="contactEmail">Email de contact</Label>
        <Input
          id="contactEmail"
          type="email"
          value={data.contactEmail || ""}
          onChange={(e) => set("contactEmail", e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="status">Statut</Label>
        <StatusSelect
          value={data.status || "Nouveau"}
          onValueChange={(v) => set("status", v)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.description || ""}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notes personnelles</Label>
        <Textarea
          id="notes"
          value={data.notes || ""}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
        />
      </div>

      <Button
        onClick={onSubmit}
        disabled={loading}
        className=""
      >
        {loading ? "Enregistrement..." : submitLabel}
      </Button>
    </div>
  );
}
