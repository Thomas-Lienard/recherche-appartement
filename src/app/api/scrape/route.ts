import { NextRequest } from "next/server";
import { extractListing } from "@/lib/scrapers/llm-extract";

export async function POST(request: NextRequest) {
  const { text, url } = await request.json();

  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return Response.json(
      { error: "Collez le contenu de l'annonce (minimum 10 caracteres)" },
      { status: 400 }
    );
  }

  try {
    const data = await extractListing(text);
    if (url) data.url = url;
    if (url) {
      try {
        data.source = new URL(url).hostname.replace("www.", "");
      } catch {
        // ignore invalid url
      }
    }
    return Response.json(data);
  } catch (e) {
    return Response.json(
      {
        error: `Erreur lors de l'extraction: ${e instanceof Error ? e.message : "Erreur inconnue"}`,
      },
      { status: 500 }
    );
  }
}
