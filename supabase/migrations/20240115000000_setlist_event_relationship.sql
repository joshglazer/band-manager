alter table public.setlists drop column if exists date;
alter table public.setlists add column if not exists event_id bigint references public.band_events(id) on delete set null;
