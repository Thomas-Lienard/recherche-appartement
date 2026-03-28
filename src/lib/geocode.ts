export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

async function nominatimSearch(
  query: string
): Promise<GeocodingResult | null> {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    {
      headers: {
        "User-Agent": "recherche-appartement/1.0",
      },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.length) return null;

  return {
    latitude: parseFloat(data[0].lat),
    longitude: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

function simplifyAddress(address: string): string[] {
  const variants: string[] = [];

  // Remove "Quartier X" or similar neighborhood info
  const noQuartier = address.replace(/,?\s*Quartier\s+[^,]*/gi, "").trim();
  if (noQuartier !== address) variants.push(noQuartier);

  // Keep only parts that look like street + postal code + city
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length > 2) {
    // Try first two parts (street + city/postal)
    variants.push(parts.slice(0, 2).join(", "));
    // Try first part + last part
    variants.push(`${parts[0]}, ${parts[parts.length - 1]}`);
  }

  // Try just removing commas (Nominatim sometimes handles this better)
  variants.push(address.replace(/,/g, " ").replace(/\s+/g, " ").trim());

  return variants;
}

export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  // Try the original address first
  const result = await nominatimSearch(address);
  if (result) return result;

  // Try simplified variants
  for (const variant of simplifyAddress(address)) {
    const result = await nominatimSearch(variant);
    if (result) return result;
  }

  return null;
}
