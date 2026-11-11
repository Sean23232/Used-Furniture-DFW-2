# UsedOfficeFurnitureDFW.com — Online Showroom

An independent product showroom and lead-generation website for used and pre-owned office
furniture in the Dallas–Fort Worth market. Built with Next.js (App Router), Tailwind CSS,
PostgreSQL, and Drizzle ORM.

> **No shopping cart, checkout, payments, or customer accounts** — by design. Visitors browse,
> then contact the sales team by phone, email, or inquiry form.

## What's live

| Area | Status |
| --- | --- |
| **Inventory** | Real pre-owned inventory (207 listings at last sync) imported from the existing used-furniture feed, with photos re-hosted on this site. Sold items are hidden automatically. |
| **Inquiries** | Every inquiry is delivered instantly to the password-protected **Sales Inbox** at `/admin`. Email alerts switch on as soon as an email service is configured (see below). |
| **Contact details** | Placeholders until verified values are supplied (see "Business details"). |

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Homepage: hero, value strip, categories, featured items, new arrivals, why pre-owned, DFW service area, inquiry CTA |
| `/furniture` | Catalog with search, multi-category filters, pricing filter, sorting, "show more" paging, mobile filter drawer, shareable URLs |
| `/furniture/[category]` | SEO landing page for each category (e.g. `/furniture/office-chairs`) |
| `/furniture/[category]/[slug]` | Product detail: photo gallery, specifications, price, call/email actions, prefilled inquiry form |
| `/new-arrivals` | Featured furniture, recently added products, deals (when flagged), availability CTA |
| `/about`, `/contact` | About page and contact page (`/contact?item=UOF-22125` pre-fills the form) |
| `/admin` | Sales Inbox (staff only, not indexed) |
| `/sitemap.xml`, `/robots.txt` | Generated automatically, including every category and listing |

## Live inventory

- **Full sync (new items, photos, edits):** `node scripts/sync-inventory.mjs`
  Fetches all in-stock listings, maps them to this site's categories, strips third-party branding,
  phone numbers, internal stock codes and quantity claims, re-hosts up to 4 optimized photos per item
  in `public/images/inventory/`, writes `src/data/inventory-snapshot.json`, upserts the `products`
  table, and unpublishes items that are no longer listed. Rebuild/redeploy afterwards so new photos
  are served. `--dry-run` previews the mapping without writing anything.
- **Automatic refresh:** while the site runs, it re-checks the feed every 30 minutes
  (`INVENTORY_REFRESH_MINUTES`) to hide sold items and apply price changes. Disable with
  `INVENTORY_LIVE_SYNC=false`. A safety check prevents mass changes from a broken feed.
- Item numbers use the format `UOF-<source product ID>` so the sales team can match listings.
- Availability labels are never shown unless explicitly confirmed (`availability` column).
- Newest 8 listings are flagged as New Arrivals; one standout per key category is Featured. Both flags
  (and any listing field) can be edited in the database, e.g. with `npx drizzle-kit studio`.

## Sales Inbox (`/admin`)

- Sign in with `ADMIN_PASSWORD` (set in `.env`; sessions are signed with `ADMIN_SESSION_SECRET`).
- See every inquiry in real time with the customer's details, item link, and message.
- Track follow-up status (New → Contacted → Closed) and export everything to CSV.

## Email alerts for new inquiries

Inquiries are always stored in the Sales Inbox. To **also** email them to the sales team, set the
recipient and ONE provider, then restart:

```
INQUIRY_NOTIFY_EMAIL="sales@yourdomain.com"     # comma-separate multiple recipients

# Option A — Resend (https://resend.com)
RESEND_API_KEY="re_..."
INQUIRY_FROM_EMAIL="Website <inquiries@yourdomain.com>"   # domain verified with Resend

# Option B — any SMTP mailbox (Microsoft 365, Google Workspace, Zoho, cPanel…)
SMTP_HOST="smtp.office365.com"
SMTP_PORT="587"
SMTP_USER="sales@yourdomain.com"
SMTP_PASS="app-password"
```

The Sales Inbox shows whether email alerts are on, and each inquiry records whether an alert was sent.

## Business details (placeholders until verified)

Contact details are **not invented**. Placeholders such as `[INSERT VERIFIED BUSINESS PHONE]` are
shown until these environment variables are set, then the site is rebuilt:

```
NEXT_PUBLIC_BUSINESS_PHONE="(214) 000-0000"
NEXT_PUBLIC_BUSINESS_EMAIL="sales@yourdomain.com"
NEXT_PUBLIC_BUSINESS_ADDRESS="Street, City, TX"      # optional
NEXT_PUBLIC_BUSINESS_HOURS="Mon–Fri, 8am–5pm"         # optional
NEXT_PUBLIC_SITE_URL="https://www.usedofficefurnituredfw.com"
NEXT_PUBLIC_PROTOTYPE_MODE="false"                    # hides preview notices at launch
```

## Data model

`products` (inventory) and `inquiries` (leads) are defined in `src/db/schema.ts`.
`price_usd` NULL shows "Contact for Pricing"; `availability` NULL shows no availability label;
`published` false hides a listing; `is_demo` marks demonstration content
(`src/data/demo-inventory.ts` is only used if no inventory snapshot exists).

## Imagery

Listing photos come from the inventory feed (re-hosted). Category and section photos are Pexels stock
photography; the homepage hero is a generated showroom image.

## Development

```
npm run dev                         # local development
node scripts/sync-inventory.mjs     # refresh inventory + photos
npx drizzle-kit push                # apply schema changes
npm run build                       # production build
```
