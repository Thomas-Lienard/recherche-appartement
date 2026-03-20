import { NextRequest } from "next/server";
import { geocodeAddress } from "@/lib/geocode";

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
