/** Shared inquiry validation — used by the browser form and the API route. */

export type InquiryField = "fullName" | "businessName" | "email" | "phone" | "furnitureInterest" | "message";

export const INQUIRY_FIELDS: InquiryField[] = ["fullName", "businessName", "email", "phone", "furnitureInterest", "message"];

export type InquiryValues = Record<InquiryField, string>;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

export interface InquiryPayload extends InquiryValues {
  productId: string;
  sourcePage: string;
  /** Honeypot — must stay empty. */
  website: string;
}

export const INQUIRY_LIMITS = {
  fullName: 120,
  businessName: 160,
  email: 254,
  phone: 40,
  furnitureInterest: 200,
  message: 4000,
  productId: 40,
  sourcePage: 300,
  website: 200,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Customer-facing reference for a stored inquiry, e.g. INQ-00042. */
export function inquiryReference(id: number): string {
  return `INQ-${String(id).padStart(5, "0")}`;
}

export function validateInquiry(values: InquiryValues): InquiryErrors {
  const errors: InquiryErrors = {};
  const fullName = values.fullName.trim();
  const email = values.email.trim();
  const phone = values.phone.trim();
  const message = values.message.trim();

  if (!fullName) errors.fullName = "Please enter your full name.";
  else if (fullName.length < 2) errors.fullName = "Please enter your full name (at least 2 characters).";
  else if (fullName.length > INQUIRY_LIMITS.fullName) errors.fullName = "Please shorten your name.";

  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL_PATTERN.test(email) || email.length > INQUIRY_LIMITS.email)
    errors.email = "Please enter a valid email address, for example name@company.com.";

  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 15) errors.phone = "Please enter a valid phone number, including area code.";
  }

  if (values.businessName.trim().length > INQUIRY_LIMITS.businessName) errors.businessName = "Please shorten the business name.";
  if (values.furnitureInterest.trim().length > INQUIRY_LIMITS.furnitureInterest)
    errors.furnitureInterest = "Please shorten this field.";

  if (!message) errors.message = "Please include a short message so our team can help.";
  else if (message.length < 10) errors.message = "Please add a little more detail (at least 10 characters).";
  else if (message.length > INQUIRY_LIMITS.message) errors.message = "Please keep your message under 4,000 characters.";

  return errors;
}

/** Normalizes untrusted JSON input into a well-typed payload. */
export function normalizeInquiryPayload(raw: unknown): InquiryPayload {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const read = (key: keyof typeof INQUIRY_LIMITS) => {
    const value = source[key];
    // Allow slightly longer input so length validation can report a helpful message.
    return typeof value === "string" ? value.trim().slice(0, INQUIRY_LIMITS[key] + 50) : "";
  };
  return {
    fullName: read("fullName"),
    businessName: read("businessName"),
    email: read("email"),
    phone: read("phone"),
    furnitureInterest: read("furnitureInterest"),
    message: read("message"),
    productId: read("productId").slice(0, INQUIRY_LIMITS.productId),
    sourcePage: read("sourcePage").slice(0, INQUIRY_LIMITS.sourcePage),
    website: read("website"),
  };
}
