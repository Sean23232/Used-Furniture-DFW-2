import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export type ProductImageRecord = { src: string; alt: string };
export type ProductSpecRecord = { label: string; value: string };

/**
 * Inventory — one row per listed item.
 *
 * Staff can add, update, unpublish, or remove items here without touching any
 * page layouts. Field conventions:
 *  - price_usd     NULL  → shown on the site as "Contact for Pricing"
 *  - availability  NULL  → no availability label is shown. Only set this to
 *                          'available' | 'on-hold' | 'sold' once confirmed.
 *  - is_demo       TRUE  → demonstration listing (prices labeled "Sample price")
 *  - published     FALSE → hidden from the website without deleting the record
 */
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    productCode: varchar("product_code", { length: 40 }).notNull().unique(),
    /** ID of the item in the source inventory feed (null for manually added items). */
    sourceId: integer("source_id").unique(),
    slug: varchar("slug", { length: 180 }).notNull().unique(),
    name: varchar("name", { length: 200 }).notNull(),
    category: varchar("category", { length: 60 }).notNull(),
    shortDescription: text("short_description").notNull(),
    description: text("description").notNull(),
    priceUsd: integer("price_usd"),
    priceNote: varchar("price_note", { length: 120 }),
    images: jsonb("images").$type<ProductImageRecord[]>().notNull().default([]),
    specifications: jsonb("specifications").$type<ProductSpecRecord[]>().notNull().default([]),
    availability: varchar("availability", { length: 20 }),
    featured: boolean("featured").notNull().default(false),
    newArrival: boolean("new_arrival").notNull().default(false),
    isDeal: boolean("is_deal").notNull().default(false),
    isDemo: boolean("is_demo").notNull().default(false),
    published: boolean("published").notNull().default(true),
    dateAdded: timestamp("date_added", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("products_category_idx").on(table.category),
    index("products_published_idx").on(table.published),
  ],
);

/**
 * Customer inquiries submitted through the website forms.
 * Stored so no lead is lost, even before email delivery is integrated.
 */
export const inquiries = pgTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    businessName: varchar("business_name", { length: 160 }),
    email: varchar("email", { length: 254 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    furnitureInterest: varchar("furniture_interest", { length: 200 }),
    productCode: varchar("product_code", { length: 40 }),
    message: text("message").notNull(),
    sourcePage: varchar("source_page", { length: 300 }),
    emailDelivered: boolean("email_delivered").notNull().default(false),
    status: varchar("status", { length: 20 }).notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("inquiries_created_idx").on(table.createdAt)],
);
