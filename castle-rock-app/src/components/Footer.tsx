export default function Footer() {
  return (
    <footer className="border-t border-paper/10 px-5 pt-12 pb-10 sm:px-6 md:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between mb-10">
          <div>
            <p className="type text-[9px] uppercase tracking-[0.35em] text-bone/40 mb-3">
              Castle Rock Archive · Volume I
            </p>
            <p className="serif text-2xl font-light text-paper/85 leading-snug max-w-md italic">
              &ldquo;The trust of the innocent is the liar&apos;s most useful tool.&rdquo;
            </p>
            <p className="serif mt-2 text-sm text-bone/50">— Stephen King, <em>Needful Things</em></p>
          </div>
          <nav className="flex flex-col gap-2" aria-label="Footer navigation">
            <a href="https://github.com/fivetran-jasonchletsos/StephenKing-ODI-Demo" target="_blank" rel="noopener noreferrer"
               className="type text-[10px] uppercase tracking-[0.25em] text-bone/45 hover:text-ember">GitHub</a>
            <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer"
               className="type text-[10px] uppercase tracking-[0.25em] text-bone/45 hover:text-ember">Open Library</a>
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer"
               className="type text-[10px] uppercase tracking-[0.25em] text-bone/45 hover:text-ember">TMDB</a>
            <a href="https://www.wikidata.org" target="_blank" rel="noopener noreferrer"
               className="type text-[10px] uppercase tracking-[0.25em] text-bone/45 hover:text-ember">Wikidata</a>
            <a href="https://www.fivetran.com" target="_blank" rel="noopener noreferrer"
               className="type text-[10px] uppercase tracking-[0.25em] text-bone/45 hover:text-ember">Fivetran</a>
          </nav>
        </div>
        <div className="border-t border-paper/8 pt-6"></div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="type text-[9px] uppercase tracking-[0.3em] text-bone/35">
              Fivetran → Iceberg/S3 → Snowflake → dbt → Cortex Analyst
            </p>
            <p className="type text-[9px] uppercase tracking-[0.3em] text-bone/30">
              Set in Rozha One, Special Elite, JetBrains Mono
            </p>
          </div>
          <div className="text-right">
            <p className="type text-[9px] uppercase tracking-[0.3em] text-bone/30">v1.0 · 2026</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
