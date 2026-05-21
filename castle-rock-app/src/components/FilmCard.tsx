import type { Film } from "@/lib/films";
import { filmSlug } from "./slugs";
import postersManifest from "@/../public/posters/manifest.json";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const manifest = postersManifest as Record<string, { found: boolean }>;

export default function FilmCard({ film }: { film: Film }) {
  const slug = filmSlug(film.title, film.year);
  const hasPoster = manifest[slug]?.found === true;
  const posterUrl = hasPoster ? `${BASE}/posters/${slug}.jpg` : null;

  return (
    <article className="group">
      <div className="aspect-[2/3] relative overflow-hidden bg-coal cover-card border border-paper/10">
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt={`Poster of ${film.title} (${film.year})`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
            <p className="serif text-paper/85 text-lg leading-tight">{film.title}</p>
            <p className="type text-[10px] uppercase tracking-[0.3em] text-bone/45 mt-2">{film.year}</p>
          </div>
        )}
        <div className="absolute top-2 left-2 type text-[9px] uppercase tracking-[0.25em] bg-ink/80 text-bone/85 px-1.5 py-0.5">
          {film.type === "film" ? "Film" : film.type === "miniseries" ? "Miniseries" : "Series"}
        </div>
      </div>
      <div className="mt-2.5">
        <h3 className="serif text-base leading-tight text-paper">{film.title}</h3>
        <p className="type text-[10px] uppercase tracking-[0.25em] text-bone/55 mt-1">
          {film.year} · dir. {film.director || "—"}
        </p>
        <p className="text-sm text-bone/65 mt-2 leading-snug line-clamp-3">{film.blurb}</p>
        <p className="type text-[10px] uppercase tracking-[0.25em] text-ember/70 mt-2">
          From: {film.source}
        </p>
      </div>
    </article>
  );
}
