"use client";

import { useState } from "react";
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

export function AddListingDialog({ onCreated }: AddListingDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"url" | "form">("url");
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ListingFormData>({});

  const handleScrape = async () => {
    if (!url.trim()) {
      setStep("form");
      return;
    }

    setScraping(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur de scraping");
        // Still allow manual entry
        setFormData({ url, source: "manual" });
      } else {
        setFormData({ ...data, url });
      }
    } catch {
      toast.error("Erreur de connexion");
      setFormData({ url, source: "manual" });
    } finally {
      setScraping(false);
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
    setStep("url");
    setUrl("");
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
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
          + Ajouter une annonce
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une annonce</DialogTitle>
        </DialogHeader>

        {step === "url" ? (
          <div className="grid gap-4 py-4">
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
                onClick={handleScrape}
                disabled={scraping}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
              >
                {scraping
                  ? "Scraping en cours..."
                  : url.trim()
                    ? "Scraper et pre-remplir"
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
