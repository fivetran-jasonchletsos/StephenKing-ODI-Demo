-- One row per King adaptation (films, miniseries, TV series).

with credits as (
    select tmdb_id
    from {{ source('tmdb', 'crew_credit') }}
    where person_id = 3636
      and job in ('Novel', 'Story', 'Screenplay', 'Author')
),
movies as (
    select
        m.tmdb_id,
        m.title,
        cast(substr(m.release_date, 1, 4) as integer)  as released_year,
        'film'                                          as type,
        m.imdb_id                                       as imdb,
        m.poster_path                                   as poster_path
    from {{ source('tmdb', 'movie') }}   m
    join credits c on c.tmdb_id = m.tmdb_id
    union all
    select
        t.tmdb_id,
        t.name                                          as title,
        cast(substr(t.first_air_date, 1, 4) as integer) as released_year,
        case when t.episode_count > 8 then 'tv-series' else 'miniseries' end as type,
        null                                            as imdb,
        t.poster_path
    from {{ source('tmdb', 'tv_series') }} t
    join credits c on c.tmdb_id = t.tmdb_id
)

select
    {{ dbt_utils.generate_surrogate_key(['tmdb_id', 'type']) }}  as film_sk,
    tmdb_id, title, released_year, type, imdb, poster_path
from movies
