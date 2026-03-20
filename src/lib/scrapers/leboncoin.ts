import * as cheerio from "cheerio";
import type { ScraperPlugin, ScrapedListing } from "./types";

export const leboncoinScraper: ScraperPlugin = {
  name: "leboncoin",
  hostnames: ["www.leboncoin.fr", "leboncoin.fr"],

  async scrape(url: string): Promise<ScrapedListing> {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const result: ScrapedListing = { source: "leboncoin" };

    // Try JSON-LD first
    const jsonLd = $('script[type="application/ld+json"]').first().html();
    if (jsonLd) {
      try {
        const data = JSON.parse(jsonLd);
        if (data["@type"] === "Product" || data["@type"] === "Residence") {
          result.title = data.name;
          result.description = data.description;
          if (data.offers?.price) result.price = parseFloat(data.offers.price);
          if (data.image) {
            result.photos = Array.isArray(data.image)
              ? data.image
              : [data.image];
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    // Try __NEXT_DATA__
    const nextDataScript = $("#__NEXT_DATA__").html();
    if (nextDataScript) {
      try {
        const nextData = JSON.parse(nextDataScript);
        const ad = nextData?.props?.pageProps?.ad;
        if (ad) {
          result.title = result.title || ad.subject;
          result.description = result.description || ad.body;
          result.price = result.price || ad.price?.[0];
          result.photos =
            result.photos ||
            ad.images?.urls_large ||
            ad.images?.urls ||
            [];
          const attrs = ad.attributes || [];
          for (const attr of attrs) {
            if (attr.key === "square" && attr.value)
              result.surface = parseFloat(attr.value);
            if (attr.key === "rooms" && attr.value)
              result.rooms = parseInt(attr.value);
          }
          if (ad.location) {
            const parts = [
              ad.location.address,
              ad.location.zipcode,
              ad.location.city,
            ].filter(Boolean);
            result.address = parts.join(", ");
          }
        }
      } catch {
        // ignore
      }
    }

    // Fallback: HTML scraping
    if (!result.title) {
      result.title =
        $("h1").first().text().trim() ||
        $('[data-qa-id="adview_title"]').text().trim();
    }
    if (!result.price) {
      const priceText =
        $('[data-qa-id="adview_price"]').text() ||
        $('[class*="Price"]').first().text();
      const priceMatch = priceText.replace(/\s/g, "").match(/(\d+)/);
      if (priceMatch) result.price = parseInt(priceMatch[1]);
    }

    return result;
  },
};
