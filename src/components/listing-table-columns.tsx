"use client";

import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "./status-badge";
import Link from "next/link";

export interface ListingRow {
  id: string;
  title: string | null;
  price: number | null;
  surface: number | null;
  rooms: number | null;
  address: string | null;
  status: string;
  source: string | null;
  createdAt: string;
  url: string | null;
}

export const columns: ColumnDef<ListingRow>[] = [
  {
    accessorKey: "title",
    header: "Titre",
    cell: ({ row }) => (
      <Link
        href={`/listings/${row.original.id}`}
        className="font-medium text-gray-900 hover:text-emerald-600 transition-colors"
      >
        {row.getValue("title") || "Sans titre"}
      </Link>
    ),
  },
  {
    accessorKey: "price",
    header: "Prix",
    cell: ({ row }) => {
      const price = row.getValue("price") as number | null;
      return price ? `${price.toLocaleString("fr-FR")} EUR` : "-";
    },
  },
  {
    accessorKey: "surface",
    header: "Surface",
    cell: ({ row }) => {
      const surface = row.getValue("surface") as number | null;
      return surface ? `${surface} m2` : "-";
    },
  },
  {
    accessorKey: "rooms",
    header: "Pieces",
    cell: ({ row }) => {
      const rooms = row.getValue("rooms") as number | null;
      return rooms ?? "-";
    },
  },
  {
    accessorKey: "address",
    header: "Adresse",
    cell: ({ row }) => {
      const address = row.getValue("address") as string | null;
      return (
        <span className="max-w-[200px] truncate block" title={address || ""}>
          {address || "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    filterFn: "equals",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") as string);
      return date.toLocaleDateString("fr-FR");
    },
  },
];
