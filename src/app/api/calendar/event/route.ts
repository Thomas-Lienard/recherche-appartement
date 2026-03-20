import { auth } from "@/lib/auth";
import { createCalendarEvent } from "@/lib/google";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.accessToken) {
    return Response.json(
      { error: "Non connecte. Veuillez vous connecter avec Google." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { listingId, startDateTime, durationMinutes, reminderMinutes } = body;

  if (!listingId || !startDateTime) {
    return Response.json(
      { error: "Champs requis : listingId, startDateTime" },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) {
    return Response.json({ error: "Annonce introuvable" }, { status: 404 });
  }

  try {
    const event = await createCalendarEvent(session.accessToken, {
      summary: `Visite : ${listing.title || "Appartement"}`,
      description: [
        listing.url ? `Annonce : ${listing.url}` : "",
        listing.price ? `Prix : ${listing.price.toLocaleString("fr-FR")} EUR` : "",
        listing.surface ? `Surface : ${listing.surface} m2` : "",
        listing.rooms ? `Pieces : ${listing.rooms}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      location: listing.address || undefined,
      startDateTime,
      durationMinutes: durationMinutes || 60,
      reminderMinutes: reminderMinutes || 30,
    });

    // Save calendar event ID and visit date to the listing
    await prisma.listing.update({
      where: { id: listingId },
      data: {
        calendarEventId: event.id,
        visitDate: new Date(startDateTime),
        status: "Visite programmee",
      },
    });

    return Response.json({ success: true, eventId: event.id });
  } catch (error) {
    console.error("Erreur creation evenement:", error);
    return Response.json(
      { error: "Erreur lors de la creation de l'evenement. Verifiez vos permissions Google." },
      { status: 500 }
    );
  }
}
