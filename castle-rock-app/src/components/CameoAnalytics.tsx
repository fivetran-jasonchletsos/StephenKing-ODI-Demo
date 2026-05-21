import { cameos } from "@/lib/cameos";

// Bucket each cameo's role into a category for the right-side chart.
// Categories are slightly tongue-in-cheek; if a role matches multiple
// it picks the first hit.
const CATEGORIES: { label: string; test: (role: string) => boolean }[] = [
  { label: "Minister / clergy",       test: (r) => /minister|priest|preacher|father|reverend/i.test(r) },
  { label: "Driver",                  test: (r) => /\b(driver|bus|conductor)\b/i.test(r) },
  { label: "Pizza / delivery",        test: (r) => /pizza|delivery/i.test(r) },
  { label: "Diner / store / clerk",   test: (r) => /clerk|cashier|store|shop|diner|customer/i.test(r) },
  { label: "Cemetery / funeral",      test: (r) => /cemetery|funeral|graveyard|mourner|caretaker/i.test(r) },
  { label: "Doctor / medical",        test: (r) => /doctor|dr\.|nurse|medical/i.test(r) },
  { label: "Voice / phone",           test: (r) => /voice|phone/i.test(r) },
  { label: "Background / pedestrian", test: (r) => /uncredited|pedestrian|background|passenger/i.test(r) },
  { label: "Named character",         test: ()  => true }, // catch-all
];

function bucketRole(role: string): string {
  for (const c of CATEGORIES) if (c.test(role)) return c.label;
  return "Named character";
}

export default function CameoAnalytics() {
  // ── By decade ────────────────────────────────────────────────────────────
  const byDecade = new Map<number, number>();
  for (const c of cameos) {
    const d = Math.floor(c.year / 10) * 10;
    byDecade.set(d, (byDecade.get(d) ?? 0) + 1);
  }
  const decades = Array.from(byDecade.keys()).sort();
  const decadeMax = Math.max(...byDecade.values(), 1);

  // ── By year (sparkline-ish) ──────────────────────────────────────────────
  const minY = Math.min(...cameos.map((c) => c.year));
  const maxY = Math.max(...cameos.map((c) => c.year));
  const yearCounts: { year: number; count: number }[] = [];
  for (let y = minY; y <= maxY; y++) {
    yearCounts.push({ year: y, count: cameos.filter((c) => c.year === y).length });
  }
  const yearMax = Math.max(...yearCounts.map((p) => p.count), 1);

  // ── By role category ─────────────────────────────────────────────────────
  const byCat = new Map<string, number>();
  for (const c of cameos) {
    const k = bucketRole(c.role);
    byCat.set(k, (byCat.get(k) ?? 0) + 1);
  }
  const cats = Array.from(byCat.entries()).sort((a, b) => b[1] - a[1]);
  const catMax = Math.max(...cats.map(([, n]) => n), 1);

  // ── Headlines ────────────────────────────────────────────────────────────
  const topDecade = decades.reduce((a, b) => ((byDecade.get(a) ?? 0) >= (byDecade.get(b) ?? 0) ? a : b));

  return (
    <section className="mt-12 mb-14">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { label: "Total cameos",           value: cameos.length },
          { label: "Years spanned",          value: `${minY}–${maxY}` },
          { label: "Most active decade",     value: `${topDecade}s · ${byDecade.get(topDecade)}` },
          { label: "Avg cameos / decade",    value: (cameos.length / decades.length).toFixed(1) },
        ].map((t) => (
          <div key={t.label} className="border border-paper/15 bg-coal/40 p-4">
            <p className="type text-[10px] uppercase tracking-[0.3em] text-bone/45">{t.label}</p>
            <p className="serif text-3xl text-paper mt-1">{t.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* By decade */}
        <div className="border border-paper/15 bg-coal/30 p-5">
          <h3 className="type text-[10px] uppercase tracking-[0.3em] text-bone/55 mb-4">By decade</h3>
          <ul className="space-y-2.5">
            {decades.map((d) => {
              const n = byDecade.get(d) ?? 0;
              const pct = (n / decadeMax) * 100;
              return (
                <li key={d} className="flex items-center gap-3">
                  <span className="type text-[10px] uppercase tracking-[0.25em] text-bone/55 w-12 shrink-0">{d}s</span>
                  <div className="flex-1 h-5 bg-paper/5 border border-paper/10 relative">
                    <div className="h-full" style={{ width: `${pct}%`, background: "#7f1a14" }} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 type text-[10px] uppercase tracking-[0.25em] text-paper">{n}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* By role category */}
        <div className="border border-paper/15 bg-coal/30 p-5">
          <h3 className="type text-[10px] uppercase tracking-[0.3em] text-bone/55 mb-4">By role type</h3>
          <ul className="space-y-2.5">
            {cats.map(([cat, n]) => {
              const pct = (n / catMax) * 100;
              return (
                <li key={cat} className="flex items-center gap-3">
                  <span className="type text-[10px] uppercase tracking-[0.25em] text-bone/65 w-44 shrink-0">{cat}</span>
                  <div className="flex-1 h-5 bg-paper/5 border border-paper/10 relative">
                    <div className="h-full" style={{ width: `${pct}%`, background: "#a92d24" }} />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 type text-[10px] uppercase tracking-[0.25em] text-paper">{n}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* By year — small sparkline */}
      <div className="mt-8 border border-paper/15 bg-coal/30 p-5">
        <h3 className="type text-[10px] uppercase tracking-[0.3em] text-bone/55 mb-4">By year</h3>
        <svg viewBox={`0 0 ${yearCounts.length * 14} 60`} width="100%" height="80" role="img"
             aria-label={`Cameos per year from ${minY} to ${maxY}`}>
          {yearCounts.map((p, i) => {
            const x = i * 14;
            const h = (p.count / yearMax) * 50;
            return (
              <g key={p.year}>
                <rect x={x + 2} y={56 - h} width="10" height={h} fill="#a92d24" fillOpacity={p.count ? 0.85 : 0} />
                <rect x={x + 2} y={56}    width="10" height={1} fill="#e9e1cf" fillOpacity={0.15} />
              </g>
            );
          })}
          <text x={0}                              y={68} fill="#c9bfa6" fillOpacity={0.45} fontSize="10" fontFamily="var(--font-jetbrains)">{minY}</text>
          <text x={yearCounts.length * 14}        y={68} fill="#c9bfa6" fillOpacity={0.45} fontSize="10" fontFamily="var(--font-jetbrains)" textAnchor="end">{maxY}</text>
        </svg>
      </div>
    </section>
  );
}
