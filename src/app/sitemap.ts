import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/categories";
import { getAllProducts } from "@/lib/inventory";
import { siteConfig } from "@/lib/site";
import { categoryHref, productHref } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();
  const products = await getAllProducts();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/furniture`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/new-arrivals`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...CATEGORIES.map((category) => ({
      url: `${base}${categoryHref(category.slug)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${base}${productHref(product)}`,
      lastModified: product.dateAdded ? new Date(product.dateAdded) : now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
