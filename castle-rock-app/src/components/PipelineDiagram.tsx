// Visual SVG lineage diagram for the /architecture page.
// Three sources → Fivetran → Iceberg (S3) → Snowflake → dbt → 4 consumers.
// No deps, no JS lib.

export default function PipelineDiagram() {
  // Layout — uses viewBox coordinates
  const W = 1200, H = 460;
  const stage = (x: number, y: number) => ({ x, y });

  const SOURCES = [
    { id: "ol", label: "Open Library",  hint: "books · editions · authors", pos: stage(60,  60) },
    { id: "td", label: "TMDB",          hint: "films · cast · cameos",     pos: stage(60, 200) },
    { id: "wd", label: "Wikidata",      hint: "characters · places",        pos: stage(60, 340) },
  ];
  const FIVETRAN  = { id: "ft",  label: "Fivetran",         hint: "3 managed connectors", pos: stage(330, 200) };
  const ICEBERG   = { id: "ic",  label: "Iceberg / S3",      hint: "open lake foundation",  pos: stage(560, 110) };
  const SNOW      = { id: "sn",  label: "Snowflake",         hint: "managed tables",         pos: stage(560, 290) };
  const DBT       = { id: "dbt", label: "dbt",               hint: "bronze → silver → gold", pos: stage(800, 200) };
  const CONSUMERS = [
    { id: "cx", label: "Cortex Analyst", hint: "natural-language Q&A",  pos: stage(1060,  60), accent: "ember" },
    { id: "bi", label: "BI / Notebooks", hint: "Snowsight, Streamlit",   pos: stage(1060, 170), accent: "bone" },
    { id: "app", label: "Castle Rock app", hint: "this site, gold JSON",  pos: stage(1060, 280), accent: "bone" },
    { id: "ath", label: "Athena / Spark", hint: "same Iceberg files",     pos: stage(1060, 390), accent: "bone" },
  ];

  const NODE_W = 180;
  const NODE_H = 64;
  const PORT_R = 4;

  const all = [
    ...SOURCES, FIVETRAN, ICEBERG, SNOW, DBT, ...CONSUMERS,
  ];
  const byId = Object.fromEntries(all.map((n) => [n.id, n]));

  // Edges: source-side → target-side with optional label
  const EDGES = [
    { a: "ol",  b: "ft" },
    { a: "td",  b: "ft" },
    { a: "wd",  b: "ft" },
    { a: "ft",  b: "ic", label: "Iceberg writes" },
    { a: "ft",  b: "sn", label: "Snowflake mirror" },
    { a: "ic",  b: "dbt" },
    { a: "sn",  b: "dbt" },
    { a: "dbt", b: "cx",  label: "gold + semantic" },
    { a: "dbt", b: "bi" },
    { a: "dbt", b: "app" },
    { a: "dbt", b: "ath" },
  ] as const;

  function rightPort(n: typeof FIVETRAN)  { return { x: n.pos.x + NODE_W, y: n.pos.y + NODE_H / 2 }; }
  function leftPort (n: typeof FIVETRAN)  { return { x: n.pos.x,          y: n.pos.y + NODE_H / 2 }; }

  function path(a: typeof FIVETRAN, b: typeof FIVETRAN) {
    const p0 = rightPort(a);
    const p1 = leftPort(b);
    const midX = (p0.x + p1.x) / 2;
    // gentle cubic
    return `M ${p0.x} ${p0.y} C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  function Node({ n, accent = "bone" }: { n: typeof FIVETRAN; accent?: "ember" | "bone" | "blood" | "sickly" }) {
    const colors: Record<string, { border: string; bg: string; title: string; hint: string }> = {
      bone:   { border: "#c9bfa6", bg: "rgba(255,255,255,0.03)", title: "#e9e1cf", hint: "rgba(201,191,166,0.65)" },
      ember:  { border: "#a92d24", bg: "rgba(127,26,20,0.10)",   title: "#e9e1cf", hint: "rgba(201,191,166,0.65)" },
      blood:  { border: "#7f1a14", bg: "rgba(127,26,20,0.18)",   title: "#e9e1cf", hint: "rgba(201,191,166,0.65)" },
      sickly: { border: "#7a8a4a", bg: "rgba(122,138,74,0.10)",  title: "#e9e1cf", hint: "rgba(201,191,166,0.65)" },
    };
    const c = colors[accent];
    return (
      <g transform={`translate(${n.pos.x} ${n.pos.y})`}>
        <rect width={NODE_W} height={NODE_H} fill={c.bg} stroke={c.border} strokeWidth="1.2" />
        <text x={12} y={26} fill={c.title} fontSize="16" fontFamily="var(--font-rozha), Georgia, serif">{n.label}</text>
        <text x={12} y={48} fill={c.hint} fontSize="11" fontFamily="var(--font-jetbrains)" letterSpacing="0.05em">{n.hint}</text>
      </g>
    );
  }

  return (
    <div className="border border-paper/15 bg-coal/30 p-4 sm:p-6 overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="auto" role="img"
           aria-label="Castle Rock ODI pipeline diagram">
        <defs>
          <marker id="arrow" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
            <path d="M 0 0 L 12 6 L 0 12 z" fill="#c9bfa6" fillOpacity="0.55" />
          </marker>
        </defs>

        {/* Stage labels */}
        {[
          { x: 60 + NODE_W / 2,   label: "Sources" },
          { x: 330 + NODE_W / 2,  label: "Ingest"  },
          { x: 560 + NODE_W / 2,  label: "Storage (open lake + warehouse)" },
          { x: 800 + NODE_W / 2,  label: "Transform" },
          { x: 1060 + NODE_W / 2, label: "Consumers" },
        ].map((s) => (
          <text key={s.label} x={s.x} y={20} fill="#a92d24" fontSize="10"
                fontFamily="var(--font-jetbrains)" letterSpacing="0.3em" textAnchor="middle">
            {s.label.toUpperCase()}
          </text>
        ))}

        {/* Edges */}
        {EDGES.map((e, i) => {
          const a = byId[e.a];
          const b = byId[e.b];
          return (
            <g key={i}>
              <path d={path(a, b)} stroke="#c9bfa6" strokeOpacity="0.35" strokeWidth="1.2"
                    fill="none" markerEnd="url(#arrow)" />
              {("label" in e && e.label) && (
                <text x={(rightPort(a).x + leftPort(b).x) / 2}
                      y={(rightPort(a).y + leftPort(b).y) / 2 - 6}
                      fill="#c9bfa6" fillOpacity="0.5" fontSize="10"
                      fontFamily="var(--font-jetbrains)" letterSpacing="0.05em" textAnchor="middle">
                  {e.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {SOURCES.map((n) => <Node key={n.id} n={n} accent="bone" />)}
        <Node n={FIVETRAN} accent="bone" />
        <Node n={ICEBERG}  accent="bone" />
        <Node n={SNOW}     accent="bone" />
        <Node n={DBT}      accent="bone" />
        {CONSUMERS.map((n) => <Node key={n.id} n={n} accent={n.accent as "ember" | "bone"} />)}

        {/* Cortex spotlight ring */}
        <circle cx={CONSUMERS[0].pos.x + NODE_W + 6}
                cy={CONSUMERS[0].pos.y + NODE_H / 2}
                r="6"
                fill="none"
                stroke="#a92d24"
                strokeOpacity="0.7"
                strokeWidth="1.4">
          <animate attributeName="r" values="6;9;6" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.7;0.25;0.7" dur="2.4s" repeatCount="indefinite" />
        </circle>
        <text x={CONSUMERS[0].pos.x + NODE_W + 18}
              y={CONSUMERS[0].pos.y + NODE_H / 2 + 4}
              fill="#a92d24" fontSize="10" fontFamily="var(--font-jetbrains)" letterSpacing="0.2em">
          AI / NL Q&amp;A
        </text>
      </svg>
    </div>
  );
}
