-- Add archived_at column to bands table
alter table public.bands add column if not exists archived_at timestamptz;

-- Allow band members to update band (needed for archive/unarchive)
create policy "band members can update their bands"
  on public.bands for update
  to authenticated
  using (public.is_band_member(id))
  with check (public.is_band_member(id));

-- Update get_my_bands() to expose archived_at and support filtering by archive status.
-- archived_only = false (default) returns only active bands.
-- archived_only = true returns only archived bands.
create or replace function public.get_my_bands(archived_only boolean default false)
returns table(
  id           bigint,
  name         text,
  created_at   timestamptz,
  archived_at  timestamptz,
  song_count   bigint,
  member_count bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    b.id,
    b.name,
    b.created_at,
    b.archived_at,
    (select count(*) from public.songs      s   where s.band_id  = b.id) as song_count,
    (select count(*) from public.band_members bm2 where bm2.band_id = b.id) as member_count
  from public.bands b
  inner join public.band_members bm
    on bm.band_id = b.id and bm.user_id = auth.uid()
  where
    case when archived_only
      then b.archived_at is not null
      else b.archived_at is null
    end
  order by b.name;
$$;
