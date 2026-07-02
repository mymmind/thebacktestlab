"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  LayoutDashboard,
  List,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { href: "/workspace", label: "Workspace", icon: LayoutDashboard },
  { href: "/sessions", label: "Sessions", icon: List },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/stats", label: "Stats", icon: BarChart3 },
] as const;

export function LeftNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="flex w-14 shrink-0 flex-col border-r border-border bg-sidebar lg:w-44"
    >
      <div className="hidden border-b border-border px-4 py-4 lg:block">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Navigate
        </p>
      </div>
      <ScrollArea className="flex-1">
        <ul className="flex flex-col py-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <li key={href}>
                <Link
                  href={href}
                  title={label}
                  className={cn(
                    "nav-rail-link",
                    isActive && "nav-rail-link-active",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
      <Separator />
      <div className="hidden space-y-2 p-3 lg:block">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Keyboard-first
        </p>
        <p className="text-[10px] text-muted-foreground/70">
          Press <Kbd className="mx-0.5">?</Kbd> for shortcuts
        </p>
      </div>
    </nav>
  );
}
