"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { MAIN_NAV, mailtoHref, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { buttonStyles } from "./ui";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    const trigger = menuButtonRef.current;

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
      trigger?.focus();
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-white/95 backdrop-blur-md transition-shadow duration-300",
          scrolled ? "border-mist shadow-[0_8px_28px_-16px_rgba(23,43,58,0.35)]" : "border-mist/70",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
          <Logo />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {MAIN_NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative block rounded-md px-3 py-2 text-[15px] font-semibold transition-colors",
                        active ? "text-navy" : "text-charcoal/75 hover:text-navy",
                      )}
                    >
                      {item.label}
                      {active && (
                        <span aria-hidden="true" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-accent" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={siteConfig.phone.href}
              className={buttonStyles({ variant: "primary", size: "md", className: "max-lg:hidden" })}
            >
              <Phone className="size-4" aria-hidden="true" />
              <span className="xl:hidden">Call Now</span>
              <span className="hidden text-left xl:flex xl:flex-col xl:leading-tight">
                <span className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-navy/70">
                  Call for availability
                </span>
                <span>{siteConfig.phone.short}</span>
              </span>
            </a>
            <a
              href={siteConfig.phone.href}
              aria-label={`Call our team: ${siteConfig.phone.display}`}
              className="inline-flex size-11 items-center justify-center rounded-lg bg-accent text-navy transition-colors hover:bg-accent-light lg:hidden"
            >
              <Phone className="size-5" aria-hidden="true" />
            </a>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label="Open menu"
              className="inline-flex size-11 items-center justify-center rounded-lg border border-mist text-navy transition-colors hover:bg-cream lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden"
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-mist px-4 sm:px-6">
            <Logo onClick={closeMenu} />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeMenu}
              aria-label="Close menu"
              className="inline-flex size-11 items-center justify-center rounded-lg border border-mist text-navy hover:bg-cream"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-2 sm:px-6">
            <ul className="divide-y divide-mist">
              {MAIN_NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between py-4 font-display text-xl font-bold",
                        active ? "text-accent-ink" : "text-navy",
                      )}
                    >
                      {item.label}
                      <ChevronRight className="size-5 text-steel" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="shrink-0 space-y-3 border-t border-mist bg-cream px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-6">
            <a href={siteConfig.phone.href} className={buttonStyles({ variant: "primary", size: "lg", className: "w-full" })}>
              <Phone className="size-5" aria-hidden="true" /> Call for Availability
            </a>
            <a
              href={mailtoHref("Used office furniture inquiry")}
              className={buttonStyles({ variant: "outline", size: "lg", className: "w-full" })}
            >
              <Mail className="size-5" aria-hidden="true" /> Email Our Team
            </a>
            <p className="flex items-center justify-center gap-2 pt-1 text-sm text-steel">
              <MapPin className="size-4" aria-hidden="true" /> Serving businesses across Dallas–Fort Worth
            </p>
          </div>
        </div>
      )}
    </>
  );
}
