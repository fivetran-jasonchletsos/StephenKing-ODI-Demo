import { cameos } from "@/lib/cameos";
import CameoAnalytics from "@/components/CameoAnalytics";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cameos — Castle Rock Archive",
};

export default function CameosPage() {
  const sorted = [...cameos].sort((a, b) => a.year - b.year);
  return (
    <main className="px-5 py-12 sm:px-6 sm:py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="type text-[11px] uppercase tracking-[0.35em] text-ember mb-3">Cameos</p>
        <h1 className="serif text-4xl sm:text-5xl text-paper drip-stop">King On Screen</h1>
        <p className="serif italic text-bone/65 mt-3 max-w-2xl">
          {cameos.length} on-screen appearances, in his own adaptations and a few outside. Pulled
          from TMDB cast credits filtered for King's actor entry (TMDB person 3636).
        </p>

        <CameoAnalytics />

        <h2 className="type text-[11px] uppercase tracking-[0.35em] text-ember mt-16 mb-3">
          The full list, chronological
        </h2>

        <ul className="mt-6 space-y-8 border-l border-blood/40 pl-6">
          {sorted.map((c, i) => (
            <li key={`${c.year}-${c.film}-${i}`} className="relative">
              <span className="absolute -left-[26px] top-2 w-2.5 h-2.5 rounded-full bg-blood ring-2 ring-blood/30" aria-hidden="true" />
              <div className="flex flex-wrap items-baseline gap-3 mb-1">
                <span className="type text-[11px] uppercase tracking-[0.3em] text-ember">{c.year}</span>
                <h3 className="serif text-2xl text-paper">{c.film}</h3>
              </div>
              <p className="serif italic text-bone/75 mb-1">as {c.role}</p>
              <p className="text-bone/70 leading-relaxed max-w-2xl">{c.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
