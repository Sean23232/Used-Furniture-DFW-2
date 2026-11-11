import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContainedImage } from "@/components/contained-image";
import { InquiryCta } from "@/components/inquiry-cta";
import { PriceBlock, ProductGrid } from "@/components/product-card";
import {
  breadcrumbJsonLd,
  buttonStyles,
  Container,
  DemoNotice,
  Eyebrow,
  JsonLd,
  PageHeader,
  SectionHeading,
  type Crumb,
} from "@/components/ui";
import { CATEGORY_MAP } from "@/lib/categories";
import { getDeals, getFeaturedProducts, getNewArrivals } from "@/lib/inventory";
import { siteConfig } from "@/lib/site";
import type { Product } from "@/lib/types";
import { inquireHref, productHref } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Featured Used Office Furniture & New Arrivals in DFW",
  description:
    "See featured pre-owned office furniture and recently added listings for Dallas–Fort Worth businesses. Inventory changes regularly — contact our team to confirm availability.",
  alternates: { canonical: "/new-arrivals" },
};

function Spotlight({ product }: { product: Product }) {
  const category = CATEGORY_MAP[product.category];
  const href = productHref(product);
  const image = product.images[0];
  return (
    <article className="grid overflow-hidden rounded-2xl border border-mist bg-white shadow-card lg:grid-cols-12">
      <Link
        href={href}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-[4/3] bg-mist lg:col-span-7 lg:aspect-auto lg:min-h-[440px]"
      >
        {image && (
          <ContainedImage
            src={image.src}
            alt={image.alt}
            sizes="(min-width: 1280px) 720px, (min-width: 1024px) 58vw, 100vw"
          />
        )}
      </Link>
      <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-5">
        <Eyebrow>Featured · {category.name}</Eyebrow>
        <h3 className="mt-3 text-2xl font-extrabold leading-tight text-navy sm:text-3xl">
          <Link href={href} className="transition-colors hover:text-accent-ink">
            {product.name}
          </Link>
        </h3>
        <p className="mt-4 leading-relaxed text-steel">{product.shortDescription}</p>
        <div className="mt-6">
          <PriceBlock product={product} size="lg" />
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={href} className={buttonStyles({ variant: "secondary" })}>
            View Details
          </Link>
          <Link href={inquireHref(product)} className={buttonStyles({ variant: "primary" })}>
            Ask About This Item
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function NewArrivalsPage() {
  const [featured, newArrivals, deals] = await Promise.all([getFeaturedProducts(), getNewArrivals(), getDeals()]);
  const [spotlight, ...moreFeatured] = featured;
  const anyDemo = [...featured, ...newArrivals].some((product) => product.isDemo);

  const crumbs: Crumb[] = [{ label: "Home", href: "/" }, { label: "Featured & New Arrivals" }];
  const sections = [
    { href: "#featured", label: "Featured Furniture" },
    { href: "#recently-added", label: "Recently Added" },
    ...(deals.length > 0 ? [{ href: "#deals", label: "Selected Deals" }] : []),
    { href: "#availability", label: "Contact for Availability" },
  ];

  return (
    <>
      <PageHeader
        breadcrumbs={crumbs}
        eyebrow="Featured & New Arrivals"
        title="Featured Furniture & New Arrivals"
        description="A closer look at highlighted pieces and recently added pre-owned office furniture. Our selection changes regularly — contact our team to confirm availability."
        image={{ src: "/images/site/open-workspace.jpg", alt: "Open office with white desks and blue task chairs" }}
      >
        <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2">
          {sections.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="rounded-full border border-mist bg-cream px-4 py-2 text-sm font-semibold text-navy transition-colors hover:border-navy/30 hover:bg-white"
            >
              {section.label}
            </a>
          ))}
        </nav>
        {anyDemo && (
          <DemoNotice className="mt-6 max-w-2xl">
            Demonstration listings — featured and new-arrival highlights will reflect verified inventory once provided.
          </DemoNotice>
        )}
      </PageHeader>

      <section id="featured" aria-labelledby="featured-title" className="py-16 sm:py-20">
        <Container>
          <SectionHeading
            id="featured-title"
            eyebrow="Featured Furniture"
            title="Highlighted Pieces from Our Listings"
            description="Selected by our team from current listings. Ask about any item for photos, details, and pricing."
          />
          {spotlight ? (
            <>
              <div className="mt-10">
                <Spotlight product={spotlight} />
              </div>
              {moreFeatured.length > 0 && <ProductGrid products={moreFeatured} className="mt-8" />}
            </>
          ) : (
            <p className="mt-10 text-steel">Featured items will appear here as our team highlights them.</p>
          )}
        </Container>
      </section>

      <section id="recently-added" aria-labelledby="recent-title" className="border-y border-mist bg-white py-16 sm:py-20">
        <Container>
          <SectionHeading
            id="recent-title"
            eyebrow="New Arrivals"
            title="Recently Added Products"
            description="The latest additions to our listings. Inventory changes regularly, so ask our team about anything that catches your eye."
            action={
              <Link href="/furniture?sort=newest" className={buttonStyles({ variant: "outline" })}>
                Browse Newest Listings <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          {newArrivals.length > 0 ? (
            <ProductGrid products={newArrivals} className="mt-10" />
          ) : (
            <p className="mt-10 text-steel">New listings will appear here as they are added.</p>
          )}
        </Container>
      </section>

      {deals.length > 0 && (
        <section id="deals" aria-labelledby="deals-title" className="py-16 sm:py-20">
          <Container>
            <SectionHeading
              id="deals-title"
              eyebrow="Selected Deals"
              title="Selected Furniture Deals"
              description="Pricing highlights supplied by our sales team. Contact us to confirm details."
            />
            <ProductGrid products={deals} className="mt-10" />
          </Container>
        </section>
      )}

      <InquiryCta
        id="availability"
        title="Contact Us for Availability"
        description="Availability changes as items sell and new pieces are listed. Call or send an inquiry and our team will confirm current availability and details."
      />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteConfig.url)} />
    </>
  );
}
