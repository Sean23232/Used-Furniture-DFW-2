import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { Download, ExternalLink, Inbox, Mail, MailCheck, Package, Phone } from "lucide-react";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { buttonStyles } from "@/components/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { emailDeliverySummary, isEmailDeliveryConfigured } from "@/lib/email";
import { inquiryReference } from "@/lib/inquiry";
import { getAllProducts } from "@/lib/inventory";
import { getLiveInventoryStatus } from "@/lib/inventory-live";
import { cn, productHref } from "@/lib/utils";
import { setInquiryStatus } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inquiries" };

const STATUSES = {
  new: { label: "New", badge: "bg-accent-soft text-accent-ink ring-accent/30" },
  contacted: { label: "Contacted", badge: "bg-sky-50 text-sky-800 ring-sky-200" },
  closed: { label: "Closed", badge: "bg-mist text-charcoal ring-steel/20" },
} as const;
type StatusKey = keyof typeof STATUSES;
const isStatus = (value: unknown): value is StatusKey => typeof value === "string" && value in STATUSES;

const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Chicago",
});

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function InquiriesPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();
  const params = await searchParams;
  const filter: StatusKey | "all" = isStatus(params.status) ? params.status : "all";

  const [rows, grouped, products] = await Promise.all([
    db
      .select()
      .from(inquiries)
      .where(filter === "all" ? undefined : eq(inquiries.status, filter))
      .orderBy(desc(inquiries.createdAt))
      .limit(300),
    db.select({ status: inquiries.status, total: sql<number>`count(*)::int` }).from(inquiries).groupBy(inquiries.status),
    getAllProducts(),
  ]);

  const counts: Record<StatusKey | "all", number> = { all: 0, new: 0, contacted: 0, closed: 0 };
  for (const group of grouped) {
    if (isStatus(group.status)) counts[group.status] = group.total;
    counts.all += group.total;
  }
  const productById = new Map(products.map((product) => [product.id, product]));
  const live = getLiveInventoryStatus();
  const emailOn = isEmailDeliveryConfigured();
  const tabs: { key: StatusKey | "all"; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "contacted", label: "Contacted" },
    { key: "closed", label: "Closed" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-navy">Inquiries</h1>
          <p className="mt-1 text-steel">Every inquiry submitted on the website, newest first.</p>
        </div>
        <a href="/admin/inquiries/export" className={buttonStyles({ variant: "outline", size: "sm" })}>
          <Download className="size-4" aria-hidden="true" /> Export CSV
        </a>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div
          className={cn(
            "flex gap-3 rounded-xl border p-4 text-sm",
            emailOn ? "border-emerald-200 bg-emerald-50" : "border-accent/30 bg-accent-soft",
          )}
        >
          {emailOn ? (
            <MailCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden="true" />
          ) : (
            <Mail className="mt-0.5 size-5 shrink-0 text-accent-ink" aria-hidden="true" />
          )}
          <div>
            <p className="font-semibold text-navy">{emailOn ? "Email alerts are on" : "Email alerts are off"}</p>
            <p className="mt-0.5 leading-relaxed text-charcoal/80">
              {emailOn
                ? `New inquiries are also emailed (${emailDeliverySummary()}).`
                : "New inquiries appear here instantly. Connect an email service (Resend or SMTP) to also receive email alerts."}
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border border-mist bg-white p-4 text-sm">
          <Package className="mt-0.5 size-5 shrink-0 text-steel" aria-hidden="true" />
          <div>
            <p className="font-semibold text-navy">{products.length} live inventory listings</p>
            <p className="mt-0.5 leading-relaxed text-charcoal/80">
              {live.lastCheckedAt
                ? `Last automatic check ${dateFormat.format(new Date(live.lastCheckedAt))}: ${live.lastResult}`
                : "Sold items are hidden automatically — the inventory feed is re-checked every 30 minutes."}
            </p>
          </div>
        </div>
      </div>

      <nav aria-label="Filter inquiries by status" className="mt-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "all" ? "/admin/inquiries" : `/admin/inquiries?status=${tab.key}`}
            aria-current={filter === tab.key ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              filter === tab.key ? "border-navy bg-navy text-white" : "border-mist bg-white text-navy hover:border-navy/30",
            )}
          >
            {tab.label} <span className="ml-1 tabular-nums opacity-70">{counts[tab.key]}</span>
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-steel/30 bg-white px-6 py-16 text-center">
          <Inbox className="mx-auto size-10 text-steel" aria-hidden="true" />
          <p className="mt-4 font-display text-xl font-bold text-navy">No inquiries here yet</p>
          <p className="mx-auto mt-2 max-w-md text-steel">
            Inquiries sent from product pages and the contact page will appear here the moment they are submitted.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {rows.map((row) => {
            const reference = inquiryReference(row.id);
            const status = isStatus(row.status) ? row.status : "new";
            const product = row.productCode ? productById.get(row.productCode) : undefined;
            const phoneDigits = row.phone?.replace(/[^\d+]/g, "");
            return (
              <li key={row.id}>
                <article className="rounded-2xl border border-mist bg-white p-5 shadow-card sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-steel">
                        {reference} · {dateFormat.format(row.createdAt)}
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-navy">
                        {row.fullName}
                        {row.businessName && <span className="font-medium text-steel"> · {row.businessName}</span>}
                      </h2>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
                        STATUSES[status].badge,
                      )}
                    >
                      {STATUSES[status].label}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <a
                      href={`mailto:${row.email}?subject=${encodeURIComponent(`Re: your furniture inquiry (${reference})`)}`}
                      className="inline-flex items-center gap-1.5 font-semibold text-navy hover:text-accent-ink"
                    >
                      <Mail className="size-4" aria-hidden="true" /> {row.email}
                    </a>
                    {row.phone && phoneDigits && (
                      <a href={`tel:${phoneDigits}`} className="inline-flex items-center gap-1.5 font-semibold text-navy hover:text-accent-ink">
                        <Phone className="size-4" aria-hidden="true" /> {row.phone}
                      </a>
                    )}
                  </div>

                  {(row.furnitureInterest || product) && (
                    <p className="mt-3 text-sm text-charcoal">
                      <span className="font-semibold text-navy">Interested in:</span> {row.furnitureInterest || product?.name}
                      {product && (
                        <Link
                          href={productHref(product)}
                          target="_blank"
                          className="ml-2 inline-flex items-center gap-1 font-semibold text-accent-ink hover:underline"
                        >
                          View listing <ExternalLink className="size-3.5" aria-hidden="true" />
                        </Link>
                      )}
                    </p>
                  )}

                  <p className="mt-3 whitespace-pre-line rounded-xl bg-cream p-4 text-[15px] leading-relaxed text-charcoal">
                    {row.message}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {(Object.keys(STATUSES) as StatusKey[])
                      .filter((key) => key !== status)
                      .map((key) => (
                        <form key={key} action={setInquiryStatus}>
                          <input type="hidden" name="id" value={row.id} />
                          <input type="hidden" name="status" value={key} />
                          <button type="submit" className={buttonStyles({ variant: "outline", size: "sm" })}>
                            {key === "new" ? "Reopen" : `Mark ${STATUSES[key].label.toLowerCase()}`}
                          </button>
                        </form>
                      ))}
                    <span className="ml-auto text-xs text-steel">
                      {row.emailDelivered ? "Email alert sent" : "Delivered to inbox"}
                      {row.sourcePage ? ` · from ${row.sourcePage}` : ""}
                    </span>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
