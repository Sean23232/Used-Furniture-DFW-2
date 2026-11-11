"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ContainedImage } from "./contained-image";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-steel/30 bg-white text-steel">
        <ImageOff className="size-8" aria-hidden="true" />
        <p className="text-sm">Photos coming soon — ask our team for pictures of this item.</p>
      </div>
    );
  }

  const safeIndex = Math.min(index, images.length - 1);
  const current = images[safeIndex];
  const hasMultiple = images.length > 1;
  const go = (delta: number) => setIndex((value) => (value + delta + images.length) % images.length);

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-mist bg-white shadow-card">
        <ContainedImage
          key={current.src}
          src={current.src}
          alt={current.alt}
          preload={safeIndex === 0}
          sizes="(min-width: 1280px) 720px, (min-width: 1024px) 58vw, 100vw"
        />
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-md transition-colors hover:bg-white"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow-md transition-colors hover:bg-white"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
            <span
              className="absolute bottom-3 right-3 rounded-full bg-navy/85 px-2.5 py-1 text-xs font-semibold tabular-nums text-white"
              aria-live="polite"
            >
              Photo {safeIndex + 1} of {images.length}
            </span>
          </>
        )}
      </div>

      {hasMultiple && (
        <ul className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5" aria-label={`${productName} photos`}>
          {images.map((image, imageIndex) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => setIndex(imageIndex)}
                aria-label={`Show photo ${imageIndex + 1} of ${images.length}`}
                aria-current={imageIndex === safeIndex ? "true" : undefined}
                className={cn(
                  "relative block aspect-[4/3] w-full overflow-hidden rounded-lg border-2 bg-white transition",
                  imageIndex === safeIndex ? "border-accent" : "border-transparent opacity-75 hover:opacity-100",
                )}
              >
                <Image src={image.src} alt="" fill sizes="140px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
