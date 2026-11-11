import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  LayoutGrid,
  MapPin,
  Palette,
  Phone,
  Recycle,
  Search,
  Tag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { CategoryCard } from "@/components/category-card";
import { DfwMap } from "@/components/dfw-map";
import { InquiryCta } from "@/components/inquiry-cta";
import { ProductRail } from "@/components/product-card";
import { buttonStyles, Container, DemoNotice, Eyebrow, SectionHeading } from "@/components/ui";
import { HOME_CATEGORY_GROUPS } from "@/lib/categories";
import { getFeaturedProducts, getNewArrivals } from "@/lib/inventory";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Used Office Furniture Dallas–Fort Worth | UsedOfficeFurnitureDFW.com" },
  description:
    "Browse quality used office furniture in Dallas–Fort Worth — pre-owned desks, office chairs, workstations, conference tables, filing cabinets, and reception furniture. Call or send an inquiry.",
  alternates: { canonical: "/" },
};

const VALUE_POINTS = [
  { icon: ClipboardCheck, title: "Practical Furniture Solutions", text: "Desks, seating, tables, and storage for everyday business needs." },
  { icon: Tag, title: "Value-Focused Options", text: "Pre-owned pieces that help your furnishing budget go further." },
  { icon: LayoutGrid, title: "Multiple Furniture Categories", text: "From private offices to reception areas, browse by category." },
  { icon: MapPin, title: "Serving the DFW Area", text: "Supporting workplaces across Dallas, Fort Worth, and nearby communities." },
];

const WHY_POINTS = [
  {
    icon: Wallet,
    title: "More Budget-Conscious Workspace Solutions",
    text: "Pre-owned furniture can help you furnish offices, meeting rooms, and reception areas while keeping costs in check.",
  },
  {
    icon: TrendingUp,
    title: "Practical Options for Growing Businesses",
    text: "Add desks, seating, or storage as your team grows — without committing to a full new-furniture project.",
  },
  {
    icon: Palette,
    title: "A Wide Variety of Furniture Styles",
    text: "Explore a changing mix of styles and finishes, from classic wood-tone desks to modern mesh seating.",
  },
  {
    icon: Recycle,
    title: "An Opportunity to Give Quality Furniture Another Use",
    text: "Choosing pre-owned pieces keeps well-built commercial furniture in service for longer.",
  },
];

const POPULAR_LINKS = [
  { label: "Office chairs", href: "/furniture/office-chairs" },
  { label: "Desks", href: "/furniture/desks-workstations" },
  { label: "Conference tables", href: "/furniture/conference-tables" },
  { label: "Filing cabinets", href: "/furniture/filing-storage" },
];

export default async function HomePage() {
  const [featured, newArrivals] = await Promise.all([getFeaturedProducts(6), getNewArrivals(4)]);
  const showDemoNote = [...featured, ...newArrivals].some((product) => product.isDemo);

  return (
    <>
      {/* 1 — Hero */}
      <section className="relative isolate overflow-hidden bg-navy">
        <Image
          src="/images/site/hero-showroom.jpg"
          alt="Organized showroom floor with pre-owned office desks, task chairs, workstations, and filing cabinets"
          fill
          preload
          sizes="100vw"
          className="-z-20 object-cover object-[70%_center]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-navy/75 lg:bg-transparent lg:bg-linear-to-r lg:from-navy/95 lg:via-navy/80 lg:to-navy/20"
        />
        <Container className="pb-24 pt-14 sm:pb-28 sm:pt-20 lg:pb-36 lg:pt-28">
          <div className="max-w-2xl">
            <Eyebrow tone="light">Dallas–Fort Worth · Pre-Owned Office Furniture</Eyebrow>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              Quality Used Office Furniture. <span className="text-accent-light">Smart Value</span> for Your Workspace.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
              Explore a wide selection of pre-owned office desks, chairs, workstations, conference furniture, and more.
              Serving businesses throughout Dallas–Fort Worth.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/furniture" className={buttonStyles({ variant: "primary", size: "lg" })}>
                Browse Available Furniture <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
              <a href={siteConfig.phone.href} className={buttonStyles({ variant: "outline-light", size: "lg" })}>
                <Phone className="size-5" aria-hidden="true" /> Call for Availability
              </a>
            </div>

            <form action="/furniture" method="get" role="search" className="mt-10 max-w-xl">
              <label htmlFor="hero-search" className="text-sm font-medium text-white/80">
                Looking for something specific?
              </label>
              <div className="mt-2 flex gap-2 rounded-xl bg-white p-1.5 shadow-lift focus-within:ring-3 focus-within:ring-accent/60">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-steel" aria-hidden="true" />
                  <input
                    id="hero-search"
                    name="q"
                    type="search"
                    placeholder="Search desks, chairs, tables…"
                    className="h-11 w-full rounded-lg bg-transparent pl-10 pr-3 text-base text-charcoal placeholder:text-steel/70 focus:outline-none"
                  />
                </div>
                <button type="submit" className={buttonStyles({ variant: "secondary", size: "md" })}>
                  Search
                </button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/70">
                <span className="mr-1">Popular:</span>
                {POPULAR_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-white/25 px-3 py-1 text-white/85 transition-colors hover:border-white/60 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </form>
          </div>
        </Container>
      </section>

      {/* 2 — Trust & value strip */}
      <section aria-label="Why businesses shop with us" className="relative z-10 -mt-12">
        <Container>
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-mist bg-mist shadow-lift sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 bg-white p-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-base font-bold text-navy">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-steel">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 3 — Categories */}
      <section aria-labelledby="categories-heading" className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            id="categories-heading"
            eyebrow="Shop by Category"
            title="Browse Used Office Furniture by Category"
            description="Find the right pieces for private offices, open workspaces, meeting rooms, and reception areas."
            action={
              <Link href="/furniture" className={buttonStyles({ variant: "outline" })}>
                View All Furniture <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HOME_CATEGORY_GROUPS.map((group) => (
              <li key={group.title}>
                <CategoryCard {...group} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* 4 — Featured furniture */}
      <section aria-labelledby="featured-heading" className="border-y border-mist bg-white py-20 sm:py-24">
        <Container>
          <SectionHeading
            id="featured-heading"
            eyebrow="Featured Furniture"
            title="Featured Pre-Owned Office Furniture"
            description="A selection of pieces from our current listings. Contact our team to confirm availability and details."
            action={
              <Link href="/furniture" className={buttonStyles({ variant: "outline" })}>
                Browse All Furniture <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            }
          />
          {showDemoNote && (
            <DemoNotice className="mt-8 max-w-3xl">
              Sample listings shown for demonstration. Final inventory, photos, and pricing will be provided by the sales
              team.
            </DemoNotice>
          )}
          <div className="mt-10">
            <ProductRail products={featured} />
          </div>
        </Container>
      </section>

      {/* 5 — New arrivals */}
      <section aria-labelledby="new-arrivals-heading" className="bg-navy py-20 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Eyebrow tone="light">New Arrivals</Eyebrow>
            <h2 id="new-arrivals-heading" className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Recently Added to Our Inventory
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/75">
              Our selection of pre-owned office furniture changes regularly as new pieces are listed. Check back often,
              or tell our team what you&apos;re looking for.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/new-arrivals" className={buttonStyles({ variant: "primary", size: "lg" })}>
                Explore New Arrivals <ArrowRight className="size-5" aria-hidden="true" />
              </Link>
              <a href={siteConfig.phone.href} className={buttonStyles({ variant: "outline-light", size: "lg" })}>
                <Phone className="size-5" aria-hidden="true" /> Call for Availability
              </a>
            </div>
            <p className="mt-6 text-sm text-white/60">Inventory changes frequently — please confirm availability with our team.</p>
          </div>
          <ProductRail products={newArrivals} columns={2} />
        </Container>
      </section>

      {/* 6 — Why pre-owned */}
      <section aria-labelledby="why-heading" className="py-20 sm:py-24">
        <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lift lg:aspect-[4/5]">
              <Image
                src="/images/site/why-preowned.jpg"
                alt="Open-plan office furnished with workstations, task chairs, and storage cabinets"
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-8 right-4 hidden max-w-xs rounded-xl border border-mist bg-white p-5 shadow-lift sm:block lg:-right-6">
              <p className="font-display text-sm font-bold text-navy">Furnishing a new space?</p>
              <p className="mt-1 text-sm leading-relaxed text-steel">
                Tell us about your project and our team can help you explore suitable pieces.
              </p>
              <Link
                href="/contact#inquiry-form"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink hover:underline"
              >
                Start a conversation <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div>
            <SectionHeading
              id="why-heading"
              eyebrow="Why Pre-Owned?"
              title="Why Choose Pre-Owned Office Furniture?"
              description="Used office furniture is a practical way to equip a workspace. Here's why many businesses consider pre-owned pieces."
            />
            <ul className="mt-10 grid gap-8 sm:grid-cols-2">
              {WHY_POINTS.map(({ icon: Icon, title, text }) => (
                <li key={title}>
                  <span className="flex size-11 items-center justify-center rounded-lg bg-navy text-accent-light">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold leading-snug text-navy">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-steel">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* 7 — Serving DFW */}
      <section aria-labelledby="dfw-heading" className="border-t border-mist bg-white py-20 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <Eyebrow>Serving Dallas–Fort Worth</Eyebrow>
            <h2 id="dfw-heading" className="mt-3 text-3xl font-extrabold leading-tight text-navy sm:text-4xl">
              Your Local Destination for Used Office Furniture in DFW.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-steel">
              Explore pre-owned office furniture options for workplaces throughout the Dallas–Fort Worth area.
            </p>
            <p className="mt-4 leading-relaxed text-steel">
              Whether you&apos;re furnishing a new office in Dallas, expanding a team in Fort Worth, or setting up a
              location in Plano, Frisco, Arlington, or Irving, our team can help you explore available pieces and answer
              your questions.
            </p>
            <ul aria-label="Communities in the Dallas–Fort Worth area" className="mt-8 flex flex-wrap gap-2">
              {siteConfig.serviceArea.cities.map((city) => (
                <li key={city} className="rounded-full border border-mist bg-cream px-3 py-1.5 text-sm font-medium text-charcoal">
                  {city}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-steel">Ask our team about pickup and delivery options for your location.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className={buttonStyles({ variant: "secondary", size: "lg" })}>
                Contact Our DFW Team
              </Link>
              <Link href="/furniture" className={buttonStyles({ variant: "outline", size: "lg" })}>
                Browse Furniture
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-mist shadow-card">
            <DfwMap />
          </div>
        </Container>
      </section>

      {/* 8 — Inquiry CTA */}
      <InquiryCta />
    </>
  );
}
