import Link from "next/link";
import { notFound } from "next/navigation";
import { films } from "@/lib/films";
import { books } from "@/lib/books";
import { cameos } from "@/lib/cameos";
import { relatedFor, GENRE_LABEL, UNIVERSE_LABEL } from "@/lib/related";
import { bookSlug, filmSlug } from "@/components/slugs";
import postersManifest from "@/../public/posters/manifest.json";
import coversManifest  from "@/../public/covers/manifest.json";
import type { Metadata } from "next";

const BASE   = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const posters = postersManifest as Record<string, { found: boolean }>;
const covers  = coversManifest  as Record<string, { found: boolean }>;

export function generateStaticParams() {
  return films.map((f) => ({ slug: filmSlug(f.title, f.year) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const f = films.find((x) => filmSlug(x.title, x.year) === params.slug);
  return {
    title: f ? `${f.title} (${f.year}) — Castle Rock Archive` : "Film — Castle Rock Archive",
  };
}

export default function FilmDetailPage({ params }: { params: { slug: string } }) {
  const film = films.find((f) => filmSlug(f.title, f.year) === params.slug);
  if (!film) return notFound();

  const fslug = filmSlug(film.title, film.year);
  const hasPoster = posters[fslug]?.found === true;
  const posterUrl = hasPoster ? `${BASE}/posters/${fslug}.jpg` : null;

  // Find the source book (loose match)
  const sourceLower = film.source.toLowerCase();
  const sourceBook = books.find((b) =>
    sourceLower.includes(b.title.toLowerCase()) || b.title.toLowerCase().includes(sourceLower.replace(/\s*\(.*\)\s*/, ""))
  );

  // Related works via similarity engine
  const relatedWorks = relatedFor(fslug).slice(0, 6);

  // King's cameo in this film, if any
  const kingCameo = cameos.find((c) => c.film.toLowerCase() === film.title.toLowerCase()
                                    || c.film_imdb === film.imdb);

  return (
    <main className="px-5 py-12 sm:px-6 sm:py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3 type text-[10px] uppercase tracking-[0.3em] text-bone/45">
          <Link href="/" className="hover:text-ember">Castle Rock</Link>
          <span className="text-bone/20">/</span>
          <Link href="/films" className="hover:text-ember">Films</Link>
          <span className="text-bone/20">/</span>
          <span className="text-bone/70">{film.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-start">
          <div className="w-full aspect-[2/3] bg-coal border border-paper/15 overflow-hidden">
            {posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={posterUrl} alt={`Poster of ${film.title}`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center serif text-paper/85 text-xl p-4 text-center">
                {film.title}
              </div>
            )}
          </div>
          <div>
            <p className="type text-[11px] uppercase tracking-[0.3em] text-ember mb-2">
              {film.year} · {film.type}{film.director ? ` · dir. ${film.director}` : ""}
            </p>
            <h1 className="serif text-4xl sm:text-5xl text-paper leading-tight drip-stop">{film.title}</h1>
            <p className="serif italic text-bone/80 mt-4 leading-relaxed text-lg">{film.blurb}</p>
            <p className="type text-[11px] uppercase tracking-[0.25em] text-bone/55 mt-5">
              From: <span className="text-bone/85">{film.source}</span>
            </p>
            {film.imdb && (
              <p className="type text-[10px] uppercase tracking-[0.25em] text-bone/45 mt-2">
                <a href={`https://www.imdb.com/title/${film.imdb}/`} target="_blank" rel="noopener noreferrer"
                   className="hover:text-ember underline underline-offset-2">
                  IMDB · {film.imdb}
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Source book */}
        {sourceBook && (
          <section className="mt-14">
            <h2 className="type text-[10px] uppercase tracking-[0.3em] text-bone/55 mb-4">
              Source material
            </h2>
            <Link href={`/book/${bookSlug(sourceBook.title)}/`} className="group flex gap-5 items-start border border-paper/15 bg-coal/30 p-4 hover:border-ember/40 transition">
              <div className="w-20 h-28 shrink-0 bg-ink border border-paper/15 overflow-hidden">
                {(() => {
                  const s = bookSlug(sourceBook.title);
                  const has = covers[s]?.found === true;
                  const url = has ? `${BASE}/covers/${s}.jpg` : null;
                  return url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={url} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center serif text-paper/85 text-xs p-2 text-center">{sourceBook.title}</div>;
                })()}
              </div>
              <div className="min-w-0">
                <p className="type text-[10px] uppercase tracking-[0.3em] text-ember mb-1">
                  {sourceBook.year} · {sourceBook.category}{sourceBook.pseudonym ? ` · as ${sourceBook.pseudonym}` : ""}
                </p>
                <h3 className="serif text-2xl text-paper leading-tight group-hover:text-ember transition">{sourceBook.title}</h3>
                <p className="serif italic text-bone/70 text-sm mt-1 leading-snug">{sourceBook.blurb}</p>
              </div>
            </Link>
          </section>
        )}

        {/* King cameo in this film */}
        {kingCameo && (
          <section className="mt-14">
            <h2 className="type text-[10px] uppercase tracking-[0.3em] text-bone/55 mb-4">
              Stephen King cameo
            </h2>
            <div className="border-l-2 border-blood/60 pl-5 py-2">
              <p className="serif text-xl text-paper">as {kingCameo.role}</p>
              <p className="text-bone/75 mt-1 leading-relaxed">{kingCameo.description}</p>
            </div>
          </section>
        )}

        {/* Related works */}
        {relatedWorks.length > 0 && (
          <section className="mt-16">
            <div className="flex items-baseline gap-4 mb-5">
              <h2 className="type text-[10px] uppercase tracking-[0.3em] text-bone/55">
                Related works ({relatedWorks.length})
              </h2>
              <Link href="/related" className="type text-[9px] uppercase tracking-[0.25em] text-ember/70 hover:text-ember">
                full constellation &rarr;
              </Link>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedWorks.map((nb) => {
                const isBook = nb.work.kind === "book";
                const href = isBook ? `/book/${nb.slug}/` : `/film/${nb.slug}/`;
                const nbCoverSlug  = isBook  ? nb.slug : null;
                const nbPosterSlug = !isBook ? nb.slug : null;
                const hasCoverNb  = nbCoverSlug  ? (coversManifest  as Record<string, { found: boolean }>)[nbCoverSlug]?.found  === true : false;
                const hasPosterNb = nbPosterSlug ? (postersManifest as Record<string, { found: boolean }>)[nbPosterSlug]?.found === true : false;
                const imgUrl = hasCoverNb
                  ? `${BASE}/covers/${nb.slug}.jpg`
                  : hasPosterNb
                  ? `${BASE}/posters/${nb.slug}.jpg`
                  : null;
                return (
                  <li key={nb.slug}>
                    <Link href={href}
                      className="group flex gap-3 items-start border border-paper/10 bg-coal/20 p-3 hover:border-ember/35 transition">
                      <div className="w-12 h-16 shrink-0 bg-ink border border-paper/10 overflow-hidden">
                        {imgUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center serif text-paper/60 text-[9px] p-1 text-center leading-tight">
                            {nb.work.title.slice(0, 10)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="type text-[9px] uppercase tracking-[0.2em] text-ember mb-0.5">
                          {nb.work.kind} · {nb.work.year} · {Math.round(nb.score * 100)}% match
                        </p>
                        <h3 className="serif text-sm text-paper leading-tight group-hover:text-ember transition line-clamp-2">
                          {nb.work.title}
                        </h3>
                        <p className="type text-[9px] uppercase tracking-[0.18em] text-bone/50 mt-0.5 line-clamp-1">
                          {nb.why}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {nb.sharedUniverse.slice(0, 2).map((u) => (
                            <span key={u}
                              className="type text-[8px] uppercase tracking-[0.15em] border border-ember/30 px-1 text-ember/80">
                              {UNIVERSE_LABEL[u] ?? u}
                            </span>
                          ))}
                          {nb.sharedGenres.slice(0, 1).map((g) => (
                            <span key={g}
                              className="type text-[8px] uppercase tracking-[0.15em] border border-paper/15 px-1 text-bone/55">
                              {GENRE_LABEL[g] ?? g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <p className="type text-[10px] uppercase tracking-[0.3em] text-bone/40 mt-16">
          Data: film dimension (TMDB), cameo fact table (TMDB cast credits filtered to person 3636).
        </p>
      </div>
    </main>
  );
}
