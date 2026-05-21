-- Recurring + signature King characters drawn from Wikidata.

with c as (
    select
        wikidata_qid,
        label                              as name,
        description                        as role,
        narrative_location                 as primary_location,
        case
            when antagonist_flag then 'antagonist'
            when supernatural_flag then 'supernatural'
            when neutral_flag then 'neutral'
            else 'protagonist'
        end                                as alignment
    from {{ source('wikidata', 'character') }}
)

select
    {{ dbt_utils.generate_surrogate_key(['wikidata_qid']) }}  as character_sk,
    wikidata_qid,
    name,
    role,
    primary_location,
    alignment

from c
