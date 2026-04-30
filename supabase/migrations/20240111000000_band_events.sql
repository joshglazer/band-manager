create table if not exists public.band_events (
  id bigint generated always as identity primary key,
  band_id bigint not null references public.bands(id) on delete cascade,
  type text not null check (type in ('practice', 'gig')),
  location text not null,
  date date not null,
  created_at timestamp with time zone default now() not null
);

alter table public.band_events enable row level security;

create policy "Band members can view events"
  on public.band_events for select
  using (is_band_member(band_id));

create policy "Band members can insert events"
  on public.band_events for insert
  with check (is_band_member(band_id));

create policy "Band members can update events"
  on public.band_events for update
  using (is_band_member(band_id));

create policy "Band members can delete events"
  on public.band_events for delete
  using (is_band_member(band_id));
