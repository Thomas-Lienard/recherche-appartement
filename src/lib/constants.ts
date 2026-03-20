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
  Nouveau: { bg: "bg-blue-100", text: "text-blue-700" },
  Contacte: { bg: "bg-yellow-100", text: "text-yellow-700" },
  "Visite programmee": { bg: "bg-orange-100", text: "text-orange-700" },
  Visite: { bg: "bg-purple-100", text: "text-purple-700" },
  "Offre faite": { bg: "bg-indigo-100", text: "text-indigo-700" },
  Refuse: { bg: "bg-red-100", text: "text-red-700" },
  Accepte: { bg: "bg-emerald-100", text: "text-emerald-700" },
};

export const STATUS_MAP_COLORS: Record<ListingStatus, string> = {
  Nouveau: "#3b82f6",
  Contacte: "#eab308",
  "Visite programmee": "#f97316",
  Visite: "#a855f7",
  "Offre faite": "#6366f1",
  Refuse: "#ef4444",
  Accepte: "#10b981",
};
