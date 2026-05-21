-- One row per (character, book) — cross-book links via Wikidata
-- + manual curator overrides.

with links as (
    select
        wikidata_qid_character,
        wikidata_qid_work,
        ol_work_id
    from {{ source('wikidata', 'cross_book_link') }}
)

select
    c.character_sk,
    b.book_sk,
    l.wikidata_qid_character,
    l.wikidata_qid_work,
    l.ol_work_id,
    c.name        as character_name,
    b.title       as book_title,
    b.published_year

from links l
join {{ ref('dim_character') }} c
  on c.wikidata_qid = l.wikidata_qid_character
join {{ ref('dim_book') }}      b
  on b.ol_work_id = l.ol_work_id
