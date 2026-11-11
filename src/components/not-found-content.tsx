import Link from "next/link";
import { buttonStyles, Container, Eyebrow } from "./ui";

export function NotFoundContent() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Page not found</Eyebrow>
          <h1 className="mt-3 text-4xl font-extrabold text-navy sm:text-5xl">We couldn&apos;t find that page</h1>
          <p className="mt-5 text-lg leading-relaxed text-steel">
            The item may have sold or the link may be out of date. Browse current listings or contact our team for help.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/furniture" className={buttonStyles({ variant: "primary", size: "lg" })}>
              Browse Furniture
            </Link>
            <Link href="/contact" className={buttonStyles({ variant: "outline", size: "lg" })}>
              Contact Our Team
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
