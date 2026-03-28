export const STATUSES = [
  "Nouveau",
  "Contacte",
  "Visite programmee",
  "Visite",
  "Offre faite",
  "Refuse",
  "Accepte",
] as const;

export type ListingStatus = (typeof STATUSES)[number];

export const STATUS_COLORS: Record<ListingStatus, { bg: string; text: string }> = {
  Nouveau: { bg: "bg-blue-50", text: "text-blue-600" },
  Contacte: { bg: "bg-amber-50", text: "text-amber-600" },
  "Visite programmee": { bg: "bg-orange-50", text: "text-orange-600" },
  Visite: { bg: "bg-purple-50", text: "text-purple-600" },
  "Offre faite": { bg: "bg-indigo-50", text: "text-indigo-600" },
  Refuse: { bg: "bg-red-50", text: "text-red-500" },
  Accepte: { bg: "bg-[#CDEA68]/20", text: "text-[#5F9530]" },
};

export const STATUS_MAP_COLORS: Record<ListingStatus, string> = {
  Nouveau: "#3b82f6",
  Contacte: "#d97706",
  "Visite programmee": "#ea580c",
  Visite: "#9333ea",
  "Offre faite": "#4f46e5",
  Refuse: "#ef4444",
  Accepte: "#CDEA68",
};

export const STATUS_GROUPS: Record<string, ListingStatus[] | null> = {
  "Tous": null,
  "En cours": ["Nouveau", "Contacte", "Visite programmee"],
  "Visites": ["Visite", "Offre faite"],
  "Termines": ["Refuse", "Accepte"],
};

export const CAVE_OPTIONS = [
  { value: "non", label: "Non" },
  { value: "compris", label: "Compris" },
  { value: "en_sus", label: "En sus" },
] as const;

export const PARKING_OPTIONS = [
  { value: "non", label: "Non" },
  { value: "compris", label: "Compris" },
  { value: "en_sus", label: "En sus" },
] as const;
