import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Shows the whole photo (no cropping) over a soft blurred backdrop of itself, so product
 * photos of any shape — tall chairs, wide tables — sit neatly in consistent frames.
 * Both layers share the same source, so the browser downloads the image only once.
 */
export function ContainedImage({
  src,
  alt,
  sizes,
  loading,
  preload,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  loading?: "lazy" | "eager";
  preload?: boolean;
  className?: string;
}) {
  return (
    <>
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        fill
        sizes={sizes}
        loading={preload ? undefined : loading}
        preload={preload}
        className="scale-110 object-cover opacity-60 blur-2xl"
      />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={preload ? undefined : loading}
        preload={preload}
        className={cn("object-contain", className)}
      />
    </>
  );
}
