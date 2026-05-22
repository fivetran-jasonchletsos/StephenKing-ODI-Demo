"use client";

import { useMemo, useState } from "react";
import { books } from "@/lib/books";
import { characters, type Character } from "@/lib/characters";
import { bookSlug } from "@/components/slugs";
import ConnectionsCortexPanel from "@/components/ConnectionsCortexPanel";
import coversManifest from "@/../public/covers/manifest.json";

const BASE   = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const covers = coversManifest as Record<string, { found: boolean }>;

const ALIGN_STROKE: Record<string, string> = {
  protagonist:  "#7a8a4a", // sickly green
  antagonist:   "#a92d24", // ember red
  neutral:      "#c9bfa6", // bone
  supernatural: "#7f1a14", // blood
};
const ALIGN_LABEL: Record<string, string> = {
  protagonist:  "Protagonist",
  antagonist:   "Antagonist",
  neutral:      "Neutral",
  supernatural: "Supernatural",
};

// ─── Layout constants ────────────────────────────────────────────────────────
const SVG_WIDTH    = 1600;
const PAD_LEFT     = 60;
const PAD_RIGHT    = 60;
const USABLE_WIDTH = SVG_WIDTH - PAD_LEFT - PAD_RIGHT;

const BASELINE_Y   = 540;      // where the book row sits
const SVG_HEIGHT   = BASELINE_Y + 120; // extra room for labels below
const COVER_W      = 22;
const COVER_H      = 32;

// ─── Helpers ────────────────────────────────────────────────────────────────
function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

// ─── Data prep — computed once at module load ───────────────────────────────
const sortedBooks = [...books].sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
const titleToIndex = new Map<string, number>();
sortedBooks.forEach((b, i) => titleToIndex.set(b.title, i));

const YEAR_MIN = Math.min(...sortedBooks.map((b) => b.year));
const YEAR_MAX = Math.max(...sortedBooks.map((b) => b.year));

// Distribute books along x — by INDEX (not year) so they're evenly spaced.
// (Year-based positioning bunches them too tightly in dense decades.)
function indexToX(i: number): number {
  if (sortedBooks.length <= 1) return PAD_LEFT + USABLE_WIDTH / 2;
  return PAD_LEFT + (i / (sortedBooks.length - 1)) * USABLE_WIDTH;
}

type Arc = {
  character: Character;
  fromIdx: number;
  toIdx: number;
  d: string;            // svg path
  midX: number;
  midY: number;
  radius: number;
  alignmentStroke: string;
};

function buildArcs(): Arc[] {
  const arcs: Arc[] = [];
  for (const c of characters) {
    if (c.books.length < 2) continue;
    // Get the book indices this character is in, sorted.
    const idxs = c.books
      .map((t) => titleToIndex.get(t))
      .filter((i): i is number => i !== undefined)
      .sort((a, b) => a - b);
    if (idxs.length < 2) continue;
    // Thread through consecutive book pairs.
    for (let k = 0; k < idxs.length - 1; k++) {
      const a = idxs[k];
      const b = idxs[k + 1];
      const x1 = indexToX(a);
      const x2 = indexToX(b);
      const r  = Math.abs(x2 - x1) / 2;
      const midX = (x1 + x2) / 2;
      // SVG arc above the baseline. sweep-flag 0 = counterclockwise = arc above (since y grows down)
      const d = `M ${x1} ${BASELINE_Y} A ${r} ${r} 0 0 1 ${x2} ${BASELINE_Y}`;
      arcs.push({
        character: c,
        fromIdx: a,
        toIdx:   b,
        d,
        midX,
        midY: BASELINE_Y - r,
        radius: r,
        alignmentStroke: ALIGN_STROKE[c.alignment ?? "neutral"],
      });
    }
  }
  // Larger radii drawn first so smaller arcs render on top
  arcs.sort((a, b) => b.radius - a.radius);
  return arcs;
}
const ARCS = buildArcs();

// Multi-book characters list (the legend / focus controls)
const MULTI_BOOK = characters
  .filter((c) => c.books.length >= 2)
  .map((c) => ({ ...c, validBooks: c.books.filter((t) => titleToIndex.has(t)) }))
  .filter((c) => c.validBooks.length >= 2)
  .sort((a, b) => b.validBooks.length - a.validBooks.length || a.name.localeCompare(b.name));

// Decade marks for the year axis
const DECADES = Array.from(new Set(sortedBooks.map((b) => Math.floor(b.year / 10) * 10))).sort();

// ─── Page ───────────────────────────────────────────────────────────────────
export default function ConnectionsPage() {
  const [focus, setFocus] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const active = hover ?? focus;
  const activeChar = active ? characters.find((c) => c.name === active) : null;
  const activeIdxs = useMemo(() => {
    if (!activeChar) return new Set<number>();
    return new Set(activeChar.books
      .map((t) => titleToIndex.get(t))
      .filter((i): i is number => i !== undefined));
  }, [activeChar]);

  return (
    <main className="px-5 py-12 sm:px-6 sm:py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="type text-[11px] uppercase tracking-[0.35em] text-ember mb-3">Connections</p>
        <h1 className="serif text-4xl sm:text-5xl text-paper drip-stop">The web, drawn.</h1>
        <p className="serif italic text-bone/70 mt-3 max-w-3xl">
          Every book along the bottom, sorted by publication year. Each arc threads a recurring
          character through their books. Hover a character on the right; click to lock the focus.
          The data behind this is the appearance fact table joined with the book dimension — both
          modeled in dbt from the Wikidata connector.
        </p>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Visualization */}
          <div className="overflow-x-auto -mx-5 px-5 sm:-mx-6 sm:px-6 md:-mx-0 md:px-0">
            <div style={{ minWidth: 1200 }}>
              <svg
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                width="100%"
                height={SVG_HEIGHT}
                role="img"
                aria-label="Arc diagram connecting Stephen King books by recurring characters"
                style={{ display: "block" }}
              >
                <defs>
                  {/* a subtle outer glow filter for the active arc */}
                  <filter id="arcGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" />
                  </filter>
                </defs>

                {/* Decade ticks + labels */}
                {DECADES.map((d) => {
                  const firstIdx = sortedBooks.findIndex((b) => b.year >= d);
                  const x = firstIdx >= 0 ? indexToX(firstIdx) : null;
                  if (x === null) return null;
                  return (
                    <g key={`dec-${d}`}>
                      <line x1={x} y1={BASELINE_Y + 10} x2={x} y2={BASELINE_Y + 20} stroke="#e9e1cf" strokeOpacity="0.2" />
                      <text x={x} y={BASELINE_Y + 36} fill="#c9bfa6" fillOpacity="0.55" fontSize="11"
                            fontFamily="var(--font-jetbrains)" letterSpacing="0.2em" textAnchor="middle">
                        {d}s
                      </text>
                    </g>
                  );
                })}

                {/* Baseline */}
                <line x1={PAD_LEFT} y1={BASELINE_Y} x2={SVG_WIDTH - PAD_RIGHT} y2={BASELINE_Y}
                      stroke="#e9e1cf" strokeOpacity="0.18" strokeWidth="1" />

                {/* Arcs — render inactive first (dimmed), then active on top */}
                {ARCS.map((arc, i) => {
                  const isActive = active === arc.character.name;
                  const dim = !!active && !isActive;
                  return (
                    <path
                      key={`arc-${i}`}
                      d={arc.d}
                      fill="none"
                      stroke={arc.alignmentStroke}
                      strokeOpacity={dim ? 0.06 : isActive ? 0.95 : 0.34}
                      strokeWidth={isActive ? 2.4 : 1.1}
                      filter={isActive ? "url(#arcGlow)" : undefined}
                    />
                  );
                })}

                {/* Book covers — small thumbnails anchored above the baseline.
                    When focused, only the active character's books light up. */}
                {sortedBooks.map((b, i) => {
                  const x = indexToX(i);
                  const slug = bookSlug(b.title);
                  const has  = covers[slug]?.found === true;
                  const url  = has ? `${BASE}/covers/${slug}.jpg` : null;
                  const isActive = activeIdxs.has(i);
                  const dim = !!active && !isActive;

                  return (
                    <g key={`bk-${b.title}`}>
                      {/* hit target: small invisible square + a real cover image */}
                      <g transform={`translate(${x - COVER_W / 2} ${BASELINE_Y - COVER_H - 4})`}
                         opacity={dim ? 0.18 : 1}>
                        {url ? (
                          <image
                            href={url}
                            xlinkHref={url}
                            width={COVER_W}
                            height={COVER_H}
                            preserveAspectRatio="xMidYMid slice"
                            stroke="#e9e1cf"
                            strokeOpacity="0.2"
                          />
                        ) : (
                          <rect width={COVER_W} height={COVER_H} fill="#161210" stroke="#e9e1cf" strokeOpacity="0.2" />
                        )}
                        {/* Outline for active book */}
                        {isActive && (
                          <rect width={COVER_W} height={COVER_H} fill="none"
                                stroke="#a92d24" strokeWidth="1.6" />
                        )}
                      </g>

                      {/* Book dot on baseline */}
                      <circle cx={x} cy={BASELINE_Y} r="2.5"
                              fill={isActive ? "#a92d24" : "#e9e1cf"}
                              fillOpacity={dim ? 0.15 : isActive ? 1 : 0.55} />

                      {/* Title (rotated) on hover via <title> */}
                      <title>{b.title} · {b.year}</title>
                    </g>
                  );
                })}

                {/* Focus character label, centered above */}
                {activeChar && (
                  <g transform={`translate(${SVG_WIDTH / 2} 36)`}>
                    <text textAnchor="middle" fill="#e9e1cf" fontSize="22"
                          fontFamily="var(--font-rozha), Georgia, serif">
                      {activeChar.name}
                    </text>
                    <text textAnchor="middle" y="22" fill="#c9bfa6" fillOpacity="0.65" fontSize="11"
                          fontFamily="var(--font-jetbrains)" letterSpacing="0.2em">
                      {activeChar.books.length} BOOKS · {ALIGN_LABEL[activeChar.alignment ?? "neutral"]}
                    </text>
                  </g>
                )}

                {/* Year-range end labels */}
                <text x={PAD_LEFT} y={BASELINE_Y + 64} fill="#c9bfa6" fillOpacity="0.4"
                      fontSize="10" fontFamily="var(--font-jetbrains)">
                  {YEAR_MIN}
                </text>
                <text x={SVG_WIDTH - PAD_RIGHT} y={BASELINE_Y + 64} fill="#c9bfa6" fillOpacity="0.4"
                      fontSize="10" fontFamily="var(--font-jetbrains)" textAnchor="end">
                  {YEAR_MAX}
                </text>
              </svg>

              {/* Legend */}
              <div className="mt-3 flex gap-6 type text-[10px] uppercase tracking-[0.3em] text-bone/55 justify-center">
                <span><span className="inline-block w-3 h-[2px] align-middle bg-[#a92d24] mr-1.5" /> antagonist</span>
                <span><span className="inline-block w-3 h-[2px] align-middle bg-[#7a8a4a] mr-1.5" /> protagonist</span>
                <span><span className="inline-block w-3 h-[2px] align-middle bg-[#7f1a14] mr-1.5" /> supernatural</span>
                <span><span className="inline-block w-3 h-[2px] align-middle bg-[#c9bfa6] mr-1.5" /> neutral</span>
              </div>
            </div>
          </div>

          {/* Right side — character roster */}
          <aside>
            <p className="type text-[10px] uppercase tracking-[0.3em] text-bone/55 mb-3">
              {MULTI_BOOK.length} cross-book characters
            </p>
            <ul className="border border-paper/15 bg-coal/30 max-h-[60vh] overflow-y-auto">
              {MULTI_BOOK.map((c) => {
                const active = focus === c.name;
                return (
                  <li key={c.name} className="border-b border-paper/8">
                    <button
                      type="button"
                      onMouseEnter={() => setHover(c.name)}
                      onMouseLeave={() => setHover((h) => (h === c.name ? null : h))}
                      onClick={() => setFocus((f) => (f === c.name ? null : c.name))}
                      className="w-full text-left px-4 py-2.5 flex items-baseline gap-3 transition"
                      style={{
                        background: active ? "rgba(127,26,20,0.20)" : "transparent",
                        borderLeft: active ? `2px solid ${ALIGN_STROKE[c.alignment ?? "neutral"]}` : "2px solid transparent",
                      }}
                    >
                      <span className="serif text-sm text-paper flex-1 leading-tight">{c.name}</span>
                      <span className="type text-[9px] uppercase tracking-[0.2em]" style={{ color: ALIGN_STROKE[c.alignment ?? "neutral"] }}>
                        {c.validBooks.length}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {focus ? (
              <button
                type="button"
                onClick={() => setFocus(null)}
                className="mt-3 type text-[10px] uppercase tracking-[0.25em] text-bone/55 hover:text-ember"
              >
                ← clear focus
              </button>
            ) : (
              <p className="mt-3 type text-[10px] uppercase tracking-[0.25em] text-bone/40">
                hover to preview · click to lock
              </p>
            )}
          </aside>
        </div>

        <p className="type text-[10px] uppercase tracking-[0.3em] text-bone/40 mt-12">
          Drawn from the appearance fact table joined with the book dimension. Pure SVG, no JS chart lib.
        </p>

        <ConnectionsCortexPanel />
      </div>
    </main>
  );
}
