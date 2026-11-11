"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CircleCheck, Info, LoaderCircle, Phone, Send, TriangleAlert } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import {
  INQUIRY_FIELDS,
  INQUIRY_LIMITS,
  validateInquiry,
  type InquiryErrors,
  type InquiryField,
  type InquiryValues,
} from "@/lib/inquiry";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { buttonStyles } from "./ui";

export interface InquiryProductSummary {
  id: string;
  name: string;
  href: string;
  image?: { src: string; alt: string };
}

interface InquiryFormProps {
  defaultInterest?: string;
  defaultMessage?: string;
  product?: InquiryProductSummary;
}

type ApiResponse = {
  ok: boolean;
  reference?: string;
  emailDelivered?: boolean;
  errors?: InquiryErrors;
  error?: string;
};

const inputClass = (invalid: boolean) =>
  cn(
    "block w-full rounded-lg border bg-white px-3.5 py-3 text-base text-charcoal shadow-xs transition-colors placeholder:text-steel/60 focus:outline-none focus:ring-3",
    invalid
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-steel/25 hover:border-steel/45 focus:border-navy/50 focus:ring-accent/25",
  );

function Field({
  id,
  label,
  required,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-semibold text-navy">
        <span>
          {label}
          {required && (
            <span className="ml-0.5 text-accent-ink" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {optional && <span className="text-xs font-normal text-steel">Optional</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-red-700">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-steel">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function InquiryForm({ defaultInterest = "", defaultMessage = "", product }: InquiryFormProps) {
  const uid = useId();
  const initialValues: InquiryValues = {
    fullName: "",
    businessName: "",
    email: "",
    phone: "",
    furnitureInterest: defaultInterest,
    message: defaultMessage,
  };

  const [values, setValues] = useState<InquiryValues>(initialValues);
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reference: string; emailDelivered: boolean } | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const successRef = useRef<HTMLDivElement>(null);

  const fieldId = (field: InquiryField) => `${uid}-${field}`;
  const describedBy = (field: InquiryField, hasHint = false) =>
    errors[field] ? `${fieldId(field)}-error` : hasHint ? `${fieldId(field)}-hint` : undefined;

  function handleChange(field: InquiryField, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (errors[field]) setErrors((previous) => ({ ...previous, [field]: validateInquiry(next)[field] }));
  }

  function handleBlur(field: InquiryField) {
    if (!attempted && !values[field].trim()) return;
    setErrors((previous) => ({ ...previous, [field]: validateInquiry(values)[field] }));
  }

  function focusField(field: InquiryField) {
    document.getElementById(fieldId(field))?.focus();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    setAttempted(true);
    const found = validateInquiry(values);
    setErrors(found);
    const firstInvalid = INQUIRY_FIELDS.find((field) => found[field]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    setStatus("submitting");
    setServerError(null);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          productId: product?.id ?? "",
          sourcePage: window.location.pathname,
          website: honeypot,
        }),
      });
      const data = (await response.json().catch(() => null)) as ApiResponse | null;

      if (response.ok && data?.ok) {
        setResult({ reference: data.reference ?? "", emailDelivered: Boolean(data.emailDelivered) });
        setStatus("success");
        window.requestAnimationFrame(() => successRef.current?.focus());
        return;
      }
      if (response.status === 422 && data?.errors) {
        const serverErrors = data.errors;
        setErrors(serverErrors);
        setStatus("idle");
        const invalid = INQUIRY_FIELDS.find((field) => serverErrors[field]);
        if (invalid) focusField(invalid);
        return;
      }
      throw new Error(data?.error ?? `Request failed with status ${response.status}`);
    } catch {
      setServerError(
        "We couldn't submit your inquiry just now. Please try again, or contact our team directly by phone or email.",
      );
      setStatus("error");
    }
  }

  function reset() {
    setValues(initialValues);
    setErrors({});
    setAttempted(false);
    setResult(null);
    setServerError(null);
    setStatus("idle");
  }

  if (status === "success" && result) {
    const firstName = values.fullName.trim().split(/\s+/)[0];
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 focus:outline-none sm:p-8"
      >
        <CircleCheck className="size-10 text-emerald-700" aria-hidden="true" />
        <h3 className="mt-4 text-2xl font-bold text-navy">Thank you, {firstName}!</h3>
        {result.emailDelivered ? (
          <p className="mt-2 leading-relaxed text-charcoal">
            {`Your inquiry${product ? ` about the ${product.name}` : ""} has been sent to our sales team${
              result.reference ? ` (reference ${result.reference})` : ""
            }. Our team will follow up using the contact details you provided.`}
          </p>
        ) : (
          <>
            <p className="mt-2 leading-relaxed text-charcoal">
              {`Your inquiry${product ? ` about the ${product.name}` : ""} has been delivered to our sales team's inbox`}
              {result.reference ? (
                <>
                  {" under reference "}
                  <strong className="font-semibold text-navy">{result.reference}</strong>
                </>
              ) : null}
              {". Our team will follow up using the contact details you provided."}
            </p>
            {siteConfig.prototypeMode && (
              <div className="mt-5 flex gap-3 rounded-xl border border-accent/40 bg-accent-soft p-4 text-sm leading-relaxed text-charcoal">
                <Info className="mt-0.5 size-5 shrink-0 text-accent-ink" aria-hidden="true" />
                <p>
                  <strong className="font-semibold text-navy">Preview note:</strong> inquiries go to the secure Sales
                  Inbox in real time. Email alerts to the sales team switch on once an email service is connected.
                </p>
              </div>
            )}
          </>
        )}
        <p className="mt-5 text-sm text-steel">
          Need a faster answer? Call{" "}
          <a href={siteConfig.phone.href} className="font-semibold text-navy underline underline-offset-4">
            {siteConfig.phone.display}
          </a>
          .
        </p>
        <button type="button" onClick={reset} className={buttonStyles({ variant: "outline", size: "sm", className: "mt-6" })}>
          Send another inquiry
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-describedby={`${uid}-required-note`}>
      {product && (
        <div className="flex items-center gap-4 rounded-xl border border-mist bg-cream p-3">
          {product.image && (
            <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-mist">
              <Image src={product.image.src} alt="" fill sizes="64px" className="object-cover" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">Inquiring about</p>
            <p className="truncate font-display font-bold text-navy">{product.name}</p>
            <p className="text-xs text-steel">
              Item #{product.id} ·{" "}
              <Link href={product.href} className="font-medium text-navy underline underline-offset-2 hover:text-accent-ink">
                View item
              </Link>
            </p>
          </div>
        </div>
      )}

      <p id={`${uid}-required-note`} className="text-sm text-steel">
        Fields marked <span className="font-semibold text-accent-ink">*</span> are required.
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={fieldId("fullName")} label="Full Name" required error={errors.fullName}>
          <input
            id={fieldId("fullName")}
            name="fullName"
            type="text"
            autoComplete="name"
            required
            maxLength={INQUIRY_LIMITS.fullName}
            value={values.fullName}
            onChange={(event) => handleChange("fullName", event.target.value)}
            onBlur={() => handleBlur("fullName")}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={describedBy("fullName")}
            className={inputClass(Boolean(errors.fullName))}
          />
        </Field>
        <Field id={fieldId("businessName")} label="Business Name" optional error={errors.businessName}>
          <input
            id={fieldId("businessName")}
            name="businessName"
            type="text"
            autoComplete="organization"
            maxLength={INQUIRY_LIMITS.businessName}
            value={values.businessName}
            onChange={(event) => handleChange("businessName", event.target.value)}
            onBlur={() => handleBlur("businessName")}
            aria-invalid={Boolean(errors.businessName)}
            aria-describedby={describedBy("businessName")}
            className={inputClass(Boolean(errors.businessName))}
          />
        </Field>
        <Field id={fieldId("email")} label="Email Address" required error={errors.email}>
          <input
            id={fieldId("email")}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={INQUIRY_LIMITS.email}
            value={values.email}
            onChange={(event) => handleChange("email", event.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            className={inputClass(Boolean(errors.email))}
          />
        </Field>
        <Field id={fieldId("phone")} label="Phone Number" hint="Include area code so our team can call you back." error={errors.phone}>
          <input
            id={fieldId("phone")}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={INQUIRY_LIMITS.phone}
            value={values.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            onBlur={() => handleBlur("phone")}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("phone", true)}
            className={inputClass(Boolean(errors.phone))}
          />
        </Field>
      </div>

      <Field
        id={fieldId("furnitureInterest")}
        label="Furniture Interested In"
        hint="For example: conference table, task chairs, or an item number."
        error={errors.furnitureInterest}
      >
        <input
          id={fieldId("furnitureInterest")}
          name="furnitureInterest"
          type="text"
          list={`${uid}-interest-options`}
          maxLength={INQUIRY_LIMITS.furnitureInterest}
          value={values.furnitureInterest}
          onChange={(event) => handleChange("furnitureInterest", event.target.value)}
          onBlur={() => handleBlur("furnitureInterest")}
          aria-invalid={Boolean(errors.furnitureInterest)}
          aria-describedby={describedBy("furnitureInterest", true)}
          className={inputClass(Boolean(errors.furnitureInterest))}
        />
        <datalist id={`${uid}-interest-options`}>
          {CATEGORIES.map((category) => (
            <option key={category.slug} value={category.name} />
          ))}
        </datalist>
      </Field>

      <Field id={fieldId("message")} label="Message" required error={errors.message}>
        <textarea
          id={fieldId("message")}
          name="message"
          rows={5}
          required
          maxLength={INQUIRY_LIMITS.message}
          value={values.message}
          onChange={(event) => handleChange("message", event.target.value)}
          onBlur={() => handleBlur("message")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={describedBy("message")}
          placeholder="Tell us what you're looking for — quantities, sizes, timing, or questions about an item."
          className={cn(inputClass(Boolean(errors.message)), "min-h-36 resize-y")}
        />
      </Field>

      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Website</label>
        <input
          id={`${uid}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      {serverError && (
        <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <p>{serverError}</p>
            <a href={siteConfig.phone.href} className="mt-2 inline-flex items-center gap-1.5 font-semibold underline underline-offset-4">
              <Phone className="size-4" aria-hidden="true" /> {siteConfig.phone.display}
            </a>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={submitting}
          className={buttonStyles({ variant: "primary", size: "lg", className: "w-full whitespace-nowrap sm:w-auto sm:shrink-0" })}
        >
          {submitting ? (
            <>
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" /> Sending…
            </>
          ) : (
            <>
              <Send className="size-5" aria-hidden="true" /> Send Inquiry
            </>
          )}
        </button>
        <p className="text-xs leading-relaxed text-steel">
          No payment details are collected. Our sales team handles availability, questions, and final arrangements
          directly.
        </p>
      </div>
    </form>
  );
}
