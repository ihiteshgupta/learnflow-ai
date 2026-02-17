import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-[#1e1b4b]">
      <header className="sticky top-0 z-50 border-b border-indigo-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-[#1e1b4b] transition-colors hover:text-[#f59e0b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Dronacharya home"
          >
            <GraduationCap className="h-5 w-5 text-[#f59e0b]" />
            Dronacharya
          </Link>
          <nav aria-label="Authentication">
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                className="border-[#1e1b4b] text-[#1e1b4b] hover:border-[#f59e0b] hover:text-[#f59e0b]"
              >
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-[#1e1b4b] via-[#312e81] to-[#f59e0b] text-white shadow-lg shadow-[#1e1b4b]/20 hover:brightness-110"
              >
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main id="main-content">{children}</main>
    </div>
  );
}

