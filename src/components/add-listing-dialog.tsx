"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListingForm, type ListingFormData } from "./listing-form";
import { toast } from "sonner";

interface AddListingDialogProps {
  onCreated: () => void;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AddListingDialog({ onCreated }: AddListingDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"paste" | "form">("paste");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [pastedImages, setPastedImages] = useState<string[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ListingFormData>({});

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData.items;
      const imageFiles: File[] = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        const newImages = await Promise.all(imageFiles.map(fileToDataUrl));
        setPastedImages((prev) => [...prev, ...newImages]);
      }
    },
    []
  );

  const removeImage = (index: number) => {
    setPastedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExtract = async () => {
    if (!text.trim()) {
      setFormData({ photos: pastedImages.length > 0 ? pastedImages : undefined });
      setStep("form");
      return;
    }

    setExtracting(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, url: url.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur d'extraction");
        setFormData({
          url: url.trim() || undefined,
          source: "manual",
          photos: pastedImages.length > 0 ? pastedImages : undefined,
        });
      } else {
        const photos = pastedImages.length > 0 ? pastedImages : data.photos;
        setFormData({ ...data, url: url.trim() || data.url, photos });
      }
    } catch {
      toast.error("Erreur de connexion");
      setFormData({
        url: url.trim() || undefined,
        source: "manual",
        photos: pastedImages.length > 0 ? pastedImages : undefined,
      });
    } finally {
      setExtracting(false);
      setStep("form");
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur de sauvegarde");
        return;
      }
      toast.success("Annonce ajoutee !");
      setOpen(false);
      resetForm();
      onCreated();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setStep("paste");
    setText("");
    setUrl("");
    setPastedImages([]);
    setFormData({});
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger
        render={<Button />}
      >
        + Ajouter une annonce
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une annonce</DialogTitle>
        </DialogHeader>

        {step === "paste" ? (
          <div className="grid gap-4 py-4" onPaste={handlePaste}>
            <div className="grid gap-2">
              <Label htmlFor="paste-text">
                Contenu de l&apos;annonce
              </Label>
              <textarea
                id="paste-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Collez ici le texte et/ou les images de l'annonce..."
                rows={8}
                className="w-full rounded-xl border border-[#E5E5E5] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#CDEA68] focus:border-transparent resize-y"
              />
            </div>

            {pastedImages.length > 0 && (
              <div className="grid gap-2">
                <Label>Images collees ({pastedImages.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {pastedImages.map((src, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={src}
                        alt={`Image ${i + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="url">URL de l&apos;annonce (optionnel)</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.leboncoin.fr/..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExtract}
                disabled={extracting}
                className="flex-1"
              >
                {extracting
                  ? "Extraction en cours..."
                  : text.trim()
                    ? "Extraire les infos"
                    : "Saisie manuelle"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <ListingForm
              data={formData}
              onChange={setFormData}
              onSubmit={handleSubmit}
              submitLabel="Ajouter"
              loading={saving}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
