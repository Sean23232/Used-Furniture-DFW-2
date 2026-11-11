import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { isEmailDeliveryConfigured, sendInquiryNotification } from "@/lib/email";
import { inquiryReference as toReference, normalizeInquiryPayload, validateInquiry } from "@/lib/inquiry";

export const dynamic = "force-dynamic";

/** Stores a customer inquiry; optionally emails the sales team when an email service is configured. */
export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const payload = normalizeInquiryPayload(raw);

  // Honeypot field filled → likely automated spam. Respond neutrally without storing.
  if (payload.website) {
    return Response.json({ ok: true, reference: "", emailDelivered: false });
  }

  const errors = validateInquiry(payload);
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 422 });
  }

  try {
    const [row] = await db
      .insert(inquiries)
      .values({
        fullName: payload.fullName,
        businessName: payload.businessName || null,
        email: payload.email,
        phone: payload.phone || null,
        furnitureInterest: payload.furnitureInterest || null,
        productCode: payload.productId || null,
        message: payload.message,
        sourcePage: payload.sourcePage || null,
      })
      .returning({ id: inquiries.id });

    const reference = toReference(row.id);
    const emailDelivered = await sendInquiryNotification({ reference, ...payload });
    if (emailDelivered) {
      await db.update(inquiries).set({ emailDelivered: true }).where(eq(inquiries.id, row.id));
    }

    return Response.json(
      {
        ok: true,
        reference,
        emailDelivered,
        emailConfigured: isEmailDeliveryConfigured(),
        delivery: emailDelivered ? "sales-inbox+email" : "sales-inbox",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[inquiries] Failed to store inquiry", error);
    return Response.json(
      { ok: false, error: "We couldn't save your inquiry right now. Please call or email our team directly." },
      { status: 500 },
    );
  }
}

/**
 * Staff access to stored inquiries:
 *   GET /api/inquiries  with header  Authorization: Bearer <INQUIRIES_ADMIN_TOKEN>
 * Disabled (404) unless INQUIRIES_ADMIN_TOKEN is configured.
 */
export async function GET(request: Request) {
  const token = process.env.INQUIRIES_ADMIN_TOKEN;
  if (!token) return Response.json({ ok: false, error: "Not found." }, { status: 404 });
  if (request.headers.get("authorization") !== `Bearer ${token}`) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(200);
  return Response.json({ ok: true, inquiries: rows.map((row) => ({ ...row, reference: toReference(row.id) })) });
}
