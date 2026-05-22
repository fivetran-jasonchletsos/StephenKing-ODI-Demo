"use client";

import { useState } from "react";

// Cortex Analyst panel — questions that exercise the gold.fct_appearance graph.
// Static / pre-baked, same pattern as the LinerNotes Cortex panel. The point
// is to show what a graph-aware semantic layer makes possible.

type Token = { text: string; color?: string };

function tokenizeSQL(sql: string): Token[] {
  const combined = new RegExp(
    [
      "(?<comment>--[^\\n]*)",
      "(?<string>'[^']*')",
      "(?<schema>\\b(?:gold|silver|bronze)\\.[a-z_]+)",
      "(?<keyword>\\b(?:SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|LEFT JOIN|INNER JOIN|JOIN|ON|AND|OR|NOT|AS|WITH|CASE|WHEN|THEN|ELSE|END|BY|ASC|DESC|DISTINCT|COUNT|SUM|AVG|MAX|MIN|ROUND|COALESCE|CAST|FLOOR|IN|IS|NULL|TRUE|FALSE|PARTITION|OVER|BETWEEN|DATE_TRUNC|INTERVAL|ARRAY_AGG|LISTAGG|DATEDIFF)\\b)",
      "(?<number>\\b\\d+(?:\\.\\d+)?\\b)",
    ].join("|"),
    "gi"
  );
  const tokens: Token[] = [];
  let last = 0;
  for (const m of sql.matchAll(combined)) {
    if (m.index === undefined) continue;
    if (m.index > last) tokens.push({ text: sql.slice(last, m.index) });
    const g = m.groups ?? {};
    if      (g.comment) tokens.push({ text: g.comment, color: "#7d7568" });
    else if (g.string)  tokens.push({ text: g.string,  color: "#7a8a4a" });
    else if (g.schema)  tokens.push({ text: g.schema,  color: "#c9bfa6" });
    else if (g.keyword) tokens.push({ text: g.keyword, color: "#a92d24" });
    else if (g.number)  tokens.push({ text: g.number,  color: "#a92d24" });
    else                tokens.push({ text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < sql.length) tokens.push({ text: sql.slice(last) });
  return tokens;
}

function SQLBlock({ sql }: { sql: string }) {
  const tokens = tokenizeSQL(sql);
  return (
    <pre
      className="overflow-x-auto text-xs leading-relaxed"
      style={{
        fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(233,225,207,0.10)",
        padding: "1rem 1.25rem",
        color: "#c9bfa6",
        whiteSpace: "pre",
      }}
    >
      <code>
        {tokens.map((t, i) => t.color
          ? <span key={i} style={{ color: t.color }}>{t.text}</span>
          : <span key={i}>{t.text}</span>)}
      </code>
    </pre>
  );
}

type Q = {
  id: string;
  question: string;
  sql: string;
  narrative: string;
  data: { label: string; value: string }[];
};

const QUESTIONS: Q[] = [
  {
    id: "most-connected",
    question: "Who is the most-connected character?",
    sql: `SELECT
    c.name,
    COUNT(*)                          AS book_count,
    LISTAGG(b.title, ', ') WITHIN GROUP (ORDER BY b.published_year)
                                       AS book_list
FROM   gold.fct_appearance a
JOIN   gold.dim_character  c USING (character_sk)
JOIN   gold.dim_book       b USING (book_sk)
GROUP  BY c.name
ORDER  BY book_count DESC
LIMIT  5;`,
    narrative: `Randall Flagg threads through seven books — The Stand, Eyes of the Dragon, and five Dark Tower volumes. He is the answer most readers expect; the runner-up (Roland Deschain at six) is more focused but shorter-tailed.`,
    data: [
      { label: "Top character",          value: "Randall Flagg" },
      { label: "Book count",             value: "7" },
      { label: "Years spanned",          value: "1978 → 2004 (26 yr)" },
    ],
  },
  {
    id: "longest-span",
    question: "Which character has the longest gap between their first and last book?",
    sql: `WITH per_char AS (
    SELECT
        c.character_sk,
        c.name,
        MIN(b.published_year)  AS first_year,
        MAX(b.published_year)  AS last_year,
        MAX(b.published_year) - MIN(b.published_year) AS year_gap
    FROM   gold.fct_appearance a
    JOIN   gold.dim_character  c USING (character_sk)
    JOIN   gold.dim_book       b USING (book_sk)
    GROUP  BY c.character_sk, c.name
    HAVING COUNT(*) >= 2
)
SELECT *
FROM   per_char
ORDER  BY year_gap DESC
LIMIT  10;`,
    narrative: `Father Callahan tops the list: introduced in Salem's Lot (1975), reappears in Wolves of the Calla (2003) — a 28-year gap. Danny Torrance is close behind (Shining 1977 → Doctor Sleep 2013 = 36 years), but Father Callahan's reappearance was the structural shock; Danny's was an announced sequel.`,
    data: [
      { label: "Longest gap",        value: "Danny Torrance — 36 yr" },
      { label: "Most surprising",    value: "Father Callahan — 28 yr" },
      { label: "Chars with gap ≥ 20", value: "6" },
    ],
  },
  {
    id: "dark-tower-bridges",
    question: "Which characters bridge the Dark Tower series with a standalone King novel?",
    sql: `SELECT
    c.name,
    COUNT(CASE WHEN b.series = 'The Dark Tower' THEN 1 END) AS dt_books,
    COUNT(CASE WHEN b.series IS NULL            THEN 1 END) AS standalone_books,
    LISTAGG(b.title, ' · ') WITHIN GROUP (ORDER BY b.published_year) AS appearances
FROM   gold.fct_appearance a
JOIN   gold.dim_character  c USING (character_sk)
JOIN   gold.dim_book       b USING (book_sk)
GROUP  BY c.name
HAVING dt_books >= 1 AND standalone_books >= 1
ORDER  BY (dt_books + standalone_books) DESC;`,
    narrative: `Randall Flagg (The Stand + Eyes of the Dragon + five Dark Tower books) and Father Callahan (Salem's Lot + Wolves of the Calla) are the canonical bridges. Susannah Dean and Roland have only-Dark-Tower appearances; Walter/Flagg crosses every boundary. The graph confirms the lore.`,
    data: [
      { label: "Bridge characters",       value: "2" },
      { label: "Flagg standalone books",  value: "Stand, Eyes of the Dragon" },
      { label: "Callahan standalone",     value: "'Salem's Lot" },
    ],
  },
  {
    id: "decade-density",
    question: "Which decade has the highest cross-book character density?",
    sql: `WITH decade_books AS (
    SELECT
        FLOOR(b.published_year / 10) * 10 AS decade,
        b.book_sk
    FROM   gold.dim_book b
),
cross_chars AS (
    SELECT
        d.decade,
        COUNT(DISTINCT CASE WHEN cnt > 1 THEN a.character_sk END) AS cross_book_chars,
        COUNT(DISTINCT a.character_sk)                            AS total_chars
    FROM   decade_books d
    JOIN   gold.fct_appearance a USING (book_sk)
    JOIN   (
        SELECT character_sk, COUNT(*) AS cnt
        FROM   gold.fct_appearance
        GROUP  BY character_sk
    ) tot ON tot.character_sk = a.character_sk
    GROUP  BY d.decade
)
SELECT *,
       ROUND(100.0 * cross_book_chars / total_chars, 1) AS pct
FROM   cross_chars
ORDER  BY decade;`,
    narrative: `The 1980s peak: 42% of characters introduced in 1980s books also appear in another King book. The Stand, IT, Misery, Pet Sematary, the early Dark Tower — that decade laid most of the bridges that 1990s + 2000s books cross.`,
    data: [
      { label: "Top decade",      value: "1980s (42% cross-book)" },
      { label: "Second",          value: "1970s (38%)" },
      { label: "Lowest density",  value: "2020s (11%)" },
    ],
  },
  {
    id: "holly-gibney-graph",
    question: "Where does Holly Gibney show up?",
    sql: `SELECT
    b.title,
    b.published_year,
    CASE WHEN b.published_year = (
        SELECT MIN(b2.published_year)
        FROM   gold.fct_appearance a2
        JOIN   gold.dim_book b2 USING (book_sk)
        WHERE  a2.character_sk = a.character_sk
    ) THEN 'debut'
      ELSE 'recurrence'
    END                                        AS role_in_arc
FROM   gold.fct_appearance a
JOIN   gold.dim_character  c USING (character_sk)
JOIN   gold.dim_book       b USING (book_sk)
WHERE  c.name = 'Holly Gibney'
ORDER  BY b.published_year ASC;`,
    narrative: `Holly debuts in Mr. Mercedes (2014), survives the Hodges trilogy, takes over The Outsider (2018) and If It Bleeds (2020), then gets her own title (Holly, 2023). The arc the network draws is Holly becoming the load-bearing detective of the late-King universe.`,
    data: [
      { label: "Appearances",     value: "6" },
      { label: "Debut",            value: "Mr. Mercedes (2014)" },
      { label: "Latest",           value: "Holly (2023)" },
    ],
  },
  {
    id: "bachman-bridge",
    question: "Do any Bachman novels share characters with the King-credited bibliography?",
    sql: `WITH bachman AS (
    SELECT book_sk, title
    FROM   gold.dim_book
    WHERE  pseudonym = 'Richard Bachman'
),
king_credit AS (
    SELECT book_sk, title
    FROM   gold.dim_book
    WHERE  pseudonym IS NULL
)
SELECT
    bk.title    AS bachman_title,
    kk.title    AS king_title,
    COUNT(DISTINCT a1.character_sk) AS shared_characters,
    LISTAGG(c.name, ', ') WITHIN GROUP (ORDER BY c.name) AS character_list
FROM   gold.fct_appearance a1
JOIN   gold.fct_appearance a2 USING (character_sk)
JOIN   bachman      bk ON bk.book_sk = a1.book_sk
JOIN   king_credit  kk ON kk.book_sk = a2.book_sk
JOIN   gold.dim_character c USING (character_sk)
GROUP  BY bk.title, kk.title
ORDER  BY shared_characters DESC
LIMIT  10;`,
    narrative: `The Regulators (1996) ↔ Desperation (1996) share their whole cast under different identities — that's the Bachman/King twin-book conceit. Otherwise the Bachman novels are deliberately isolated; King kept Bachman characters out of the larger universe to preserve the pseudonym's integrity (until the reveal).`,
    data: [
      { label: "Bachman ↔ King pairs",        value: "1 (Regulators ↔ Desperation)" },
      { label: "Shared characters in pair",    value: "Entire cast (reskinned)" },
      { label: "Isolated Bachman novels",      value: "Rage, Long Walk, Running Man, Roadwork, Thinner, Blaze" },
    ],
  },
];

const KICKER = "type text-[10px] uppercase tracking-[0.3em]";

export default function ConnectionsCortexPanel() {
  const [activeId, setActiveId] = useState<string>(QUESTIONS[0].id);
  const active = QUESTIONS.find((q) => q.id === activeId) ?? QUESTIONS[0];

  return (
    <section className="mt-20">
      <div className="section-ornament mb-6">
        <span className={`${KICKER} text-ember`}>Cortex on the graph</span>
      </div>
      <h2 className="serif text-3xl text-paper sm:text-4xl drip-stop">Ask the connections.</h2>
      <p className="serif italic text-bone/70 mt-3 max-w-3xl leading-relaxed">
        These questions exercise the graph behind the diagram — the appearance fact table joined with
        the book and character dimensions. Cortex Analyst writes
        the SQL; the semantic layer in the dbt project teaches it the cross-book
        vocabulary (series, pseudonyms, role/alignment).
      </p>

      <div className="mt-10 flex flex-col lg:flex-row" style={{ border: "1px solid rgba(233,225,207,0.15)" }}>
        <aside className="shrink-0 lg:w-80" style={{ borderRight: "1px solid rgba(233,225,207,0.12)" }}>
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(233,225,207,0.12)" }}>
            <p className={`${KICKER} text-bone/55`}>Example questions</p>
          </div>
          <ul>
            {QUESTIONS.map((q) => {
              const isActive = q.id === activeId;
              return (
                <li key={q.id} style={{ borderBottom: "1px solid rgba(233,225,207,0.08)" }}>
                  <button
                    onClick={() => setActiveId(q.id)}
                    className="w-full text-left px-4 py-3.5 transition focus:outline-none focus:ring-2 focus:ring-ember/40"
                    style={{
                      background: isActive ? "rgba(127,26,20,0.18)" : "transparent",
                      borderLeft: isActive ? "2px solid #a92d24" : "2px solid transparent",
                      color: isActive ? "#e9e1cf" : "#c9bfa6",
                    }}
                  >
                    <span className="serif text-sm leading-snug">{q.question}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-4 flex items-start gap-3"
               style={{ borderBottom: "1px solid rgba(233,225,207,0.12)", background: "rgba(255,255,255,0.015)" }}>
            <span aria-hidden="true" className="shrink-0"
                  style={{ width: 6, height: 6, borderRadius: "50%", background: "#a92d24", marginTop: 6 }} />
            <p className="serif text-base leading-snug text-paper">{active.question}</p>
          </div>

          <div className="px-5 pt-5 pb-0" style={{ borderBottom: "1px solid rgba(233,225,207,0.12)" }}>
            <p className={`${KICKER} text-bone/55 mb-3`}>Generated SQL</p>
            <div className="pb-5"><SQLBlock sql={active.sql} /></div>
          </div>

          <div className="flex-1 px-5 py-5">
            <p className={`${KICKER} text-bone/55 mb-4`}>Cortex Analyst response</p>
            <div className="p-4 mb-4"
                 style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(233,225,207,0.12)" }}>
              <p className="serif text-base leading-relaxed text-paper/90 italic">{active.narrative}</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {active.data.map((d) => (
                <div key={d.label} className="p-3"
                     style={{ background: "rgba(127,26,20,0.10)", border: "1px solid rgba(169,45,36,0.30)" }}>
                  <p className={`${KICKER} text-bone/55 mb-1`}>{d.label}</p>
                  <p className="serif text-base leading-snug text-paper">{d.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-5 py-3 flex items-center gap-3"
               style={{ borderTop: "1px solid rgba(233,225,207,0.12)", background: "rgba(255,255,255,0.01)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-label="Snowflake" style={{ opacity: 0.6 }}>
              <line x1="12" y1="2"    x2="12" y2="22"    stroke="#29b5e8" strokeWidth="2" strokeLinecap="round" />
              <line x1="2"  y1="12"   x2="22" y2="12"    stroke="#29b5e8" strokeWidth="2" strokeLinecap="round" />
              <line x1="4.93"  y1="4.93"  x2="19.07" y2="19.07" stroke="#29b5e8" strokeWidth="2" strokeLinecap="round" />
              <line x1="19.07" y1="4.93"  x2="4.93"  y2="19.07" stroke="#29b5e8" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className={`${KICKER}`} style={{ color: "rgba(233,225,207,0.35)" }}>
              Powered by Snowflake Cortex Analyst over gold.*
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
