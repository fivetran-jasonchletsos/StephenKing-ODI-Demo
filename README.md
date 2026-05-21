# StephenKing-ODI-Demo · Castle Rock Archive

End-to-end ODI demonstration built around the Stephen King universe.
Books, film adaptations, his on-screen cameos, and a roster of recurring
characters — all pulled from open APIs by Fivetran, modeled by dbt
into a Snowflake gold layer, and surfaced through a horror-themed
Next.js front end. Snowflake **Cortex Analyst** sits on top of the gold
tables and answers natural-language questions about the corpus.

This is the personal-curatorial demo of the family (parallel to
LinerNotes and Peter's Movies) but the ingest path is *real* ODI —
multiple public APIs, one open Iceberg lake mirrored into Snowflake,
many engines and consumers (BI, dbt, Cortex) reading the same bytes.

## Sources

| Source | Connector | What it gives us | Bronze schema |
|---|---|---|---|
| Open Library | Fivetran HTTP source | Bibliography: novels, collections, editions, ISBNs, OL IDs, cover image refs | `bronze_openlibrary` |
| TMDB | Fivetran TMDB / HTTP source | Adaptations: title, year, poster path, cast & crew (used for cameo detection) | `bronze_tmdb` |
| Wikidata | Fivetran HTTP source (SPARQL endpoint) | Recurring characters, fictional places (Castle Rock, Derry, Jerusalem's Lot), cross-book links | `bronze_wikidata` |

The /architecture page walks visitors through this pipeline with the
same lineage diagram the industry demos use.

## Stack

- **Ingest**: Fivetran managed connectors (3 sources, all hands-off after setup)
- **Storage**: Apache Iceberg in S3 (open foundation) → mirrored into Snowflake managed tables
- **Transform**: dbt Cloud / dbt Core targeting Snowflake; bronze → silver → gold + a small Semantic Layer
- **Activation**: Snowflake Cortex Analyst on `gold.*` tables for NL Q&A
- **Surface**: Next.js 14 static export → GitHub Pages

```
       Open Library  TMDB  Wikidata
              \      |     /
               Fivetran (3 connectors)
                     |
        S3 + Iceberg  ⇄  Snowflake (managed tables)
                     |
                    dbt
                     |
       gold.dim_book · gold.dim_film · gold.dim_character
       gold.fct_adaptation · gold.fct_cameo · gold.fct_appearance
                     |
        ┌────────────┼────────────┬────────────┐
       BI         Cortex      Castle Rock     Notebooks
                  Analyst       front end
```

## Layout

| Path | What lives there |
|---|---|
| `connectors/` | Fivetran connector recipes for each source |
| `infra/` | Terraform (S3 + Glue) + `snowflake.sql` DDL for the warehouse, db, schemas, role |
| `transform/` | dbt project `castle_rock` — bronze sources, silver staging, gold dims/facts, semantic-layer metrics |
| `castle-rock-app/` | Next.js 14 + Tailwind 3 horror-themed front end |
| `castle-rock-app/scripts/` | Python/Node scripts to refresh seed data + cover thumbnails |

## Pages

- `/` — Hero + grid of all books with cover thumbnails
- `/books` — Full bibliography, filterable by decade
- `/films` — Adaptations, including the obscure ones
- `/cameos` — King's on-screen appearances with character names and the film it's in
- `/characters` — Searchable character roster with descriptions, the books they appear in, and cross-book links (Father Callahan → Salem's Lot + Dark Tower V; Randall Flagg → seven books; etc.)
- `/timeline` — Career timeline 1974 → present, stacked covers per year (same visual as LinerNotes + Peter's Movies)
- `/submit` — Cortex rejection page + live submissions ticker
- `/architecture` — ODI thesis: one open lake, many engines, with the three Fivetran connectors and the lineage diagram
- `/pipeline` — Connector health + layer status

## Why Cortex sits on this data

The gold layer is small (~600 books, ~200 films, ~80 characters) but
the *joins* are rich: a question like "which characters appear in both
a 1986 book and an adaptation released in 2017?" exercises three joins
across the gold layer. Cortex Analyst can answer it in one shot. The
/ask page (or the /architecture page's Cortex panel) shows half a dozen
of these.

## Local dev

```bash
cd castle-rock-app
npm ci
npm run dev   # http://localhost:3000
```

## License

Demo code. Data is derived from public APIs (Open Library, TMDB,
Wikidata). All character names, book titles, and film titles are the
property of their respective rights holders; we use them here for
non-commercial educational demonstration.
