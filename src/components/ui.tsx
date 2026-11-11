import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

type ButtonVariant = "primary" | "secondary" | "outline" | "outline-light" | "ghost" | "light";
type ButtonSize = "sm" | "md" | "lg";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-navy shadow-xs hover:bg-accent-light",
  secondary: "bg-navy text-white shadow-xs hover:bg-navy-800",
  outline: "border border-navy/20 bg-white text-navy hover:border-navy/40 hover:bg-cream",
  "outline-light": "border border-white/40 text-white hover:border-white/70 hover:bg-white/10",
  ghost: "text-navy hover:bg-mist",
  light: "bg-white text-navy shadow-xs hover:bg-cream",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3.5 text-sm",
  md: "min-h-11 px-5 text-[15px]",
  lg: "min-h-12 px-6 text-base sm:min-h-13 sm:px-7",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg text-center font-semibold leading-tight transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60",
    BUTTON_VARIANTS[variant],
    BUTTON_SIZES[size],
    className,
  );
}

export function Eyebrow({
  children,
  tone = "dark",
  className,
}: {
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs font-bold uppercase tracking-[0.18em] sm:text-[13px]",
        tone === "light" ? "text-accent-light" : "text-accent-ink",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  tone = "dark",
  align = "left",
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
  id?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {eyebrow && <Eyebrow tone={tone === "light" ? "light" : "dark"}>{eyebrow}</Eyebrow>}
        <h2
          id={id}
          className={cn(
            "mt-3 text-3xl font-extrabold leading-tight sm:text-4xl",
            tone === "light" ? "text-white" : "text-navy",
          )}
        >
          {title}
        </h2>
        {description && (
          <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", tone === "light" ? "text-white/75" : "text-steel")}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-steel">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link href={item.href} className="rounded underline-offset-4 hover:text-navy hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className={cn(isLast && "font-medium text-navy")}>
                  {item.label}
                </span>
              )}
              {!isLast && <ChevronRight className="size-3.5 text-steel/60" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function breadcrumbJsonLd(items: Crumb[], baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href === "/" ? "" : item.href}` } : {}),
    })),
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumbs,
  image,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  breadcrumbs?: Crumb[];
  image?: { src: string; alt: string; position?: string };
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-mist bg-white">
      <Container className="py-8 sm:py-12 lg:py-14">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <div
          className={cn(
            "mt-6 grid items-center gap-8",
            image && "lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-12",
          )}
        >
          <div className="max-w-3xl">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <h1 className="mt-3 text-3xl font-extrabold leading-[1.1] text-navy sm:text-4xl lg:text-5xl">{title}</h1>
            {description && <p className="mt-4 text-base leading-relaxed text-steel sm:text-lg">{description}</p>}
            {children}
          </div>
          {image && (
            <div className="relative hidden aspect-[16/10] overflow-hidden rounded-2xl border border-mist shadow-card lg:block">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="26rem"
                className="object-cover"
                style={image.position ? { objectPosition: image.position } : undefined}
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

export function DemoNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-lg border border-accent/30 bg-accent-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-accent-ink",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
