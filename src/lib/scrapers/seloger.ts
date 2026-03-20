import * as cheerio from "cheerio";
import type { ScraperPlugin, ScrapedListing } from "./types";

export const selogerScraper: ScraperPlugin = {
  name: "seloger",
  hostnames: ["www.seloger.com", "seloger.com"],

  async scrape(url: string): Promise<ScrapedListing> {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const result: ScrapedListing = { source: "seloger" };

    // Try JSON-LD
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || "");
        if (
          data["@type"] === "Residence" ||
          data["@type"] === "Apartment" ||
          data["@type"] === "SingleFamilyResidence"
        ) {
          result.title = data.name;
          result.description = data.description;
          if (data.floorSize?.value)
            result.surface = parseFloat(data.floorSize.value);
          if (data.numberOfRooms) result.rooms = parseInt(data.numberOfRooms);
          if (data.address) {
            const addr = data.address;
            result.address = [
              addr.streetAddress,
              addr.postalCode,
              addr.addressLocality,
            ]
              .filter(Boolean)
              .join(", ");
          }
          if (data.image) {
            result.photos = Array.isArray(data.image)
              ? data.image
              : [data.image];
          }
        }
      } catch {
        // ignore
      }
    });

    // Fallback HTML
    if (!result.title) {
      result.title =
        $("h1").first().text().trim() ||
        $('[class*="Title"]').first().text().trim();
    }
    if (!result.price) {
      const priceText =
        $('[data-test="price"]').text() ||
        $('[class*="price"]').first().text();
      const match = priceText.replace(/\s/g, "").match(/(\d+)/);
      if (match) result.price = parseInt(match[1]);
    }
    if (!result.surface) {
      const surfText = $('[class*="surface"]').first().text();
      const match = surfText.replace(/\s/g, "").match(/([\d,]+)/);
      if (match) result.surface = parseFloat(match[1].replace(",", "."));
    }
    if (!result.address) {
      result.address = $('[class*="locality"]').first().text().trim();
    }

    // Photos from image carousel
    if (!result.photos?.length) {
      const photos: string[] = [];
      $("img[src*='photo'], img[src*='image']").each((_, el) => {
        const src = $(el).attr("src");
        if (src && !src.includes("logo")) photos.push(src);
      });
      if (photos.length) result.photos = photos;
    }

    return result;
  },
};
