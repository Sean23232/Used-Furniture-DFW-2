import Link from "next/link";
import { CATEGORY_MAP } from "@/lib/categories";
import { ContainedImage } from "./contained-image";
import { AVAILABILITY_LABELS, type AvailabilityStatus, type Product } from "@/lib/types";
import { categoryHref, cn, formatPrice, inquireHref, productHref } from "@/lib/utils";
import { buttonStyles } from "./ui";

export function PriceBlock({ product, size = "md" }: { product: Product; size?: "md" | "lg" }) {
  if (product.price === null) {
    return (
      <div>
        <p className={cn("font-display font-bold text-navy", size === "lg" ? "text-2xl sm:text-3xl" : "text-base")}>
          Contact for Pricing
        </p>
        <p className="mt-0.5 text-xs text-steel">Call or send an inquiry for a quote</p>
      </div>
    );
  }

  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-1.5">
        <span
          className={cn(
            "font-display font-extrabold tracking-tight text-navy",
            size === "lg" ? "text-3xl sm:text-4xl" : "text-xl",
          )}
        >
          {formatPrice(product.price)}
        </span>
        {product.priceNote && <span className="text-sm text-steel">{product.priceNote}</span>}
      </p>
      {product.isDemo && (
        <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-steel">Sample price · demo listing</p>
      )}
    </div>
  );
}

const AVAILABILITY_STYLES: Record<AvailabilityStatus, string> = {
  available: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  "on-hold": "bg-amber-50 text-amber-800 ring-amber-200",
  sold: "bg-mist text-charcoal ring-steel/20",
};

/** Only rendered when availability has been confirmed by the sales team. */
export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        AVAILABILITY_STYLES[status],
      )}
    >
      {AVAILABILITY_LABELS[status]}
    </span>
  );
}

export function ProductCard({
  product,
  imageLoading = "lazy",
  sizes = "(min-width: 1280px) 384px, (min-width: 640px) 50vw, 90vw",
}: {
  product: Product;
  imageLoading?: "lazy" | "eager";
  sizes?: string;
}) {
  const href = productHref(product);
  const category = CATEGORY_MAP[product.category];
  const image = product.images[0];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-mist bg-white shadow-card transition-shadow duration-300 hover:shadow-lift">
      <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[4/3] overflow-hidden bg-mist">
        {image ? (
          <ContainedImage
            src={image.src}
            alt={image.alt}
            sizes={sizes}
            loading={imageLoading}
            className="transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-sm text-steel">Photo coming soon</span>
        )}
        {(product.newArrival || product.isDeal) && (
          <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.newArrival && (
              <span className="rounded-md bg-accent px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-navy shadow-sm">
                New Arrival
              </span>
            )}
            {product.isDeal && (
              <span className="rounded-md bg-navy px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
                Featured Deal
              </span>
            )}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={categoryHref(product.category)}
            className="text-xs font-semibold uppercase tracking-[0.14em] text-steel transition-colors hover:text-accent-ink"
          >
            {category.name}
          </Link>
          <span className="shrink-0 text-xs tabular-nums text-steel">#{product.id}</span>
        </div>
        <h3 className="mt-2 font-display text-lg font-bold leading-snug text-navy">
          <Link href={href} className="transition-colors hover:text-accent-ink">
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-steel">{product.shortDescription}</p>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between gap-3 border-t border-mist pt-4">
            <PriceBlock product={product} />
            {product.availability && <AvailabilityBadge status={product.availability} />}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={href}
              aria-label={`View Details: ${product.name}`}
              className={buttonStyles({ variant: "outline", size: "sm", className: "grow basis-28" })}
            >
              View Details
            </Link>
            <Link
              href={inquireHref(product)}
              aria-label={`Ask About This Item: ${product.name}`}
              className={buttonStyles({ variant: "primary", size: "sm", className: "grow-[1.4] basis-40" })}
            >
              Ask About This Item
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, className }: { products: Product[]; className?: string }) {
  return (
    <ul className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

/** Horizontal swipe rail on phones, regular grid from the small breakpoint up. */
export function ProductRail({ products, columns = 3 }: { products: Product[]; columns?: 2 | 3 }) {
  return (
    <ul
      className={cn(
        "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0",
        columns === 3 && "lg:grid-cols-3",
      )}
    >
      {products.map((product) => (
        <li key={product.id} className="w-[82%] shrink-0 snap-start sm:w-auto">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
