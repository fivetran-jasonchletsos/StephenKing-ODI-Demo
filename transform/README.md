# castle_rock — dbt project

Transforms Fivetran-landed bronze data into the silver and gold layers
in Snowflake. The gold layer is what Cortex Analyst sees.

## Run

```bash
cp profiles.yml.example ~/.dbt/profiles.yml
export SNOWFLAKE_ACCOUNT=... SNOWFLAKE_USER=... SNOWFLAKE_PASSWORD=...
dbt deps
dbt build
```

## Models

- `bronze/sources.yml` — declares the three bronze schemas Fivetran lands
- `silver/` — staging models per source (not bundled in this skeleton)
- `gold/` — `dim_book`, `dim_film`, `dim_character`, `fct_appearance`, `fct_cameo`
- `gold/_gold__models.yml` — tests + a semantic model definition Cortex Analyst attaches to

## Cortex Analyst

Once `dbt build` has populated `gold.*`:

1. In Snowsight, create a Cortex Analyst service pointing at
   `castle_rock.gold.castle_rock_corpus` (the semantic model in
   `_gold__models.yml`).
2. Add NL question suggestions like:
   - "How many novels feature Randall Flagg?"
   - "Which Bachman novels are in the archive?"
   - "What is the longest gap between adaptations of the same book?"

The `/architecture` page references Cortex as the natural-language
interface; wire it through the Cortex Analyst Streamlit shim or a small
Cloudflare Worker if you want browser-side calls.
