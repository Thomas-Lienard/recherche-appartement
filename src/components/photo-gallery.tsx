"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PhotoGalleryProps {
  photos: string[];
  listingId?: string;
  onPhotosChange?: (photos: string[]) => void;
}

export function PhotoGallery({ photos, listingId, onPhotosChange }: PhotoGalleryProps) {
  const [selected, setSelected] = useState(0);
  const [adding, setAdding] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const editable = !!listingId && !!onPhotosChange;

  async function savePhotos(newPhotos: string[]) {
    if (!listingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: newPhotos }),
      });
      if (!res.ok) throw new Error();
      onPhotosChange?.(newPhotos);
    } catch {
      toast.error("Erreur lors de la sauvegarde des photos");
    } finally {
      setSaving(false);
    }
  }

  function handleAddUrl() {
    const url = urlInput.trim();
    if (!url) return;
    const newPhotos = [...photos, url];
    savePhotos(newPhotos);
    setUrlInput("");
    setAdding(false);
    setSelected(newPhotos.length - 1);
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          const newPhotos = [...photos, dataUrl];
          savePhotos(newPhotos);
          setUrlInput("");
          setAdding(false);
          setSelected(newPhotos.length - 1);
        };
        reader.readAsDataURL(file);
        return;
      }
    }
  }

  function handleRemove(index: number) {
    const newPhotos = photos.filter((_, i) => i !== index);
    savePhotos(newPhotos);
    if (selected >= newPhotos.length) {
      setSelected(Math.max(0, newPhotos.length - 1));
    }
  }

  if (!photos.length) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center h-64 rounded-2xl bg-[#F0F0F0] text-[#8A8A8A]">
          Aucune photo
        </div>
        {editable && (
          <AddPhotoControls
            adding={adding}
            setAdding={setAdding}
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            onAddUrl={handleAddUrl}
            onPaste={handlePaste}
            inputRef={inputRef}
            saving={saving}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#F0F0F0]">
        <Image
          src={photos[selected]}
          alt={`Photo ${selected + 1}`}
          fill
          className="object-cover"
          unoptimized
        />
        {editable && (
          <button
            onClick={() => handleRemove(selected)}
            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white text-sm hover:bg-black/70 transition-colors"
            title="Supprimer cette photo"
          >
            ×
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
              i === selected
                ? "border-[#CDEA68]"
                : "border-transparent hover:border-[#E5E5E5]"
            }`}
          >
            <Image
              src={photo}
              alt={`Thumb ${i + 1}`}
              fill
              className="object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>
      {editable && (
        <AddPhotoControls
          adding={adding}
          setAdding={setAdding}
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          onAddUrl={handleAddUrl}
          onPaste={handlePaste}
          inputRef={inputRef}
          saving={saving}
        />
      )}
    </div>
  );
}

function AddPhotoControls({
  adding,
  setAdding,
  urlInput,
  setUrlInput,
  onAddUrl,
  onPaste,
  inputRef,
  saving,
}: {
  adding: boolean;
  setAdding: (v: boolean) => void;
  urlInput: string;
  setUrlInput: (v: string) => void;
  onAddUrl: () => void;
  onPaste: (e: React.ClipboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  saving: boolean;
}) {
  if (!adding) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setAdding(true)}
        disabled={saving}
      >
        {saving ? (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent mr-2" />
        ) : null}
        + Ajouter une photo
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Coller une URL ou une image..."
        value={urlInput}
        onChange={(e) => setUrlInput(e.target.value)}
        onPaste={onPaste}
        onKeyDown={(e) => {
          if (e.key === "Enter") onAddUrl();
          if (e.key === "Escape") setAdding(false);
        }}
        className="text-sm"
        autoFocus
      />
      <Button size="sm" onClick={onAddUrl} disabled={!urlInput.trim() || saving}>
        OK
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
        ✕
      </Button>
    </div>
  );
}
