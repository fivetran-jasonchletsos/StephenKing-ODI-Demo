import FilmCard from "@/components/FilmCard";
import { films } from "@/lib/films";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Films — Castle Rock Archive",
};

export default function FilmsPage() {
  const byDecade = new Map<number, typeof films>();
  for (const f of films) {
    const d = Math.floor(f.year / 10) * 10;
    if (!byDecade.has(d)) byDecade.set(d, []);
    byDecade.get(d)!.push(f);
  }
  const decades = Array.from(byDecade.keys()).sort();

  return (
    <main className="px-5 py-12 sm:px-6 sm:py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="type text-[11px] uppercase tracking-[0.35em] text-ember mb-3">Films</p>
        <h1 className="serif text-4xl sm:text-5xl text-paper drip-stop">Adaptations</h1>
        <p className="serif italic text-bone/65 mt-3 max-w-2xl">
          Feature films, miniseries, and major TV series adapted from King source material.
          Hundreds of student films and shorts (Dollar Babies) are omitted.
        </p>

        {decades.map((d) => {
          const list = (byDecade.get(d) || []).sort((a, b) => a.year - b.year);
          return (
            <section key={d} className="mt-14">
              <h2 className="type text-[11px] uppercase tracking-[0.35em] text-bone/55 mb-5">
                {d}s · {list.length} title{list.length === 1 ? "" : "s"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-10">
                {list.map((f) => <FilmCard key={`${f.title}-${f.year}`} film={f} />)}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
