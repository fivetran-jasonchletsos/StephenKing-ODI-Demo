// djb2 hash, matches scripts/fetch-assets.mjs

export function djb2(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

export const bookSlug    = (title: string)                => djb2(title);
export const filmSlug    = (title: string, year: number)  => djb2(`${title}|${year}`);
export const characterSlug = (name: string)               => djb2(name);
