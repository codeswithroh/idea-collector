"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Lightbulb, Hammer, Layout, Layers } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: Layout },
  { href: "/feed", label: "Feed", icon: Layers },
  { href: "/build", label: "Build", icon: Hammer },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-raised border-b-[2px] border-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-copper border-[2px] border-ink rounded-badge flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span className="font-mono font-bold text-lg uppercase tracking-tight hidden sm:block text-ink">
              StackForge
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "font-mono text-xs px-4 py-2 flex items-center gap-2 rounded-btn border-[2px] transition-all duration-100",
                    isActive
                      ? "bg-copper text-white border-ink shadow-pixel-sm"
                      : "bg-surface-raised text-ink border-transparent hover:border-ink hover:shadow-pixel-sm"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
