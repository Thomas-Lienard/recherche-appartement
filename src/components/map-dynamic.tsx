"use client";

import dynamic from "next/dynamic";
import type { MapViewProps } from "./map-view";

export const MapView = dynamic<MapViewProps>(
  () => import("./map-view").then((mod) => mod.MapViewInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full w-full bg-[#F0F0F0] rounded-2xl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E5E5] border-t-[#CDEA68]" />
      </div>
    ),
  }
);
