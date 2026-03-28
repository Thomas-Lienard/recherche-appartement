import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { geocodeAddress } from "@/lib/geocode";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });

  if (!listing) {
    return Response.json({ error: "Annonce non trouvee" }, { status: 404 });
  }

  return Response.json(listing);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // Auto-geocode if address provided and no coordinates
  if (body.address && !body.latitude && !body.longitude) {
    const geo = await geocodeAddress(body.address);
    if (geo) {
      body.latitude = geo.latitude;
      body.longitude = geo.longitude;
    }
  }

  // Re-geocode existing listing if it has an address but missing coordinates
  if (!body.address && !body.latitude && !body.longitude) {
    const existing = await prisma.listing.findUnique({ where: { id } });
    if (existing?.address && !existing.latitude && !existing.longitude) {
      const geo = await geocodeAddress(existing.address);
      if (geo) {
        body.latitude = geo.latitude;
        body.longitude = geo.longitude;
      }
    }
  }

  if (Array.isArray(body.photos)) {
    body.photos = JSON.stringify(body.photos);
  }

  try {
    const listing = await prisma.listing.update({
      where: { id },
      data: body,
    });
    return Response.json(listing);
  } catch {
    return Response.json({ error: "Annonce non trouvee" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.listing.delete({ where: { id } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Annonce non trouvee" }, { status: 404 });
  }
}
