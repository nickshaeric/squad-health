"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLUB } from "@/data/club";
import { RoleSwitcher } from "./role-switcher";

const NAV = [
  { href: "/", label: "Team health", icon: LayoutDashboard },
  { href: "/squad", label: "Squad", icon: Users },
  { href: "/trends", label: "Injury trends", icon: TrendingUp },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-background min-h-svh">
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/75 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <Activity className="size-4" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Squad Health</p>
              <p className="text-muted-foreground text-xs">
                {CLUB.name}
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto">
            <RoleSwitcher />
          </div>
        </div>

        <nav className="flex items-center gap-1 border-t px-4 pb-2 pt-2 md:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 text-xs font-medium",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="text-muted-foreground mx-auto max-w-7xl px-4 pb-8 text-xs sm:px-6">
        <p>
          Demonstration data. Role switching is a demo feature; production
          authorisation is enforced server-side.
        </p>
      </footer>
    </div>
  );
}
