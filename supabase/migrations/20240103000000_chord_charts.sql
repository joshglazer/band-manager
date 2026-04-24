alter table public.songs
  add column if not exists chord_chart text;
