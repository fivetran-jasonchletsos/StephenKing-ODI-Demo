// Related-works similarity engine for the Stephen King catalog.
//
// Mirrors the LinerNotes Jaccard + weighted approach, adapted for
// the Castle Rock universe. Similarity signals:
//   - genre tags       (horror, suspense, coming-of-age, etc.)
//   - universe tags    (Castle Rock, Derry, Dark Tower, etc.)
//   - era (decade)     (decade-proximity bonus)
//   - recurring chars  (shared character overlap)
//
// Runs entirely at build time / on first access, so the static site
// ships a full similarity graph with no runtime API.

import { books, type Book } from "./books";
import { films, type Film } from "./films";
import { characters } from "./characters";
import { bookSlug, filmSlug } from "@/components/slugs";

// ---------------------------------------------------------------------------
// Catalog item — unified shape for books and films
// ---------------------------------------------------------------------------
export type WorkKind = "book" | "film";

export type CatalogWork = {
  kind: WorkKind;
  slug: string;
  title: string;
  year: number;
  blurb: string;
};

function allWorks(): CatalogWork[] {
  const bs: CatalogWork[] = books.map((b) => ({
    kind: "book",
    slug: bookSlug(b.title),
    title: b.title,
    year: b.year,
    blurb: b.blurb,
  }));
  const fs: CatalogWork[] = films.map((f) => ({
    kind: "film",
    slug: filmSlug(f.title, f.year),
    title: f.title,
    year: f.year,
    blurb: f.blurb,
  }));
  return [...bs, ...fs];
}

// ---------------------------------------------------------------------------
// Tag extraction
// ---------------------------------------------------------------------------
export type WorkTags = {
  genres: string[];
  universe: string[];
  decade: number;
  chars: string[];      // character names that appear in this work
};

const GENRE_LABEL: Record<string, string> = {
  horror:        "Horror",
  suspense:      "Suspense / Thriller",
  "coming-of-age": "Coming of age",
  fantasy:       "Fantasy",
  "sci-fi":      "Sci-fi",
  literary:      "Literary fiction",
  "noir-crime":  "Noir / Crime",
  nonfiction:    "Nonfiction",
  children:      "Children",
};

const UNIVERSE_LABEL: Record<string, string> = {
  "castle-rock":  "Castle Rock",
  derry:          "Derry",
  "dark-tower":   "Dark Tower",
  "stand-verse":  "The Stand universe",
  "bill-hodges":  "Bill Hodges / Holly",
  "shining-verse":"Overlook universe",
};

export { GENRE_LABEL, UNIVERSE_LABEL };

// Character name → set of book/story titles they appear in
const charBookSet = new Map<string, Set<string>>();
for (const c of characters) {
  for (const bt of c.books) {
    if (!charBookSet.has(c.name)) charBookSet.set(c.name, new Set());
    charBookSet.get(c.name)!.add(bt);
  }
}

function genresForBook(b: Book): string[] {
  const g: string[] = [];
  if (b.category === "nonfiction") return ["nonfiction"];
  if (b.category === "children") return ["children"];

  const t = b.title.toLowerCase();
  const bl = b.blurb.toLowerCase();

  // genre signals
  if (["IT", "The Shining", "'Salem's Lot", "Pet Sematary", "Cujo", "Misery",
       "The Dark Half", "Christine", "The Tommyknockers", "The Outsider",
       "Doctor Sleep", "Cycle of the Werewolf", "Revival", "The Institute",
       "Sleeping Beauties", "Holly", "Later", "The Boogeyman"].includes(b.title))
    g.push("horror");

  if (["The Dead Zone", "Firestarter", "The Running Man", "Gerald's Game",
       "Dolores Claiborne", "Rose Madder", "Under the Dome", "Mr. Mercedes",
       "Finders Keepers", "End of Watch", "The Outsider", "Billy Summers"].includes(b.title))
    g.push("suspense");

  if (["The Body", "Stand By Me", "IT", "Joyland", "11/22/63", "Boy", "Different Seasons"].includes(b.title)
      || bl.includes("coming-of-age") || bl.includes("boy") || bl.includes("kids")
      || bl.includes("four kids") || bl.includes("young"))
    g.push("coming-of-age");

  if (b.series === "The Dark Tower" || ["The Talisman", "Black House", "Insomnia",
      "The Eyes of the Dragon", "Charlie the Choo-Choo", "Fairy Tale"].includes(b.title))
    g.push("fantasy");

  if (["The Stand", "The Tommyknockers", "Dreamcatcher", "Cell", "The Institute",
       "Firestarter", "The Running Man", "The Long Walk"].includes(b.title))
    g.push("sci-fi");

  if (["On Writing", "Danse Macabre"].includes(b.title))
    g.push("nonfiction");

  if (["Bag of Bones", "Lisey's Story", "Duma Key", "Elevation", "Joyland",
       "11/22/63"].includes(b.title))
    g.push("literary");

  if (["Mr. Mercedes", "Finders Keepers", "End of Watch", "Holly", "The Outsider",
       "Billy Summers", "If It Bleeds", "Later"].includes(b.title))
    g.push("noir-crime");

  if (b.pseudonym === "Richard Bachman" && !g.includes("suspense")) g.push("suspense");

  if (g.length === 0) g.push("horror"); // fallback — nearly everything is horror
  return [...new Set(g)];
}

function genresForFilm(f: Film): string[] {
  const g: string[] = [];
  const t = f.title.toLowerCase();
  const bl = f.blurb.toLowerCase();

  if (["The Shining", "IT", "IT (Chapter One)", "IT Chapter Two", "Pet Sematary",
       "The Mist", "1408", "Doctor Sleep", "Gerald's Game", "Salem's Lot",
       "'Salem's Lot", "The Boogeyman", "1922", "Maximum Overdrive",
       "Children of the Corn", "Cujo", "Carrie"].includes(f.title))
    g.push("horror");

  if (["Misery", "The Dead Zone", "Firestarter", "Needful Things", "The Outsider",
       "Mr. Harrigan's Phone", "The Dark Half"].includes(f.title))
    g.push("suspense");

  if (["Stand By Me", "IT (Chapter One)", "IT Chapter Two"].includes(f.title))
    g.push("coming-of-age");

  if (["The Shawshank Redemption", "The Green Mile", "Dolores Claiborne",
       "Hearts in Atlantis", "Lisey's Story", "The Life of Chuck"].includes(f.title))
    g.push("literary");

  if (["The Running Man", "Sleepwalkers"].includes(f.title)) g.push("sci-fi");

  if (f.source.toLowerCase().includes("dark tower")
      || ["The Dark Tower"].includes(f.title))
    g.push("fantasy");

  if (["Mr. Harrigan's Phone", "11.22.63", "Castle Rock"].includes(f.title))
    g.push("noir-crime");

  if (g.length === 0) g.push("horror");
  return [...new Set(g)];
}

function universeForBook(b: Book): string[] {
  const u: string[] = [];
  const castleRock = ["Cujo", "The Dead Zone", "The Dark Half", "Needful Things",
                      "Four Past Midnight", "Elevation", "From a Buick 8"];
  const derry = ["IT", "Insomnia", "Bag of Bones", "11/22/63", "Doctor Sleep"];
  const darkTower = ["The Dark Tower: The Gunslinger", "The Drawing of the Three",
                     "The Waste Lands", "Wizard and Glass", "Wolves of the Calla",
                     "Song of Susannah", "The Dark Tower", "Insomnia", "Black House",
                     "The Talisman", "The Eyes of the Dragon", "Charlie the Choo-Choo",
                     "Fairy Tale"];
  const standVerse = ["The Stand", "The Eyes of the Dragon"];
  const billHodges = ["Mr. Mercedes", "Finders Keepers", "End of Watch",
                      "The Outsider", "If It Bleeds", "Holly"];
  const shining = ["The Shining", "Doctor Sleep"];

  if (castleRock.includes(b.title)) u.push("castle-rock");
  if (derry.includes(b.title)) u.push("derry");
  if (darkTower.includes(b.title)) u.push("dark-tower");
  if (standVerse.includes(b.title)) u.push("stand-verse");
  if (billHodges.includes(b.title)) u.push("bill-hodges");
  if (shining.includes(b.title)) u.push("shining-verse");

  return u;
}

function universeForFilm(f: Film): string[] {
  const u: string[] = [];
  const src = f.source.toLowerCase();
  const t = f.title.toLowerCase();

  if (src.includes("needful things") || src.includes("dark half") || src.includes("cujo")
      || src.includes("dead zone") || t.includes("castle rock"))
    u.push("castle-rock");

  if (src.includes("it") || src.includes("derry")) u.push("derry");

  if (src.includes("dark tower")) u.push("dark-tower");

  if (src.includes("the stand")) u.push("stand-verse");

  if (src.includes("mr. mercedes") || src.includes("finders keepers")
      || src.includes("end of watch") || src.includes("outsider")
      || f.title.toLowerCase().includes("outsider"))
    u.push("bill-hodges");

  if (src.includes("shining") || src.includes("doctor sleep")) u.push("shining-verse");

  return u;
}

function charsForBook(b: Book): string[] {
  return characters.filter((c) => c.books.includes(b.title)).map((c) => c.name);
}

function charsForFilm(f: Film): string[] {
  // A film's characters are those in its source book (loose match)
  const srcLower = f.source.toLowerCase();
  const srcBook = books.find((b) =>
    srcLower.includes(b.title.toLowerCase())
    || b.title.toLowerCase().includes(srcLower.replace(/\s*\(.*\)\s*/, ""))
  );
  return srcBook ? charsForBook(srcBook) : [];
}

function tagsForWork(w: CatalogWork): WorkTags {
  const decade = Math.floor(w.year / 10) * 10;
  if (w.kind === "book") {
    const b = books.find((x) => bookSlug(x.title) === w.slug)!;
    return {
      genres: genresForBook(b),
      universe: universeForBook(b),
      decade,
      chars: charsForBook(b),
    };
  } else {
    const f = films.find((x) => filmSlug(x.title, x.year) === w.slug)!;
    return {
      genres: genresForFilm(f),
      universe: universeForFilm(f),
      decade,
      chars: charsForFilm(f),
    };
  }
}

// ---------------------------------------------------------------------------
// Weights — tuned for the King universe
// ---------------------------------------------------------------------------
const W_GENRE    = 1.0;
const W_UNIVERSE = 1.6;  // shared Castle Rock / Derry / Dark Tower is the strongest signal
const W_CHARS    = 1.2;  // shared recurring characters
const W_ERA      = 0.4;  // decade proximity
const K = 8;             // neighbors per work

// ---------------------------------------------------------------------------
// Pairwise
// ---------------------------------------------------------------------------
function jaccard(a: string[], b: string[]): { score: number; shared: string[] } {
  if (a.length === 0 || b.length === 0) return { score: 0, shared: [] };
  const setA = new Set(a);
  const shared = b.filter((x) => setA.has(x));
  const union = new Set([...a, ...b]).size;
  return { score: shared.length / union, shared };
}

function eraScore(a: WorkTags, b: WorkTags): number {
  const gap = Math.abs(a.decade - b.decade) / 10;
  if (gap === 0) return 1;
  if (gap >= 5) return 0;
  return 1 - gap / 5;
}

function pairScore(
  a: WorkTags,
  b: WorkTags
): { score: number; sharedGenres: string[]; sharedUniverse: string[]; sharedChars: string[] } {
  const g = jaccard(a.genres, b.genres);
  const u = jaccard(a.universe, b.universe);
  const c = jaccard(a.chars, b.chars);
  const era = eraScore(a, b);

  const raw = W_GENRE * g.score + W_UNIVERSE * u.score + W_CHARS * c.score + W_ERA * era;
  const maxWeight = W_GENRE + W_UNIVERSE + W_CHARS + W_ERA;
  return {
    score: raw / maxWeight,
    sharedGenres: g.shared,
    sharedUniverse: u.shared,
    sharedChars: c.shared,
  };
}

// ---------------------------------------------------------------------------
// Why-related copy
// ---------------------------------------------------------------------------
function whyCopy(
  s: { sharedUniverse: string[]; sharedGenres: string[]; sharedChars: string[] },
  aDecade: number,
  bDecade: number
): string {
  if (s.sharedUniverse.length > 0) {
    const label = UNIVERSE_LABEL[s.sharedUniverse[0]] ?? s.sharedUniverse[0];
    return `Both set in the ${label} universe`;
  }
  if (s.sharedChars.length > 0) {
    const names = s.sharedChars.slice(0, 2).join(" and ");
    return `Features ${names}`;
  }
  if (s.sharedGenres.length >= 2) {
    const g1 = GENRE_LABEL[s.sharedGenres[0]] ?? s.sharedGenres[0];
    const g2 = GENRE_LABEL[s.sharedGenres[1]] ?? s.sharedGenres[1];
    return `Both ${g1} and ${g2}`;
  }
  if (s.sharedGenres.length === 1) {
    const g1 = GENRE_LABEL[s.sharedGenres[0]] ?? s.sharedGenres[0];
    return `Rooted in ${g1}`;
  }
  if (aDecade === bDecade) return `${aDecade}s era`;
  return "Adjacent sensibility";
}

// ---------------------------------------------------------------------------
// Neighbor type
// ---------------------------------------------------------------------------
export type RelatedNeighbor = {
  slug: string;
  work: CatalogWork;
  score: number;
  why: string;
  sharedGenres: string[];
  sharedUniverse: string[];
  sharedChars: string[];
};

// ---------------------------------------------------------------------------
// Build cache
// ---------------------------------------------------------------------------
type TaggedWork = { work: CatalogWork; tags: WorkTags };

let _cache: Map<string, RelatedNeighbor[]> | null = null;

function build(): Map<string, RelatedNeighbor[]> {
  const works = allWorks();
  const tagged: TaggedWork[] = works.map((w) => ({ work: w, tags: tagsForWork(w) }));
  const result = new Map<string, RelatedNeighbor[]>();

  for (let i = 0; i < tagged.length; i++) {
    const a = tagged[i];
    const scored: RelatedNeighbor[] = [];

    for (let j = 0; j < tagged.length; j++) {
      if (i === j) continue;
      const b = tagged[j];
      const s = pairScore(a.tags, b.tags);
      if (s.score <= 0) continue;
      scored.push({
        slug: b.work.slug,
        work: b.work,
        score: s.score,
        why: whyCopy(s, a.tags.decade, b.tags.decade),
        sharedGenres: s.sharedGenres,
        sharedUniverse: s.sharedUniverse,
        sharedChars: s.sharedChars,
      });
    }

    scored.sort((x, y) => y.score - x.score);
    result.set(a.work.slug, scored.slice(0, K));
  }

  return result;
}

export function relatedFor(slug: string): RelatedNeighbor[] {
  if (!_cache) _cache = build();
  return _cache.get(slug) ?? [];
}

export function workBySlug(slug: string): CatalogWork | null {
  return allWorks().find((w) => w.slug === slug) ?? null;
}

export function tagsFor(slug: string): WorkTags | null {
  const w = workBySlug(slug);
  if (!w) return null;
  return tagsForWork(w);
}

// Returns the full tagged list — used by the /related network page.
export function allTaggedWorks(): { work: CatalogWork; tags: WorkTags; neighbors: RelatedNeighbor[] }[] {
  if (!_cache) _cache = build();
  const works = allWorks();
  return works.map((w) => ({
    work: w,
    tags: tagsForWork(w),
    neighbors: _cache!.get(w.slug) ?? [],
  }));
}
