import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Minimal, dependency-free authentication for the staff Sales Inbox.
 * Configure ADMIN_PASSWORD (and ideally ADMIN_SESSION_SECRET) in the environment.
 */

export const ADMIN_COOKIE = "uofdfw_admin";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 12; // 12 hours

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const digest = (value: string) => createHmac("sha256", "uofdfw-admin-password").update(value).digest("hex");
  return safeEqual(digest(input), digest(expected));
}

export function createAdminSession(): string {
  const payload = `v1.${Date.now() + ADMIN_SESSION_SECONDS * 1000}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminSession(token: string | undefined): boolean {
  if (!token || !sessionSecret()) return false;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;
  const payload = token.slice(0, separator);
  if (!safeEqual(token.slice(separator + 1), sign(payload))) return false;
  const expires = Number(payload.split(".")[1]);
  return Number.isFinite(expires) && expires > Date.now();
}

export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) redirect("/admin/login");
}
