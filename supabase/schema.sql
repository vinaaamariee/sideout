-- VolleyTrack Pro — Supabase Database Schema
-- Run this in your Supabase SQL editor: https://supabase.com/dashboard/project/_/sql

-- ─── ENABLE EXTENSIONS ───────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── MATCHES TABLE ───────────────────────────────────────────────────────────
create table if not exists matches (
  id                text        primary key,
  home_team_name    text        not null default 'HOME',
  away_team_name    text        not null default 'AWAY',
  home_sets         integer     not null default 0,
  away_sets         integer     not null default 0,
  status            text        not null default 'active'
                                check (status in ('active', 'complete')),
  started_at        timestamptz not null default now(),
  ended_at          timestamptz,
  game_state        jsonb       not null default '{}',
  created_at        timestamptz not null default now()
);

comment on table matches is
  'One row per volleyball match. game_state stores the full Zustand state as JSONB for recovery.';

-- ─── MATCH LOGS TABLE ────────────────────────────────────────────────────────
create table if not exists match_logs (
  id              uuid        primary key default uuid_generate_v4(),
  match_id        text        not null references matches(id) on delete cascade,
  player_id       text        not null,
  player_name     text        not null,
  player_number   integer     not null,
  team_key        text        not null check (team_key in ('home', 'away')),
  action_type     text        not null check (action_type in (
                                'kill', 'attackError', 'attempt',
                                'block',
                                'ace', 'serviceError',
                                'assist', 'excSet',
                                'excDig',
                                'recPerfect', 'recGood', 'recError'
                              )),
  position        integer     check (position between 1 and 6),
  set_number      integer     not null check (set_number between 1 and 5),
  home_score      integer     not null default 0,
  away_score      integer     not null default 0,
  timestamp       timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

comment on table match_logs is
  'Append-only log of every recorded action during a match. Used for play-by-play and undo.';

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index if not exists match_logs_match_id_idx
  on match_logs (match_id);

create index if not exists match_logs_created_at_idx
  on match_logs (match_id, created_at desc);

create index if not exists match_logs_player_idx
  on match_logs (match_id, player_id);

create index if not exists matches_status_idx
  on matches (status);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
-- Enable RLS on both tables
alter table matches     enable row level security;
alter table match_logs  enable row level security;

-- Public read/write policy (adjust for auth if you add login later)
-- For anon scoring (no auth):
create policy "Allow all operations on matches"
  on matches for all
  using (true)
  with check (true);

create policy "Allow all operations on match_logs"
  on match_logs for all
  using (true)
  with check (true);

-- ─── REALTIME ────────────────────────────────────────────────────────────────
-- Enable Supabase Realtime on match_logs for live score broadcasting
alter publication supabase_realtime add table match_logs;
alter publication supabase_realtime add table matches;

-- ─── HELPER VIEWS ────────────────────────────────────────────────────────────

-- View: per-player aggregated stats for a match
create or replace view match_player_stats as
select
  ml.match_id,
  ml.player_id,
  ml.player_name,
  ml.player_number,
  ml.team_key,
  count(*) filter (where ml.action_type = 'kill')         as kills,
  count(*) filter (where ml.action_type = 'attackError')  as attack_errors,
  count(*) filter (where ml.action_type in ('kill','attackError','attempt')) as total_attempts,
  count(*) filter (where ml.action_type = 'block')        as blocks,
  count(*) filter (where ml.action_type = 'ace')          as aces,
  count(*) filter (where ml.action_type = 'serviceError') as service_errors,
  count(*) filter (where ml.action_type = 'assist')       as assists,
  count(*) filter (where ml.action_type = 'excSet')       as exc_sets,
  count(*) filter (where ml.action_type = 'excDig')       as exc_digs,
  count(*) filter (where ml.action_type = 'recPerfect')   as rec_perfect,
  count(*) filter (where ml.action_type = 'recGood')      as rec_good,
  count(*) filter (where ml.action_type = 'recError')     as rec_error,
  -- PoG formula: K*1.0 + BLK*1.5 + ACE*1.2 + AST*0.5 + DIG*1.0 - ERR*1.0
  round(
    count(*) filter (where ml.action_type = 'kill')        * 1.0 +
    count(*) filter (where ml.action_type = 'block')       * 1.5 +
    count(*) filter (where ml.action_type = 'ace')         * 1.2 +
    count(*) filter (where ml.action_type = 'assist')      * 0.5 +
    count(*) filter (where ml.action_type = 'excDig')      * 1.0 -
    (
      count(*) filter (where ml.action_type = 'attackError') +
      count(*) filter (where ml.action_type = 'serviceError')
    ) * 1.0
  , 2) as pog_score
from match_logs ml
group by ml.match_id, ml.player_id, ml.player_name, ml.player_number, ml.team_key;

comment on view match_player_stats is
  'Aggregated per-player stats with PoG score calculated server-side.';

-- View: match summary
create or replace view match_summary as
select
  m.id,
  m.home_team_name,
  m.away_team_name,
  m.home_sets,
  m.away_sets,
  m.status,
  m.started_at,
  m.ended_at,
  extract(epoch from (coalesce(m.ended_at, now()) - m.started_at)) / 60 as duration_minutes,
  count(ml.id) as total_actions,
  case
    when m.home_sets > m.away_sets then m.home_team_name
    when m.away_sets > m.home_sets then m.away_team_name
    else 'TBD'
  end as winning_team
from matches m
left join match_logs ml on ml.match_id = m.id
group by m.id;

comment on view match_summary is 'Quick overview of all matches with computed winner and duration.';
