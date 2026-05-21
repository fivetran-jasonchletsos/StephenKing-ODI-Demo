-- King's on-screen appearances. Filter TMDB cast credits to person 3636.

with king_acts as (
    select cc.tmdb_id, cc.character as role
    from {{ source('tmdb', 'cast_credit') }} cc
    where cc.person_id = 3636      -- Stephen King's TMDB id
)

select
    {{ dbt_utils.generate_surrogate_key(['ka.tmdb_id']) }} as cameo_sk,
    f.film_sk,
    f.title              as film_title,
    f.released_year      as year,
    ka.role              as character_played

from king_acts ka
join {{ ref('dim_film') }} f using (tmdb_id)
