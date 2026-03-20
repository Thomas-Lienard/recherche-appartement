import type { ScraperPlugin } from "./types";
import { leboncoinScraper } from "./leboncoin";
import { selogerScraper } from "./seloger";
import { papScraper } from "./pap";

const scrapers: ScraperPlugin[] = [
  leboncoinScraper,
  selogerScraper,
  papScraper,
];

export function getScraperForUrl(url: string): ScraperPlugin | null {
  const hostname = new URL(url).hostname;
  return scrapers.find((s) => s.hostnames.includes(hostname)) || null;
}

export type { ScrapedListing, ScraperPlugin } from "./types";
