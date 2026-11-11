import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CatalogBrowser } from "@/components/catalog-browser";
import { InquiryCta } from "@/components/inquiry-cta";
import { breadcrumbJsonLd, Container, JsonLd, PageHeader, type Crumb } from "@/components/ui";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { getAllProducts } from "@/lib/inventory";
import { siteConfig } from "@/lib/site";
import { categoryHref, countByCategory, firstParam, parsePricing, parseSort, toListing } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = Promise<{ category: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Category Not Found", robots: { index: false, follow: true } };

  return {
    title: category.seoTitle,
    description: category.metaDescription,
    alternates: { canonical: categoryHref(category.slug) },
    openGraph: {
      title: category.seoTitle,
      description: category.metaDescription,
      url: categoryHref(category.slug),
      images: [{ url: category.image.src, alt: category.image.alt }],
    },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const query = await searchParams;
  const products = await getAllProducts();
  const counts = countByCategory(products);
  const otherCategories = CATEGORIES.filter((item) => item.slug !== category.slug);

  const initialQuery = (firstParam(query.q) ?? "").slice(0, 100);
  const initialSort = parseSort(firstParam(query.sort));
  const initialPricing = parsePricing(firstParam(query.pricing));
  const stateKey = [category.slug, initialQuery, initialSort, initialPricing].join("|");

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Browse Furniture", href: "/furniture" },
    { label: category.name },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={crumbs}
        eyebrow="Used Office Furniture · Dallas–Fort Worth"
        title={category.heading}
        description={category.intro}
        image={category.image}
      />

      <section className="py-10 sm:py-12">
        <Container>
          <CatalogBrowser
            key={stateKey}
            products={products.map(toListing)}
            pageCategory={category.slug}
            initialQuery={initialQuery}
            initialSort={initialSort}
            initialPricing={initialPricing}
          />
        </Container>
      </section>

      <section aria-labelledby="other-categories-heading" className="border-t border-mist bg-white py-14 sm:py-16">
        <Container>
          <h2 id="other-categories-heading" className="text-2xl font-extrabold text-navy">
            Browse Other Furniture Categories
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {otherCategories.map((item) => (
              <li key={item.slug}>
                <Link
                  href={categoryHref(item.slug)}
                  className="group flex h-full items-center justify-between gap-3 rounded-xl border border-mist bg-cream px-4 py-3.5 transition-colors hover:border-navy/25 hover:bg-white"
                >
                  <span className="font-semibold text-navy">{item.name}</span>
                  <span className="flex shrink-0 items-center gap-2 text-sm text-steel">
                    {counts[item.slug]} {counts[item.slug] === 1 ? "item" : "items"}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <InquiryCta
        title={`Looking for ${category.name.toLowerCase()}?`}
        description="Speak with our team about current options, item details, and pricing for your workspace."
      />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteConfig.url)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: category.heading,
          description: category.metaDescription,
          url: `${siteConfig.url}${categoryHref(category.slug)}`,
          isPartOf: { "@id": `${siteConfig.url}/#website` },
        }}
      />
    </>
  );
}
