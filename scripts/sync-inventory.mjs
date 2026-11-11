#!/usr/bin/env node
/**
 * Inventory sync — imports the current pre-owned inventory feed into this website.
 *
 *   node scripts/sync-inventory.mjs            # full sync (data + photos + database)
 *   node scripts/sync-inventory.mjs --dry-run  # fetch and map only, no writes
 *
 * What it does:
 *  1. Fetches every in-stock listing from the source inventory feed (WooCommerce Store API).
 *  2. Maps each listing to this site's categories and product structure, removing any
 *     third-party branding, phone numbers, internal stock codes, and quantity claims.
 *  3. Downloads up to MAX_IMAGES photos per item, optimizes them, and re-hosts them in
 *     public/images/inventory (so the website never depends on the source site).
 *  4. Writes src/data/inventory-snapshot.json (used to seed fresh databases).
 *  5. Upserts listings into the `products` table, removes demonstration listings, and
 *     unpublishes items that are no longer in the feed (sold / removed).
 *
 * Re-run any time inventory changes. Rebuild/redeploy afterwards so new photos are served.
 */
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import pg from "pg";
import sharp from "sharp";

const SOURCE_API =
  process.env.INVENTORY_SOURCE_API || "https://www.businessinteriors.com/wp-json/wc/store/v1/products";
const DATES_API = SOURCE_API.replace("/wc/store/v1/products", "/wp/v2/product");
const ROOT = process.cwd();
const IMG_DIR = path.join(ROOT, "public", "images", "inventory");
const SNAPSHOT_PATH = path.join(ROOT, "src", "data", "inventory-snapshot.json");
const MAX_IMAGES = Number(process.env.INVENTORY_MAX_IMAGES || 4);
const DRY_RUN = process.argv.includes("--dry-run");
const HEADERS = { "User-Agent": "UsedOfficeFurnitureDFW-InventorySync/1.0", Accept: "application/json" };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, asJson = true) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(60_000) });
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      return { body: asJson ? await response.json() : Buffer.from(await response.arrayBuffer()), headers: response.headers };
    } catch (error) {
      if (attempt === 3) throw error;
      await sleep(1500 * attempt);
    }
  }
  throw new Error("unreachable");
}

async function fetchAllPages(base, params) {
  const items = [];
  let page = 1;
  let totalPages = 1;
  do {
    const query = new URLSearchParams({ ...params, per_page: "100", page: String(page) });
    const { body, headers } = await fetchWithRetry(`${base}?${query}`);
    items.push(...body);
    totalPages = Number(headers.get("x-wp-totalpages") || 1);
    page += 1;
  } while (page <= totalPages);
  return items;
}

const ENTITIES = {
  "&nbsp;": " ", "&amp;": "&", "&quot;": '"', "&#039;": "'", "&apos;": "'", "&lt;": "<", "&gt;": ">",
  "&ndash;": "–", "&mdash;": "—", "&rsquo;": "’", "&lsquo;": "‘", "&rdquo;": "”", "&ldquo;": "“",
  "&prime;": "′", "&Prime;": "″", "&times;": "×", "&frac12;": "½",
};
function decodeOnce(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&[a-zA-Z]+;|&#0?39;/g, (entity) => ENTITIES[entity] ?? entity);
}
const decode = (value = "") => decodeOnce(decodeOnce(value));

function htmlToText(html = "") {
  const text = decode(
    html
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h[1-6]|tr|ul|ol)>/gi, "\n\n")
      .replace(/<li[^>]*>/gi, "\n• ")
      .replace(/<[^>]+>/g, " "),
  );
  return text
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Internal stock / location codes such as "GA260720/OIG/*50", "MC260269/OIG*50", "46540100/B-S//100".
const STOCK_CODE = /(^|\s)\(?[A-Za-z0-9-]+\)?\s?\/[A-Za-z][A-Za-z-]*(?:\/{1,2}|\*|\/\*)\*?\d+(?=\s|$)/gm;
const BLOCKED_SENTENCE =
  /business\s*interiors|businessinteriors|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b|quantity|qty\b|clusters? of|on (?:the |our )?website|section on website/i;

function sanitizeText(text) {
  return text
    .replace(STOCK_CODE, "")
    .split("\n")
    .map((line) =>
      line
        .split(/(?<=[.!?])\s+/)
        .filter((sentence) => !BLOCKED_SENTENCE.test(sentence))
        .join(" ")
        .replace(/\s+/g, " ")
        .replace(/\s+([.,;:])/g, "$1")
        .trim(),
    )
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^(?:•\s*)?$/gm, "")
    .trim();
}

function cleanName(raw) {
  return decode(raw)
    .replace(/\s*[–—-]\s*as low as\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function mapCategory(product, name) {
  const slugs = product.categories.map((category) => category.slug);
  const n = name.toLowerCase();
  if (/reception/.test(n) && !slugs.includes("storage")) return "reception-furniture";
  if (slugs.includes("cubicles")) return "cubicles-workstations";
  if (slugs.includes("desks")) return "desks-workstations";
  if (slugs.includes("tables")) return /conference|boardroom|meeting/.test(n) ? "conference-tables" : "office-tables";
  if (slugs.includes("storage")) return "filing-storage";
  if (slugs.includes("lounge")) return "lounge-furniture";
  if (slugs.includes("chairs")) return /lounge|sofa|settee|loveseat/.test(n) ? "lounge-furniture" : "office-chairs";
  return "other-office-furniture";
}

function pickImageUrl(image) {
  const candidates = (image.srcset || "")
    .split(",")
    .map((entry) => entry.trim().split(/\s+/))
    .map(([url, width]) => ({ url, width: parseInt(width, 10) || 0 }))
    .filter((candidate) => candidate.url && candidate.width);
  const suitable = candidates.filter((c) => c.width >= 1000).sort((a, b) => a.width - b.width)[0];
  if (suitable) return suitable.url;
  const largest = candidates.sort((a, b) => b.width - a.width)[0];
  return largest?.url || image.src;
}

/** Source galleries often repeat the main photo — keep each photo once. */
function uniqueImages(images) {
  const seen = new Set();
  return images.filter((image) => {
    const key = (image.src || "").replace(/-\d+x\d+(?=\.\w+$)/, "").replace(/-scaled(?=\.\w+$)/, "");
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function lowerFirst(value) {
  return value ? value.charAt(0).toLowerCase() + value.slice(1) : value;
}

function mapProduct(product, dates) {
  const name = cleanName(product.name);
  const category = mapCategory(product, name);
  const attributes = Object.fromEntries(
    (product.attributes || [])
      .map((attribute) => [attribute.name, (attribute.terms || []).map((term) => decode(term.name)).join(", ").trim()])
      .filter(([, value]) => value),
  );

  const rawText = sanitizeText(htmlToText(product.description))
    .replace(/\n{2,}(?=•|\*|\d+\s*[–-]\s)/g, "\n")
    .replace(/:\n{2,}/g, ":\n");
  const lines = rawText.split("\n").map((line) => line.trim());
  const featureIndex = lines.findIndex((line) => /^features?:/i.test(line));
  let features = "";
  if (featureIndex >= 0) {
    const inline = lines[featureIndex].replace(/^features?:\s*/i, "").trim();
    if (inline) {
      features = inline;
    } else {
      const bullets = [];
      for (let i = featureIndex + 1; i < lines.length && /^•/.test(lines[i]); i++) bullets.push(lines[i].replace(/^•\s*/, ""));
      features = bullets.filter(Boolean).join(", ");
    }
  }
  const shortFeatures = features && features.length <= 90 ? features : "";
  const body = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  const finish = [attributes["Main Material and Color"], attributes["Second Material and Color"]]
    .filter(Boolean)
    .map((value) => value.toLowerCase())
    .join(" with ");
  const baseName = name.replace(/^used\s+/i, "");
  let shortDescription = `Pre-owned ${baseName}`;
  if (finish) shortDescription += ` in ${finish}`;
  if (shortFeatures && shortFeatures.length <= 60) {
    shortDescription += ` — ${shortFeatures.split(", ").map(lowerFirst).join(", ")}`;
  }
  shortDescription += ".";

  const description = [
    "This listing is part of our current pre-owned office furniture inventory, available to businesses throughout Dallas–Fort Worth.",
    body,
    "Contact our team to confirm current availability, condition details, and pricing for your project.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const specifications = [];
  if (attributes["Brand/Manufacturer"]) specifications.push({ label: "Brand / model", value: attributes["Brand/Manufacturer"] });
  if (attributes["Model Number"]) specifications.push({ label: "Model", value: attributes["Model Number"] });
  if (attributes["Size"]) specifications.push({ label: "Size", value: attributes["Size"] });
  if (shortFeatures) specifications.push({ label: "Features", value: shortFeatures });
  if (attributes["Main Material and Color"]) specifications.push({ label: "Primary material / color", value: attributes["Main Material and Color"] });
  if (attributes["Second Material and Color"]) specifications.push({ label: "Secondary material / color", value: attributes["Second Material and Color"] });
  specifications.push({
    label: "Condition",
    value: attributes["Condition"]
      ? `Pre-owned — rated ${attributes["Condition"]}`
      : "Pre-owned — ask our team for condition details",
  });

  const minor = Number(product.prices?.currency_minor_unit ?? 2);
  const rawPrice = Number(product.prices?.price || 0);
  const price = rawPrice > 0 ? Math.round(rawPrice / 10 ** minor) : null;
  const startingPrice = /as low as\s*$/i.test(decode(product.name));

  const slug =
    (product.slug || name.toLowerCase())
      .toLowerCase()
      .replace(/-?as-low-as$/, "")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-|-$/g, "") || `item-${product.id}`;

  return {
    id: `UOF-${product.id}`,
    sourceId: product.id,
    slug,
    name,
    category,
    shortDescription,
    description,
    price,
    priceNote: startingPrice && price !== null ? "starting price" : null,
    images: uniqueImages(product.images || []).slice(0, MAX_IMAGES).map((image, index) => ({
      remote: pickImageUrl(image),
      file: `${slug}-${index + 1}.jpg`,
      alt:
        index === 0
          ? `${name}${finish ? ` in ${finish}` : ""} — pre-owned office furniture`
          : `${name} — additional photo ${index + 1}`,
    })),
    specifications,
    availability: null,
    featured: false,
    newArrival: false,
    isDeal: false,
    dateAdded: dates.get(product.id) ? new Date(`${dates.get(product.id)}Z`).toISOString() : null,
    isDemo: false,
  };
}

async function runPool(items, limit, worker) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await worker(items[index], index);
    }
  });
  await Promise.all(runners);
}

async function main() {
  console.log(`[sync] Fetching inventory feed…`);
  const feed = await fetchAllPages(SOURCE_API, { orderby: "date", order: "desc" });
  const inStock = feed.filter((product) => product.is_in_stock && product.type === "simple");
  console.log(`[sync] ${feed.length} listings in feed, ${inStock.length} in stock.`);

  let dates = new Map();
  try {
    const dated = await fetchAllPages(DATES_API, { _fields: "id,date" });
    dates = new Map(dated.map((entry) => [entry.id, entry.date]));
  } catch (error) {
    console.warn("[sync] Listing dates unavailable:", error.message);
  }

  const mapped = inStock.map((product) => mapProduct(product, dates));

  // Ensure unique slugs.
  const seen = new Set();
  for (const product of mapped) {
    if (seen.has(product.slug)) {
      product.slug = `${product.slug}-${product.sourceId}`;
      product.images.forEach((image, index) => (image.file = `${product.slug}-${index + 1}.jpg`));
    }
    seen.add(product.slug);
  }

  // Highlights: newest listings are New Arrivals; one standout per key category is Featured.
  [...mapped]
    .filter((product) => product.dateAdded)
    .sort((a, b) => Date.parse(b.dateAdded) - Date.parse(a.dateAdded))
    .slice(0, 8)
    .forEach((product) => (product.newArrival = true));
  for (const category of ["office-chairs", "desks-workstations", "conference-tables", "cubicles-workstations", "filing-storage", "lounge-furniture"]) {
    const pick = mapped
      .filter((product) => product.category === category && !product.newArrival && product.price !== null)
      .sort((a, b) => b.images.length - a.images.length || (b.price ?? 0) - (a.price ?? 0))[0];
    if (pick) pick.featured = true;
  }

  const byCategory = mapped.reduce((acc, product) => ({ ...acc, [product.category]: (acc[product.category] || 0) + 1 }), {});
  console.log("[sync] Category mapping:", byCategory);
  if (DRY_RUN) {
    console.log("[sync] Dry run — sample:", JSON.stringify(mapped.slice(0, 2), null, 2));
    return;
  }

  // Photos
  await fs.mkdir(IMG_DIR, { recursive: true });
  const jobs = mapped.flatMap((product) => product.images.map((image) => ({ product, image })));
  let downloaded = 0;
  let failed = 0;
  await runPool(jobs, 8, async ({ product, image }) => {
    const target = path.join(IMG_DIR, image.file);
    try {
      await fs.access(target);
      image.ok = true;
      return;
    } catch {}
    try {
      const { body } = await fetchWithRetry(image.remote, false);
      await sharp(body)
        .rotate()
        .flatten({ background: "#ffffff" })
        .resize({ width: 1100, height: 1100, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 74, mozjpeg: true, progressive: true })
        .toFile(target);
      image.ok = true;
      downloaded += 1;
    } catch (error) {
      failed += 1;
      console.warn(`[sync] Photo failed for ${product.name}: ${error.message}`);
    }
  });
  console.log(`[sync] Photos: ${downloaded} downloaded, ${failed} failed, ${jobs.length - downloaded - failed} already present.`);

  const products = mapped
    .map(({ images, ...product }) => ({
      ...product,
      images: images.filter((image) => image.ok).map((image) => ({ src: `/images/inventory/${image.file}`, alt: image.alt })),
    }))
    .filter((product) => product.images.length > 0);

  // Remove photos no longer referenced.
  const referenced = new Set(products.flatMap((product) => product.images.map((image) => path.basename(image.src))));
  for (const file of await fs.readdir(IMG_DIR)) {
    if (!referenced.has(file)) await fs.unlink(path.join(IMG_DIR, file));
  }

  await fs.writeFile(SNAPSHOT_PATH, `${JSON.stringify(products, null, 1)}\n`);
  console.log(`[sync] Snapshot written: ${products.length} listings → ${path.relative(ROOT, SNAPSHOT_PATH)}`);

  if (!process.env.DATABASE_URL) {
    console.warn("[sync] DATABASE_URL not set — skipped database update.");
    return;
  }
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query("BEGIN");
    const removedDemo = await client.query("DELETE FROM products WHERE is_demo = true");
    for (const product of products) {
      await client.query(
        `INSERT INTO products (product_code, source_id, slug, name, category, short_description, description, price_usd, price_note,
           images, specifications, availability, featured, new_arrival, is_deal, is_demo, published, date_added, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11::jsonb,NULL,$12,$13,false,false,true,$14,now())
         ON CONFLICT (product_code) DO UPDATE SET
           source_id = EXCLUDED.source_id, slug = EXCLUDED.slug, name = EXCLUDED.name, category = EXCLUDED.category,
           short_description = EXCLUDED.short_description, description = EXCLUDED.description,
           price_usd = EXCLUDED.price_usd, price_note = EXCLUDED.price_note, images = EXCLUDED.images,
           specifications = EXCLUDED.specifications, featured = EXCLUDED.featured, new_arrival = EXCLUDED.new_arrival,
           is_demo = false, published = true, date_added = EXCLUDED.date_added, updated_at = now()`,
        [
          product.id, product.sourceId, product.slug, product.name, product.category, product.shortDescription,
          product.description, product.price, product.priceNote, JSON.stringify(product.images),
          JSON.stringify(product.specifications), product.featured, product.newArrival, product.dateAdded,
        ],
      );
    }
    const unpublished = await client.query(
      "UPDATE products SET published = false, updated_at = now() WHERE source_id IS NOT NULL AND NOT (source_id = ANY($1::int[])) AND published = true",
      [products.map((product) => product.sourceId)],
    );
    await client.query("COMMIT");
    console.log(
      `[sync] Database updated: ${products.length} listings upserted, ${removedDemo.rowCount} demo listings removed, ${unpublished.rowCount} sold/removed listings unpublished.`,
    );
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("[sync] Failed:", error);
  process.exit(1);
});
