"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { characters } from "@/lib/characters";
import { books } from "@/lib/books";
import { bookSlug } from "@/components/slugs";

const ALIGN_LABEL: Record<string, string> = {
  protagonist:  "Protagonist",
  antagonist:   "Antagonist",
  neutral:      "Neutral",
  supernatural: "Supernatural",
};
const ALIGN_COLOR: Record<string, string> = {
  protagonist:  "text-sickly",
  antagonist:   "text-ember",
  neutral:      "text-bone/65",
  supernatural: "text-blood",
};

export default function CharactersPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return characters.filter((c) => {
      if (filter && c.alignment !== filter) return false;
      if (!term) return true;
      if (c.name.toLowerCase().includes(term)) return true;
      if (c.aliases?.some((a) => a.toLowerCase().includes(term))) return true;
      if (c.role.toLowerCase().includes(term)) return true;
      if (c.description.toLowerCase().includes(term)) return true;
      if (c.books.some((b) => b.toLowerCase().includes(term))) return true;
      return false;
    });
  }, [q, filter]);

  // group by primary book for visual scanning
  const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="px-5 py-12 sm:px-6 sm:py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="type text-[11px] uppercase tracking-[0.35em] text-ember mb-3">Characters</p>
        <h1 className="serif text-4xl sm:text-5xl text-paper drip-stop">The Roster</h1>
        <p className="serif italic text-bone/65 mt-3 max-w-2xl">
          {characters.length} characters worth knowing. Multi-book appearances tracked — Father
          Callahan, Randall Flagg, Holly Gibney, the Losers.
        </p>

        <div className="mt-8 mb-10 flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="search names, aliases, books, descriptions…"
            className="flex-1 min-w-[14rem] bg-coal border border-paper/15 px-3 py-2 type text-sm text-paper placeholder:text-bone/40
              focus:outline-none focus:ring-2 focus:ring-ember/40 focus:border-ember/50"
            aria-label="Search characters"
          />
          {["", "protagonist", "antagonist", "neutral", "supernatural"].map((f) => (
            <button
              key={f || "all"}
              type="button"
              onClick={() => setFilter(f)}
              className={
                "type text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 transition " +
                (filter === f
                  ? "bg-blood text-paper border border-ember/40"
                  : "border border-paper/15 text-bone/65 hover:text-paper hover:border-ember/60")
              }
            >
              {f === "" ? "All" : ALIGN_LABEL[f]}
            </button>
          ))}
        </div>

        <p className="type text-[10px] uppercase tracking-[0.3em] text-bone/40 mb-6">
          Showing {sorted.length} of {characters.length}
        </p>

        <ul className="space-y-10">
          {sorted.map((c) => (
            <li key={c.name} className="border-l-2 border-blood/40 pl-5">
              <div className="flex flex-wrap items-baseline gap-3 mb-1">
                <h3 className="serif text-2xl text-paper">{c.name}</h3>
                {c.alignment && (
                  <span className={`type text-[10px] uppercase tracking-[0.25em] ${ALIGN_COLOR[c.alignment]}`}>
                    {ALIGN_LABEL[c.alignment]}
                  </span>
                )}
              </div>
              {c.aliases && c.aliases.length > 0 && (
                <p className="type text-[10px] uppercase tracking-[0.25em] text-bone/45 mb-2">
                  also: {c.aliases.join(" · ")}
                </p>
              )}
              <p className="serif italic text-bone/75 mb-2">{c.role}</p>
              <p className="text-bone/80 leading-relaxed max-w-3xl">{c.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="type text-[10px] uppercase tracking-[0.25em] text-bone/55">
                  Appears in:
                </span>
                {c.books.map((title) => {
                  const exists = books.some((b) => b.title === title);
                  if (!exists) {
                    return (
                      <span key={title} className="type text-[10px] uppercase tracking-[0.2em] px-2 py-1 bg-coal/60 border border-paper/15 text-bone/75">
                        {title}
                      </span>
                    );
                  }
                  return (
                    <Link
                      key={title}
                      href={`/book/${bookSlug(title)}/`}
                      className="type text-[10px] uppercase tracking-[0.2em] px-2 py-1 bg-coal/60 border border-paper/15 text-paper hover:border-ember/60 hover:bg-blood/15 transition"
                    >
                      {title}
                    </Link>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
