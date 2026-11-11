import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Armchair, ArrowRight, Handshake, MapPin, Phone, Search } from "lucide-react";
import { InquiryCta } from "@/components/inquiry-cta";
import { breadcrumbJsonLd, Breadcrumbs, buttonStyles, Container, Eyebrow, JsonLd, SectionHeading, type Crumb } from "@/components/ui";
import { PLACEHOLDERS, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us — Used Office Furniture Specialists Serving DFW",
  description:
    "UsedOfficeFurnitureDFW.com specializes in used and pre-owned office furniture for businesses across Dallas–Fort Worth. Browse online, then speak directly with our sales team.",
  alternates: { canonical: "/about" },
};

const OFFERINGS = [
  {
    icon: Armchair,
    title: "Specialists in Pre-Owned Office Furniture",
    text: "We focus on used and pre-owned office furniture — desks, seating, tables, storage, workstations, and reception pieces for commercial spaces.",
  },
  {
    icon: Search,
    title: "Help Exploring Your Options",
    text: "Browse our online showroom by category, search for specific pieces, and review photos, descriptions, and pricing where available.",
  },
  {
    icon: Handshake,
    title: "Direct Access to Our Sales Team",
    text: "Speak directly with our team about availability, details, and pricing. Purchases are arranged personally — never through an automated checkout.",
  },
];

const STEPS = [
  { title: "Browse the catalog", text: "Explore furniture by category or search for the specific pieces you need." },
  { title: "Ask about an item", text: "Call, email, or send an inquiry. Item numbers make it easy to reference a piece." },
  { title: "Talk with our team", text: "Our sales team confirms availability, answers questions, and discusses pricing." },
  { title: "Finalize directly", text: "Arrangements are completed directly with our team. No online payment is required." },
];

export default function AboutPage() {
  const crumbs: Crumb[] = [{ label: "Home", href: "/" }, { label: "About Us" }];

  return (
    <>
      <section className="border-b border-mist bg-white">
        <Container className="py-8 sm:py-12 lg:py-16">
          <Breadcrumbs items={crumbs} />
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow>About Us</Eyebrow>
              <h1 className="mt-3 text-3xl font-extrabold leading-[1.1] text-navy sm:text-4xl lg:text-5xl">
                Practical Office Furniture Solutions for Businesses Across DFW.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-steel">
                UsedOfficeFurnitureDFW.com is an online showroom dedicated to used and pre-owned office furniture. We
                help businesses throughout Dallas–Fort Worth explore practical, value-focused furniture options for their
                workplaces.
              </p>
              <p className="mt-4 leading-relaxed text-steel">
                Browse our listings at your own pace, then speak directly with our sales team about the pieces
                you&apos;re interested in. We&apos;re here to answer questions and help you find furniture that fits
                your space.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/furniture" className={buttonStyles({ variant: "primary", size: "lg" })}>
                  Browse Furniture <ArrowRight className="size-5" aria-hidden="true" />
                </Link>
                <a href={siteConfig.phone.href} className={buttonStyles({ variant: "outline", size: "lg" })}>
                  <Phone className="size-5" aria-hidden="true" /> Call Our Team
                </a>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lift">
              <Image
                src="/images/site/about-office.jpg"
                alt="Commercial office interior with upholstered seating, desks, and task chairs"
                fill
                preload
                sizes="(min-width: 1024px) 600px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="what-we-do" className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            id="what-we-do"
            eyebrow="What We Do"
            title="A Dedicated Source for Used Office Furniture"
            description="Everything on this website is focused on one thing: helping DFW businesses find pre-owned office furniture."
          />
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {OFFERINGS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-2xl border border-mist bg-white p-7 shadow-card">
                <span className="flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-xl font-bold leading-snug text-navy">{title}</h3>
                <p className="mt-3 leading-relaxed text-steel">{text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="how-it-works" className="bg-navy py-20 sm:py-24">
        <Container>
          <SectionHeading
            id="how-it-works"
            tone="light"
            eyebrow="How It Works"
            title="From Browsing to Your Workspace"
            description="There's no shopping cart or online checkout. Our sales team handles every inquiry personally."
          />
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="font-display text-sm font-extrabold tracking-[0.2em] text-accent-light">
                  STEP {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-xl font-bold text-white">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-white/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section aria-labelledby="serving-dfw" className="py-20 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative order-last aspect-[4/3] overflow-hidden rounded-2xl shadow-card lg:order-first">
            <Image
              src="/images/site/training-room.jpg"
              alt="Training room furnished with white tables and black mesh chairs"
              fill
              sizes="(min-width: 1024px) 600px, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <Eyebrow>Serving the DFW Market</Eyebrow>
            <h2 id="serving-dfw" className="mt-3 text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
              Focused on Workplaces Across Dallas–Fort Worth
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-steel">
              From corporate offices in Dallas to growing teams in Fort Worth and the surrounding suburbs, we serve
              businesses throughout the Dallas–Fort Worth metroplex.
            </p>
            <p className="mt-6 flex items-start gap-2 text-[15px] leading-relaxed text-charcoal">
              <MapPin className="mt-1 size-4 shrink-0 text-accent-ink" aria-hidden="true" />
              {siteConfig.serviceArea.cities.join(" · ")}
            </p>
            <Link href="/contact" className={buttonStyles({ variant: "secondary", size: "lg", className: "mt-8" })}>
              Contact Our Team
            </Link>
          </div>
        </Container>
      </section>

      {siteConfig.prototypeMode && (
        <section aria-labelledby="company-details" className="pb-4">
          <Container>
            <div className="rounded-2xl border-2 border-dashed border-steel/30 bg-white p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">
                Editable placeholder · awaiting verified company information
              </p>
              <h2 id="company-details" className="mt-2 text-2xl font-extrabold text-navy">
                Our Story
              </h2>
              <dl className="mt-6 grid gap-6 md:grid-cols-3">
                <div>
                  <dt className="text-sm font-semibold text-steel">Company background</dt>
                  <dd className="mt-1 text-charcoal">[INSERT VERIFIED COMPANY BACKGROUND]</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-steel">Showroom / warehouse address</dt>
                  <dd className="mt-1 text-charcoal">{siteConfig.address.verified ? siteConfig.address.display : PLACEHOLDERS.address}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-steel">Business hours</dt>
                  <dd className="mt-1 text-charcoal">{siteConfig.hours.display}</dd>
                </div>
              </dl>
            </div>
          </Container>
        </section>
      )}

      <InquiryCta />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteConfig.url)} />
    </>
  );
}
