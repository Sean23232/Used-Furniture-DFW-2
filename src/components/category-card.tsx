import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryImage } from "@/lib/categories";

export function CategoryCard({
  title,
  description,
  href,
  image,
}: {
  title: string;
  description: string;
  href: string;
  image: CategoryImage;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-mist bg-white shadow-card transition-shadow duration-300 hover:shadow-lift"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-mist">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          style={image.position ? { objectPosition: image.position } : undefined}
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold text-navy">{title}</h3>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-steel">{description}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-[15px] font-semibold text-navy transition-colors group-hover:text-accent-ink">
          Explore Category
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
