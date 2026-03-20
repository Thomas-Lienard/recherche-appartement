import { NextRequest } from "next/server";
import { getScraperForUrl } from "@/lib/scrapers";

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url || typeof url !== "string") {
    return Response.json({ error: "URL requise" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return Response.json({ error: "URL invalide" }, { status: 400 });
  }

  const scraper = getScraperForUrl(url);

  if (!scraper) {
    return Response.json(
      { error: "Site non supporte. Sites supportes : Leboncoin, SeLoger, PAP" },
      { status: 400 }
    );
  }

  try {
    const data = await scraper.scrape(url);
    return Response.json(data);
  } catch (e) {
    return Response.json(
      { error: `Erreur lors du scraping: ${e instanceof Error ? e.message : "Erreur inconnue"}` },
      { status: 500 }
    );
  }
}
