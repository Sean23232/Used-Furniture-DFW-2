import { eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

/**
 * Live inventory refresh (server-side, background).
 *
 * Every INVENTORY_REFRESH_MINUTES (default 30) the site re-checks the source inventory feed:
 *  - items that are no longer listed / in stock are hidden automatically (sold), and
 *  - price changes are applied.
 * New items are imported with their photos by running `node scripts/sync-inventory.mjs`.
 * Disable with INVENTORY_LIVE_SYNC=false.
 */

const SOURCE_API =
  process.env.INVENTORY_SOURCE_API || "https://www.businessinteriors.com/wp-json/wc/store/v1/products";
const INTERVAL_MS = Math.max(5, Number(process.env.INVENTORY_REFRESH_MINUTES) || 30) * 60_000;

type FeedItem = { id: number; is_in_stock: boolean; prices?: { price?: string; currency_minor_unit?: number } };

export interface LiveInventoryStatus {
  lastCheckedAt: string | null;
  lastResult: string | null;
  pendingNewListings: number;
}

const status: LiveInventoryStatus = { lastCheckedAt: null, lastResult: null, pendingNewListings: 0 };
let lastAttempt = 0;
let inFlight: Promise<void> | null = null;

export function getLiveInventoryStatus(): LiveInventoryStatus {
  return { ...status };
}

/** Fire-and-forget; runs at most once per interval per server process. */
export function scheduleLiveInventoryRefresh(): void {
  if (process.env.INVENTORY_LIVE_SYNC === "false") return;
  const now = Date.now();
  if (inFlight || now - lastAttempt < INTERVAL_MS) return;
  lastAttempt = now;
  inFlight = refreshFromSource()
    .catch((error: unknown) => {
      status.lastResult = `Skipped: ${error instanceof Error ? error.message : "unknown error"}`;
      console.warn("[inventory] Live refresh skipped:", status.lastResult);
    })
    .finally(() => {
      status.lastCheckedAt = new Date().toISOString();
      inFlight = null;
    });
}

async function fetchFeed(): Promise<FeedItem[]> {
  const items: FeedItem[] = [];
  let page = 1;
  let totalPages = 1;
  let total = 0;
  do {
    const response = await fetch(`${SOURCE_API}?per_page=100&page=${page}&_fields=id,is_in_stock,prices`, {
      headers: { Accept: "application/json", "User-Agent": "UsedOfficeFurnitureDFW-LiveInventory/1.0" },
      signal: AbortSignal.timeout(20_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`feed responded with ${response.status}`);
    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new Error("unexpected feed format");
    items.push(...(data as FeedItem[]));
    totalPages = Number(response.headers.get("x-wp-totalpages")) || 1;
    total = Number(response.headers.get("x-wp-total")) || items.length;
    page += 1;
  } while (page <= totalPages && page <= 25);
  if (items.length === 0 || items.length < total) throw new Error("incomplete feed response");
  return items;
}

async function refreshFromSource(): Promise<void> {
  const feed = await fetchFeed();
  const live = new Map(feed.filter((item) => item.is_in_stock).map((item) => [item.id, item]));
  const rows = await db
    .select({ id: products.id, sourceId: products.sourceId, published: products.published, priceUsd: products.priceUsd })
    .from(products)
    .where(isNotNull(products.sourceId));
  if (rows.length === 0) return;

  const publishedRows = rows.filter((row) => row.published);
  const stillListed = publishedRows.filter((row) => row.sourceId !== null && live.has(row.sourceId)).length;
  // Safety net: never mass-hide inventory because of a partial or broken feed.
  if (publishedRows.length > 10 && stillListed < publishedRows.length * 0.5) {
    throw new Error("feed changed too much at once; no automatic changes applied");
  }

  let hidden = 0;
  let repriced = 0;
  for (const row of rows) {
    if (row.sourceId === null) continue;
    const item = live.get(row.sourceId);
    if (!item) {
      if (row.published) {
        await db.update(products).set({ published: false, updatedAt: new Date() }).where(eq(products.id, row.id));
        hidden += 1;
      }
      continue;
    }
    const minorUnit = item.prices?.currency_minor_unit ?? 2;
    const rawPrice = Number(item.prices?.price ?? 0);
    const price = rawPrice > 0 ? Math.round(rawPrice / 10 ** minorUnit) : null;
    if (row.published && price !== null && price !== row.priceUsd) {
      await db.update(products).set({ priceUsd: price, updatedAt: new Date() }).where(eq(products.id, row.id));
      repriced += 1;
    }
  }

  const knownIds = new Set(rows.map((row) => row.sourceId));
  status.pendingNewListings = [...live.keys()].filter((id) => !knownIds.has(id)).length;
  status.lastResult = `OK — ${hidden} sold/removed item(s) hidden, ${repriced} price update(s), ${status.pendingNewListings} new listing(s) awaiting import.`;
  if (hidden || repriced) console.info(`[inventory] Live refresh: ${status.lastResult}`);
}
