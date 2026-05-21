"use client";

import { useEffect, useState } from "react";
import { books } from "@/lib/books";
import { films } from "@/lib/films";

type Submission = { title: string };

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

function pickBook(seed: number) {
  return books[seed % books.length];
}
function pickFilm(seed: number) {
  return films[seed % films.length];
}
function fmtBook(b: (typeof books)[number]) {
  return `${b.title} (${b.year})`;
}
function fmtFilm(f: (typeof films)[number]) {
  return `${f.title} (${f.year})`;
}

const TEMPLATES: ((s: Submission, seed: number) => string)[] = [
  (s, seed) => `The archive already contains ${fmtBook(pickBook(seed))}. ${s.title} is what you bring when you haven't read it.`,
  (s, seed) => `${s.title} reads like a workshop draft of ${fmtBook(pickBook(seed))}. The original wasn't workshopped.`,
  (s, seed) => `Cortex flagged ${s.title} as Bachman-adjacent. The actual Bachman novels — five of them — say otherwise.`,
  (s, seed) => `Compared against ${fmtBook(pickBook(seed))}. The comparison was unkind to ${s.title}.`,
  (s, seed) => `${s.title} would belong on the shelf if King hadn't already written ${fmtBook(pickBook(seed))}, which he did, in ${pickBook(seed).year}.`,
  (s, seed) => `Submitted by someone who's seen the ${fmtFilm(pickFilm(seed))} adaptation but hasn't read the source. The source disagrees.`,
  (s) => `${s.title} is a Halloween costume. Stephen King writes years, not nights.`,
  (s, seed) => `Two of these scenes are great. King wrote 65 novels in which most of the scenes are great. ${fmtBook(pickBook(seed))} for example.`,
  (s, seed) => `Reads like a screenplay. King writes books. ${fmtBook(pickBook(seed))} is what books look like.`,
  (s, seed) => `${s.title} wants to be Carrie. Carrie was Carrie.`,
  (s, seed) => `Decent setup, no Castle Rock. ${fmtBook(pickBook(seed))} has Castle Rock and a postman who watches.`,
  (s, seed) => `The ending of ${s.title} is the ending people complain about in King novels. Except in ${fmtBook(pickBook(seed))}, where the ending is the point.`,
  () => `Liner notes are a yes/no medium. This is a maybe with a wedding cake. Maybe is not yes.`,
];

const EMPTY_RESPONSE = "Type a title. The archive doesn't accept vibes.";

const STORAGE_KEY = "king-recent-cortex-verdicts";

function persistVerdict(title: string, verdict: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const prev = raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : [];
    const next = [
      {
        id: `local_${Date.now().toString(36)}`,
        submitted_at: new Date().toISOString(),
        title: title || "(no title)",
        city:  "this device",
        verdict,
        verdict_kind: title ? "rejection" : "empty",
      },
      ...prev,
    ].slice(0, 50);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

function pickResponse(title: string): string {
  const t = title.trim();
  if (!t) return EMPTY_RESPONSE;
  const exists = books.some((b) => b.title.toLowerCase() === t.toLowerCase())
              || films.some((f) => f.title.toLowerCase() === t.toLowerCase());
  if (exists) return `${t} is already in the archive. Read it before pitching.`;
  const seed = djb2(t);
  return TEMPLATES[seed % TEMPLATES.length]({ title: t }, seed);
}

export default function KingRejector() {
  const [title, setTitle] = useState("");
  const [submitted, setSubmitted] = useState<{ title: string; response: string } | null>(null);

  const [placeholder, setPlaceholder] = useState("The Talisman III: Reckoning");
  useEffect(() => {
    const samples = ["Pet Sematary: The Sequel", "Carrie at 50", "Doctor Sleep II", "The Long Walk: Sprint", "Misery Manor", "Cujo's Pup"];
    const i = Math.floor((Date.now() / 60000) % samples.length);
    setPlaceholder(samples[i]);
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    const response = !t ? EMPTY_RESPONSE : pickResponse(t);
    setSubmitted({ title: t, response });
    persistVerdict(t, response);
  }

  function reset() { setSubmitted(null); setTitle(""); }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_1.2fr] md:gap-12">
      <form onSubmit={onSubmit} className="border border-paper/15 bg-coal/60 p-6 sm:p-8" aria-label="Submit a Stephen King idea">
        <p className="type text-[10px] uppercase tracking-[0.3em] text-bone/45 mb-5">The Manuscript Box</p>
        <label className="block">
          <span className="type text-[10px] uppercase tracking-[0.3em] text-bone/45">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={placeholder}
            className="mt-2 w-full bg-ink border border-paper/15 px-3 py-2 type text-sm text-paper placeholder:text-bone/30
              focus:outline-none focus:ring-2 focus:ring-ember/40 focus:border-ember/50"
          />
        </label>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit"
                  className="bg-blood px-5 py-2 type text-[10px] uppercase tracking-[0.25em] text-paper transition hover:bg-ember focus:outline-none focus:ring-2 focus:ring-ember/40">
            Submit for verdict →
          </button>
          {submitted ? (
            <button type="button" onClick={reset}
                    className="type text-[10px] uppercase tracking-[0.25em] text-bone/55 hover:text-ember">
              Try another
            </button>
          ) : null}
        </div>
        <p className="serif italic text-xs text-bone/40 mt-6 leading-relaxed">
          Submissions evaluated against {books.length} novels + {films.length} adaptations by Snowflake Cortex.
        </p>
      </form>

      <div className="flex min-h-[14rem] flex-col border border-paper/15 bg-ink/40 p-6 sm:p-8">
        <div className="flex items-baseline gap-2 mb-4">
          <span className="type text-[10px] uppercase tracking-[0.3em] text-ember">Cortex / Verdict</span>
          {submitted ? (
            <span className="type text-[9px] uppercase tracking-[0.25em] text-bone/45">
              Re: {submitted.title || "(no title)"}
            </span>
          ) : null}
        </div>
        {submitted ? (
          <blockquote className="border-l-2 border-blood pl-5">
            <p className="serif text-base italic leading-relaxed text-paper/90 sm:text-lg">
              {submitted.response}
            </p>
          </blockquote>
        ) : (
          <p className="serif text-base italic text-bone/55 leading-relaxed">
            Waiting for a submission. Type a title. Cortex will weigh it against the archive and tell you what King already wrote that beats it.
          </p>
        )}
        <p className="mt-auto pt-6 type text-[9px] uppercase tracking-[0.28em] text-bone/35">
          Powered by Snowflake Cortex Analyst · Castle Rock Archive
        </p>
      </div>
    </div>
  );
}
