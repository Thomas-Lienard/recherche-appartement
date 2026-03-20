export interface ScrapedListing {
  title?: string;
  price?: number;
  surface?: number;
  rooms?: number;
  address?: string;
  description?: string;
  photos?: string[];
  contactEmail?: string;
  source?: string;
}

export interface ScraperPlugin {
  name: string;
  hostnames: string[];
  scrape(url: string): Promise<ScrapedListing>;
}
