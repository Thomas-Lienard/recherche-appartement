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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface SendEmailDialogProps {
  listing: {
    title?: string | null;
    url?: string | null;
    address?: string | null;
    contactEmail?: string | null;
    price?: number | null;
    surface?: number | null;
  };
  trigger?: React.ReactNode;
}

export function SendEmailDialog({ listing, trigger }: SendEmailDialogProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [to, setTo] = useState(listing.contactEmail || "");
  const [subject, setSubject] = useState(
    `Demande de renseignements - ${listing.title || "Annonce"}`
  );
  const [message, setMessage] = useState(
    `Bonjour,\n\nJe me permets de vous contacter au sujet de votre annonce "${listing.title || ""}".${listing.price ? `\n\nPrix indique : ${listing.price.toLocaleString("fr-FR")} EUR` : ""}${listing.surface ? `\nSurface : ${listing.surface} m2` : ""}${listing.address ? `\nAdresse : ${listing.address}` : ""}${listing.url ? `\n\nLien de l'annonce : ${listing.url}` : ""}\n\nJe souhaiterais obtenir plus d'informations et, si possible, organiser une visite.\n\nCordialement`
  );

  const handleSend = async () => {
    if (!to || !subject || !message) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de l'envoi");
        return;
      }

      toast.success("Email envoye !");
      setOpen(false);
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={trigger ? (trigger as React.ReactElement) : <Button variant="outline" size="sm" />}
      >
        {!trigger && "Envoyer un email"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Contacter le proprietaire</DialogTitle>
        </DialogHeader>

        {!session ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 mb-4">
              Connectez-vous avec Google pour envoyer des emails depuis votre
              compte Gmail.
            </p>
            <Button onClick={() => signIn("google")}>
              Se connecter avec Google
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-to">Destinataire</Label>
              <Input
                id="email-to"
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="email@exemple.com"
              />
            </div>
            <div>
              <Label htmlFor="email-subject">Objet</Label>
              <Input
                id="email-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                className="resize-y"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={sending}
              >
                Annuler
              </Button>
              <Button onClick={handleSend} disabled={sending}>
                {sending ? "Envoi..." : "Envoyer"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
