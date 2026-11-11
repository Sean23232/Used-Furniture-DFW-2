import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/catalog-browser";
import { InquiryCta } from "@/components/inquiry-cta";
import { breadcrumbJsonLd, Container, DemoNotice, JsonLd, PageHeader, type Crumb } from "@/components/ui";
import { getAllProducts } from "@/lib/inventory";
import { siteConfig } from "@/lib/site";
import { firstParam, parseCategoryParam, parsePricing, parseSort, toListing } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Used Office Furniture in Dallas–Fort Worth",
  description:
    "Search and filter pre-owned office desks, chairs, conference tables, filing cabinets, cubicles, and reception furniture for businesses throughout Dallas–Fort Worth.",
  alternates: { canonical: "/furniture" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function FurniturePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const products = await getAllProducts();

  const initialQuery = (firstParam(params.q) ?? "").slice(0, 100);
  const initialCategories = parseCategoryParam(firstParam(params.category));
  const initialSort = parseSort(firstParam(params.sort));
  const initialPricing = parsePricing(firstParam(params.pricing));
  const stateKey = [initialQuery, initialCategories.join(","), initialSort, initialPricing].join("|");

  const crumbs: Crumb[] = [{ label: "Home", href: "/" }, { label: "Browse Furniture" }];

  return (
    <>
      <PageHeader
        breadcrumbs={crumbs}
        eyebrow="Furniture Catalog"
        title="Explore Our Used Office Furniture"
        description="Browse pre-owned office furniture for businesses and workspaces throughout Dallas–Fort Worth."
      >
        {products.some((product) => product.isDemo) && (
          <DemoNotice className="mt-6 max-w-2xl">
            Demonstration inventory: listings and sample prices are placeholders until verified inventory is provided.
          </DemoNotice>
        )}
      </PageHeader>

      <section className="py-10 sm:py-12">
        <Container>
          <CatalogBrowser
            key={stateKey}
            products={products.map(toListing)}
            initialQuery={initialQuery}
            initialCategories={initialCategories}
            initialSort={initialSort}
            initialPricing={initialPricing}
          />
        </Container>
      </section>

      <InquiryCta
        title="Don't See What You Need?"
        description="Our inventory changes regularly. Tell our team what you're looking for — they can share what's currently available."
      />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteConfig.url)} />
    </>
  );
}
