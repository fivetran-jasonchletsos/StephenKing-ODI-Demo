import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ODI Architecture — Castle Rock Archive",
};

const ENGINES = [
  { name: "Snowflake (primary)", use: "Warehouse, dbt target, Cortex Analyst, BI", sample: "SELECT * FROM gold.dim_book WHERE published_year >= 1986;" },
  { name: "AWS Athena",          use: "Ad-hoc SQL over the same Iceberg tables",   sample: "SELECT title, year FROM gold.dim_film WHERE source = '\\'Salem''s Lot\\'';" },
  { name: "DuckDB",              use: "Laptop-local exploration",                   sample: "INSTALL iceberg; LOAD iceberg;\nSELECT * FROM iceberg_scan('s3://castle-rock/gold/dim_character/');" },
  { name: "Apache Spark",        use: "Batch + ML feature engineering",             sample: "spark.read.format('iceberg').load('gold.fct_appearance').groupBy('character').count()" },
  { name: "Snowflake Cortex",    use: "Natural-language Q&A over gold",             sample: "Cortex Analyst answers: \"How many novels feature Randall Flagg?\" → joins gold.dim_character + gold.fct_appearance" },
  { name: "Castle Rock app",     use: "Static front end reading gold JSON",         sample: "fetch('/data/dim_book.json'); fetch('/data/fct_appearance.json');" },
];

const COMPARISON = [
  { dim: "Storage",       wg: "Vendor-managed proprietary",  odi: "Open Iceberg in Castle Rock's S3, mirrored into Snowflake" },
  { dim: "Storage copies",wg: "One per engine",              odi: "Single copy, every engine reads it" },
  { dim: "Compute",       wg: "Bundled with storage",        odi: "Snowflake primary; Athena/DuckDB/Spark/Cortex pluggable" },
  { dim: "AI access",     wg: "Vendor-defined pathway",       odi: "Cortex Analyst on the same gold tables Snowflake BI reads" },
  { dim: "Switching",     wg: "Full rewrite",                 odi: "dbt profile change" },
];

export default function ArchitecturePage() {
  return (
    <main className="px-5 py-12 sm:px-6 sm:py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="type text-[10px] uppercase tracking-[0.3em] text-ember mb-3">ODI Architecture</p>
        <h1 className="serif text-4xl sm:text-5xl text-paper drip-stop">
          Three sources. One open lake. Cortex on top.
        </h1>
        <p className="serif italic text-bone/70 mt-3 max-w-3xl leading-relaxed">
          Castle Rock pulls from Open Library, TMDB, and Wikidata via Fivetran into Apache Iceberg
          on S3, mirrors into Snowflake managed tables, transforms with dbt, then exposes the gold
          layer to Snowflake Cortex Analyst, BI, the static front end, and any other engine that
          can read Iceberg.
        </p>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Sources",          value: "3", sub: "OpenLibrary · TMDB · Wikidata" },
            { label: "Bronze schemas",   value: "3", sub: "one per connector" },
            { label: "Gold tables",      value: "9", sub: "dims, facts, marts" },
            { label: "Engines reading",  value: "6", sub: "Snowflake · Cortex · Athena · DuckDB · Spark · the app" },
          ].map((t) => (
            <div key={t.label} className="border border-paper/15 bg-coal/40 p-4">
              <div className="type text-[10px] uppercase tracking-[0.3em] text-bone/45">{t.label}</div>
              <div className="serif text-3xl text-paper mt-1">{t.value}</div>
              <div className="type text-[10px] uppercase tracking-[0.25em] text-bone/40 mt-1">{t.sub}</div>
            </div>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="serif text-2xl text-paper mb-5 drip-stop">Pipeline</h2>
          <pre className="text-xs sm:text-sm text-bone/80 font-mono whitespace-pre overflow-x-auto bg-coal/40 border border-paper/15 p-5">
{`   OpenLibrary       TMDB         Wikidata
       \\            |            /
            Fivetran (3 connectors)
                     |
            Apache Iceberg in S3 (open foundation)
                     |   mirror via Iceberg external table
                     ▼
            Snowflake managed tables   (bronze_*)
                     |
                    dbt
                     ▼
            gold.dim_book    gold.dim_film    gold.dim_character
            gold.fct_adaptation    gold.fct_cameo    gold.fct_appearance
                     |
       ┌─────────────┼─────────────┬─────────────┐
       ▼             ▼             ▼             ▼
   Cortex        Athena         Castle Rock    Notebooks
   Analyst    (Iceberg read)      front end      (Spark, etc.)
`}
          </pre>
        </section>

        <section className="mt-16">
          <h2 className="serif text-2xl text-paper mb-5 drip-stop">Engines reading the same gold</h2>
          <div className="space-y-3">
            {ENGINES.map((e) => (
              <details key={e.name} className="border border-paper/15 bg-coal/40 p-4 group">
                <summary className="cursor-pointer flex items-baseline gap-3">
                  <span className="serif text-lg text-paper">{e.name}</span>
                  <span className="type text-[10px] uppercase tracking-[0.25em] text-bone/55">{e.use}</span>
                </summary>
                <pre className="mt-3 text-xs font-mono text-ember/85 whitespace-pre-wrap bg-ink/60 p-3 border border-paper/10">
{e.sample}
                </pre>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="serif text-2xl text-paper mb-5 drip-stop">Walled garden vs Open Data Infrastructure</h2>
          <table className="w-full text-sm border border-paper/15">
            <thead>
              <tr className="text-left type text-[10px] uppercase tracking-[0.3em] text-bone/55">
                <th className="px-3 py-2 border-b border-paper/15">Dimension</th>
                <th className="px-3 py-2 border-b border-paper/15">Walled garden</th>
                <th className="px-3 py-2 border-b border-paper/15">Castle Rock (ODI)</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((c) => (
                <tr key={c.dim} className="border-b border-paper/10">
                  <td className="px-3 py-2 serif text-paper">{c.dim}</td>
                  <td className="px-3 py-2 text-bone/65">{c.wg}</td>
                  <td className="px-3 py-2 text-ember/85">{c.odi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
