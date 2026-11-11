import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { InquiryForm } from "@/components/inquiry-form";
import { breadcrumbJsonLd, Container, JsonLd, PageHeader, type Crumb } from "@/components/ui";
import { getProductById } from "@/lib/inventory";
import { mailtoHref, siteConfig } from "@/lib/site";
import { firstParam, productHref } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Our Used Office Furniture Team in DFW",
  description:
    "Call, email, or send an inquiry to the UsedOfficeFurnitureDFW.com sales team about used office furniture in Dallas, Fort Worth, and surrounding DFW communities.",
  alternates: { canonical: "/contact" },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function ContactCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-mist bg-white p-5 shadow-card sm:p-6">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">{icon}</span>
      <div className="min-w-0">
        <h2 className="font-display text-lg font-bold text-navy">{title}</h2>
        <div className="mt-1 text-[15px] leading-relaxed text-steel">{children}</div>
      </div>
    </div>
  );
}

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const itemId = (firstParam(params.item) ?? "").slice(0, 40);
  const product = itemId ? await getProductById(itemId) : null;
  const interest = (firstParam(params.interest) ?? "").slice(0, 200);

  const defaultInterest = product ? `${product.name} (Item #${product.id})` : interest;
  const defaultMessage = product
    ? `I'm interested in the ${product.name}. Please contact me with more information.`
    : "";

  const crumbs: Crumb[] = [{ label: "Home", href: "/" }, { label: "Contact" }];

  return (
    <>
      <PageHeader
        breadcrumbs={crumbs}
        eyebrow="Contact Our Team"
        title="Let's Find the Right Furniture for Your Workspace."
        description="Call, email, or send an inquiry about any item. Our sales team handles availability, questions, and pricing directly — there's no online checkout."
      />

      <section className="py-12 sm:py-16">
        <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-4 lg:col-span-5">
            <ContactCard icon={<Phone className="size-5" aria-hidden="true" />} title="Call Our Sales Team">
              <a href={siteConfig.phone.href} className="block break-words text-lg font-semibold text-navy hover:text-accent-ink">
                {siteConfig.phone.display}
              </a>
              <p className="mt-1">Call for availability, pricing, and item details.</p>
            </ContactCard>

            <ContactCard icon={<Mail className="size-5" aria-hidden="true" />} title="Email Our Team">
              <a
                href={mailtoHref("Used office furniture inquiry")}
                className="block break-words text-lg font-semibold text-navy hover:text-accent-ink"
              >
                {siteConfig.email.display}
              </a>
              <p className="mt-1">Include item numbers, quantities, or photos of your space.</p>
            </ContactCard>

            <ContactCard icon={<MapPin className="size-5" aria-hidden="true" />} title="Service Area">
              <p className="font-semibold text-charcoal">Dallas–Fort Worth, Texas</p>
              <p className="mt-1">{siteConfig.serviceArea.cities.join(", ")}, and surrounding communities.</p>
              <p className="mt-3 text-sm">
                <span className="font-semibold text-charcoal">Address:</span> {siteConfig.address.display}
              </p>
            </ContactCard>

            <ContactCard icon={<Clock className="size-5" aria-hidden="true" />} title="Business Hours">
              <p>{siteConfig.hours.display}</p>
            </ContactCard>

            <div className="rounded-2xl bg-navy p-6 text-white">
              <h2 className="font-display text-lg font-bold text-white">What happens next?</h2>
              <ol className="mt-4 space-y-3 text-[15px] text-white/80">
                {[
                  "Our team reviews your inquiry and the items you're interested in.",
                  "We confirm current availability and answer your questions.",
                  "We discuss pricing and next steps directly with you.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-navy">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div id="inquiry-form" className="lg:col-span-7">
            <div className="rounded-2xl border border-mist bg-white p-6 shadow-card sm:p-8 lg:p-10">
              <h2 className="text-2xl font-extrabold text-navy sm:text-3xl">Send an Inquiry</h2>
              <p className="mt-2 leading-relaxed text-steel">
                Tell us what you&apos;re looking for. Include an item number if you have one.
              </p>
              <div className="mt-8">
                <InquiryForm
                  key={product?.id ?? interest}
                  product={
                    product
                      ? { id: product.id, name: product.name, href: productHref(product), image: product.images[0] }
                      : undefined
                  }
                  defaultInterest={defaultInterest}
                  defaultMessage={defaultMessage}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <JsonLd data={breadcrumbJsonLd(crumbs, siteConfig.url)} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact UsedOfficeFurnitureDFW.com",
          url: `${siteConfig.url}/contact`,
          about: { "@id": `${siteConfig.url}/#organization` },
        }}
      />
    </>
  );
}
