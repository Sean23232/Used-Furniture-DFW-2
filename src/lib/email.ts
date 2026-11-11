import nodemailer from "nodemailer";
import { siteConfig } from "./site";

/**
 * Email alerts for new inquiries (server-side only). Inquiries are ALWAYS stored in the
 * Sales Inbox; email is sent in addition once ONE of these providers is configured:
 *
 *  Resend:  RESEND_API_KEY, INQUIRY_FROM_EMAIL (sender on a domain verified with Resend)
 *  SMTP:    SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASS, optional SMTP_SECURE=true
 *           (works with Microsoft 365, Google Workspace, Zoho, cPanel mailboxes, etc.)
 *
 *  Always:  INQUIRY_NOTIFY_EMAIL — recipient inbox(es), comma-separated
 */

export interface InquiryEmail {
  reference: string;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  furnitureInterest: string;
  productId: string;
  message: string;
  sourcePage: string;
}

type Provider = "resend" | "smtp";

function getProvider(): Provider | null {
  if (!process.env.INQUIRY_NOTIFY_EMAIL) return null;
  if (process.env.RESEND_API_KEY && process.env.INQUIRY_FROM_EMAIL) return "resend";
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return "smtp";
  return null;
}

export function isEmailDeliveryConfigured(): boolean {
  return getProvider() !== null;
}

export function emailDeliverySummary(): string {
  const provider = getProvider();
  if (!provider) return "not connected";
  return `${provider === "resend" ? "via Resend" : "via SMTP"} to ${process.env.INQUIRY_NOTIFY_EMAIL}`;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function sendInquiryNotification(inquiry: InquiryEmail): Promise<boolean> {
  const provider = getProvider();
  if (!provider) return false;

  const recipients = (process.env.INQUIRY_NOTIFY_EMAIL ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
  const inboxUrl = `${siteConfig.url}/admin/inquiries`;
  const details: [string, string][] = [
    ["Reference", inquiry.reference],
    ["Name", inquiry.fullName],
    ["Business", inquiry.businessName || "—"],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone || "—"],
    ["Interested in", inquiry.furnitureInterest || "—"],
    ["Item #", inquiry.productId || "—"],
    ["Submitted from", inquiry.sourcePage || "—"],
  ];
  const subject = `New website inquiry ${inquiry.reference}${inquiry.furnitureInterest ? ` — ${inquiry.furnitureInterest}` : ""}`.slice(0, 180);
  const text = [...details.map(([label, value]) => `${label}: ${value}`), "", "Message:", inquiry.message, "", `Sales Inbox: ${inboxUrl}`].join("\n");
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#252D33;max-width:640px">
<h2 style="color:#172B3A;margin:0 0 12px">New website inquiry</h2>
<table cellpadding="6" style="border-collapse:collapse;font-size:14px">${details
    .map(([label, value]) => `<tr><td style="color:#526B7B;font-weight:bold;vertical-align:top">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`)
    .join("")}</table>
<p style="font-weight:bold;color:#172B3A;margin:16px 0 6px">Message</p>
<p style="white-space:pre-line;background:#F6F5F1;padding:12px;border-radius:8px;font-size:14px">${escapeHtml(inquiry.message)}</p>
<p><a href="${inboxUrl}" style="color:#8A5A2B;font-weight:bold">Open the Sales Inbox</a></p></div>`;

  try {
    if (provider === "resend") {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.INQUIRY_FROM_EMAIL, to: recipients, reply_to: inquiry.email, subject, text, html }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) console.error("[inquiries] Resend responded with", response.status, await response.text().catch(() => ""));
      return response.ok;
    }

    const port = Number(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10_000,
    });
    await transporter.sendMail({
      from: process.env.INQUIRY_FROM_EMAIL || process.env.SMTP_USER,
      to: recipients,
      replyTo: inquiry.email,
      subject,
      text,
      html,
    });
    return true;
  } catch (error) {
    console.error("[inquiries] Email delivery failed", error);
    return false;
  }
}
