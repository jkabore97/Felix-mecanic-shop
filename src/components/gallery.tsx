"use client";

import { useState } from "react";

export function Gallery({ images, title }: { images: Array<{ url: string; alt?: string | null }>; title: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return <div className="card grid aspect-[5/4] place-items-center text-muted">Pas d&apos;image</div>;
  }
  const current = images[active] ?? images[0];
  return (
    <div className="space-y-3">
      <div className="card overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current.url} alt={current.alt ?? title} className="aspect-[5/4] w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setActive(i)}
              className={`size-16 shrink-0 overflow-hidden rounded-2xl border-2 transition-colors ${i === active ? "border-accent" : "border-transparent"}`}
              aria-label={`Image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
