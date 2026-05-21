#!/usr/bin/env node
/**
 * Fetch book covers + film posters for the Castle Rock Archive.
 *
 *   Books  → Open Library: https://covers.openlibrary.org/b/olid/{OLID}-L.jpg
 *   Films  → OMDB (poster URL keyed by IMDB id)
 *
 * Outputs:
 *   castle-rock-app/public/covers/{slug}.jpg + manifest.json
 *   castle-rock-app/public/posters/{slug}.jpg + manifest.json
 *
 *   OMDB_API_KEY=xxxx node scripts/fetch-assets.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
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

function djb2(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

// Split a TS array-of-objects file on '{ title:' and extract per-object fields.
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
    return {
      title: get("title"),
      olid:  get("olid"),
      imdb:  get("imdb"),
      year:  yearMatch ? parseInt(yearMatch[1], 10) : null,
    };
  });
}

// ───── Books ─────
const books = parseObjects(resolve(APP, "src/lib/books.ts"));
console.log(`Books in source: ${books.length}; with OLID: ${books.filter((b) => b.olid).length}`);

const bookManifest = {};
for (const b of books) {
  if (!b.title) continue;
  const slug = djb2(b.title);
  const entry = { found: false, title: b.title, olid: b.olid ?? null };
  if (b.olid) {
    const out = resolve(COVERS, `${slug}.jpg`);
    if (existsSync(out)) {
      entry.found = true;
    } else {
      const url = `https://covers.openlibrary.org/b/olid/${b.olid}-L.jpg?default=false`;
      try {
        const r = await fetch(url);
        if (r.ok && r.headers.get("content-type")?.startsWith("image/")) {
          const buf = Buffer.from(await r.arrayBuffer());
          if (buf.length > 1000) {
            writeFileSync(out, buf);
            entry.found = true;
            console.log(`  cover ✓ ${b.title}`);
          }
        }
      } catch (e) { /* noop */ }
    }
  }
  bookManifest[slug] = entry;
  if (!entry.found) console.log(`  cover ✗ ${b.title}`);
}
writeFileSync(resolve(COVERS, "manifest.json"), JSON.stringify(bookManifest, null, 2));

// ───── Films ─────
const films = parseObjects(resolve(APP, "src/lib/films.ts"));
console.log(`Films in source: ${films.length}; with IMDB id: ${films.filter((f) => f.imdb).length}`);

const filmManifest = {};
for (const f of films) {
  if (!f.title) continue;
  const slug = djb2(`${f.title}|${f.year}`);
  const entry = { found: false, title: f.title, year: f.year, imdb: f.imdb ?? null };
  if (f.imdb) {
    const out = resolve(POSTERS, `${slug}.jpg`);
    if (existsSync(out)) {
      entry.found = true;
    } else {
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
  }
  filmManifest[slug] = entry;
  if (!entry.found) console.log(`  poster ✗ ${f.title} (${f.year ?? ""})`);
}
writeFileSync(resolve(POSTERS, "manifest.json"), JSON.stringify(filmManifest, null, 2));

const bc = Object.values(bookManifest).filter((x) => x.found).length;
const pc = Object.values(filmManifest).filter((x) => x.found).length;
console.log(`Done. Books with covers: ${bc}/${Object.keys(bookManifest).length}`);
console.log(`     Films with posters: ${pc}/${Object.keys(filmManifest).length}`);
