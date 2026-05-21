# Fivetran connectors — Castle Rock Archive (3 sources)

Three managed Fivetran connectors feed Castle Rock. All three land into
the same Iceberg lake in S3, mirrored into Snowflake. dbt + Cortex sit
on top of the gold layer.

## The connectors

| Connector | Source | Bronze schema | Sync | Tables we use |
|---|---|---|---|---|
| Open Library | `https://openlibrary.org/api/` (HTTP source via Fivetran Connector SDK) | `bronze_openlibrary` | Daily | `work`, `edition`, `author`, `subject` |
| TMDB | `https://api.themoviedb.org/3/` (Fivetran TMDB / HTTP source) | `bronze_tmdb` | Daily | `person`, `movie`, `tv_series`, `cast_credit`, `crew_credit` |
| Wikidata | SPARQL endpoint at `https://query.wikidata.org/sparql` (Fivetran HTTP source) | `bronze_wikidata` | Weekly | `character`, `place`, `cross_book_link` |

## Open Library setup

Fetches every Stephen King work and its editions.

Query starter:
```
GET /authors/OL2162284A.json
GET /authors/OL2162284A/works.json?limit=200
GET /works/{WORK_OL_ID}/editions.json
```

Connector config (recipe):
```
Connector type:       HTTP source
Pagination:           cursor (works.next)
Auth:                 none (public API; respect Open Library rate limits)
Schema:               bronze_openlibrary
Tables landed:        work, edition, author, subject
Schema inference:     enabled
```

## TMDB setup

Fetches all titles tagged with Stephen King as writer or actor.

Query starter:
```
GET /person/3636                          (Stephen King's TMDB person id)
GET /person/3636/movie_credits
GET /person/3636/tv_credits
GET /movie/{movie_id}                     (per film, for poster + cast)
```

Connector config:
```
Connector type:       TMDB (official Fivetran) or HTTP source
API key:              required (free tier OK)
Schema:               bronze_tmdb
Tables landed:        person, movie, tv_series, cast_credit, crew_credit
Schema inference:     enabled
```

Cameo detection: any row in `cast_credit` where `person_id = 3636` AND
`movie_id` joins to a film whose `crew_credit` doesn't list King as
writer/director — those are pure on-screen appearances.

## Wikidata setup

A SPARQL query against `https://query.wikidata.org/sparql` for
characters and places in King's fiction.

Sample query:
```sparql
SELECT ?character ?characterLabel ?work ?workLabel
WHERE {
  ?character wdt:P1080 ?work .              # subject_of (work)
  ?work     wdt:P50    wd:Q39829 .          # author = Stephen King
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
```

Connector config:
```
Connector type:       HTTP source
URL:                  https://query.wikidata.org/sparql
Headers:              { "Accept": "application/sparql-results+json" }
Schema:               bronze_wikidata
Tables landed:        character, place, cross_book_link
Sync frequency:       weekly (Wikidata churns slowly)
```

## Why three connectors and not one

Each source answers a different question:
- **Open Library** is the authoritative bibliography. Other places have
  errors and reshuffled editions; OL has canonical work IDs.
- **TMDB** is the only complete source for adaptations including
  obscure miniseries, dollar-baby short films, and King's cast credits.
- **Wikidata** is where the *cross-book character links* live — Father
  Callahan on the same node as Salem's Lot and Wolves of the Calla;
  Randall Flagg linked to seven works.

This is the ODI thesis in concrete form: each source is best at what
it's best at, none of them is forced into the others' shape.
