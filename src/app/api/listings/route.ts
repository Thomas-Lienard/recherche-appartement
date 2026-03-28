import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { geocodeAddress } from "@/lib/geocode";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { address: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return Response.json(listings);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const ALLOWED_FIELDS = [
      "title", "price", "surface", "rooms", "address", "description",
      "photos", "status", "notes", "cave", "parking", "reference",
      "contactEmail", "url", "source",
    ] as const;

    // Only keep allowed fields with valid values
    const data: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body && body[key] != null && body[key] !== "<UNKNOWN>") {
        data[key] = body[key];
      }
    }

    // Auto-geocode if address is present
    if (data.address && typeof data.address === "string") {
      try {
        const geo = await geocodeAddress(data.address);
        if (geo) {
          data.latitude = geo.latitude;
          data.longitude = geo.longitude;
        }
      } catch {
        // Geocoding failure is non-critical, continue without coordinates
      }
    }

    // Ensure photos is stored as JSON string
    if (Array.isArray(data.photos)) {
      data.photos = JSON.stringify(data.photos);
    }

    const listing = await prisma.listing.create({
      data,
    });

    return Response.json(listing, { status: 201 });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Erreur lors de la sauvegarde" },
      { status: 500 }
    );
  }
}
