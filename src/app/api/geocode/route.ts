import { NextRequest } from "next/server";
import { geocodeAddress } from "@/lib/geocode";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { address } = await request.json();

  if (!address || typeof address !== "string") {
    return Response.json({ error: "Adresse requise" }, { status: 400 });
  }

  const result = await geocodeAddress(address);

  if (!result) {
    return Response.json({ error: "Adresse non trouvee" }, { status: 404 });
  }

  return Response.json(result);
}

// Backfill: re-geocode all listings with an address but missing coordinates
export async function PUT() {
  const listings = await prisma.listing.findMany({
    where: {
      address: { not: null },
      latitude: null,
    },
  });

  const results = [];
  for (const listing of listings) {
    const geo = await geocodeAddress(listing.address!);
    if (geo) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { latitude: geo.latitude, longitude: geo.longitude },
      });
      results.push({ id: listing.id, address: listing.address, ...geo });
    } else {
      results.push({ id: listing.id, address: listing.address, error: "not found" });
    }
  }

  return Response.json({ updated: results.filter((r) => !("error" in r)).length, results });
}
