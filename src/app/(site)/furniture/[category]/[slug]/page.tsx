import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Mail, MessageSquareText, Phone } from "lucide-react";
import { InquiryForm } from "@/components/inquiry-form";
import { AvailabilityBadge, PriceBlock, ProductGrid } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import {
  breadcrumbJsonLd,
  Breadcrumbs,
  buttonStyles,
  Container,
  DemoNotice,
  JsonLd,
  SectionHeading,
  type Crumb,
} from "@/components/ui";
import { CATEGORY_MAP } from "@/lib/categories";
import { getProductBySlug, getRelatedProducts } from "@/lib/inventory";
import { mailtoHref, siteConfig } from "@/lib/site";
import type { AvailabilityStatus } from "@/lib/types";
import { categoryHref, descriptionParagraphs, productHref } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = Promise<{ category: string; slug: string }>;

const SCHEMA_AVAILABILITY: Record<AvailabilityStatus, string> = {
  available: "https://schema.org/InStock",
  "on-hold": "https://schema.org/LimitedAvailability",
  sold: "https://schema.org/SoldOut",
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Item Not Found", robots: { index: false, follow: true } };

  const category = CATEGORY_MAP[product.category];
  const description = `${product.shortDescription} Pre-owned office furniture for Dallas–Fort Worth businesses — ask our team about item #${product.id}.`;
  return {
    title: `${product.name} | Used ${category.name} in DFW`,
    description,
    alternates: { canonical: productHref(product) },
    openGraph: {
      title: product.name,
      description,
      url: productHref(product),
      images: product.images.slice(0, 1).map((image) => ({ url: image.src, alt: image.alt })),
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { category: categorySlug, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  if (product.category !== categorySlug) permanentRedirect(productHref(product));

  const category = CATEGORY_MAP[product.category];
  const related = await getRelatedProducts(product, 3);
  const relatedIsSameCategory = related.every((item) => item.category === product.category);
  const paragraphs = descriptionParagraphs(product.description);
  const href = productHref(product);

  const crumbs: Crumb[] = [
    { label: "Home", href: "/" },
    { label: "Browse Furniture", href: "/furniture" },
    { label: category.name, href: categoryHref(category.slug) },
    { label: product.name },
  ];

  const emailSubject = `Inquiry: ${product.name} (Item #${product.id})`;
  const emailBody = `Hello,\n\nI'm interested in the ${product.name} (Item #${product.id}). Please contact me with more information.\n\nListing: ${siteConfig.url}${href}\n\nThank you.`;
  const defaultMessage = `I'm interested in the ${product.name}. Please contact me with more information.`;

  // Offers are only described for verified (non-demo) listings with a confirmed price.
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.id,
    category: category.name,
    url: `${siteConfig.url}${href}`,
    image: product.images.map((image) => `${siteConfig.url}${image.src}`),
    ...(product.price !== null && !product.isDemo
      ? {
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "USD",
            itemCondition: "https://schema.org/UsedCondition",
            url: `${siteConfig.url}${href}`,
            ...(product.availability ? { availability: SCHEMA_AVAILABILITY[product.availability] } : {}),
          },
        }
      : {}),
  };

  return (
    <>
      <div className="border-b border-mist bg-white">
        <Container className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Breadcrumbs items={crumbs} />
          <Link
            href={categoryHref(category.slug)}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-navy transition-colors hover:text-accent-ink"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to {category.name}
          </Link>
        </Container>
      </div>

      <section className="bg-white pb-14 pt-8 sm:pt-10">
        <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          <div className="lg:col-span-5">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={categoryHref(category.slug)}
                className="text-xs font-bold uppercase tracking-[0.16em] text-accent-ink hover:underline"
              >
                {category.name}
              </Link>
              {product.newArrival && (
                <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-navy">
                  New Arrival
                </span>
              )}
              {product.featured && (
                <span className="rounded-md bg-navy px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                  Featured
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-navy sm:text-4xl">{product.name}</h1>
            <p className="mt-2 text-sm text-steel">
              Item # <span className="font-semibold tabular-nums text-charcoal">{product.id}</span>
            </p>

            <div className="mt-6 rounded-xl border border-mist bg-cream p-5">
              <PriceBlock product={product} size="lg" />
              {product.availability ? (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="text-steel">Availability:</span>
                  <AvailabilityBadge status={product.availability} />
                </div>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-steel">
                  Inventory changes frequently — contact our team to confirm current availability.
                </p>
              )}
            </div>

            <p className="mt-6 text-lg leading-relaxed text-charcoal">{product.shortDescription}</p>

            <div className="mt-8 grid gap-3">
              <a href="#inquire" className={buttonStyles({ variant: "primary", size: "lg", className: "w-full" })}>
                <MessageSquareText className="size-5" aria-hidden="true" /> Ask About This Item
              </a>
              <div className="grid gap-3 sm:grid-cols-2">
                <a href={siteConfig.phone.href} className={buttonStyles({ variant: "secondary", size: "lg" })}>
                  <Phone className="size-5" aria-hidden="true" /> Call for Availability
                </a>
                <a href={mailtoHref(emailSubject, emailBody)} className={buttonStyles({ variant: "outline", size: "lg" })}>
                  <Mail className="size-5" aria-hidden="true" /> Email Our Team
                </a>
              </div>
            </div>

            <ul className="mt-8 space-y-3 border-t border-mist pt-6 text-[15px] text-charcoal">
              {[
                "Speak directly with our sales team about this item",
                `Reference item #${product.id} when you call or email`,
                "Serving businesses throughout Dallas–Fort Worth",
              ].map((text) => (
                <li key={text} className="flex gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent-ink" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>

            {product.isDemo && (
              <DemoNotice className="mt-6">
                Demonstration listing — the details and sample price shown are placeholders, not actual inventory or
                pricing.
              </DemoNotice>
            )}
          </div>
        </Container>
      </section>

      <section className="border-t border-mist py-14 sm:py-16">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-2xl font-extrabold text-navy">Product Details</h2>
            <div className="mt-4 space-y-4 whitespace-pre-line text-[17px] leading-relaxed text-charcoal">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {product.specifications.length > 0 && (
              <>
                <h2 className="mt-12 text-2xl font-extrabold text-navy">Specifications</h2>
                <dl className="mt-5 divide-y divide-mist overflow-hidden rounded-xl border border-mist bg-white">
                  {product.specifications.map((spec) => (
                    <div
                      key={spec.label}
                      className="grid gap-1 px-5 py-3.5 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:gap-6"
                    >
                      <dt className="text-sm font-semibold text-steel">{spec.label}</dt>
                      <dd className="text-[15px] text-charcoal">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-3 text-xs text-steel">
                  Measurements are approximate. Please confirm details with our team before purchase.
                </p>
              </>
            )}
          </div>

          <div id="inquire" className="lg:col-span-5">
            <div className="rounded-2xl border border-mist bg-white p-6 shadow-card sm:p-8">
              <h2 className="text-2xl font-extrabold text-navy">Ask About This Item</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-steel">
                Send a quick inquiry and our sales team can confirm availability, details, and pricing.
              </p>
              <div className="mt-6">
                <InquiryForm
                  product={{ id: product.id, name: product.name, href, image: product.images[0] }}
                  defaultInterest={`${product.name} (Item #${product.id})`}
                  defaultMessage={defaultMessage}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="border-t border-mist bg-white py-16 sm:py-20">
          <Container>
            <SectionHeading
              id="related-heading"
              eyebrow={relatedIsSameCategory ? "Same Category" : "Keep Browsing"}
              title={relatedIsSameCategory ? `More ${category.name}` : "You May Also Like"}
              action={
                <Link href={categoryHref(category.slug)} className={buttonStyles({ variant: "outline" })}>
                  View {category.name} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              }
            />
            <div className="mt-10">
              <ProductGrid products={related} />
            </div>
          </Container>
        </section>
      )}

      {/* Mobile quick actions */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-mist bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-xl gap-3">
          <a
            href={siteConfig.phone.href}
            aria-label={`Call for availability: ${siteConfig.phone.display}`}
            className={buttonStyles({ variant: "secondary", size: "md", className: "flex-1" })}
          >
            <Phone className="size-4" aria-hidden="true" /> Call
          </a>
          <a href="#inquire" className={buttonStyles({ variant: "primary", size: "md", className: "flex-[2]" })}>
            <MessageSquareText className="size-4" aria-hidden="true" /> Ask About This Item
          </a>
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden="true" />

      <JsonLd data={breadcrumbJsonLd(crumbs, siteConfig.url)} />
      <JsonLd data={productJsonLd} />
    </>
  );
}
