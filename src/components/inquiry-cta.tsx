import Link from "next/link";
import { Mail, MessageSquareText, Phone } from "lucide-react";
import { mailtoHref, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { buttonStyles, Container } from "./ui";

export function InquiryCta({
  title = "Looking for the Right Furniture for Your Office?",
  description = "Explore our available furniture or speak with our team about the pieces you're interested in.",
  className,
  id,
}: {
  title?: string;
  description?: string;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} aria-labelledby="inquiry-cta-title" className={cn("bg-cream py-16 sm:py-20", className)}>
      <Container>
        <div className="relative overflow-hidden rounded-3xl bg-charcoal px-6 py-12 text-white sm:px-10 sm:py-14 lg:px-14">
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-accent" />
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <div>
              <h2 id="inquiry-cta-title" className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                {title}
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/75">{description}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={siteConfig.phone.href}
                className={buttonStyles({ variant: "primary", size: "lg", className: "sm:flex-1 lg:flex-none" })}
              >
                <Phone className="size-5" aria-hidden="true" /> Call Our Team
              </a>
              <Link
                href="/contact#inquiry-form"
                className={buttonStyles({ variant: "outline-light", size: "lg", className: "sm:flex-1 lg:flex-none" })}
              >
                <MessageSquareText className="size-5" aria-hidden="true" /> Send an Inquiry
              </Link>
              <a
                href={mailtoHref("Used office furniture inquiry")}
                className="inline-flex items-center justify-center gap-2 pt-1 text-sm text-white/70 underline-offset-4 hover:text-white hover:underline sm:hidden lg:inline-flex"
              >
                <Mail className="size-4" aria-hidden="true" /> Prefer email? {siteConfig.email.display}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
