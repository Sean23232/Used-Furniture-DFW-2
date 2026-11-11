import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { DemoNotice } from "@/components/ui";
import { isAdminConfigured, isAdminSession } from "@/lib/admin-auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  if (await isAdminSession()) redirect("/admin/inquiries");

  return (
    <div className="mx-auto max-w-md pt-6 sm:pt-12">
      <div className="rounded-2xl border border-mist bg-white p-7 shadow-card sm:p-9">
        <span className="flex size-12 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
          <LockKeyhole className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-navy">Sales team sign in</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-steel">
          View and manage inquiries submitted through UsedOfficeFurnitureDFW.com.
        </p>
        {!isAdminConfigured() && (
          <DemoNotice className="mt-5">Access is not configured. Set ADMIN_PASSWORD in the environment.</DemoNotice>
        )}
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
