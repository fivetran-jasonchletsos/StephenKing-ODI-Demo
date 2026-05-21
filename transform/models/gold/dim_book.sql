-- One row per Stephen King book (novel, collection, or novella).
-- Sourced from Open Library `work` records.

with w as (
    select
        ol_work_id,
        title,
        first_publish_year                as published_year,
        coalesce(work_type, 'novel')      as category,
        case
            when title in ('Rage', 'The Long Walk', 'Roadwork', 'The Running Man', 'Thinner') then 'Richard Bachman'
        end                                as pseudonym,
        coalesce(series_name, null)        as series,
        description_short                  as blurb,
        primary_olid_cover                 as olid
    from {{ source('openlibrary', 'work') }}
)

select
    {{ dbt_utils.generate_surrogate_key(['ol_work_id']) }}   as book_sk,
    ol_work_id,
    title,
    published_year,
    category,
    pseudonym,
    series,
    blurb,
    olid

from w
where author_ol_id = 'OL2162284A'   -- Stephen King
