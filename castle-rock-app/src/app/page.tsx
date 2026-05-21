import Link from "next/link";
import Hero from "@/components/Hero";
import BookCard from "@/components/BookCard";
import { books } from "@/lib/books";

export default function HomePage() {
  // Show all books sorted by year
  const sorted = [...books].sort((a, b) => a.year - b.year);
  return (
    <main>
      <Hero />
      <section className="px-5 py-12 sm:px-6 sm:py-16 md:px-16 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 section-ornament">
            <span className="type text-[11px] uppercase tracking-[0.35em] text-ember">All Books</span>
          </div>
          <h2 className="serif text-3xl sm:text-4xl text-paper mb-3 drip-stop">{books.length} novels &amp; collections</h2>
          <p className="serif italic text-bone/65 mb-10 max-w-3xl">
            Pulled from Open Library by Fivetran. The full bibliography would land all ~70 novels +
            200+ short stories + collections; this curated subset is the canon.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-10">
            {sorted.map((b) => (
              <Link key={b.title} href="/books" className="block">
                <BookCard book={b} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
