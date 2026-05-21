"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { num: "01", href: "/",            label: "Archive" },
  { num: "02", href: "/books",       label: "Books" },
  { num: "03", href: "/films",       label: "Films" },
  { num: "04", href: "/cameos",      label: "Cameos" },
  { num: "05", href: "/characters",  label: "Characters" },
  { num: "06", href: "/web",         label: "The Web" },
  { num: "07", href: "/timeline",    label: "Timeline" },
  { num: "08", href: "/submit",      label: "Submit" },
  { num: "09", href: "/architecture",label: "ODI" },
  { num: "10", href: "/pipeline",    label: "Pipeline" },
];

export default function TopNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(href + "/");

  return (
    <header className="meta-bar">
      <div className="mx-auto flex max-w-7xl items-center gap-x-6 gap-y-2 px-4 py-3 overflow-x-auto sm:px-6 sm:py-4 md:px-10">
        <Link href="/" className="flex-none flex items-center gap-2.5 text-paper hover:text-ember focus:outline-none focus:ring-2 focus:ring-ember/40">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true" className="flex-none flicker">
            <circle cx="16" cy="16" r="14" fill="#0b0807" stroke="#e9e1cf" strokeWidth="0.5" opacity="0.9" />
            <circle cx="16" cy="16" r="11" fill="none" stroke="#a92d24" strokeWidth="0.5" opacity="0.55" />
            <path d="M16 6 L18 14 L26 16 L18 18 L16 26 L14 18 L6 16 L14 14 Z" fill="#7f1a14" />
            <circle cx="16" cy="16" r="1.4" fill="#0b0807" />
          </svg>
          <span className="serif text-base sm:text-lg leading-none">Castle Rock</span>
          <span className="hidden sm:inline type text-[10px] text-bone/55 leading-none">/ Archive</span>
        </Link>
        <nav aria-label="Primary" className="flex flex-1 flex-nowrap items-center gap-x-4 sm:gap-x-6">
          {NAV.map((n) => {
            const a = isActive(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className="group flex flex-none items-baseline gap-2 focus:outline-none focus:ring-2 focus:ring-ember/40"
                aria-current={a ? "page" : undefined}
              >
                <span className={`font-mono text-xs tracking-[0.25em] uppercase ${a ? "text-ember" : "text-ember/45"}`}>
                  {n.num}
                </span>
                <span className={`serif text-base sm:text-lg transition-colors ${a ? "text-paper" : "text-bone/65 group-hover:text-paper"}`}>
                  {n.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
