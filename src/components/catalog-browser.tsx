"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, PackageSearch, Phone, Search, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, CATEGORY_MAP, type CategorySlug } from "@/lib/categories";
import { siteConfig } from "@/lib/site";
import type { PricingFilter, Product, SortKey } from "@/lib/types";
import { cn, countByCategory, normalizeText, SORT_OPTIONS, sortProducts } from "@/lib/utils";
import { ProductCard } from "./product-card";
import { buttonStyles } from "./ui";

const PAGE_SIZE = 24;

const PRICING_OPTIONS: { value: PricingFilter; label: string }[] = [
  { value: "all", label: "All items" },
  { value: "priced", label: "Price listed" },
  { value: "contact", label: "Contact for pricing" },
];

export interface CatalogBrowserProps {
  products: Product[];
  initialQuery?: string;
  initialCategories?: CategorySlug[];
  initialSort?: SortKey;
  initialPricing?: PricingFilter;
  /** Set on category landing pages (e.g. /furniture/office-chairs). */
  pageCategory?: CategorySlug;
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove filter: ${label}`}
      className="inline-flex items-center gap-1.5 rounded-full border border-mist bg-white py-1 pl-3 pr-2 text-sm font-medium text-navy transition-colors hover:border-navy/30"
    >
      {label}
      <X className="size-3.5 text-steel" aria-hidden="true" />
    </button>
  );
}

export function CatalogBrowser({
  products,
  initialQuery = "",
  initialCategories = [],
  initialSort = "featured",
  initialPricing = "all",
  pageCategory,
}: CatalogBrowserProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState<CategorySlug[]>(pageCategory ? [pageCategory] : initialCategories);
  const [sort, setSort] = useState<SortKey>(initialSort);
  const [pricing, setPricing] = useState<PricingFilter>(initialPricing);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  /** True while leaving a category landing page for the main catalog. */
  const navigatingRef = useRef(false);

  const searchIndex = useMemo(
    () =>
      new Map(
        products.map((product) => [
          product.id,
          normalizeText(`${product.name} ${product.shortDescription} ${CATEGORY_MAP[product.category].name} ${product.id}`),
        ]),
      ),
    [products],
  );
  const counts = useMemo(() => countByCategory(products), [products]);
  const scopeTotal = pageCategory ? counts[pageCategory] : products.length;

  const results = useMemo(() => {
    const terms = normalizeText(deferredQuery).split(" ").filter(Boolean);
    const filtered = products.filter((product) => {
      if (selected.length > 0 && !selected.includes(product.category)) return false;
      if (pricing === "priced" && product.price === null) return false;
      if (pricing === "contact" && product.price !== null) return false;
      if (terms.length === 0) return true;
      const haystack = searchIndex.get(product.id) ?? "";
      return terms.every((term) => haystack.includes(term));
    });
    return sortProducts(filtered, sort);
  }, [products, selected, pricing, deferredQuery, sort, searchIndex]);

  // Progressive "Show more" paging — resets automatically whenever the result set changes.
  const resultKey = `${deferredQuery}|${selected.join(",")}|${pricing}|${sort}`;
  const [paging, setPaging] = useState({ key: resultKey, count: PAGE_SIZE });
  const visibleCount = paging.key === resultKey ? paging.count : PAGE_SIZE;
  const visibleResults = results.slice(0, visibleCount);
  const remaining = results.length - visibleResults.length;

  const trimmedQuery = query.trim();
  const categoryFilters = pageCategory ? [] : selected;
  const activeCount = categoryFilters.length + (pricing !== "all" ? 1 : 0) + (trimmedQuery ? 1 : 0);
  const canClear = activeCount > 0 || sort !== "featured";

  // Keep the URL shareable without triggering navigation.
  useEffect(() => {
    if (navigatingRef.current) return;
    const params = new URLSearchParams();
    if (trimmedQuery) params.set("q", trimmedQuery);
    if (!pageCategory && selected.length > 0) params.set("category", selected.join(","));
    if (sort !== "featured") params.set("sort", sort);
    if (pricing !== "all") params.set("pricing", pricing);
    const search = params.toString();
    const nextUrl = search ? `${pathname}?${search}` : pathname;
    if (nextUrl !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [trimmedQuery, selected, sort, pricing, pathname, pageCategory]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const trigger = filterButtonRef.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [drawerOpen]);

  function navigateToCatalog(nextCategories: CategorySlug[]) {
    const params = new URLSearchParams();
    if (nextCategories.length > 0) params.set("category", nextCategories.join(","));
    if (trimmedQuery) params.set("q", trimmedQuery);
    if (sort !== "featured") params.set("sort", sort);
    if (pricing !== "all") params.set("pricing", pricing);
    const search = params.toString();
    navigatingRef.current = true;
    setDrawerOpen(false);
    router.push(search ? `/furniture?${search}` : "/furniture");
  }

  function toggleCategory(slug: CategorySlug) {
    const next = selected.includes(slug) ? selected.filter((item) => item !== slug) : [...selected, slug];
    // Update immediately so the checkbox responds instantly, even while navigating.
    setSelected(next);
    if (pageCategory) navigateToCatalog(next);
  }

  function clearFilters() {
    setQuery("");
    setPricing("all");
    setSort("featured");
    if (!pageCategory) setSelected([]);
  }

  const renderFilters = (prefix: string) => (
    <div className="space-y-8">
      <fieldset>
        <legend className="font-display text-sm font-bold uppercase tracking-[0.14em] text-navy">Categories</legend>
        <ul className="mt-3 space-y-0.5">
          {CATEGORIES.map((category) => {
            const id = `${prefix}-category-${category.slug}`;
            const checked = selected.includes(category.slug);
            return (
              <li key={category.slug}>
                <label
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-[15px] transition-colors hover:bg-cream",
                    checked && "bg-cream",
                  )}
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(category.slug)}
                    className="size-4 shrink-0 cursor-pointer accent-navy"
                  />
                  <span className={cn("flex-1", checked ? "font-semibold text-navy" : "text-charcoal")}>{category.name}</span>
                  <span className="text-xs tabular-nums text-steel">{counts[category.slug]}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="font-display text-sm font-bold uppercase tracking-[0.14em] text-navy">Pricing</legend>
        <div className="mt-3 space-y-0.5">
          {PRICING_OPTIONS.map((option) => {
            const id = `${prefix}-pricing-${option.value}`;
            return (
              <label
                key={option.value}
                htmlFor={id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-[15px] transition-colors hover:bg-cream",
                  pricing === option.value && "bg-cream font-semibold text-navy",
                )}
              >
                <input
                  id={id}
                  type="radio"
                  name={`${prefix}-pricing`}
                  value={option.value}
                  checked={pricing === option.value}
                  onChange={() => setPricing(option.value)}
                  className="size-4 shrink-0 cursor-pointer accent-navy"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-3">
        <button
          type="button"
          onClick={clearFilters}
          disabled={!canClear}
          className={buttonStyles({ variant: "outline", size: "sm", className: "w-full" })}
        >
          Clear filters
        </button>
        {pageCategory && (
          <Link href="/furniture" className="block text-center text-sm font-semibold text-navy underline-offset-4 hover:underline">
            View all furniture
          </Link>
        )}
      </div>

      <div className="rounded-xl border border-mist bg-cream p-4 text-sm">
        <p className="font-semibold text-navy">Can&apos;t find what you need?</p>
        <p className="mt-1 leading-relaxed text-steel">
          Inventory changes regularly. Our team can tell you what&apos;s currently available.
        </p>
        <a
          href={siteConfig.phone.href}
          className="mt-3 inline-flex items-center gap-2 font-semibold text-navy transition-colors hover:text-accent-ink"
        >
          <Phone className="size-4" aria-hidden="true" /> Call our team
        </a>
      </div>
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 xl:gap-12">
      <aside aria-label="Catalog filters" className="hidden lg:block">
        <div className="sticky top-28 rounded-2xl border border-mist bg-white p-6 shadow-card">{renderFilters("desktop")}</div>
      </aside>

      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form role="search" onSubmit={(event) => event.preventDefault()} className="relative flex-1">
            <label htmlFor="catalog-search" className="sr-only">
              Search furniture by product name
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-steel" aria-hidden="true" />
            <input
              id="catalog-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by product name, e.g. desk or chair"
              autoComplete="off"
              enterKeyHint="search"
              className="h-12 w-full rounded-xl border border-steel/25 bg-white pl-11 pr-11 text-base text-charcoal shadow-xs placeholder:text-steel/70 focus:border-navy/40 focus:outline-none focus:ring-3 focus:ring-accent/25"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-steel hover:bg-mist hover:text-navy"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </form>

          <div className="flex gap-3">
            <button
              ref={filterButtonRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
              className={buttonStyles({ variant: "outline", size: "md", className: "h-12 flex-1 rounded-xl lg:hidden" })}
            >
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              Filters
              {activeCount > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-navy px-1.5 py-0.5 text-xs text-white">
                  {activeCount}
                </span>
              )}
            </button>
            <div className="relative flex-1 sm:flex-none">
              <label htmlFor="catalog-sort" className="sr-only">
                Sort furniture
              </label>
              <select
                id="catalog-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-steel/25 bg-white pl-4 pr-10 text-[15px] font-medium text-navy shadow-xs focus:border-navy/40 focus:outline-none focus:ring-3 focus:ring-accent/25 sm:w-56"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-steel" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <p className="mr-1 text-sm text-steel" aria-live="polite">
            Showing <span className="font-semibold text-navy">{results.length}</span> of {scopeTotal}{" "}
            {scopeTotal === 1 ? "item" : "items"}
          </p>
          {trimmedQuery && <FilterChip label={`“${trimmedQuery}”`} onRemove={() => setQuery("")} />}
          {categoryFilters.map((slug) => (
            <FilterChip key={slug} label={CATEGORY_MAP[slug].name} onRemove={() => toggleCategory(slug)} />
          ))}
          {pricing !== "all" && (
            <FilterChip
              label={PRICING_OPTIONS.find((option) => option.value === pricing)?.label ?? "Pricing"}
              onRemove={() => setPricing("all")}
            />
          )}
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-navy underline underline-offset-4 hover:text-accent-ink"
            >
              Clear filters
            </button>
          )}
        </div>

        <h2 className="sr-only">Furniture listings</h2>
        {results.length > 0 ? (
          <>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {visibleResults.map((product, index) => (
                <li key={product.id}>
                  <ProductCard
                    product={product}
                    imageLoading={index < 3 ? "eager" : "lazy"}
                    sizes="(min-width: 1280px) 300px, (min-width: 640px) 45vw, 92vw"
                  />
                </li>
              ))}
            </ul>
            {remaining > 0 && (
              <div className="mt-10 flex flex-col items-center gap-3 text-center">
                <p className="text-sm text-steel">
                  Showing {visibleResults.length} of {results.length} matching items
                </p>
                <button
                  type="button"
                  onClick={() => setPaging({ key: resultKey, count: visibleCount + PAGE_SIZE })}
                  className={buttonStyles({ variant: "secondary", size: "lg" })}
                >
                  Show {Math.min(PAGE_SIZE, remaining)} more
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-steel/30 bg-white px-6 py-14 text-center">
            <PackageSearch className="mx-auto size-10 text-steel" aria-hidden="true" />
            <p className="mt-4 font-display text-xl font-bold text-navy">No furniture matches your search</p>
            <p className="mx-auto mt-2 max-w-md leading-relaxed text-steel">
              Try a different search term or clear your filters. Our inventory changes regularly — our team may be able
              to help you find what you need.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={clearFilters} className={buttonStyles({ variant: "secondary" })}>
                Clear filters
              </button>
              <Link
                href={`/contact?interest=${encodeURIComponent(trimmedQuery || "Office furniture")}#inquiry-form`}
                className={buttonStyles({ variant: "outline" })}
              >
                Ask our team
              </Link>
            </div>
          </div>
        )}
      </div>

      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="catalog-filters-title"
          className="fixed inset-0 z-50 lg:hidden"
        >
          <div className="absolute inset-0 bg-navy/50" aria-hidden="true" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-mist px-5 py-4">
              <h2 id="catalog-filters-title" className="text-lg font-bold text-navy">
                Filter Furniture
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="inline-flex size-10 items-center justify-center rounded-lg border border-mist text-navy hover:bg-cream"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">{renderFilters("mobile")}</div>
            <div className="border-t border-mist p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className={buttonStyles({ variant: "secondary", size: "lg", className: "w-full" })}
              >
                Show {results.length} {results.length === 1 ? "item" : "items"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
