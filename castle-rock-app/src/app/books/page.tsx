import BookCard from "@/components/BookCard";
import { books } from "@/lib/books";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Books — Castle Rock Archive",
};

export default function BooksPage() {
  const byDecade = new Map<number, typeof books>();
  for (const b of books) {
    const d = Math.floor(b.year / 10) * 10;
    if (!byDecade.has(d)) byDecade.set(d, []);
    byDecade.get(d)!.push(b);
  }
  const decades = Array.from(byDecade.keys()).sort();

  return (
    <main className="px-5 py-12 sm:px-6 sm:py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        <p className="type text-[11px] uppercase tracking-[0.35em] text-ember mb-3">Books</p>
        <h1 className="serif text-4xl sm:text-5xl text-paper drip-stop">The Bibliography</h1>
        <p className="serif italic text-bone/65 mt-3 max-w-2xl">
          From <em>Carrie</em> (1974) through the latest collection. Bachman novels included.
        </p>

        {decades.map((d) => {
          const list = (byDecade.get(d) || []).sort((a, b) => a.year - b.year);
          return (
            <section key={d} className="mt-14">
              <h2 className="type text-[11px] uppercase tracking-[0.35em] text-bone/55 mb-5">
                {d}s · {list.length} book{list.length === 1 ? "" : "s"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-10">
                {list.map((b) => <BookCard key={b.title} book={b} />)}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
