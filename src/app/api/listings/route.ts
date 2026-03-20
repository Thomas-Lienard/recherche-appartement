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
  const body = await request.json();

  // Auto-geocode if address is present and no coordinates provided
  if (body.address && !body.latitude && !body.longitude) {
    const geo = await geocodeAddress(body.address);
    if (geo) {
      body.latitude = geo.latitude;
      body.longitude = geo.longitude;
    }
  }

  // Ensure photos is stored as JSON string
  if (Array.isArray(body.photos)) {
    body.photos = JSON.stringify(body.photos);
  }

  const listing = await prisma.listing.create({
    data: body,
  });

  return Response.json(listing, { status: 201 });
}
