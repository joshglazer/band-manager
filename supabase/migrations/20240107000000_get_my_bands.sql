-- Returns only bands the current user is an actual member of, with correct
-- total song and member counts. Using security definer so the subcount queries
-- aren't restricted by RLS, and an inner join on band_members to ensure invited-
-- but-not-yet-joined bands are excluded regardless of bands SELECT policies.
create or replace function public.get_my_bands()
returns table(
  id         bigint,
  name       text,
  created_at timestamptz,
  song_count bigint,
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
    (select count(*) from public.songs    s  where s.band_id  = b.id) as song_count,
    (select count(*) from public.band_members bm2 where bm2.band_id = b.id) as member_count
  from public.bands b
  inner join public.band_members bm
    on bm.band_id = b.id and bm.user_id = auth.uid()
  order by b.name;
$$;

grant execute on function public.get_my_bands() to authenticated;
