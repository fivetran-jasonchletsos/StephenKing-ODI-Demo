import PipelineDiagram from "@/components/PipelineDiagram";
import EngineSelector  from "@/components/EngineSelector";
import DataQualityPanel from "@/components/DataQualityPanel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ODI Architecture — Castle Rock Archive",
};

export default function ArchitecturePage() {
  return (
    <main className="px-5 py-12 sm:px-6 sm:py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <p className="type text-[11px] uppercase tracking-[0.35em] text-ember mb-3">ODI Architecture</p>
        <h1 className="serif text-4xl sm:text-5xl text-paper drip-stop">
          Three sources. One open lake. Cortex on top.
        </h1>
        <p className="serif italic text-bone/75 mt-4 max-w-3xl leading-relaxed">
          Fivetran pulls Open Library + TMDB + Wikidata into Apache Iceberg on S3, mirrored into
          Snowflake managed tables. dbt builds the gold layer with a semantic model. Snowflake
          Cortex Analyst sits on that semantic model and answers natural-language questions — the
          same gold tables Athena, DuckDB, Spark, and this front end already read.
        </p>

        <section className="mt-10">
          <PipelineDiagram />
        </section>

        <section className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Fivetran connectors", value: "3",  sub: "OpenLibrary · TMDB · Wikidata" },
            { label: "Bronze schemas",      value: "3",  sub: "one per source" },
            { label: "Gold tables",         value: "5",  sub: "dim_book · dim_film · dim_character · fct_appearance · fct_cameo" },
            { label: "Engines reading gold", value: "6", sub: "Snowflake · Cortex · Athena · DuckDB · Spark · the app" },
          ].map((t) => (
            <div key={t.label} className="border border-paper/15 bg-coal/40 p-4">
              <p className="type text-[10px] uppercase tracking-[0.3em] text-bone/45">{t.label}</p>
              <p className="serif text-3xl text-paper mt-1">{t.value}</p>
              <p className="type text-[10px] uppercase tracking-[0.25em] text-bone/40 mt-1">{t.sub}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 border border-ember/40 bg-ember/5 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <line x1="12" y1="2"    x2="12" y2="22"    stroke="#29b5e8" strokeWidth="2" strokeLinecap="round" />
              <line x1="2"  y1="12"   x2="22" y2="12"    stroke="#29b5e8" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.93"  y1="4.93"  x2="19.07" y2="19.07" stroke="#29b5e8" strokeWidth="2" strokeLinecap="round" />
              <line x1="19.07" y1="4.93"  x2="4.93"  y2="19.07" stroke="#29b5e8" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="type text-[10px] uppercase tracking-[0.3em] text-ember">Cortex spotlight</p>
          </div>
          <h2 className="serif text-3xl sm:text-4xl text-paper drip-stop">Cortex Analyst is the consumer ODI was waiting for.</h2>
          <p className="serif italic text-bone/85 mt-3 max-w-3xl leading-relaxed">
            ODI says: don't lock your data inside one vendor's proprietary AI gateway — keep it
            open and let any AI read it. Cortex Analyst proves the other direction: you can run a
            state-of-the-art NL→SQL agent <span className="text-ember">on top of the open layer</span> —
            same Iceberg gold tables Athena and DuckDB read, no separate AI data product, no
            second copy.
          </p>

          <div className="mt-7 grid md:grid-cols-2 gap-5">
            <div className="border border-paper/15 bg-coal/30 p-5">
              <p className="type text-[10px] uppercase tracking-[0.3em] text-ember mb-2">What Fivetran does</p>
              <p className="serif text-base text-paper leading-relaxed">
                Three managed connectors, one destination role, zero glue code. Each source lands
                into its own bronze schema and into Iceberg in S3 simultaneously — the open lake
                is automatic, not a separate engineering project.
              </p>
            </div>
            <div className="border border-paper/15 bg-coal/30 p-5">
              <p className="type text-[10px] uppercase tracking-[0.3em] text-ember mb-2">What dbt does</p>
              <p className="serif text-base text-paper leading-relaxed">
                Conforms the three sources into <code className="font-mono text-bone/85">gold.dim_*</code> and
                <code className="font-mono text-bone/85"> gold.fct_*</code> tables and writes the
                <em> semantic model</em> Cortex Analyst attaches to. The semantic model teaches Cortex what
                "decade", "series", "alignment", and "pseudonym" mean for the King corpus.
              </p>
            </div>
            <div className="border border-paper/15 bg-coal/30 p-5 md:col-span-2">
              <p className="type text-[10px] uppercase tracking-[0.3em] text-ember mb-2">What Cortex does</p>
              <p className="serif text-base text-paper leading-relaxed">
                Reads natural-language questions, walks the semantic model + table relationships,
                writes the SQL, runs it on Snowflake, and returns the answer with the SQL it used.
                The same semantic model can be queried by an analyst in Snowsight, by an agent
                over the Cortex API, or by a Streamlit app — and the data is the same data the
                rest of this site reads. No second silo.
              </p>
            </div>
          </div>
        </section>

        <EngineSelector />

        <DataQualityPanel />

        <section className="mt-16">
          <div className="section-ornament mb-6">
            <span className="type text-[11px] uppercase tracking-[0.35em] text-ember">vs all-in-one platforms</span>
          </div>
          <table className="w-full text-sm border border-paper/15">
            <thead>
              <tr className="text-left type text-[10px] uppercase tracking-[0.3em] text-bone/55">
                <th className="px-3 py-2 border-b border-paper/15">Dimension</th>
                <th className="px-3 py-2 border-b border-paper/15">Walled garden</th>
                <th className="px-3 py-2 border-b border-paper/15">Castle Rock (ODI)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Storage",          "Vendor-managed proprietary",      "Open Iceberg in Castle Rock's S3, mirrored into Snowflake"],
                ["Storage copies",   "One per engine",                  "Single copy; every engine reads it"],
                ["AI access",        "Vendor-defined gateway",          "Cortex on the same gold the BI reads"],
                ["Semantic model",   "Tool-specific, not reusable",     "dbt semantic model — Cortex, BI, agents all reuse it"],
                ["Switching cost",   "Full rewrite",                    "dbt profile change"],
                ["Adding an engine", "Migrate or live without",         "Attach to the lake, no re-ingest"],
              ].map(([dim, wg, odi]) => (
                <tr key={dim} className="border-b border-paper/10">
                  <td className="px-3 py-2 serif text-paper">{dim}</td>
                  <td className="px-3 py-2 text-bone/65">{wg}</td>
                  <td className="px-3 py-2 text-ember/85">{odi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
