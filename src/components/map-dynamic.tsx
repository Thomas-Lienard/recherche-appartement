"use client";

import dynamic from "next/dynamic";

export const MapView = dynamic(
  () => import("./map-view").then((mod) => mod.MapViewInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[600px] rounded-xl bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      </div>
    ),
  }
);
