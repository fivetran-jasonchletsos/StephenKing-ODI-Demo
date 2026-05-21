// Static data-quality panel — what the dbt test results look like after a
// nightly run. In production this would read from elementary / dbt artifacts.

type Test = {
  model: string;
  test: string;
  status: "pass" | "warn" | "fail";
  records: number;
  failed: number;
  detail?: string;
};

const TESTS: Test[] = [
  { model: "gold.dim_book",         test: "unique(book_sk)",             status: "pass", records: 70,    failed: 0 },
  { model: "gold.dim_book",         test: "not_null(book_sk, title)",    status: "pass", records: 70,    failed: 0 },
  { model: "gold.dim_book",         test: "year_in_range(1974, 2024)",   status: "pass", records: 70,    failed: 0 },
  { model: "gold.dim_film",         test: "unique(film_sk)",              status: "pass", records: 48,    failed: 0 },
  { model: "gold.dim_film",         test: "not_null(tmdb_id, released_year)", status: "pass", records: 48, failed: 0 },
  { model: "gold.dim_character",    test: "unique(wikidata_qid)",         status: "pass", records: 75,    failed: 0 },
  { model: "gold.dim_character",    test: "accepted_values(alignment)",   status: "pass", records: 75,    failed: 0,
    detail: "{protagonist, antagonist, neutral, supernatural}" },
  { model: "gold.fct_appearance",   test: "relationships(book_sk → dim_book)",      status: "pass", records: 187, failed: 0 },
  { model: "gold.fct_appearance",   test: "relationships(character_sk → dim_character)", status: "pass", records: 187, failed: 0 },
  { model: "gold.fct_cameo",        test: "unique(cameo_sk)",             status: "pass", records: 25,    failed: 0 },
  { model: "gold.fct_cameo",        test: "tmdb_id_is_king (custom)",     status: "pass", records: 25,    failed: 0,
    detail: "asserts cameo's TMDB person_id = 3636 (Stephen King)" },
  { model: "bronze_openlibrary.work", test: "freshness(< 36h)",            status: "pass", records: 1240,  failed: 0, detail: "last sync 14h ago" },
  { model: "bronze_tmdb.movie",       test: "freshness(< 36h)",            status: "pass", records: 1820,  failed: 0, detail: "last sync 19h ago" },
  { model: "bronze_wikidata.character", test: "freshness(< 7d)",           status: "warn", records: 91,    failed: 0, detail: "SPARQL pull weekly; current age 6d 4h" },
  { model: "gold.dim_book",         test: "pseudonym_in_set",              status: "warn", records: 70,    failed: 2,
    detail: "2 records use 'Beryl Evans'/'Eleanor Druse' — accepted as known pseudonyms but flagged for review" },
];

function statusBadge(s: Test["status"]) {
  if (s === "pass") return { label: "PASS",  cls: "text-sickly bg-sickly/10 border-sickly/30" };
  if (s === "warn") return { label: "WARN",  cls: "text-[#f0b400] bg-[#f0b400]/10 border-[#f0b400]/30" };
  return                     { label: "FAIL", cls: "text-ember bg-ember/10 border-ember/40" };
}

export default function DataQualityPanel() {
  const passN = TESTS.filter((t) => t.status === "pass").length;
  const warnN = TESTS.filter((t) => t.status === "warn").length;
  const failN = TESTS.filter((t) => t.status === "fail").length;

  return (
    <section className="mt-16">
      <div className="section-ornament mb-6">
        <span className="type text-[11px] uppercase tracking-[0.35em] text-ember">Data quality &amp; tests</span>
      </div>
      <h2 className="serif text-3xl text-paper drip-stop">{TESTS.length} dbt tests, last night.</h2>
      <p className="serif italic text-bone/70 mt-3 max-w-3xl leading-relaxed">
        Generic dbt tests (unique, not_null, accepted_values, relationships, freshness) plus a
        custom assertion that every cameo's TMDB <code className="font-mono text-bone/85">person_id</code> equals 3636.
        In production this view reads <code className="font-mono text-bone/85">elementary_data.test_results</code>.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="border border-sickly/40 bg-sickly/10 p-4">
          <p className="type text-[10px] uppercase tracking-[0.3em] text-sickly">Pass</p>
          <p className="serif text-3xl text-paper mt-1">{passN}</p>
        </div>
        <div className="border border-[#f0b400]/40 bg-[#f0b400]/10 p-4">
          <p className="type text-[10px] uppercase tracking-[0.3em] text-[#f0b400]">Warn</p>
          <p className="serif text-3xl text-paper mt-1">{warnN}</p>
        </div>
        <div className="border border-ember/40 bg-ember/10 p-4">
          <p className="type text-[10px] uppercase tracking-[0.3em] text-ember">Fail</p>
          <p className="serif text-3xl text-paper mt-1">{failN}</p>
        </div>
      </div>

      <table className="w-full text-sm border border-paper/15 mt-6">
        <thead>
          <tr className="text-left type text-[10px] uppercase tracking-[0.25em] text-bone/55">
            <th className="px-3 py-2 border-b border-paper/15">Model</th>
            <th className="px-3 py-2 border-b border-paper/15">Test</th>
            <th className="px-3 py-2 border-b border-paper/15 text-right">Records</th>
            <th className="px-3 py-2 border-b border-paper/15 text-right">Failed</th>
            <th className="px-3 py-2 border-b border-paper/15">Status</th>
          </tr>
        </thead>
        <tbody>
          {TESTS.map((t, i) => {
            const b = statusBadge(t.status);
            return (
              <tr key={i} className="border-b border-paper/8">
                <td className="px-3 py-2 font-mono text-xs text-bone/85">{t.model}</td>
                <td className="px-3 py-2 text-bone/85">
                  {t.test}
                  {t.detail && <div className="serif italic text-bone/45 text-xs mt-0.5">{t.detail}</div>}
                </td>
                <td className="px-3 py-2 text-right text-bone/70 font-mono text-xs">{t.records.toLocaleString()}</td>
                <td className="px-3 py-2 text-right text-bone/70 font-mono text-xs">{t.failed}</td>
                <td className="px-3 py-2">
                  <span className={`type text-[9px] uppercase tracking-[0.25em] px-2 py-0.5 border ${b.cls}`}>
                    {b.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
