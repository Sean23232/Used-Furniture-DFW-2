/**
 * Central business configuration.
 *
 * IMPORTANT: Contact details are intentionally NOT invented. Until verified
 * details are supplied, clearly identifiable placeholders are displayed.
 * Provide verified values through environment variables:
 *   NEXT_PUBLIC_BUSINESS_PHONE   e.g. "(214) 000-0000"
 *   NEXT_PUBLIC_BUSINESS_EMAIL   e.g. "sales@yourdomain.com"
 *   NEXT_PUBLIC_BUSINESS_ADDRESS e.g. "123 Example St, Dallas, TX"
 *   NEXT_PUBLIC_BUSINESS_HOURS   e.g. "Mon–Fri, 8am–5pm"
 *   NEXT_PUBLIC_SITE_URL         e.g. "https://www.usedofficefurnituredfw.com"
 *   NEXT_PUBLIC_PROTOTYPE_MODE   set to "false" to hide prototype notices
 */

const clean = (value: string | undefined) => (value && value.trim() ? value.trim() : undefined);

const verifiedPhone = clean(process.env.NEXT_PUBLIC_BUSINESS_PHONE);
const verifiedEmail = clean(process.env.NEXT_PUBLIC_BUSINESS_EMAIL);
const verifiedAddress = clean(process.env.NEXT_PUBLIC_BUSINESS_ADDRESS);
const verifiedHours = clean(process.env.NEXT_PUBLIC_BUSINESS_HOURS);

export const PLACEHOLDERS = {
  phone: "[INSERT VERIFIED BUSINESS PHONE]",
  email: "[INSERT VERIFIED BUSINESS EMAIL]",
  address: "[INSERT VERIFIED ADDRESS IF PROVIDED]",
  hours: "[INSERT VERIFIED BUSINESS HOURS]",
} as const;

export const siteConfig = {
  name: "UsedOfficeFurnitureDFW.com",
  brandName: "Used Office Furniture DFW",
  url: (clean(process.env.NEXT_PUBLIC_SITE_URL) ?? "https://www.usedofficefurnituredfw.com").replace(/\/$/, ""),
  description:
    "An independent online showroom for quality used and pre-owned office furniture — desks, chairs, workstations, conference tables, storage, and reception furniture — serving businesses throughout Dallas–Fort Worth, Texas.",
  prototypeMode: process.env.NEXT_PUBLIC_PROTOTYPE_MODE !== "false",
  phone: {
    /** Full display value (placeholder until verified). */
    display: verifiedPhone ?? PLACEHOLDERS.phone,
    /** Compact display for tight UI such as the header button. */
    short: verifiedPhone ?? "(XXX) XXX-XXXX",
    href: `tel:${verifiedPhone ? verifiedPhone.replace(/[^\d+]/g, "") : "+10000000000"}`,
    verified: Boolean(verifiedPhone),
  },
  email: {
    display: verifiedEmail ?? PLACEHOLDERS.email,
    /** Empty until verified — mailto links then open a blank, pre-filled draft. */
    address: verifiedEmail ?? "",
    verified: Boolean(verifiedEmail),
  },
  address: { display: verifiedAddress ?? PLACEHOLDERS.address, verified: Boolean(verifiedAddress) },
  hours: { display: verifiedHours ?? PLACEHOLDERS.hours, verified: Boolean(verifiedHours) },
  serviceArea: {
    region: "Dallas–Fort Worth, Texas",
    cities: [
      "Dallas",
      "Fort Worth",
      "Arlington",
      "Plano",
      "Irving",
      "Frisco",
      "McKinney",
      "Denton",
      "Garland",
      "Grand Prairie",
      "Richardson",
      "Carrollton",
      "Lewisville",
      "Mesquite",
      "Allen",
      "Southlake",
      "Mansfield",
    ],
  },
} as const;

export const MAIN_NAV = [
  { label: "Home", href: "/" },
  { label: "Browse Furniture", href: "/furniture" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/** Builds a mailto: link with an optional pre-filled subject and body. */
export function mailtoHref(subject?: string, body?: string): string {
  const parts: string[] = [];
  if (subject) parts.push(`subject=${encodeURIComponent(subject)}`);
  if (body) parts.push(`body=${encodeURIComponent(body)}`);
  return `mailto:${siteConfig.email.address}${parts.length ? `?${parts.join("&")}` : ""}`;
}
