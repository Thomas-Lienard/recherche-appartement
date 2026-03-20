"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/map", label: "Carte" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-emerald-600">
          Appart Tracker
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                pathname === link.href
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="ml-2 pl-2 border-l border-gray-200">
            {session ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="text-gray-600 text-xs"
              >
                {session.user?.name?.split(" ")[0] || "Deconnexion"}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => signIn("google")}
                className="text-xs"
              >
                Connexion Google
              </Button>
            )}
          </div>
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="sm:hidden"
            render={<Button variant="ghost" size="sm" />}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetTitle className="text-lg font-semibold text-emerald-600 mb-4">
              Appart Tracker
            </SheetTitle>
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    pathname === link.href
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-100">
                {session ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { signOut(); setOpen(false); }}
                    className="w-full justify-start text-gray-600"
                  >
                    Deconnexion ({session.user?.name?.split(" ")[0]})
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { signIn("google"); setOpen(false); }}
                    className="w-full"
                  >
                    Connexion Google
                  </Button>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
