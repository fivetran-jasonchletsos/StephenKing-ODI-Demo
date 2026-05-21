import Link from "next/link";
import { books } from "@/lib/books";
import { films } from "@/lib/films";
import { bookSlug, filmSlug } from "@/components/slugs";
import coversManifest from "@/../public/covers/manifest.json";
import postersManifest from "@/../public/posters/manifest.json";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Timeline — Castle Rock Archive",
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const covers  = coversManifest  as Record<string, { found: boolean }>;
const posters = postersManifest as Record<string, { found: boolean }>;

const SVG_WIDTH    = 1600;
const PAD_LEFT     = 56;
const PAD_RIGHT    = 56;
const USABLE_WIDTH = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;

const YEAR_MIN  = 1974;
const YEAR_MAX  = 2024;
const YEAR_SPAN = YEAR_MAX - YEAR_MIN;

const BASELINE_Y  = 280;
const DOT_SIZE    = 7;
const DOT_STEP    = 10;
const THUMB_SIZE  = 28;
const SVG_HEIGHT  = BASELINE_Y + 60;

function yearToX(year: number) {
  return PAD_LEFT + ((year - YEAR_MIN) / YEAR_SPAN) * USABLE_WIDTH;
}

const DECADES = [1980, 1990, 2000, 2010, 2020];

type Dot = {
  kind: "book" | "film";
  title: string;
  year: number;
  slug: string;
  href: string;
  imgUrl: string | null;
  director?: string;
  x: number;
  y: number;
};

function buildDots(): Dot[] {
  const byYear = new Map<number, Dot[]>();
  for (const b of books) {
    const slug = bookSlug(b.title);
    const has  = covers[slug]?.found === true;
    const d: Dot = {
      kind: "book",
      title: b.title,
      year: b.year,
      slug,
      href: "/books",
      imgUrl: has ? `${BASE}/covers/${slug}.jpg` : null,
      x: yearToX(b.year),
      y: 0,
    };
    (byYear.get(b.year) ?? byYear.set(b.year, []).get(b.year))!.push(d);
  }
  for (const f of films) {
    const slug = filmSlug(f.title, f.year);
    const has  = posters[slug]?.found === true;
    const d: Dot = {
      kind: "film",
      title: f.title,
      year: f.year,
      slug,
      href: "/films",
      imgUrl: has ? `${BASE}/posters/${slug}.jpg` : null,
      director: f.director,
      x: yearToX(f.year),
      y: 0,
    };
    (byYear.get(f.year) ?? byYear.set(f.year, []).get(f.year))!.push(d);
  }
  const all: Dot[] = [];
  for (const [, items] of byYear) {
    // films first (below), books second (above) for vertical stacking
    items.sort((a, b) => (a.kind === "film" ? -1 : 1));
    items.forEach((d, i) => {
      d.y = BASELINE_Y - i * DOT_STEP - DOT_SIZE / 2;
      all.push(d);
    });
  }
  return all;
}
const DOTS = buildDots();

export default function TimelinePage() {
  return (
    <main className="px-5 py-12 sm:px-6 sm:py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="type text-[11px] uppercase tracking-[0.35em] text-ember mb-3">Timeline</p>
        <h1 className="serif text-4xl sm:text-5xl text-paper drip-stop">{YEAR_MIN} → {YEAR_MAX}</h1>
        <p className="serif italic text-bone/65 mt-3 max-w-3xl">
          Every book and every adaptation, year by year. Hover for the title; click to dig in.
        </p>

        <div className="mt-10 overflow-x-auto -mx-5 px-5 sm:-mx-6 sm:px-6 md:-mx-0 md:px-0">
          <div style={{ minWidth: "1100px" }}>
            <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} width="100%" height={SVG_HEIGHT}
                 aria-label="Career timeline" role="img" style={{ display: "block" }}>
              {DECADES.map((d) => {
                const x = yearToX(d);
                return (
                  <g key={d}>
                    <line x1={x} y1={20} x2={x} y2={BASELINE_Y} stroke="#e9e1cf" strokeOpacity="0.08" strokeWidth="1" />
                    <line x1={x} y1={BASELINE_Y - 4} x2={x} y2={BASELINE_Y + 4} stroke="#e9e1cf" strokeOpacity="0.3" strokeWidth="1" />
                  </g>
                );
              })}
              {[YEAR_MIN, YEAR_MAX].map((yr) => (
                <line key={yr} x1={yearToX(yr)} y1={BASELINE_Y - 4} x2={yearToX(yr)} y2={BASELINE_Y + 4}
                      stroke="#e9e1cf" strokeOpacity="0.25" strokeWidth="1" />
              ))}
              <line x1={PAD_LEFT} y1={BASELINE_Y} x2={SVG_WIDTH - PAD_RIGHT} y2={BASELINE_Y}
                    stroke="#e9e1cf" strokeOpacity="0.15" strokeWidth="1" />
              {DOTS.map((dot) => {
                if (dot.imgUrl) return null;
                return (
                  <circle key={`dot-${dot.kind}-${dot.slug}`} cx={dot.x} cy={dot.y} r={DOT_SIZE / 2}
                          fill={dot.kind === "book" ? "#a92d24" : "#7a8a4a"} fillOpacity="0.85" />
                );
              })}
            </svg>

            <div className="relative" style={{ marginTop: `-${SVG_HEIGHT}px`, height: `${SVG_HEIGHT}px` }}>
              {DECADES.map((d) => {
                const xPct = (yearToX(d) / SVG_WIDTH) * 100;
                const yPct = ((BASELINE_Y + 12) / SVG_HEIGHT) * 100;
                return (
                  <span key={`dl-${d}`} className="absolute type text-[10px] uppercase tracking-[0.3em] text-bone/45 -translate-x-1/2"
                        style={{ left: `${xPct}%`, top: `${yPct}%` }}>
                    {d}s
                  </span>
                );
              })}
              {[
                { y: YEAR_MIN, align: "left" as const },
                { y: YEAR_MAX, align: "right" as const },
              ].map(({ y, align }) => {
                const xPct = (yearToX(y) / SVG_WIDTH) * 100;
                const yPct = ((BASELINE_Y + 12) / SVG_HEIGHT) * 100;
                return (
                  <span key={`end-${y}`} className="absolute type text-[10px] text-bone/30"
                        style={{ left: `${xPct}%`, top: `${yPct}%`, transform: align === "right" ? "translateX(-100%)" : "none" }}>
                    {y}
                  </span>
                );
              })}

              {DOTS.map((dot) => {
                const xPct = (dot.x / SVG_WIDTH) * 100;
                const yPct = (dot.y / SVG_HEIGHT) * 100;
                if (dot.imgUrl) {
                  const halfX = ((THUMB_SIZE / 2) / SVG_WIDTH) * 100;
                  const halfY = ((THUMB_SIZE / 2) / SVG_HEIGHT) * 100;
                  return (
                    <Link key={`thumb-${dot.kind}-${dot.slug}`} href={dot.href} className="absolute group"
                          style={{ left: `${xPct - halfX}%`, top: `${yPct - halfY}%`,
                                   width: `${(THUMB_SIZE / SVG_WIDTH) * 100}%`,
                                   height: `${(THUMB_SIZE / SVG_HEIGHT) * 100}%` }}
                          title={`${dot.title} (${dot.year})`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={dot.imgUrl} alt=""
                           className={`w-full h-full object-cover border ${dot.kind === "book" ? "border-blood/60" : "border-sickly/60"}
                             transition group-hover:scale-[1.9] group-hover:z-10 group-hover:shadow-2xl`}
                           style={{ position: "relative", zIndex: 1 }}
                           loading="lazy" />
                      <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-50">
                        <span className="whitespace-nowrap bg-coal border border-paper/25 px-2 py-1 type text-[9px] uppercase tracking-[0.15em] text-paper shadow-xl">
                          {dot.title}
                        </span>
                        <span className="whitespace-nowrap bg-coal/95 px-2 py-0.5 type text-[8px] uppercase tracking-[0.15em] text-bone/65">
                          {dot.kind === "book" ? "Novel" : "Film"} · {dot.year}{dot.director ? ` · ${dot.director}` : ""}
                        </span>
                      </span>
                    </Link>
                  );
                }
                const halfDx = ((DOT_SIZE / 2) / SVG_WIDTH) * 100;
                const halfDy = ((DOT_SIZE / 2) / SVG_HEIGHT) * 100;
                return (
                  <Link key={`adot-${dot.kind}-${dot.slug}`} href={dot.href} className="absolute group"
                        style={{ left: `${xPct - halfDx}%`, top: `${yPct - halfDy}%`,
                                 width: `${(DOT_SIZE / SVG_WIDTH) * 100}%`,
                                 height: `${(DOT_SIZE / SVG_HEIGHT) * 100}%` }}
                        title={`${dot.title} (${dot.year})`}>
                    <span className={`absolute inset-0 rounded-full ${dot.kind === "book" ? "bg-blood/85" : "bg-sickly/85"} transition group-hover:scale-[2.2]`} />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50">
                      <span className="whitespace-nowrap bg-coal border border-paper/25 px-2 py-1 type text-[9px] uppercase tracking-[0.15em] text-paper shadow-xl">
                        {dot.title}
                      </span>
                      <span className="whitespace-nowrap bg-coal/95 px-2 py-0.5 type text-[8px] uppercase tracking-[0.15em] text-bone/65">
                        {dot.kind === "book" ? "Novel" : "Film"} · {dot.year}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 flex gap-6 type text-[10px] uppercase tracking-[0.3em] text-bone/55 justify-center">
              <span><span className="inline-block w-3 h-3 align-middle bg-blood/80 mr-1.5" /> books</span>
              <span><span className="inline-block w-3 h-3 align-middle bg-sickly/80 mr-1.5" /> films</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
