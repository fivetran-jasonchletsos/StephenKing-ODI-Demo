"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "king-recent-cortex-verdicts";
const REMOTE_URL  =
  (process.env.NEXT_PUBLIC_SUBMISSIONS_URL ?? "").trim()
  || ((process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/recent_submissions.json");

const REFRESH_MS = 60_000;

type Submission = {
  id?: string;
  submitted_at: string;
  title: string;
  city?: string | null;
  verdict: string;
  verdict_kind?: string;
};

function readLocal(): Submission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function merge(remote: Submission[], local: Submission[]): Submission[] {
  const seen = new Set<string>();
  const out: Submission[] = [];
  for (const s of [...local, ...remote]) {
    const k = `${s.id ?? ""}|${s.title}|${s.submitted_at}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  out.sort((a, b) => (a.submitted_at < b.submitted_at ? 1 : -1));
  return out.slice(0, 24);
}

export default function SubmissionsTicker() {
  const [items, setItems] = useState<Submission[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function pull() {
      let remote: Submission[] = [];
      try {
        const r = await fetch(REMOTE_URL, { cache: "no-store" });
        if (r.ok) {
          const d = await r.json();
          remote = Array.isArray(d?.submissions) ? d.submissions : [];
        }
      } catch { /* noop */ }
      if (!cancelled) setItems(merge(remote, readLocal()));
    }
    pull();
    const iv = setInterval(pull, REFRESH_MS);
    const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) pull(); };
    window.addEventListener("storage", onStorage);
    const t = setTimeout(pull, 4000);
    return () => { cancelled = true; clearInterval(iv); window.removeEventListener("storage", onStorage); clearTimeout(t); };
  }, []);

  if (items.length === 0) return null;
  const reel = [...items, ...items];

  return (
    <section className="relative overflow-hidden border-y border-paper/10" style={{ background: "rgba(255,255,255,0.015)" }}
             aria-label="Cortex verdicts ticker">
      <div className="px-5 py-2 sm:px-8 md:px-16">
        <p className="type text-[9px] uppercase tracking-[0.3em] text-ember">
          Live verdicts · Snowflake Cortex Analyst on gold.fct_submission
        </p>
      </div>
      <div className="overflow-hidden"
           style={{ maskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)",
                    WebkitMaskImage: "linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)" }}>
        <div className="marquee-track" style={{ animationDuration: "200s" }}>
          {reel.map((s, i) => (
            <article key={`${s.id ?? "x"}-${i}`}
                     className="shrink-0 mx-6 my-3 max-w-md border-l-2 border-blood pl-4">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="type text-[9px] uppercase tracking-[0.25em] text-bone/40 whitespace-nowrap">
                  {timeAgo(s.submitted_at)}
                </span>
                <span className="serif text-sm text-paper/90 italic truncate">
                  &ldquo;{s.title}&rdquo;
                </span>
                {s.city ? (
                  <span className="type text-[9px] uppercase tracking-[0.25em] text-bone/30 whitespace-nowrap">
                    · {s.city}
                  </span>
                ) : null}
              </div>
              <p className="serif text-xs text-bone/70 leading-snug line-clamp-2">{s.verdict}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function timeAgo(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  const secs = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (secs < 60)    return `${secs}s ago`;
  if (secs < 3_600) return `${Math.floor(secs/60)}m ago`;
  if (secs < 86_400) return `${Math.floor(secs/3_600)}h ago`;
  return `${Math.floor(secs/86_400)}d ago`;
}
