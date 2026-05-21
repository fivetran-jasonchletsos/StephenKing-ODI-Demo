import Link from "next/link";
import KingRejector from "@/components/KingRejector";
import SubmissionsTicker from "@/components/SubmissionsTicker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit — Castle Rock Archive",
};

export default function SubmitPage() {
  return (
    <main className="min-h-screen">
      <div className="border-b border-paper/10 px-5 py-4 sm:px-6 md:px-16">
        <div className="mx-auto max-w-6xl flex items-center gap-3">
          <Link href="/" className="type text-[10px] uppercase tracking-[0.3em] text-bone/45 hover:text-ember">Castle Rock</Link>
          <span className="type text-[10px] text-bone/20">/</span>
          <span className="type text-[10px] uppercase tracking-[0.3em] text-bone/45">Submit</span>
        </div>
      </div>

      <header className="border-b border-paper/10 px-5 py-8 sm:px-6 sm:py-9 md:px-16">
        <div className="mx-auto max-w-6xl">
          <p className="type text-[10px] uppercase tracking-[0.3em] text-ember mb-1">Castle Rock / Submit</p>
          <h1 className="serif text-3xl sm:text-4xl text-paper drip-stop">Pitch a King story.</h1>
          <p className="serif mt-3 max-w-2xl text-sm italic text-bone/70 sm:text-base">
            The archive has 65+ novels and 47+ adaptations. Submit anyway. Cortex will explain — in
            detail — which one already does what your pitch is trying to do.
          </p>
        </div>
      </header>

      <section className="px-5 py-12 sm:px-6 sm:py-16 md:px-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <KingRejector />
        </div>
      </section>

      <SubmissionsTicker />
    </main>
  );
}
