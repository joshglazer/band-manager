alter table public.songs
  add column if not exists key            text,
  add column if not exists bpm            integer,
  add column if not exists time_signature text,
  add column if not exists notes          text,
  add column if not exists sections       jsonb not null default '[]'::jsonb;
