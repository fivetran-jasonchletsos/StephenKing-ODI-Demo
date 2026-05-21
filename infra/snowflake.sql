-- Castle Rock Archive — Snowflake DDL
--
-- Run as ACCOUNTADMIN once. After this, Fivetran lands into bronze_*,
-- dbt builds silver + gold, Cortex Analyst sits on gold.

create warehouse if not exists castle_rock_wh
    warehouse_size = 'x-small'
    auto_suspend = 60
    auto_resume = true
    initially_suspended = true;

create database if not exists castle_rock;
use database castle_rock;

create schema if not exists bronze_openlibrary;
create schema if not exists bronze_tmdb;
create schema if not exists bronze_wikidata;
create schema if not exists silver;
create schema if not exists gold;

-- Fivetran-managed Iceberg external volume (points at the S3 + Glue lake)
create external volume if not exists castle_rock_lake
    storage_locations = (
        (
            name = 's3-lake'
            storage_provider = 's3'
            storage_base_url = 's3://castle-rock-odi-lake/'
            storage_aws_role_arn = 'arn:aws:iam::<account>:role/castle-rock-snowflake-iceberg'
            storage_aws_external_id = '<random>'
        )
    )
    allow_writes = false;

-- Fivetran writer role
create role if not exists fivetran_writer;
grant usage on warehouse castle_rock_wh to role fivetran_writer;
grant usage on database castle_rock to role fivetran_writer;
grant usage on schema castle_rock.bronze_openlibrary to role fivetran_writer;
grant usage on schema castle_rock.bronze_tmdb       to role fivetran_writer;
grant usage on schema castle_rock.bronze_wikidata   to role fivetran_writer;
grant create table, modify on schema castle_rock.bronze_openlibrary to role fivetran_writer;
grant create table, modify on schema castle_rock.bronze_tmdb        to role fivetran_writer;
grant create table, modify on schema castle_rock.bronze_wikidata    to role fivetran_writer;

-- dbt role
create role if not exists dbt_runner;
grant usage on warehouse castle_rock_wh to role dbt_runner;
grant usage on database castle_rock to role dbt_runner;
grant usage on all schemas in database castle_rock to role dbt_runner;
grant select on all tables in database castle_rock to role dbt_runner;
grant create table, create view, create dynamic table on schema castle_rock.silver to role dbt_runner;
grant create table, create view, create dynamic table on schema castle_rock.gold   to role dbt_runner;
grant modify on schema castle_rock.silver to role dbt_runner;
grant modify on schema castle_rock.gold   to role dbt_runner;

-- Cortex Analyst role (read-only on gold)
create role if not exists cortex_reader;
grant usage on warehouse castle_rock_wh to role cortex_reader;
grant usage on database castle_rock to role cortex_reader;
grant usage on schema castle_rock.gold to role cortex_reader;
grant select on all tables in schema castle_rock.gold to role cortex_reader;
grant select on future tables in schema castle_rock.gold to role cortex_reader;
