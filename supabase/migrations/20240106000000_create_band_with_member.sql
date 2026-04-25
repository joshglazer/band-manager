-- Migration: add RPC that creates a band and adds the caller as a member atomically.
-- Uses security definer so RLS on bands/band_members is bypassed for the
-- initial insert, avoiding the catch-22 where the creator cannot SELECT the
-- newly-inserted band row (SELECT policy requires band membership) before they
-- have been added as a member.

create or replace function public.create_band_with_member(band_name text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_band_id bigint;
begin
  insert into public.bands (name)
  values (band_name)
  returning id into new_band_id;

  insert into public.band_members (band_id, user_id)
  values (new_band_id, auth.uid());

  return new_band_id;
end;
$$;
