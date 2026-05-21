import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pipeline — Castle Rock Archive",
};

const CONNECTORS = [
  { name: "Open Library",  schema: "bronze_openlibrary", freq: "Daily",           tables: 4, state: "healthy" },
  { name: "TMDB",          schema: "bronze_tmdb",        freq: "Daily",           tables: 5, state: "healthy" },
  { name: "Wikidata",      schema: "bronze_wikidata",    freq: "Weekly (SPARQL)", tables: 3, state: "healthy" },
];

const LAYERS = [
  { layer: "bronze",  rows: "≈ 41,000", last: "2026-05-21T05:30Z" },
  { layer: "silver",  rows: "≈ 11,200", last: "2026-05-21T06:00Z" },
  { layer: "gold",    rows: "≈ 1,400",  last: "2026-05-21T06:08Z" },
  { layer: "publish", rows: "(JSON exports for the front end)", last: "2026-05-21T06:12Z" },
];

const SIMS = [
  { title: "Open Library schema change",       narr: "OL bumped /works fields. Fivetran auto-detected the schema evolution; silver picked up the new columns via `select *`. No consumer broke.", impact: false },
  { title: "TMDB API key rotation",            narr: "Old key expired. Fivetran alerted; updated secret; connector resumed. The lake retains all prior partitions.", impact: true },
  { title: "Snowflake mirror temporarily offline", narr: "Iceberg in S3 stayed available. Athena and DuckDB kept reading. Cortex paused; everything else continued.", impact: false },
  { title: "Cortex semantic model promoted",   narr: "Added `appearance_count` measure to the semantic layer. No data movement; no front-end change required.", impact: false },
];

export default function PipelinePage() {
  return (
    <main className="px-5 py-12 sm:px-6 sm:py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="type text-[10px] uppercase tracking-[0.3em] text-ember mb-3">Pipeline</p>
        <h1 className="serif text-4xl sm:text-5xl text-paper drip-stop">Connector + layer status</h1>

        <section className="mt-10">
          <h2 className="type text-[10px] uppercase tracking-[0.3em] text-bone/55 mb-4">Connectors</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {CONNECTORS.map((c) => (
              <div key={c.name} className="border border-paper/15 bg-coal/40 p-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="serif text-lg text-paper">{c.name}</h3>
                  <span className="type text-[9px] uppercase tracking-[0.25em] text-sickly bg-sickly/10 border border-sickly/30 px-2 py-0.5">
                    {c.state}
                  </span>
                </div>
                <p className="type text-[10px] uppercase tracking-[0.25em] text-bone/45 mt-2">
                  Schema: <span className="text-bone/75">{c.schema}</span>
                </p>
                <p className="type text-[10px] uppercase tracking-[0.25em] text-bone/45">
                  Frequency: <span className="text-bone/75">{c.freq}</span>
                </p>
                <p className="type text-[10px] uppercase tracking-[0.25em] text-bone/45">
                  Tables landed: <span className="text-bone/75">{c.tables}</span>
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="type text-[10px] uppercase tracking-[0.3em] text-bone/55 mb-4">Layer status</h2>
          <table className="w-full text-sm border border-paper/15">
            <thead>
              <tr className="text-left type text-[10px] uppercase tracking-[0.3em] text-bone/55">
                <th className="px-3 py-2 border-b border-paper/15">Layer</th>
                <th className="px-3 py-2 border-b border-paper/15 text-right">Rows</th>
                <th className="px-3 py-2 border-b border-paper/15">Last run</th>
              </tr>
            </thead>
            <tbody>
              {LAYERS.map((l) => (
                <tr key={l.layer} className="border-b border-paper/10">
                  <td className="px-3 py-2 serif text-paper">{l.layer}</td>
                  <td className="px-3 py-2 text-right text-bone/75">{l.rows}</td>
                  <td className="px-3 py-2 type text-bone/55">{l.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-12">
          <h2 className="type text-[10px] uppercase tracking-[0.3em] text-bone/55 mb-4">What-if simulator</h2>
          <div className="space-y-3">
            {SIMS.map((s) => (
              <div key={s.title} className="border border-paper/15 bg-coal/40 p-4">
                <div className="flex items-baseline justify-between">
                  <h3 className="serif text-lg text-paper">{s.title}</h3>
                  <span className={`type text-[9px] uppercase tracking-[0.25em] px-2 py-0.5 border
                    ${s.impact ? "text-ember bg-blood/15 border-ember/40" : "text-sickly bg-sickly/10 border-sickly/30"}`}>
                    {s.impact ? "Would impact source" : "No downstream impact"}
                  </span>
                </div>
                <p className="text-sm text-bone/75 mt-2 leading-relaxed">{s.narr}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
