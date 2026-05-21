"use client";

import { useState } from "react";

// The same logical question expressed by each engine, side by side. The
// point: the gold layer is open; every engine reads the same bytes; the
// query is whatever's idiomatic to the tool — Cortex Analyst writes its
// own SQL from a natural-language ask.

type EngineKey = "cortex" | "snowflake" | "athena" | "duckdb" | "spark" | "dbt";

const ENGINES: { key: EngineKey; name: string; hint: string }[] = [
  { key: "cortex",    name: "Snowflake Cortex Analyst", hint: "Natural-language → semantic model → SQL" },
  { key: "snowflake", name: "Snowflake SQL",            hint: "Direct SQL on managed Iceberg tables" },
  { key: "athena",    name: "AWS Athena",                hint: "SQL over the same Iceberg files in S3" },
  { key: "duckdb",    name: "DuckDB",                   hint: "Laptop-local on a copy of the lake" },
  { key: "spark",     name: "Apache Spark",             hint: "Distributed read for ML features" },
  { key: "dbt",       name: "dbt model",                hint: "The compiled model that built gold" },
];

type Sample = { question: string; code: Record<EngineKey, string> };

const SAMPLES: Sample[] = [
  {
    question: "How many books does each multi-book character appear in?",
    code: {
      cortex: `User: "Which characters show up in more than one King book? How many?"

Cortex Analyst resolves against gold.fct_appearance + gold.dim_character
in the semantic model, returns:

  character_name   |  book_count
  -----------------+-------------
  Randall Flagg    |  7
  Roland Deschain  |  6
  Holly Gibney     |  6
  Eddie Dean       |  6
  Susannah Dean    |  6
  ...`,
      snowflake: `SELECT
    c.name                AS character_name,
    COUNT(*)              AS book_count
FROM   castle_rock.gold.fct_appearance a
JOIN   castle_rock.gold.dim_character  c USING (character_sk)
GROUP  BY c.name
HAVING COUNT(*) >= 2
ORDER  BY book_count DESC;`,
      athena: `SELECT
    c.name                AS character_name,
    COUNT(*)              AS book_count
FROM   gold.fct_appearance a
JOIN   gold.dim_character  c ON c.character_sk = a.character_sk
GROUP  BY c.name
HAVING COUNT(*) >= 2
ORDER  BY book_count DESC;`,
      duckdb: `-- Reads the Iceberg files directly from local copy / S3
SELECT
    c.name                AS character_name,
    COUNT(*)              AS book_count
FROM   read_parquet('gold/fct_appearance/*.parquet') a
JOIN   read_parquet('gold/dim_character/*.parquet') c
   ON  c.character_sk = a.character_sk
GROUP  BY c.name
HAVING COUNT(*) >= 2
ORDER  BY book_count DESC;`,
      spark: `val appearance = spark.read.format("iceberg").load("gold.fct_appearance")
val character  = spark.read.format("iceberg").load("gold.dim_character")

appearance
  .join(character, "character_sk")
  .groupBy("name")
  .agg(count("*").as("book_count"))
  .filter($"book_count" >= 2)
  .orderBy($"book_count".desc)
  .show()`,
      dbt: `-- models/marts/mart_character_book_count.sql
{{ config(materialized='table') }}

SELECT
    c.name                AS character_name,
    COUNT(*)              AS book_count
FROM   {{ ref('fct_appearance') }} a
JOIN   {{ ref('dim_character') }}  c USING (character_sk)
GROUP  BY c.name
HAVING COUNT(*) >= 2`,
    },
  },
  {
    question: "Which characters bridge Dark Tower and a standalone novel?",
    code: {
      cortex: `User: "Which characters appear in a Dark Tower book AND a standalone King novel?"

Cortex generates the SQL using the 'series' dimension of dim_book and
fct_appearance:

  character_name    | dt_books | standalone_books
  ------------------+----------+------------------
  Randall Flagg     |    5     |    2
  Father Callahan   |    3     |    1`,
      snowflake: `SELECT
    c.name                                              AS character_name,
    COUNT(CASE WHEN b.series = 'The Dark Tower' THEN 1 END) AS dt_books,
    COUNT(CASE WHEN b.series IS NULL            THEN 1 END) AS standalone_books
FROM   castle_rock.gold.fct_appearance a
JOIN   castle_rock.gold.dim_character  c USING (character_sk)
JOIN   castle_rock.gold.dim_book       b USING (book_sk)
GROUP  BY c.name
HAVING dt_books >= 1 AND standalone_books >= 1
ORDER  BY (dt_books + standalone_books) DESC;`,
      athena: `SELECT
    c.name,
    SUM(CASE WHEN b.series = 'The Dark Tower' THEN 1 ELSE 0 END) AS dt_books,
    SUM(CASE WHEN b.series IS NULL            THEN 1 ELSE 0 END) AS standalone_books
FROM   gold.fct_appearance a
JOIN   gold.dim_character  c ON c.character_sk = a.character_sk
JOIN   gold.dim_book       b ON b.book_sk     = a.book_sk
GROUP  BY c.name
HAVING SUM(CASE WHEN b.series = 'The Dark Tower' THEN 1 ELSE 0 END) >= 1
   AND SUM(CASE WHEN b.series IS NULL            THEN 1 ELSE 0 END) >= 1
ORDER  BY (dt_books + standalone_books) DESC;`,
      duckdb: `SELECT
    c.name,
    SUM((b.series = 'The Dark Tower')::INT) AS dt_books,
    SUM((b.series IS NULL)::INT)            AS standalone_books
FROM   gold.fct_appearance a
JOIN   gold.dim_character  c USING (character_sk)
JOIN   gold.dim_book       b USING (book_sk)
GROUP  BY c.name
HAVING dt_books >= 1 AND standalone_books >= 1;`,
      spark: `val isDarkTower = $"series" === "The Dark Tower"
appearance
  .join(book, "book_sk")
  .join(character, "character_sk")
  .groupBy("name")
  .agg(
    count(when(isDarkTower, 1)).as("dt_books"),
    count(when($"series".isNull, 1)).as("standalone_books")
  )
  .filter($"dt_books" >= 1 && $"standalone_books" >= 1)
  .show()`,
      dbt: `-- models/marts/mart_dark_tower_bridges.sql
SELECT
    c.name,
    COUNT_IF(b.series = 'The Dark Tower') AS dt_books,
    COUNT_IF(b.series IS NULL)            AS standalone_books
FROM   {{ ref('fct_appearance') }} a
JOIN   {{ ref('dim_character') }}  c USING (character_sk)
JOIN   {{ ref('dim_book') }}       b USING (book_sk)
GROUP  BY c.name
HAVING dt_books >= 1 AND standalone_books >= 1`,
    },
  },
  {
    question: "Cameos by decade",
    code: {
      cortex: `User: "Show me King's on-screen cameos by decade."

Cortex Analyst infers the time grain from dim_film.released_year and
joins fct_cameo to dim_film:

  decade |  cameos
  -------+---------
  1980s  |    5
  1990s  |    9
  2000s  |    4
  2010s  |    5
  2020s  |    2`,
      snowflake: `SELECT
    (FLOOR(f.released_year / 10) * 10) AS decade,
    COUNT(*)                            AS cameos
FROM   castle_rock.gold.fct_cameo c
JOIN   castle_rock.gold.dim_film  f USING (film_sk)
GROUP  BY decade
ORDER  BY decade;`,
      athena: `SELECT
    FLOOR(f.released_year / 10) * 10 AS decade,
    COUNT(*)                          AS cameos
FROM   gold.fct_cameo c
JOIN   gold.dim_film  f ON f.film_sk = c.film_sk
GROUP  BY FLOOR(f.released_year / 10) * 10
ORDER  BY 1;`,
      duckdb: `SELECT (released_year // 10) * 10 AS decade,
       COUNT(*)                AS cameos
FROM   gold.fct_cameo c
JOIN   gold.dim_film  f USING (film_sk)
GROUP  BY 1
ORDER  BY 1;`,
      spark: `cameo
  .join(film, "film_sk")
  .withColumn("decade", (floor($"released_year" / 10) * 10).cast("int"))
  .groupBy("decade").count()
  .orderBy("decade")
  .show()`,
      dbt: `-- models/marts/mart_cameos_by_decade.sql
SELECT
    FLOOR(f.released_year / 10) * 10 AS decade,
    COUNT(*)                          AS cameos
FROM   {{ ref('fct_cameo') }} c
JOIN   {{ ref('dim_film') }}  f USING (film_sk)
GROUP  BY FLOOR(f.released_year / 10) * 10`,
    },
  },
];

const ALL_KEYS: EngineKey[] = ["cortex", "snowflake", "athena", "duckdb", "spark", "dbt"];

export default function EngineSelector() {
  const [engine, setEngine] = useState<EngineKey>("cortex");
  const [sampleIdx, setSampleIdx] = useState(0);
  const sample = SAMPLES[sampleIdx];
  const code = sample.code[engine];

  return (
    <section className="mt-16">
      <div className="section-ornament mb-6">
        <span className="type text-[11px] uppercase tracking-[0.35em] text-ember">Same gold layer, every engine</span>
      </div>
      <h2 className="serif text-3xl text-paper drip-stop">Pick a question. Pick an engine.</h2>
      <p className="serif italic text-bone/70 mt-3 max-w-3xl leading-relaxed">
        The same logical question runs on every engine that can read the gold
        layer — and Cortex Analyst writes its own SQL from a natural-language
        question, because the dbt semantic model teaches it the vocabulary.
      </p>

      {/* Question chooser */}
      <div className="mt-8 flex flex-wrap gap-2">
        {SAMPLES.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSampleIdx(i)}
            className={"text-left type text-[10px] uppercase tracking-[0.25em] px-3 py-2 transition " +
              (i === sampleIdx
                ? "bg-blood text-paper border border-ember/40"
                : "border border-paper/15 text-bone/65 hover:text-paper hover:border-ember/50")}
          >
            {s.question}
          </button>
        ))}
      </div>

      {/* Engine tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {ALL_KEYS.map((k) => {
          const e = ENGINES.find((x) => x.key === k)!;
          const isActive = k === engine;
          const isCortex = k === "cortex";
          return (
            <button
              key={k}
              type="button"
              onClick={() => setEngine(k)}
              className={"type text-[10px] uppercase tracking-[0.25em] px-3 py-1.5 transition flex items-center gap-2 " +
                (isActive
                  ? (isCortex
                      ? "bg-ember/20 text-paper border border-ember/60"
                      : "bg-paper/8 text-paper border border-paper/40")
                  : "border border-paper/15 text-bone/55 hover:text-paper hover:border-ember/50")}
            >
              {isCortex && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <line x1="12" y1="2"    x2="12" y2="22"    stroke="#29b5e8" strokeWidth="3" strokeLinecap="round" />
                  <line x1="2"  y1="12"   x2="22" y2="12"    stroke="#29b5e8" strokeWidth="3" strokeLinecap="round" />
                  <line x1="4.93"  y1="4.93"  x2="19.07" y2="19.07" stroke="#29b5e8" strokeWidth="3" strokeLinecap="round" />
                  <line x1="19.07" y1="4.93"  x2="4.93"  y2="19.07" stroke="#29b5e8" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {e.name}
            </button>
          );
        })}
      </div>
      <p className="type text-[10px] uppercase tracking-[0.3em] text-bone/40 mt-2">
        {ENGINES.find((x) => x.key === engine)!.hint}
      </p>

      <pre className="mt-4 overflow-x-auto text-xs leading-relaxed"
           style={{
             fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
             background: "rgba(255,255,255,0.02)",
             border: "1px solid rgba(233,225,207,0.15)",
             padding: "1.25rem 1.5rem",
             color: "#c9bfa6",
             whiteSpace: "pre",
           }}>
        <code>{code}</code>
      </pre>
    </section>
  );
}
