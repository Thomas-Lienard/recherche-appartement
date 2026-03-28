import Anthropic from "@anthropic-ai/sdk";
import type { ScrapedListing } from "./types";

let _client: Anthropic | null = null;
function getClient() {
  if (!_client) _client = new Anthropic();
  return _client;
}

const SYSTEM_PROMPT = `Tu es un extracteur de donnees immobilieres. A partir du contenu d'une page d'annonce immobiliere, extrais les informations structurees en utilisant l'outil extract_listing.

Regles:
- Extrais uniquement ce qui est explicitement present sur la page.
- Ne devine pas les valeurs manquantes.
- Le prix doit etre un nombre entier en euros (sans symbole).
- La surface doit etre en m2.
- Les photos doivent etre des URLs completes d'images du bien (pas les logos, icones ou placeholders).
- L'adresse doit etre aussi complete que possible (rue, code postal, ville).`;

const EXTRACT_TOOL: Anthropic.Tool = {
  name: "extract_listing",
  description:
    "Extraire les informations structurees d'une annonce immobiliere",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string", description: "Titre de l'annonce" },
      price: {
        type: "number",
        description: "Prix en euros (nombre entier, sans symbole)",
      },
      surface: { type: "number", description: "Surface en m2" },
      rooms: { type: "integer", description: "Nombre de pieces" },
      address: {
        type: "string",
        description: "Adresse complete (rue, code postal, ville)",
      },
      description: {
        type: "string",
        description: "Description de l'annonce (max 500 caracteres)",
      },
      photos: {
        type: "array",
        items: { type: "string" },
        description: "URLs des images du bien",
      },
      cave: {
        type: "string",
        enum: ["compris", "en_sus", "non"],
        description:
          "Cave: 'compris' si incluse dans le prix, 'en_sus' si disponible en supplement, 'non' si pas de cave ou non mentionne",
      },
      parking: {
        type: "string",
        enum: ["compris", "en_sus", "non"],
        description:
          "Parking/garage: 'compris' si inclus dans le prix, 'en_sus' si disponible en supplement ou en option, 'non' si pas de parking ou non mentionne",
      },
      reference: {
        type: "string",
        description:
          "Reference ou numero de l'annonce si visible (ex: REF-12345, N°123456)",
      },
      contactEmail: {
        type: "string",
        description: "Email de contact si visible",
      },
    },
  },
};

export async function extractListing(
  textContent: string,
): Promise<ScrapedListing> {
  const response = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: "tool", name: "extract_listing" },
    messages: [
      {
        role: "user",
        content: `Voici le contenu copie-colle d'une annonce immobiliere:\n\n${textContent}`,
      },
    ],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a tool_use response");
  }

  return toolUse.input as ScrapedListing;
}
