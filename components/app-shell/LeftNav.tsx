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
      className="flex w-48 shrink-0 flex-col border-r-2 border-border bg-card"
    >
      <ScrollArea className="flex-1">
        <ul className="flex flex-col gap-1 p-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-none border-2 border-transparent px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors",
                    "hover:border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive &&
                      "border-foreground bg-muted text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
      <Separator />
      <p className="p-3 text-xs text-muted-foreground">Keyboard-first replay</p>
    </nav>
  );
}
