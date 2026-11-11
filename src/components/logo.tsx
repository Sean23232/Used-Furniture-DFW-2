import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("size-10 shrink-0", className)} aria-hidden="true" focusable="false">
      <rect width="40" height="40" rx="9" fill={tone === "light" ? "#23394A" : "#172B3A"} />
      {/* Desktop */}
      <rect x="7" y="12" width="26" height="4.2" rx="1.4" fill="#C58A4A" />
      {/* Leg */}
      <rect x="9.5" y="16.2" width="3.2" height="12.8" rx="1" fill="#F6F5F1" />
      {/* Drawer pedestal */}
      <rect x="22" y="16.2" width="8.5" height="12.8" rx="1.2" fill="#F6F5F1" />
      <rect x="24" y="20" width="4.5" height="1.4" rx="0.7" fill="#172B3A" />
      <rect x="24" y="24.4" width="4.5" height="1.4" rx="0.7" fill="#172B3A" />
    </svg>
  );
}

export function Logo({
  tone = "dark",
  className,
  onClick,
}: {
  tone?: "dark" | "light";
  className?: string;
  onClick?: () => void;
}) {
  const light = tone === "light";
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Used Office Furniture DFW — home"
      className={cn("inline-flex items-center gap-3 rounded-md", className)}
    >
      <LogoMark tone={tone} />
      <span className="flex flex-col">
        <span
          className={cn(
            "font-display text-[15px] font-extrabold leading-[1.1] tracking-tight sm:text-lg sm:leading-none",
            light ? "text-white" : "text-navy",
          )}
        >
          <span className="block sm:inline">Used Office </span>
          <span className="block sm:inline">
            Furniture <span className={light ? "text-accent-light" : "text-accent-ink"}>DFW</span>
          </span>
        </span>
        <span
          className={cn(
            "mt-1.5 hidden text-[10.5px] font-semibold uppercase tracking-[0.2em] sm:block",
            light ? "text-white/60" : "text-steel",
          )}
        >
          Pre-Owned · Dallas–Fort Worth
        </span>
      </span>
    </Link>
  );
}
