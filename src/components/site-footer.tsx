import Link from "next/link";
import { Clock, Mail, MapPin, MessageSquareText, Phone } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { MAIN_NAV, mailtoHref, siteConfig } from "@/lib/site";
import { categoryHref } from "@/lib/utils";
import { Logo } from "./logo";
import { buttonStyles, Container } from "./ui";

const headingClass = "font-display text-sm font-bold uppercase tracking-[0.16em] text-white";
const linkClass = "text-[15px] text-white/75 transition-colors hover:text-white";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy text-white/75">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-4">
            <Logo tone="light" />
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed">
              An independent online showroom for used and pre-owned office furniture, helping businesses across
              Dallas–Fort Worth find practical, value-focused furniture for their workspaces.
            </p>
            <p className="mt-5 flex items-start gap-2.5 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-accent-light" aria-hidden="true" />
              Serving Dallas, Fort Worth, and surrounding DFW communities
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <h2 className={headingClass}>Explore</h2>
            <ul className="mt-5 space-y-3">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact#inquiry-form" className={linkClass}>
                  Request a Quote
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Furniture categories" className="lg:col-span-3">
            <h2 className={headingClass}>Furniture Categories</h2>
            <ul className="mt-5 space-y-3">
              {CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link href={categoryHref(category.slug)} className={linkClass}>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <h2 className={headingClass}>Contact Our Team</h2>
            <ul className="mt-5 space-y-4 text-[15px]">
              <li>
                <a href={siteConfig.phone.href} className="group flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-accent-light" aria-hidden="true" />
                  <span>
                    <span className="block text-xs uppercase tracking-wider text-white/50">Phone</span>
                    <span className="text-white/85 group-hover:text-white">{siteConfig.phone.display}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={mailtoHref("Used office furniture inquiry")} className="group flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-accent-light" aria-hidden="true" />
                  <span>
                    <span className="block text-xs uppercase tracking-wider text-white/50">Email</span>
                    <span className="break-words text-white/85 group-hover:text-white">{siteConfig.email.display}</span>
                  </span>
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent-light" aria-hidden="true" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-white/50">Address</span>
                  <span className="text-white/85">{siteConfig.address.display}</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-accent-light" aria-hidden="true" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-white/50">Hours</span>
                  <span className="text-white/85">{siteConfig.hours.display}</span>
                </span>
              </li>
            </ul>
            <Link
              href="/contact#inquiry-form"
              className={buttonStyles({ variant: "primary", size: "md", className: "mt-6" })}
            >
              <MessageSquareText className="size-4" aria-hidden="true" /> Send an Inquiry
            </Link>
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-[13px] text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} UsedOfficeFurnitureDFW.com. All rights reserved.</p>
          <p>Used &amp; pre-owned office furniture · Dallas–Fort Worth, Texas</p>
        </Container>
      </div>
    </footer>
  );
}
