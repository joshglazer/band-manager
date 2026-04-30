-- Returns user_id and email for all members of a band.
-- Security definer so it can read auth.users; caller must be a band member.
create or replace function public.get_band_member_emails(band_id_arg bigint)
returns table(
  user_id uuid,
  email   text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    bm.user_id,
    u.email
  from public.band_members bm
  inner join auth.users u on u.id = bm.user_id
  where bm.band_id = band_id_arg
    and public.is_band_member(band_id_arg);
$$;

grant execute on function public.get_band_member_emails(bigint) to authenticated;
