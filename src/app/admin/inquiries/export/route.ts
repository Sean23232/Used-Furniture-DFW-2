import { desc } from "drizzle-orm";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { isAdminSession } from "@/lib/admin-auth";
import { inquiryReference } from "@/lib/inquiry";

export const dynamic = "force-dynamic";

function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`; // prevent spreadsheet formula injection
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET() {
  if (!(await isAdminSession())) return new Response("Unauthorized", { status: 401 });

  const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  const header = [
    "Reference",
    "Received (UTC)",
    "Status",
    "Full name",
    "Business",
    "Email",
    "Phone",
    "Furniture interested in",
    "Item #",
    "Message",
    "Source page",
    "Email alert sent",
  ];
  const lines = [
    header,
    ...rows.map((row) => [
      inquiryReference(row.id),
      row.createdAt.toISOString(),
      row.status,
      row.fullName,
      row.businessName,
      row.email,
      row.phone,
      row.furnitureInterest,
      row.productCode,
      row.message,
      row.sourcePage,
      row.emailDelivered ? "yes" : "no",
    ]),
  ].map((columns) => columns.map(csvCell).join(","));

  return new Response(`\uFEFF${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
