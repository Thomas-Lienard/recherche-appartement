import * as cheerio from "cheerio";
import type { ScraperPlugin, ScrapedListing } from "./types";

export const papScraper: ScraperPlugin = {
  name: "pap",
  hostnames: ["www.pap.fr", "pap.fr"],

  async scrape(url: string): Promise<ScrapedListing> {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const result: ScrapedListing = { source: "pap" };

    // JSON-LD
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const data = JSON.parse($(el).html() || "");
        if (
          data["@type"] === "Residence" ||
          data["@type"] === "Apartment" ||
          data["@type"] === "Product"
        ) {
          result.title = data.name;
          result.description = data.description;
          if (data.offers?.price) result.price = parseFloat(data.offers.price);
          if (data.floorSize?.value)
            result.surface = parseFloat(data.floorSize.value);
          if (data.address) {
            result.address = [
              data.address.streetAddress,
              data.address.postalCode,
              data.address.addressLocality,
            ]
              .filter(Boolean)
              .join(", ");
          }
        }
      } catch {
        // ignore
      }
    });

    // HTML fallback
    if (!result.title) {
      result.title =
        $("h1").first().text().trim() ||
        $(".item-title").text().trim();
    }
    if (!result.price) {
      const priceText =
        $(".item-price").text() || $('[class*="price"]').first().text();
      const match = priceText.replace(/\s/g, "").match(/(\d+)/);
      if (match) result.price = parseInt(match[1]);
    }
    if (!result.surface) {
      const surfText = $(".item-tags li")
        .filter((_, el) => $(el).text().includes("m²"))
        .first()
        .text();
      const match = surfText.replace(/\s/g, "").match(/([\d,]+)/);
      if (match) result.surface = parseFloat(match[1].replace(",", "."));
    }
    if (!result.rooms) {
      const roomText = $(".item-tags li")
        .filter((_, el) => $(el).text().includes("pièce"))
        .first()
        .text();
      const match = roomText.match(/(\d+)/);
      if (match) result.rooms = parseInt(match[1]);
    }
    if (!result.address) {
      result.address = $(".item-description h2").first().text().trim();
    }
    if (!result.description) {
      result.description = $(".item-description p").first().text().trim();
    }

    // Photos
    if (!result.photos?.length) {
      const photos: string[] = [];
      $(".owl-item img, .gallery img").each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("data-src");
        if (src) photos.push(src);
      });
      if (photos.length) result.photos = photos;
    }

    return result;
  },
};
