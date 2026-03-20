"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ScheduleVisitDialogProps {
  listing: {
    id: string;
    title?: string | null;
    address?: string | null;
  };
  trigger?: React.ReactNode;
  onScheduled?: () => void;
}

export function ScheduleVisitDialog({
  listing,
  trigger,
  onScheduled,
}: ScheduleVisitDialogProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("60");
  const [reminder, setReminder] = useState("30");

  const handleSchedule = async () => {
    if (!date || !time) {
      toast.error("Veuillez choisir une date et une heure");
      return;
    }

    const startDateTime = new Date(`${date}T${time}:00`).toISOString();

    setScheduling(true);
    try {
      const res = await fetch("/api/calendar/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: listing.id,
          startDateTime,
          durationMinutes: parseInt(duration),
          reminderMinutes: parseInt(reminder),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la planification");
        return;
      }

      toast.success("Visite programmee et ajoutee a Google Calendar !");
      setOpen(false);
      onScheduled?.();
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setScheduling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={trigger ? (trigger as React.ReactElement) : <Button variant="outline" size="sm" />}
      >
        {!trigger && "Planifier une visite"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Planifier une visite</DialogTitle>
        </DialogHeader>

        {!session ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 mb-4">
              Connectez-vous avec Google pour ajouter la visite a votre agenda.
            </p>
            <Button onClick={() => signIn("google")}>
              Se connecter avec Google
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-900">
                {listing.title || "Appartement"}
              </p>
              {listing.address && (
                <p className="text-xs text-gray-500 mt-1">{listing.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visit-date">Date</Label>
                <Input
                  id="visit-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="visit-time">Heure</Label>
                <Input
                  id="visit-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visit-duration">Duree</Label>
                <Select value={duration} onValueChange={(v) => v && setDuration(v)}>
                  <SelectTrigger id="visit-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">1h</SelectItem>
                    <SelectItem value="90">1h30</SelectItem>
                    <SelectItem value="120">2h</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="visit-reminder">Rappel</Label>
                <Select value={reminder} onValueChange={(v) => v && setReminder(v)}>
                  <SelectTrigger id="visit-reminder">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 min avant</SelectItem>
                    <SelectItem value="30">30 min avant</SelectItem>
                    <SelectItem value="60">1h avant</SelectItem>
                    <SelectItem value="120">2h avant</SelectItem>
                    <SelectItem value="1440">1 jour avant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={scheduling}
              >
                Annuler
              </Button>
              <Button onClick={handleSchedule} disabled={scheduling}>
                {scheduling ? "Planification..." : "Planifier la visite"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
