export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  const params = new URLSearchParams({
    q: address,
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
