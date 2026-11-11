import { CATEGORY_SLUGS, type CategorySlug } from "./categories";
import type { PricingFilter, Product, SortKey } from "./types";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function formatPrice(value: number): string {
  return usd.format(value);
}

export function productHref(product: Pick<Product, "category" | "slug">): string {
  return `/furniture/${product.category}/${product.slug}`;
}

export function categoryHref(slug: CategorySlug): string {
  return `/furniture/${slug}`;
}

/** Contact page link that pre-fills the inquiry form with the selected item. */
export function inquireHref(product: Pick<Product, "id">): string {
  return `/contact?item=${encodeURIComponent(product.id)}#inquiry-form`;
}

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseCategoryParam(value: string | undefined): CategorySlug[] {
  if (!value) return [];
  const selected = new Set<CategorySlug>();
  for (const part of value.split(",")) {
    const slug = part.trim().toLowerCase();
    if ((CATEGORY_SLUGS as readonly string[]).includes(slug)) selected.add(slug as CategorySlug);
  }
  return Array.from(selected);
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Lowest price" },
  { value: "price-desc", label: "Highest price" },
  { value: "name", label: "Name A–Z" },
];

export function parseSort(value: string | undefined): SortKey {
  return SORT_OPTIONS.some((option) => option.value === value) ? (value as SortKey) : "featured";
}

export function parsePricing(value: string | undefined): PricingFilter {
  return value === "priced" || value === "contact" ? value : "all";
}

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const addedTime = (product: Product) => (product.dateAdded ? Date.parse(product.dateAdded) : 0);

function comparePrice(a: Product, b: Product, direction: 1 | -1): number {
  if (a.price === null && b.price === null) return a.name.localeCompare(b.name);
  if (a.price === null) return 1;
  if (b.price === null) return -1;
  return (a.price - b.price) * direction || a.name.localeCompare(b.name);
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const items = [...list];
  switch (sort) {
    case "newest":
      return items.sort((a, b) => addedTime(b) - addedTime(a) || a.name.localeCompare(b.name));
    case "price-asc":
      return items.sort((a, b) => comparePrice(a, b, 1));
    case "price-desc":
      return items.sort((a, b) => comparePrice(a, b, -1));
    case "name":
      return items.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return items.sort(
        (a, b) => Number(b.featured) - Number(a.featured) || addedTime(b) - addedTime(a) || a.name.localeCompare(b.name),
      );
  }
}

export function countByCategory(list: Product[]): Record<CategorySlug, number> {
  const counts = Object.fromEntries(CATEGORY_SLUGS.map((slug) => [slug, 0])) as Record<CategorySlug, number>;
  for (const product of list) counts[product.category] += 1;
  return counts;
}

/** Trims a product to the fields needed for listing cards (smaller client payloads). */
export function toListing(product: Product): Product {
  return { ...product, description: "", specifications: [], images: product.images.slice(0, 1) };
}

export function descriptionParagraphs(description: string): string[] {
  return description
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
