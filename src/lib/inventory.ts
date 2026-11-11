import { cache } from "react";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products as productsTable } from "@/db/schema";
import { DEMO_INVENTORY } from "@/data/demo-inventory";
import snapshotData from "@/data/inventory-snapshot.json";
import { isCategorySlug } from "./categories";
import { scheduleLiveInventoryRefresh } from "./inventory-live";
import { AVAILABILITY_STATUSES, type AvailabilityStatus, type Product } from "./types";
import { sortProducts } from "./utils";

type ProductRow = typeof productsTable.$inferSelect;
type ProductInsert = typeof productsTable.$inferInsert;
type SeedProduct = Product & { sourceId?: number | null };

/** Current inventory snapshot written by scripts/sync-inventory.mjs (verified listings). */
const SNAPSHOT = (snapshotData as unknown as SeedProduct[]).filter((product) => isCategorySlug(product.category));
/** Used to seed an empty database: real inventory when available, otherwise demonstration listings. */
const SEED_INVENTORY: SeedProduct[] = SNAPSHOT.length > 0 ? SNAPSHOT : DEMO_INVENTORY;

function isAvailability(value: string | null): value is AvailabilityStatus {
  return value !== null && (AVAILABILITY_STATUSES as readonly string[]).includes(value);
}

function rowToProduct(row: ProductRow): Product | null {
  if (!isCategorySlug(row.category)) return null;
  return {
    id: row.productCode,
    slug: row.slug,
    name: row.name,
    category: row.category,
    shortDescription: row.shortDescription,
    description: row.description,
    price: row.priceUsd,
    priceNote: row.priceNote,
    images: Array.isArray(row.images) ? row.images : [],
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    availability: isAvailability(row.availability) ? row.availability : null,
    featured: row.featured,
    newArrival: row.newArrival,
    isDeal: row.isDeal,
    dateAdded: row.dateAdded ? row.dateAdded.toISOString() : null,
    isDemo: row.isDemo,
  };
}

function productToInsert(product: SeedProduct): ProductInsert {
  return {
    productCode: product.id,
    sourceId: product.sourceId ?? null,
    slug: product.slug,
    name: product.name,
    category: product.category,
    shortDescription: product.shortDescription,
    description: product.description,
    priceUsd: product.price,
    priceNote: product.priceNote,
    images: product.images,
    specifications: product.specifications,
    availability: product.availability,
    featured: product.featured,
    newArrival: product.newArrival,
    isDeal: product.isDeal,
    isDemo: product.isDemo,
    published: true,
    dateAdded: product.dateAdded ? new Date(product.dateAdded) : null,
  };
}

let seeding: Promise<void> | null = null;

/** Seeds the inventory snapshot (or demo listings) when the products table is empty. */
function ensureInventory(): Promise<void> {
  if (process.env.SEED_INVENTORY === "false") return Promise.resolve();
  if (!seeding) {
    seeding = (async () => {
      const [result] = await db.select({ count: sql<number>`count(*)::int` }).from(productsTable);
      if ((result?.count ?? 0) > 0) return;
      await db.insert(productsTable).values(SEED_INVENTORY.map(productToInsert)).onConflictDoNothing();
      console.info(
        `[inventory] Seeded ${SEED_INVENTORY.length} ${SNAPSHOT.length > 0 ? "inventory" : "demonstration"} listings.`,
      );
    })().catch((error) => {
      seeding = null;
      throw error;
    });
  }
  return seeding;
}

/** All published listings (deduplicated per request). */
export const getAllProducts = cache(async (): Promise<Product[]> => {
  try {
    await ensureInventory();
    const rows = await db.select().from(productsTable).where(eq(productsTable.published, true));
    scheduleLiveInventoryRefresh();
    const list = rows.map(rowToProduct).filter((product): product is Product => product !== null);
    return sortProducts(list, "featured");
  } catch (error) {
    console.error("[inventory] Database unavailable — serving the bundled inventory snapshot.", error);
    return sortProducts(SEED_INVENTORY, "featured");
  }
});

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return (await getAllProducts()).find((product) => product.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const needle = id.trim().toUpperCase();
  if (!needle) return null;
  return (await getAllProducts()).find((product) => product.id.toUpperCase() === needle) ?? null;
}

export async function getFeaturedProducts(limit?: number): Promise<Product[]> {
  const list = (await getAllProducts()).filter((product) => product.featured);
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export async function getNewArrivals(limit?: number): Promise<Product[]> {
  const list = sortProducts(
    (await getAllProducts()).filter((product) => product.newArrival),
    "newest",
  );
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export async function getDeals(): Promise<Product[]> {
  return (await getAllProducts()).filter((product) => product.isDeal);
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  const all = await getAllProducts();
  const sameCategory = all.filter((item) => item.category === product.category && item.id !== product.id);
  const others = all.filter((item) => item.category !== product.category && item.featured);
  return [...sameCategory, ...others].slice(0, limit);
}
