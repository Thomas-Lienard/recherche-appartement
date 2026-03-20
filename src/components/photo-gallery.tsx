"use client";

import { useState } from "react";
import Image from "next/image";

interface PhotoGalleryProps {
  photos: string[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selected, setSelected] = useState(0);

  if (!photos.length) {
    return (
      <div className="flex items-center justify-center h-64 rounded-xl bg-gray-100 text-gray-400">
        Aucune photo
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={photos[selected]}
          alt={`Photo ${selected + 1}`}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === selected
                  ? "border-emerald-500"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={photo}
                alt={`Thumb ${i + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
