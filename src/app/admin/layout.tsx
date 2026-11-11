import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { buttonStyles } from "@/components/ui";
import { isAdminSession } from "@/lib/admin-auth";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: { default: "Sales Inbox", template: "%s | Sales Inbox" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const signedIn = await isAdminSession();

  return (
    <div className="flex min-h-dvh flex-1 flex-col bg-cream">
      <header className="border-b border-mist bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href={signedIn ? "/admin/inquiries" : "/admin/login"} className="flex items-center gap-3 rounded-md">
            <LogoMark className="size-9" />
            <span className="flex flex-col leading-tight">
              <span className="font-display text-lg font-extrabold text-navy">Sales Inbox</span>
              <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-steel sm:block">
                Used Office Furniture DFW
              </span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className={buttonStyles({ variant: "ghost", size: "sm" })}>
              <ExternalLink className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">View website</span>
            </Link>
            {signedIn && (
              <form action={logoutAction}>
                <button type="submit" className={buttonStyles({ variant: "outline", size: "sm" })}>
                  <LogOut className="size-4" aria-hidden="true" /> Sign out
                </button>
              </form>
            )}
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
