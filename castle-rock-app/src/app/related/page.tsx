"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  allTaggedWorks,
  relatedFor,
  tagsFor,
  GENRE_LABEL,
  UNIVERSE_LABEL,
  type CatalogWork,
  type RelatedNeighbor,
} from "@/lib/related";

// ---------------------------------------------------------------------------
// Colour by primary genre
// ---------------------------------------------------------------------------
const GENRE_COLOR: Record<string, string> = {
  horror:          "#a92d24",
  suspense:        "#c97b2a",
  "coming-of-age": "#7a8a4a",
  fantasy:         "#5b4ea8",
  "sci-fi":        "#2a7a8a",
  literary:        "#c9bfa6",
  "noir-crime":    "#6a4a2a",
  nonfiction:      "#888",
  children:        "#c9a64a",
};
function genreColor(genre: string): string {
  return GENRE_COLOR[genre] ?? "#c9bfa6";
}

// ---------------------------------------------------------------------------
// Graph types
// ---------------------------------------------------------------------------
type GraphNode = {
  id: string;
  title: string;
  year: number;
  kind: "book" | "film";
  primaryGenre: string;
};

type GraphEdge = {
  source: string;
  target: string;
  score: number;
};

// ---------------------------------------------------------------------------
// Build graph from the catalog (top-5 per node; undirected union)
// ---------------------------------------------------------------------------
function buildGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const tagged = allTaggedWorks();

  const nodes: GraphNode[] = tagged.map(({ work, tags }) => ({
    id: work.slug,
    title: work.title,
    year: work.year,
    kind: work.kind,
    primaryGenre: tags.genres[0] ?? "horror",
  }));

  const edgeSet = new Map<string, GraphEdge>();
  for (const { work, neighbors } of tagged) {
    for (const nb of neighbors.slice(0, 5)) {
      if (nb.score <= 0) continue;
      const key = [work.slug, nb.slug].sort().join("|||");
      if (!edgeSet.has(key)) {
        edgeSet.set(key, { source: work.slug, target: nb.slug, score: nb.score });
      }
    }
  }

  return { nodes, edges: Array.from(edgeSet.values()) };
}

// ---------------------------------------------------------------------------
// Force-directed simulation (no external library)
// ---------------------------------------------------------------------------
type Vec2 = { x: number; y: number };

function runSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  onTick: (positions: Vec2[], alpha: number) => void,
  onDone: (positions: Vec2[]) => void
) {
  const n = nodes.length;
  const pos: Vec2[] = nodes.map(() => ({
    x: width / 2 + (Math.random() - 0.5) * Math.min(width, height) * 0.5,
    y: height / 2 + (Math.random() - 0.5) * Math.min(width, height) * 0.5,
  }));
  const vel: Vec2[] = nodes.map(() => ({ x: 0, y: 0 }));

  const idToIdx = new Map(nodes.map((nd, i) => [nd.id, i]));
  const adjMap = new Map<string, { target: number; score: number }[]>();
  for (const e of edges) {
    const si = idToIdx.get(e.source);
    const ti = idToIdx.get(e.target);
    if (si == null || ti == null) continue;
    if (!adjMap.has(e.source)) adjMap.set(e.source, []);
    if (!adjMap.has(e.target)) adjMap.set(e.target, []);
    adjMap.get(e.source)!.push({ target: ti, score: e.score });
    adjMap.get(e.target)!.push({ target: si, score: e.score });
  }

  const REPEL    = 4000;
  const SPRING_K = 0.035;
  const REST_LEN = 150;
  const CENTER_G = 0.007;
  const DAMP     = 0.82;

  let alpha = 1.0;
  let frame = 0;
  let rafId: number;

  function tick() {
    alpha *= 0.993;
    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < n; i++) {
      let fx = 0;
      let fy = 0;

      // Repulsion
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dx = pos[i].x - pos[j].x;
        const dy = pos[i].y - pos[j].y;
        const dist2 = dx * dx + dy * dy + 1;
        const dist = Math.sqrt(dist2);
        const str = REPEL / dist2;
        fx += (dx / dist) * str;
        fy += (dy / dist) * str;
      }

      // Spring
      const nbrs = adjMap.get(nodes[i].id) ?? [];
      for (const { target: j, score } of nbrs) {
        const dx = pos[j].x - pos[i].x;
        const dy = pos[j].y - pos[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const stretch = dist - REST_LEN * (1 - score * 0.35);
        fx += (dx / dist) * SPRING_K * stretch;
        fy += (dy / dist) * SPRING_K * stretch;
      }

      // Gravity
      fx += (cx - pos[i].x) * CENTER_G;
      fy += (cy - pos[i].y) * CENTER_G;

      vel[i].x = (vel[i].x + fx * alpha) * DAMP;
      vel[i].y = (vel[i].y + fy * alpha) * DAMP;
      pos[i].x = Math.max(20, Math.min(width - 20, pos[i].x + vel[i].x));
      pos[i].y = Math.max(20, Math.min(height - 20, pos[i].y + vel[i].y));
    }

    frame++;
    if (frame % 4 === 0) onTick([...pos.map((p) => ({ ...p }))], alpha);
    if (alpha > 0.01 && frame < 700) {
      rafId = requestAnimationFrame(tick);
    } else {
      onDone([...pos.map((p) => ({ ...p }))]);
    }
  }

  rafId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(rafId);
}

// ---------------------------------------------------------------------------
// Canvas renderer
// ---------------------------------------------------------------------------
const NODE_R     = 7;
const NODE_R_SEL = 12;
const NODE_R_HOV = 10;

function drawGraph(
  ctx: CanvasRenderingContext2D,
  nodes: GraphNode[],
  edges: GraphEdge[],
  positions: Vec2[],
  idToIdx: Map<string, number>,
  selectedId: string | null,
  hoveredId: string | null,
  dpr: number
) {
  const W = ctx.canvas.width / dpr;
  const H = ctx.canvas.height / dpr;
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#0b0807";
  ctx.fillRect(0, 0, W, H);

  // Edges
  for (const e of edges) {
    const si = idToIdx.get(e.source);
    const ti = idToIdx.get(e.target);
    if (si == null || ti == null) continue;
    const sp = positions[si];
    const tp = positions[ti];
    if (!sp || !tp) continue;

    const hi = e.source === selectedId || e.target === selectedId
             || e.source === hoveredId  || e.target === hoveredId;
    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y);
    ctx.lineTo(tp.x, tp.y);
    if (hi) {
      ctx.strokeStyle = `rgba(169,45,36,${0.25 + e.score * 0.45})`;
      ctx.lineWidth = 1 + e.score * 1.8;
    } else {
      ctx.strokeStyle = `rgba(233,225,207,${0.025 + e.score * 0.065})`;
      ctx.lineWidth = 0.4 + e.score * 0.8;
    }
    ctx.stroke();
  }

  const special = new Set([selectedId, hoveredId].filter(Boolean));

  const drawNode = (node: GraphNode, i: number) => {
    const p = positions[i];
    if (!p) return;
    const isSel = node.id === selectedId;
    const isHov = node.id === hoveredId;
    const r = isSel ? NODE_R_SEL : isHov ? NODE_R_HOV : NODE_R;
    const color = genreColor(node.primaryGenre);

    if (isSel) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(169,45,36,0.18)";
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // kind indicator — film = dashed ring
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    if (node.kind === "film") {
      ctx.setLineDash([2, 2]);
      ctx.strokeStyle = isSel ? "#a92d24" : isHov ? "rgba(233,225,207,0.7)" : "rgba(233,225,207,0.28)";
      ctx.lineWidth = isSel ? 2 : 1;
    } else {
      ctx.setLineDash([]);
      ctx.strokeStyle = isSel ? "#a92d24" : isHov ? "rgba(233,225,207,0.7)" : "rgba(233,225,207,0.18)";
      ctx.lineWidth = isSel ? 2 : 1;
    }
    ctx.stroke();
    ctx.setLineDash([]);

    if (isSel || isHov) {
      const label = node.title.length > 26 ? node.title.slice(0, 24) + "…" : node.title;
      ctx.font = `600 11px 'JetBrains Mono', monospace`;
      ctx.fillStyle = isSel ? "#a92d24" : "#e9e1cf";
      ctx.textAlign = "center";
      ctx.fillText(label, p.x, p.y + r + 14);
      ctx.font = `10px 'JetBrains Mono', monospace`;
      ctx.fillStyle = "rgba(233,225,207,0.45)";
      ctx.fillText(String(node.year), p.x, p.y + r + 26);
    }
  };

  nodes.forEach((node, i) => { if (!special.has(node.id)) drawNode(node, i); });
  nodes.forEach((node, i) => { if (special.has(node.id)) drawNode(node, i); });

  ctx.restore();
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function RelatedPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posRef    = useRef<Vec2[]>([]);
  const rafRef    = useRef<number>(0);
  const dragging  = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);

  const [positions,  setPositions]  = useState<Vec2[]>([]);
  const [simDone,    setSimDone]    = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId,  setHoveredId]  = useState<string | null>(null);
  const [transform,  setTransform]  = useState({ x: 0, y: 0, scale: 1 });
  const [size, setSize] = useState({ w: 900, h: 680 });

  const { nodes, edges } = useMemo(() => buildGraph(), []);
  const idToIdx = useMemo(() => new Map(nodes.map((n, i) => [n.id, i])), [nodes]);

  useEffect(() => {
    function measure() {
      const el = canvasRef.current?.parentElement;
      if (el) setSize({ w: el.clientWidth, h: Math.min(el.clientWidth * 0.72, 680) });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (size.w < 100) return;
    setSimDone(false);
    const cleanup = runSimulation(
      nodes, edges, size.w, size.h,
      (pos) => { posRef.current = pos; setPositions([...pos]); },
      (pos) => { posRef.current = pos; setPositions([...pos]); setSimDone(true); }
    );
    return cleanup;
  }, [nodes, edges, size.w, size.h]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || posRef.current.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = size.w * dpr;
    canvas.height = size.h * dpr;
    canvas.style.width  = `${size.w}px`;
    canvas.style.height = `${size.h}px`;
    cancelAnimationFrame(rafRef.current);
    const logW = size.w;
    const logH = size.h;

    function frame() {
      if (!ctx) return;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#0b0807";
      ctx.fillRect(0, 0, logW, logH);
      ctx.translate(transform.x + logW / 2, transform.y + logH / 2);
      ctx.scale(transform.scale, transform.scale);
      ctx.translate(-logW / 2, -logH / 2);
      drawGraph(ctx, nodes, edges, posRef.current, idToIdx, selectedId, hoveredId, 1);
      ctx.restore();
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [positions, selectedId, hoveredId, transform, size, nodes, edges, idToIdx]);

  function toCanvas(clientX: number, clientY: number, canvas: HTMLCanvasElement): Vec2 {
    const rect = canvas.getBoundingClientRect();
    const lx = clientX - rect.left;
    const ly = clientY - rect.top;
    const cx = size.w / 2;
    const cy = size.h / 2;
    return {
      x: (lx - cx - transform.x) / transform.scale + cx,
      y: (ly - cy - transform.y) / transform.scale + cy,
    };
  }

  function nearestNode(cx: number, cy: number): GraphNode | null {
    let best: GraphNode | null = null;
    let bestDist = 22;
    posRef.current.forEach((p, i) => {
      if (!p) return;
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d < bestDist) { bestDist = d; best = nodes[i]; }
    });
    return best;
  }

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (dragging.current) {
      const dx = e.clientX - dragging.current.startX;
      const dy = e.clientY - dragging.current.startY;
      setTransform((t) => ({ ...t, x: dragging.current!.tx + dx, y: dragging.current!.ty + dy }));
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = toCanvas(e.clientX, e.clientY, canvas);
    const node = nearestNode(x, y);
    setHoveredId(node?.id ?? null);
    canvas.style.cursor = node ? "pointer" : "grab";
  }

  function onMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    dragging.current = { startX: e.clientX, startY: e.clientY, tx: transform.x, ty: transform.y };
  }

  function onMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    const moved = dragging.current
      ? Math.hypot(e.clientX - dragging.current.startX, e.clientY - dragging.current.startY) > 4
      : false;
    dragging.current = null;
    if (!moved) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const { x, y } = toCanvas(e.clientX, e.clientY, canvas);
      const node = nearestNode(x, y);
      setSelectedId(node?.id ?? null);
    }
  }

  function onWheel(e: React.WheelEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform((t) => ({
      ...t,
      scale: Math.max(0.25, Math.min(5, t.scale * factor)),
    }));
  }

  const selected = selectedId ? nodes.find((n) => n.id === selectedId) : null;
  const selectedTags = selectedId ? tagsFor(selectedId) : null;
  const selectedNeighbors: RelatedNeighbor[] = selectedId ? relatedFor(selectedId) : [];

  function workHref(w: { kind: string; slug: string }) {
    return w.kind === "book" ? `/book/${w.slug}/` : `/film/${w.slug}/`;
  }

  return (
    <main className="min-h-screen" style={{ background: "#0b0807", color: "#e9e1cf" }}>
      <section className="border-b px-5 py-4 sm:px-6 md:px-10" style={{ borderColor: "rgba(233,225,207,0.1)" }}>
        <div className="mx-auto max-w-7xl flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="type text-[10px] uppercase tracking-[0.35em] text-ember">
              Related Works
            </p>
            <h1 className="serif mt-2 text-2xl font-light leading-tight sm:text-3xl md:text-4xl text-paper">
              The Similarity Constellation
            </h1>
            <p className="mt-2 text-sm" style={{ color: "rgba(201,191,166,0.55)" }}>
              {nodes.length} works · {edges.length} similarity edges ·{" "}
              {simDone ? "settled" : "settling…"}
            </p>
          </div>
          <p className="type text-[9px] uppercase tracking-[0.25em] text-right max-w-xs"
             style={{ color: "rgba(233,225,207,0.35)" }}>
            Drag to pan · scroll to zoom · click any node
          </p>
        </div>
      </section>

      <div className="flex flex-col lg:flex-row">
        {/* Canvas */}
        <div className="flex-1 min-w-0 relative" style={{ background: "#0b0807", minHeight: `${size.h}px` }}>
          <canvas
            ref={canvasRef}
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={() => { setHoveredId(null); dragging.current = null; }}
            onWheel={onWheel}
            style={{ display: "block", cursor: "grab", userSelect: "none" }}
          />
          {!simDone && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="type text-[10px] uppercase tracking-[0.3em] animate-pulse"
                 style={{ color: "rgba(233,225,207,0.3)" }}>
                Calculating similarity graph…
              </p>
            </div>
          )}
          {/* Genre legend */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-x-3 gap-y-1 max-w-xs">
            {Object.entries(GENRE_LABEL).map(([g, label]) => (
              <span key={g} className="flex items-center gap-1">
                <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: genreColor(g) }} />
                <span className="type text-[9px] uppercase tracking-[0.18em]"
                      style={{ color: "rgba(233,225,207,0.4)" }}>
                  {label}
                </span>
              </span>
            ))}
            <span className="flex items-center gap-1 mt-1">
              <span className="inline-block rounded-full border border-white/40" style={{ width: 7, height: 7 }} />
              <span className="type text-[9px] uppercase tracking-[0.18em]"
                    style={{ color: "rgba(233,225,207,0.4)" }}>
                dashed = film
              </span>
            </span>
          </div>
        </div>

        {/* Side panel */}
        <aside
          className="w-full lg:w-80 flex-none overflow-y-auto border-t lg:border-t-0 lg:border-l"
          style={{ maxHeight: `${size.h + 80}px`, borderColor: "rgba(233,225,207,0.1)" }}
        >
          {selected ? (
            <div className="p-5">
              <p className="type text-[10px] uppercase tracking-[0.25em] text-ember mb-1">
                {selected.kind === "book" ? "Book" : "Film"} · {selected.year}
              </p>
              <h2 className="serif text-xl text-paper leading-tight">{selected.title}</h2>

              {selectedTags && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {selectedTags.genres.map((g) => (
                    <span key={g}
                      className="type text-[9px] uppercase tracking-[0.18em] border px-1.5 py-0.5"
                      style={{ borderColor: `${genreColor(g)}66`, color: genreColor(g) }}>
                      {GENRE_LABEL[g] ?? g}
                    </span>
                  ))}
                  {selectedTags.universe.map((u) => (
                    <span key={u}
                      className="type text-[9px] uppercase tracking-[0.18em] border px-1.5 py-0.5 text-ember"
                      style={{ borderColor: "rgba(169,45,36,0.5)" }}>
                      {UNIVERSE_LABEL[u] ?? u}
                    </span>
                  ))}
                </div>
              )}

              <Link
                href={selected.kind === "book" ? `/book/${selected.id}/` : `/film/${selected.id}/`}
                className="mt-4 inline-block type text-[9px] uppercase tracking-[0.25em] text-ember border border-ember/40 px-3 py-1.5 hover:bg-ember hover:text-ink transition"
              >
                View {selected.kind} &rarr;
              </Link>

              <div className="mt-5 border-t pt-4" style={{ borderColor: "rgba(233,225,207,0.1)" }}>
                <p className="type text-[9px] uppercase tracking-[0.3em]"
                   style={{ color: "rgba(233,225,207,0.4)" }}>
                  Nearest neighbors
                </p>
                <ol className="mt-2 space-y-1">
                  {selectedNeighbors.map((nb) => (
                    <li key={nb.slug}>
                      <button
                        onClick={() => setSelectedId(nb.slug)}
                        className="w-full text-left px-2 py-1.5 border-l-2 transition hover:bg-paper/5"
                        style={{ borderColor: "rgba(233,225,207,0.12)" }}
                      >
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="serif text-sm text-paper truncate">{nb.work.title}</span>
                          <span className="type text-[9px] text-ember flex-none">
                            {Math.round(nb.score * 100)}%
                          </span>
                        </div>
                        <p className="type text-[9px] uppercase tracking-[0.18em] truncate"
                           style={{ color: "rgba(233,225,207,0.4)" }}>
                          {nb.work.kind} · {nb.work.year}
                        </p>
                        <p className="type text-[9px] uppercase tracking-[0.18em] truncate mt-0.5"
                           style={{ color: "rgba(233,225,207,0.5)" }}>
                          {nb.why}
                        </p>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-5 border-t pt-4" style={{ borderColor: "rgba(233,225,207,0.1)" }}>
                <p className="text-[11px] leading-relaxed" style={{ color: "rgba(233,225,207,0.35)" }}>
                  Similarity computed from genre, universe (Castle Rock / Derry / Dark Tower),
                  recurring characters, and era. Weighted Jaccard, top-8 neighbors per work.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-3">
              <p className="type text-[10px] uppercase tracking-[0.3em]"
                 style={{ color: "rgba(233,225,207,0.4)" }}>
                Click any node to explore
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(233,225,207,0.5)" }}>
                Every book and film in the catalog is a node. Solid rings are books;
                dashed rings are film adaptations. Edges connect the most similar works
                by genre, universe, and recurring characters. Clusters form naturally:
                Castle Rock titles pull together, the Derry novels cluster, the Bill Hodges
                trilogy stays tight.
              </p>
              <p className="type text-[9px] uppercase tracking-[0.25em] mt-2"
                 style={{ color: "rgba(233,225,207,0.3)" }}>
                {nodes.length} works · {edges.length} connections
              </p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
