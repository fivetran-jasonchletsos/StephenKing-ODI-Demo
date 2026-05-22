import Link from "next/link";
import { notFound } from "next/navigation";
import { books } from "@/lib/books";
import { films } from "@/lib/films";
import { characters } from "@/lib/characters";
import { bookSlug, filmSlug } from "@/components/slugs";
import coversManifest from "@/../public/covers/manifest.json";
import postersManifest from "@/../public/posters/manifest.json";
import type { Metadata } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const covers  = coversManifest  as Record<string, { found: boolean }>;
const posters = postersManifest as Record<string, { found: boolean }>;

const ALIGN_COLOR: Record<string, string> = {
  protagonist:  "text-sickly",
  antagonist:   "text-ember",
  neutral:      "text-bone/70",
  supernatural: "text-blood",
};

export function generateStaticParams() {
  return books.map((b) => ({ slug: bookSlug(b.title) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const b = books.find((x) => bookSlug(x.title) === params.slug);
  return {
    title: b ? `${b.title} (${b.year}) — Castle Rock Archive` : "Book — Castle Rock Archive",
  };
}

export default function BookDetailPage({ params }: { params: { slug: string } }) {
  const book = books.find((b) => bookSlug(b.title) === params.slug);
  if (!book) return notFound();

  const slug = bookSlug(book.title);
  const hasCover = covers[slug]?.found === true;
  const coverUrl = hasCover ? `${BASE}/covers/${slug}.jpg` : null;

  // Characters that appear in this book
  const inBook = characters.filter((c) => c.books.includes(book.title));

  // Films adapted from this book (loose match against `source`)
  const titleLower = book.title.toLowerCase();
  const adaptations = films.filter((f) =>
    f.source.toLowerCase().includes(titleLower)
    || titleLower.includes(f.source.toLowerCase())
    || f.title.toLowerCase().includes(titleLower)
  );

  return (
    <main className="px-5 py-12 sm:px-6 sm:py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3 type text-[10px] uppercase tracking-[0.3em] text-bone/45">
          <Link href="/" className="hover:text-ember">Castle Rock</Link>
          <span className="text-bone/20">/</span>
          <Link href="/books" className="hover:text-ember">Books</Link>
          <span className="text-bone/20">/</span>
          <span className="text-bone/70">{book.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-start">
          <div className="w-full aspect-[2/3] bg-coal border border-paper/15 overflow-hidden">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt={`Cover of ${book.title}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center serif text-paper/85 text-xl p-4 text-center">
                {book.title}
              </div>
            )}
          </div>
          <div>
            <p className="type text-[11px] uppercase tracking-[0.3em] text-ember mb-2">
              {book.year} · {book.category}{book.pseudonym ? ` · as ${book.pseudonym}` : ""}{book.series ? ` · ${book.series}` : ""}
            </p>
            <h1 className="serif text-4xl sm:text-5xl text-paper leading-tight drip-stop">{book.title}</h1>
            <p className="serif italic text-bone/80 mt-4 leading-relaxed text-lg">{book.blurb}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {book.pseudonym && (
                <span className="type text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 border border-ember/40 text-ember">
                  Pseudonym: {book.pseudonym}
                </span>
              )}
              {book.series && (
                <span className="type text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 border border-paper/20 text-bone/70">
                  Series: {book.series}
                </span>
              )}
              <span className="type text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 border border-paper/20 text-bone/70">
                Category: {book.category}
              </span>
            </div>
          </div>
        </div>

        {/* Characters */}
        <section className="mt-16">
          <h2 className="type text-[10px] uppercase tracking-[0.3em] text-bone/55 mb-5">
            Characters in this book ({inBook.length})
          </h2>
          {inBook.length === 0 ? (
            <p className="serif italic text-bone/55">No tracked characters yet in this curated set.</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {inBook.map((c) => (
                <li key={c.name} className="border-l-2 border-blood/40 pl-4">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="serif text-lg text-paper">{c.name}</h3>
                    {c.alignment && (
                      <span className={"type text-[9px] uppercase tracking-[0.2em] " + ALIGN_COLOR[c.alignment]}>
                        {c.alignment}
                      </span>
                    )}
                    {c.books.length > 1 && (
                      <span className="type text-[9px] uppercase tracking-[0.2em] text-ember">
                        in {c.books.length} books
                      </span>
                    )}
                  </div>
                  {c.aliases && c.aliases.length > 0 && (
                    <p className="type text-[9px] uppercase tracking-[0.2em] text-bone/45 mb-1">
                      also: {c.aliases.slice(0, 3).join(" · ")}{c.aliases.length > 3 ? ` · +${c.aliases.length - 3}` : ""}
                    </p>
                  )}
                  <p className="serif italic text-bone/70 text-sm">{c.role}</p>
                  <p className="text-bone/75 text-sm mt-1 leading-snug line-clamp-3">{c.description}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Adaptations */}
        {adaptations.length > 0 && (
          <section className="mt-16">
            <h2 className="type text-[10px] uppercase tracking-[0.3em] text-bone/55 mb-5">
              Adaptations ({adaptations.length})
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {adaptations.sort((a, b) => a.year - b.year).map((f) => {
                const fslug = filmSlug(f.title, f.year);
                const hasPoster = posters[fslug]?.found === true;
                const posterUrl = hasPoster ? `${BASE}/posters/${fslug}.jpg` : null;
                return (
                  <li key={`${f.title}-${f.year}`}>
                    <Link href={`/film/${fslug}/`} className="group block">
                      <div className="aspect-[2/3] bg-coal border border-paper/15 overflow-hidden cover-card">
                        {posterUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={posterUrl} alt={`Poster of ${f.title}`} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center p-3 serif text-paper/85 text-sm text-center">
                            {f.title}
                          </div>
                        )}
                      </div>
                      <p className="serif text-sm text-paper mt-2 leading-tight">{f.title}</p>
                      <p className="type text-[10px] uppercase tracking-[0.25em] text-bone/55">
                        {f.year} · {f.type}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <p className="type text-[10px] uppercase tracking-[0.3em] text-bone/40 mt-16">
          Data sources: book dimension (Open Library), appearance fact table (Wikidata), film dimension (TMDB).
        </p>
      </div>
    </main>
  );
}
