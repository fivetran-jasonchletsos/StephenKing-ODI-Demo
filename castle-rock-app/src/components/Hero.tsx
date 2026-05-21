import Link from "next/link";
import { books } from "@/lib/books";
import { films } from "@/lib/films";
import { characters } from "@/lib/characters";
import { cameos } from "@/lib/cameos";

export default function Hero() {
  const span =
    `${Math.min(...books.map((b) => b.year))} – ${Math.max(...books.map((b) => b.year))}`;
  return (
    <section className="border-b border-paper/10 px-5 py-16 sm:px-6 sm:py-20 md:px-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="type text-[10px] uppercase tracking-[0.35em] text-ember mb-4">
          Castle Rock Archive · {span}
        </p>
        <h1 className="serif text-5xl sm:text-6xl md:text-7xl leading-[0.95] text-paper">
          <span className="blood-underline">The King</span> universe,
          <br className="hidden sm:block" /> open and indexed.
        </h1>
        <p className="serif mt-7 max-w-2xl text-lg italic text-bone/80 leading-relaxed">
          {books.length} novels and collections. {films.length} adaptations.
          {" "}{cameos.length} on-screen cameos. {characters.length} recurring characters.
          {" "}All pulled from Open Library, TMDB, and Wikidata by Fivetran;
          modeled by dbt into a Snowflake gold layer; queryable by Cortex Analyst.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/books"        className="px-5 py-2.5 type uppercase tracking-[0.2em] text-xs bg-blood text-paper hover:bg-ember transition border border-ember/40">Books</Link>
          <Link href="/films"        className="px-5 py-2.5 type uppercase tracking-[0.2em] text-xs border border-paper/25 text-bone hover:text-paper hover:border-ember/60 transition">Films</Link>
          <Link href="/characters"   className="px-5 py-2.5 type uppercase tracking-[0.2em] text-xs border border-paper/25 text-bone hover:text-paper hover:border-ember/60 transition">Characters</Link>
          <Link href="/timeline"     className="px-5 py-2.5 type uppercase tracking-[0.2em] text-xs border border-paper/25 text-bone hover:text-paper hover:border-ember/60 transition">Timeline</Link>
          <Link href="/architecture" className="px-5 py-2.5 type uppercase tracking-[0.2em] text-xs border border-paper/25 text-bone hover:text-paper hover:border-ember/60 transition">ODI Architecture</Link>
        </div>
      </div>
    </section>
  );
}
