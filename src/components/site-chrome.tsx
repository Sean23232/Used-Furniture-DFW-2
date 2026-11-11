import type { ReactNode } from "react";
import { Info, Mail, MapPin, Phone } from "lucide-react";
import { mailtoHref, siteConfig } from "@/lib/site";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { JsonLd } from "./ui";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  alternateName: siteConfig.brandName,
  url: siteConfig.url,
  logo: `${siteConfig.url}/icon.svg`,
  description: siteConfig.description,
  areaServed: siteConfig.serviceArea.cities.map((city) => ({ "@type": "City", name: `${city}, TX` })),
  knowsAbout: ["Used office furniture", "Pre-owned office furniture", "Office desks", "Office chairs", "Conference tables"],
  ...(siteConfig.phone.verified ? { telephone: siteConfig.phone.display } : {}),
  ...(siteConfig.email.verified ? { email: siteConfig.email.address } : {}),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteConfig.url}/#website`,
  name: siteConfig.name,
  url: siteConfig.url,
  publisher: { "@id": `${siteConfig.url}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${siteConfig.url}/furniture?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

function PreviewNotice() {
  if (!siteConfig.prototypeMode) return null;
  return (
    <div className="bg-accent-soft text-accent-ink">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium sm:text-[13px]">
        <Info className="hidden size-4 shrink-0 sm:block" aria-hidden="true" />
        <p>
          <strong className="font-semibold">Preview site:</strong> inventory reflects current pre-owned listings. Phone
          and email details are placeholders pending verification.
        </p>
      </div>
    </div>
  );
}

function UtilityBar() {
  return (
    <div className="hidden bg-navy text-white/80 md:block">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-6 px-6 text-[13px] lg:px-8">
        <p className="hidden items-center gap-2 lg:flex">
          <MapPin className="size-3.5 text-accent-light" aria-hidden="true" />
          Used &amp; pre-owned office furniture for businesses across Dallas–Fort Worth
        </p>
        <div className="ml-auto flex items-center gap-6">
          <a href={siteConfig.phone.href} className="flex items-center gap-2 transition-colors hover:text-white">
            <Phone className="size-3.5 text-accent-light" aria-hidden="true" />
            <span>
              <span className="sr-only">Call our team: </span>
              {siteConfig.phone.short}
            </span>
          </a>
          <a href={mailtoHref("Used office furniture inquiry")} className="flex items-center gap-2 transition-colors hover:text-white">
            <Mail className="size-3.5 text-accent-light" aria-hidden="true" />
            Email Our Team
          </a>
        </div>
      </div>
    </div>
  );
}

/** Public website chrome: notices, header, footer, and site-wide structured data. */
export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <PreviewNotice />
      <UtilityBar />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
    </>
  );
}
