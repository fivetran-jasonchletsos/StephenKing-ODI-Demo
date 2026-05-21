#!/usr/bin/env node
/**
 * Fetch book covers + film posters for the Castle Rock Archive.
 *
 *   Books — try Google Books first (recognizable trade paperback covers),
 *           fall back to Open Library search when Google misses.
 *   Films — OMDB by IMDB id.
 *
 *   OMDB_API_KEY=xxxx node scripts/fetch-assets.mjs [--force]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, "..");
const APP       = resolve(ROOT, "castle-rock-app");
const COVERS    = resolve(APP, "public/covers");
const POSTERS   = resolve(APP, "public/posters");
mkdirSync(COVERS,  { recursive: true });
mkdirSync(POSTERS, { recursive: true });

const OMDB_KEY = process.env.OMDB_API_KEY || "7971eec1";
const FORCE    = process.argv.includes("--force");

function djb2(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseObjects(file) {
  const text = readFileSync(file, "utf8");
  const parts = text.split(/\n\s*\{\s*title:/g).slice(1);
  return parts.map((chunk) => {
    const body = "title:" + chunk.split(/^\s*\},/m)[0];
    const get = (key) => {
      const re = new RegExp(`${key}:\\s*"([^"]+)"`);
      const m = body.match(re);
      return m ? m[1] : null;
    };
    const yearMatch = body.match(/year:\s*(\d+)/);
    const pseudoMatch = body.match(/pseudonym:\s*"([^"]+)"/);
    return {
      title: get("title"),
      olid:  get("olid"),
      imdb:  get("imdb"),
      year:  yearMatch ? parseInt(yearMatch[1], 10) : null,
      pseudonym: pseudoMatch ? pseudoMatch[1] : null,
    };
  });
}

// ───── Google Books cover lookup ─────
// q=intitle:"<title>"+inauthor:"<author>"  → take volumeInfo.imageLinks.thumbnail
// thumbnail comes with zoom=1 and 'edge=curl'; we strip those for a flat cover.
async function fetchFromGoogleBooks(title, author, expectedYear) {
  const q = `intitle:"${title}" inauthor:"${author}"`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=8&printType=books`;
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const data = await r.json();
    const items = data.items ?? [];

    // Rank items: King in authors AND has image AND year matches (±2) AND English
    const scored = items
      .map((it) => {
        const info = it.volumeInfo ?? {};
        const authors = info.authors ?? [];
        const hasImage = !!(info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail);
        const authorOk = authors.some((a) => a.toLowerCase().includes(author.toLowerCase()));
        const year = info.publishedDate ? parseInt(info.publishedDate.slice(0, 4), 10) : null;
        const yearOk = !expectedYear || (year && Math.abs(year - expectedYear) <= 3);
        const langOk = !info.language || info.language === "en";
        const score = (authorOk ? 4 : 0) + (yearOk ? 2 : 0) + (hasImage ? 1 : 0) + (langOk ? 1 : 0);
        return { it, score, hasImage, authorOk };
      })
      .filter((s) => s.hasImage)
      .sort((a, b) => b.score - a.score);

    for (const cand of scored.slice(0, 5)) {
      const info = cand.it.volumeInfo;
      // Prefer thumbnail (larger); strip edge=curl + zoom for a cleaner image.
      let img = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
      if (!img) continue;
      img = img.replace(/&edge=curl/g, "").replace(/&zoom=\d+/g, "&zoom=2").replace("http://", "https://");
      const cr = await fetch(img);
      if (!cr.ok) continue;
      const buf = Buffer.from(await cr.arrayBuffer());
      if (buf.length < 2500) continue;
      return { buf, source: { provider: "google-books", volumeId: cand.it.id, score: cand.score } };
    }
  } catch (e) { /* fall through */ }
  return null;
}

// ───── Open Library fallback ─────
async function fetchFromOpenLibrary(title, author, expectedYear) {
  const q = new URLSearchParams({ title, author, limit: "10" });
  const url = `https://openlibrary.org/search.json?${q.toString()}`;
  try {
    const r = await fetch(url, { headers: { "User-Agent": "castle-rock-archive/1.0" } });
    if (!r.ok) return null;
    const data = await r.json();
    const docs = data.docs ?? [];
    const candidates = docs
      .filter((d) => d.cover_i)
      .map((d) => {
        const authorOk = (d.author_name ?? []).some((a) => a.toLowerCase() === author.toLowerCase());
        const yearOk   = !expectedYear || (d.first_publish_year && Math.abs(d.first_publish_year - expectedYear) <= 2);
        return { d, score: (authorOk ? 2 : 0) + (yearOk ? 1 : 0) };
      })
      .sort((a, b) => b.score - a.score);

    for (const cand of candidates.slice(0, 5)) {
      const coverUrl = `https://covers.openlibrary.org/b/id/${cand.d.cover_i}-L.jpg`;
      const cr = await fetch(coverUrl);
      if (!cr.ok) continue;
      const buf = Buffer.from(await cr.arrayBuffer());
      if (buf.length < 2500) continue; // skip near-blanks
      return { buf, source: { provider: "openlibrary", cover_i: cand.d.cover_i, work_key: cand.d.key } };
    }
  } catch (e) { /* noop */ }
  return null;
}

async function fetchBookCover(title, year, pseudonym) {
  const authors = pseudonym ? [pseudonym, "Stephen King"] : ["Stephen King"];
  for (const author of authors) {
    const g = await fetchFromGoogleBooks(title, author, year);
    if (g) return g;
    const ol = await fetchFromOpenLibrary(title, author, year);
    if (ol) return ol;
  }
  return null;
}

// ───── Books ─────
const books = parseObjects(resolve(APP, "src/lib/books.ts"));
console.log(`Books in source: ${books.length}`);

const bookManifest = {};
for (const b of books) {
  if (!b.title) continue;
  const slug = djb2(b.title);
  const out  = resolve(COVERS, `${slug}.jpg`);
  if (FORCE && existsSync(out)) unlinkSync(out);
  const entry = { found: false, title: b.title, source: null };

  if (existsSync(out)) {
    entry.found = true;
    entry.source = "cached";
  } else {
    const result = await fetchBookCover(b.title, b.year, b.pseudonym);
    if (result) {
      writeFileSync(out, result.buf);
      entry.found = true;
      entry.source = result.source;
      console.log(`  cover ✓ ${b.title}  [${result.source.provider}]`);
    } else {
      console.log(`  cover ✗ ${b.title}`);
    }
    await sleep(120);
  }
  bookManifest[slug] = entry;
}
writeFileSync(resolve(COVERS, "manifest.json"), JSON.stringify(bookManifest, null, 2));

// ───── Films ─────
const films = parseObjects(resolve(APP, "src/lib/films.ts"));
console.log(`Films in source: ${films.length}; with IMDB id: ${films.filter((f) => f.imdb).length}`);

const filmManifest = {};
for (const f of films) {
  if (!f.title) continue;
  const slug = djb2(`${f.title}|${f.year}`);
  const out  = resolve(POSTERS, `${slug}.jpg`);
  if (FORCE && existsSync(out)) unlinkSync(out);
  const entry = { found: false, title: f.title, year: f.year, imdb: f.imdb ?? null };

  if (existsSync(out)) {
    entry.found = true;
  } else if (f.imdb) {
    try {
      const meta = await fetch(`http://www.omdbapi.com/?i=${f.imdb}&apikey=${OMDB_KEY}`).then((r) => r.json());
      if (meta?.Response === "True" && meta.Poster && meta.Poster !== "N/A") {
        const r2 = await fetch(meta.Poster);
        if (r2.ok) {
          const buf = Buffer.from(await r2.arrayBuffer());
          if (buf.length > 1000) {
            writeFileSync(out, buf);
            entry.found = true;
            console.log(`  poster ✓ ${f.title} (${f.year})`);
          }
        }
      }
    } catch (e) { /* noop */ }
  }
  if (!entry.found) console.log(`  poster ✗ ${f.title} (${f.year ?? ""})`);
  filmManifest[slug] = entry;
}
writeFileSync(resolve(POSTERS, "manifest.json"), JSON.stringify(filmManifest, null, 2));

const bc = Object.values(bookManifest).filter((x) => x.found).length;
const pc = Object.values(filmManifest).filter((x) => x.found).length;
console.log(`Done. Books with covers: ${bc}/${Object.keys(bookManifest).length}`);
console.log(`     Films with posters: ${pc}/${Object.keys(filmManifest).length}`);
