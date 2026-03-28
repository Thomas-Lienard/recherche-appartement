"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Nav() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 bg-[#1A1A1A]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            ← Retour
          </Button>
          <Link href="/" className="text-lg font-bold text-white">
            Appart Tracker
          </Link>
        </div>

        <div>
          {session ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-white/70 hover:text-white hover:bg-white/10 text-xs"
            >
              {session.user?.name?.split(" ")[0] || "Deconnexion"}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => signIn("google")}
              className="text-white border-white/20 hover:bg-white/10 text-xs"
            >
              Connexion Google
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
