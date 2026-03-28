export interface ScrapedListing {
  title?: string;
  price?: number;
  surface?: number;
  rooms?: number;
  address?: string;
  description?: string;
  photos?: string[];
  cave?: string;
  parking?: string;
  contactEmail?: string;
  reference?: string;
  source?: string;
  url?: string;
}

export interface ScraperPlugin {
  name: string;
  hostnames: string[];
  scrape(url: string): Promise<ScrapedListing>;
}
