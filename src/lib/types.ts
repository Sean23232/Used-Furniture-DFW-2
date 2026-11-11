import type { CategorySlug } from "./categories";

export type ProductImage = { src: string; alt: string };
export type ProductSpec = { label: string; value: string };

export const AVAILABILITY_STATUSES = ["available", "on-hold", "sold"] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available: "Available",
  "on-hold": "On Hold",
  sold: "Sold",
};

/**
 * Consistent product data structure used across the website.
 * Content can be maintained in the `products` table without redesigning pages.
 */
export interface Product {
  /** Product ID / item number shown to customers (e.g. "UOF-1001"). */
  id: string;
  slug: string;
  name: string;
  category: CategorySlug;
  shortDescription: string;
  /** Paragraphs separated by a blank line. */
  description: string;
  /** USD. `null` renders "Contact for Pricing". */
  price: number | null;
  /** Optional qualifier such as "each" or "per workstation". */
  priceNote: string | null;
  images: ProductImage[];
  specifications: ProductSpec[];
  /** Only set once confirmed by the sales team; otherwise `null` (no label shown). */
  availability: AvailabilityStatus | null;
  featured: boolean;
  newArrival: boolean;
  isDeal: boolean;
  /** ISO date string, if supplied. */
  dateAdded: string | null;
  /** Demonstration listing (not verified business inventory). */
  isDemo: boolean;
}

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "name";
export type PricingFilter = "all" | "priced" | "contact";
