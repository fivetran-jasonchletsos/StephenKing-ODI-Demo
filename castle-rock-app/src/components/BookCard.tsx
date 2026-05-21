import Link from "next/link";
import type { Book } from "@/lib/books";
import { bookSlug } from "./slugs";
import coversManifest from "@/../public/covers/manifest.json";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const manifest = coversManifest as Record<string, { found: boolean }>;

export default function BookCard({ book }: { book: Book }) {
  const slug = bookSlug(book.title);
  const hasCover = manifest[slug]?.found === true;
  const coverUrl = hasCover ? `${BASE}/covers/${slug}.jpg` : null;

  return (
    <Link href={`/book/${slug}/`} className="block group focus:outline-none focus:ring-2 focus:ring-ember/40">
    <article>
      <div className="aspect-[2/3] relative overflow-hidden bg-coal cover-card border border-paper/10">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center">
            <p className="serif text-paper/85 text-lg leading-tight">{book.title}</p>
            <p className="type text-[10px] uppercase tracking-[0.3em] text-bone/45 mt-2">{book.year}</p>
          </div>
        )}
        {book.pseudonym && (
          <div className="absolute top-2 left-2 type text-[9px] uppercase tracking-[0.25em] bg-ink/80 text-ember px-1.5 py-0.5 border border-ember/40">
            {book.pseudonym}
          </div>
        )}
        {book.series && (
          <div className="absolute bottom-2 right-2 type text-[9px] uppercase tracking-[0.25em] bg-ink/80 text-bone/80 px-1.5 py-0.5">
            {book.series}
          </div>
        )}
      </div>
      <div className="mt-2.5">
        <h3 className="serif text-base leading-tight text-paper">{book.title}</h3>
        <p className="type text-[10px] uppercase tracking-[0.25em] text-bone/55 mt-1">
          {book.year} · {book.category}
        </p>
        <p className="text-sm text-bone/65 mt-2 leading-snug line-clamp-3">{book.blurb}</p>
      </div>
    </article>
    </Link>
  );
}
