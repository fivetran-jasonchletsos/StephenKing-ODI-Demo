"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { books } from "@/lib/books";
import { characters, type Character } from "@/lib/characters";
import { bookSlug } from "@/components/slugs";
import coversManifest from "@/../public/covers/manifest.json";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const covers = coversManifest as Record<string, { found: boolean }>;

const ALIGN_COLOR: Record<string, string> = {
  protagonist:  "text-sickly",
  antagonist:   "text-ember",
  neutral:      "text-bone/70",
  supernatural: "text-blood",
};

// Build cross-indexes once per render.
function buildIndex() {
  const titleToCharacters = new Map<string, Character[]>();
  for (const c of characters) {
    for (const t of c.books) {
      if (!titleToCharacters.has(t)) titleToCharacters.set(t, []);
      titleToCharacters.get(t)!.push(c);
    }
  }
  return { titleToCharacters };
}

export default function WebPage() {
  const [mode, setMode] = useState<"by-book" | "by-character">("by-book");
  const [query, setQuery] = useState("");
  const [selectedBook, setSelectedBook] = useState<string | null>(
    books[Math.min(21, books.length - 1)]?.title ?? null   // default: IT, if present
  );
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    "Randall Flagg"
  );

  const { titleToCharacters } = useMemo(buildIndex, []);

  // Filtered left-column lists
  const filteredBooks = useMemo(() => {
    const t = query.trim().toLowerCase();
    return books
      .filter((b) => !t || b.title.toLowerCase().includes(t) || b.blurb.toLowerCase().includes(t))
      .sort((a, b) => a.year - b.year);
  }, [query]);

  const filteredCharacters = useMemo(() => {
    const t = query.trim().toLowerCase();
    return characters
      .filter((c) => !t
        || c.name.toLowerCase().includes(t)
        || c.role.toLowerCase().includes(t)
        || c.aliases?.some((a) => a.toLowerCase().includes(t))
        || c.books.some((b) => b.toLowerCase().includes(t)))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [query]);

  // Right-panel data
  const charactersInBook = selectedBook ? titleToCharacters.get(selectedBook) ?? [] : [];
  const characterRecord  = selectedCharacter ? characters.find((c) => c.name === selectedCharacter) : null;
  const booksOfCharacter = characterRecord
    ? books.filter((b) => characterRecord.books.includes(b.title)).sort((a, b) => a.year - b.year)
    : [];

  return (
    <main className="px-5 py-12 sm:px-6 sm:py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="type text-[11px] uppercase tracking-[0.35em] text-ember mb-3">The Web</p>
        <h1 className="serif text-4xl sm:text-5xl text-paper drip-stop">Characters &amp; their books.</h1>
        <p className="serif italic text-bone/65 mt-3 max-w-3xl">
          Pick a book to see who&apos;s in it. Pick a character to see every book they&apos;re in.
          The web behind Father Callahan, Randall Flagg, Holly Gibney, and the rest.
        </p>

        {/* Mode toggle */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setMode("by-book")}
            aria-pressed={mode === "by-book"}
            className={"type text-[10px] uppercase tracking-[0.25em] px-4 py-2 transition " +
              (mode === "by-book"
                ? "bg-blood text-paper border border-ember/40"
                : "border border-paper/15 text-bone/65 hover:text-paper hover:border-ember/60")}
          >
            Pick a book → see characters
          </button>
          <button
            type="button"
            onClick={() => setMode("by-character")}
            aria-pressed={mode === "by-character"}
            className={"type text-[10px] uppercase tracking-[0.25em] px-4 py-2 transition " +
              (mode === "by-character"
                ? "bg-blood text-paper border border-ember/40"
                : "border border-paper/15 text-bone/65 hover:text-paper hover:border-ember/60")}
          >
            Pick a character → see books
          </button>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "by-book" ? "search books…" : "search characters…"}
            className="ml-auto min-w-[14rem] bg-coal border border-paper/15 px-3 py-2 type text-sm text-paper placeholder:text-bone/40
              focus:outline-none focus:ring-2 focus:ring-ember/40 focus:border-ember/50"
            aria-label="Search"
          />
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8">
          {/* LEFT — list */}
          <aside className="border border-paper/15 bg-coal/30">
            <div className="px-4 py-3 border-b border-paper/15">
              <p className="type text-[10px] uppercase tracking-[0.3em] text-bone/55">
                {mode === "by-book"
                  ? `${filteredBooks.length} book${filteredBooks.length === 1 ? "" : "s"}`
                  : `${filteredCharacters.length} character${filteredCharacters.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <ul className="max-h-[70vh] overflow-y-auto">
              {mode === "by-book" && filteredBooks.map((b) => {
                const active = b.title === selectedBook;
                const count = titleToCharacters.get(b.title)?.length ?? 0;
                return (
                  <li key={b.title} className="border-b border-paper/8">
                    <button
                      type="button"
                      onClick={() => setSelectedBook(b.title)}
                      className="w-full text-left px-4 py-3 flex items-baseline gap-3 transition"
                      style={{
                        background: active ? "rgba(127,26,20,0.18)" : "transparent",
                        borderLeft: active ? "2px solid #a92d24" : "2px solid transparent",
                      }}
                    >
                      <span className="type text-[10px] uppercase tracking-[0.25em] text-bone/45 w-12 shrink-0">{b.year}</span>
                      <span className="serif text-sm text-paper flex-1">{b.title}</span>
                      <span className={"type text-[9px] uppercase tracking-[0.2em] " + (count > 0 ? "text-ember/85" : "text-bone/35")}>
                        {count} ch
                      </span>
                    </button>
                  </li>
                );
              })}
              {mode === "by-character" && filteredCharacters.map((c) => {
                const active = c.name === selectedCharacter;
                return (
                  <li key={c.name} className="border-b border-paper/8">
                    <button
                      type="button"
                      onClick={() => setSelectedCharacter(c.name)}
                      className="w-full text-left px-4 py-3 flex items-baseline gap-3 transition"
                      style={{
                        background: active ? "rgba(127,26,20,0.18)" : "transparent",
                        borderLeft: active ? "2px solid #a92d24" : "2px solid transparent",
                      }}
                    >
                      <span className="serif text-sm text-paper flex-1">{c.name}</span>
                      {c.alignment && (
                        <span className={"type text-[9px] uppercase tracking-[0.2em] " + ALIGN_COLOR[c.alignment]}>
                          {c.alignment}
                        </span>
                      )}
                      <span className={"type text-[9px] uppercase tracking-[0.2em] " + (c.books.length > 1 ? "text-ember" : "text-bone/45")}>
                        {c.books.length} bk
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* RIGHT — detail */}
          <section className="border border-paper/15 bg-coal/30 p-6 sm:p-8">
            {mode === "by-book" ? <BookDetail title={selectedBook} chars={charactersInBook} />
                                : <CharacterDetail character={characterRecord} books={booksOfCharacter} />}
          </section>
        </div>

        <p className="type text-[10px] uppercase tracking-[0.3em] text-bone/40 mt-10">
          Source: <span className="text-bone/70">gold.fct_appearance</span> — many-to-many from Wikidata + curator overrides, modeled in dbt, queryable by Cortex.
        </p>
      </div>
    </main>
  );
}

function BookDetail({ title, chars }: { title: string | null; chars: Character[] }) {
  if (!title) return <Empty label="Select a book on the left." />;
  const b = books.find((x) => x.title === title);
  if (!b) return <Empty label="Book not found." />;

  const slug = bookSlug(b.title);
  const hasCover = covers[slug]?.found === true;
  const coverUrl = hasCover ? `${BASE}/covers/${slug}.jpg` : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
        <div className="w-32 shrink-0 aspect-[2/3] bg-ink border border-paper/15 overflow-hidden">
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt={`Cover of ${b.title}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center serif text-paper/85 text-sm p-3 text-center">
              {b.title}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="type text-[10px] uppercase tracking-[0.3em] text-ember mb-2">{b.year} · {b.category}{b.pseudonym ? ` · as ${b.pseudonym}` : ""}{b.series ? ` · ${b.series}` : ""}</p>
          <h2 className="serif text-3xl text-paper leading-tight">{b.title}</h2>
          <p className="serif italic text-bone/70 mt-3 leading-relaxed">{b.blurb}</p>
        </div>
      </div>

      <h3 className="type text-[10px] uppercase tracking-[0.3em] text-bone/55 mb-4">
        Characters in this book ({chars.length})
      </h3>
      {chars.length === 0 ? (
        <p className="serif italic text-bone/55">
          No tracked characters in this curated set yet. (Full Wikidata ingest would surface more.)
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {chars.map((c) => (
            <li key={c.name} className="border-l-2 border-blood/40 pl-4">
              <div className="flex items-baseline gap-2 mb-1">
                <h4 className="serif text-lg text-paper">{c.name}</h4>
                {c.alignment && (
                  <span className={"type text-[9px] uppercase tracking-[0.2em] " + ALIGN_COLOR[c.alignment]}>{c.alignment}</span>
                )}
                {c.books.length > 1 && (
                  <span className="type text-[9px] uppercase tracking-[0.2em] text-ember">
                    in {c.books.length} books
                  </span>
                )}
              </div>
              <p className="serif italic text-bone/70 text-sm">{c.role}</p>
              <p className="text-bone/75 text-sm mt-1 leading-snug line-clamp-3">{c.description}</p>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-8">
        <Link href="/books" className="type text-[10px] uppercase tracking-[0.25em] text-ember hover:text-paper">
          All books →
        </Link>
      </p>
    </div>
  );
}

function CharacterDetail({ character, books: cBooks }: { character: Character | null | undefined; books: typeof books }) {
  if (!character) return <Empty label="Select a character on the left." />;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-baseline gap-3 mb-2">
          <h2 className="serif text-3xl text-paper">{character.name}</h2>
          {character.alignment && (
            <span className={"type text-[10px] uppercase tracking-[0.25em] " + ALIGN_COLOR[character.alignment]}>
              {character.alignment}
            </span>
          )}
        </div>
        {character.aliases && character.aliases.length > 0 && (
          <p className="type text-[10px] uppercase tracking-[0.25em] text-bone/55 mb-3">
            also: {character.aliases.join(" · ")}
          </p>
        )}
        <p className="serif italic text-bone/75 mb-2">{character.role}</p>
        <p className="text-bone/80 leading-relaxed max-w-3xl">{character.description}</p>
      </div>

      <h3 className="type text-[10px] uppercase tracking-[0.3em] text-bone/55 mb-4">
        Appears in {cBooks.length} book{cBooks.length === 1 ? "" : "s"}
      </h3>
      {cBooks.length === 0 ? (
        <p className="serif italic text-bone/55">No matching books in the curated archive.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cBooks.map((b) => {
            const slug = bookSlug(b.title);
            const hasCover = covers[slug]?.found === true;
            const coverUrl = hasCover ? `${BASE}/covers/${slug}.jpg` : null;
            return (
              <li key={b.title} className="group">
                <div className="aspect-[2/3] bg-ink border border-paper/15 overflow-hidden">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverUrl} alt={`Cover of ${b.title}`}
                         className="w-full h-full object-cover transition group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-2 serif text-paper/85 text-sm text-center">
                      {b.title}
                    </div>
                  )}
                </div>
                <p className="serif text-sm text-paper mt-2 leading-tight">{b.title}</p>
                <p className="type text-[10px] uppercase tracking-[0.25em] text-bone/55">
                  {b.year}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="serif italic text-bone/55 text-lg">{label}</p>;
}
