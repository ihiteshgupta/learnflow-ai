import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Dronacharya home"
          >
            <GraduationCap className="h-5 w-5 text-gold" />
            Dronacharya
          </Link>
          <nav aria-label="Authentication">
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild className="gradient-brand text-white hover:opacity-90 transition-opacity">
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

