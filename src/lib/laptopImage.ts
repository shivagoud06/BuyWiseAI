import { Laptop } from "@/types";

export const DEFAULT_LAPTOP_FALLBACK_IMAGE = "/images/placeholder-laptop.svg";

/**
 * Universal Laptop Image Resolver
 * 
 * Provides a single, centralized source of truth for laptop product photography
 * across LaptopCard, LaptopGrid, LaptopClientDetails, FeaturedLaptops, and Compare.
 * 
 * Priority:
 * 1. Existing real product image URL / source (`laptop.image`)
 * 2. Existing real project image asset (`laptop.imageUrl`)
 * 3. Neutral professional fallback placeholder
 */
export function getLaptopImage(
  laptop?: Partial<Laptop> | { image?: string | null; imageUrl?: string | null } | null
): string {
  if (!laptop) {
    return DEFAULT_LAPTOP_FALLBACK_IMAGE;
  }

  const primaryImage = typeof laptop.image === "string" ? laptop.image.trim() : "";
  if (primaryImage.length > 0) {
    return primaryImage;
  }

  const secondaryImage = typeof laptop.imageUrl === "string" ? laptop.imageUrl.trim() : "";
  if (secondaryImage.length > 0) {
    return secondaryImage;
  }

  return DEFAULT_LAPTOP_FALLBACK_IMAGE;
}

/**
 * Generates consistent accessibility alt text for laptop images
 */
export function getLaptopImageAlt(laptop?: { brand?: string; name?: string } | null): string {
  if (!laptop) return "Laptop product photo";
  const brand = laptop.brand ? laptop.brand.trim() : "";
  const name = laptop.name ? laptop.name.trim() : "Laptop";
  return `${brand} ${name} product photo`.trim();
}
