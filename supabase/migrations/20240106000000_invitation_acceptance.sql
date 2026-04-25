-- Allow invitees to see the band they've been invited to so the invitation
-- UI can display the band name before they've joined.
create policy "invitees can view their invited bands"
  on public.bands for select
  to authenticated
  using (
    exists (
      select 1 from public.band_invitations
      where band_id = bands.id
        and invitee_user_id = auth.uid()
        and status = 'pending'
    )
  );

-- Accepts a pending invitation: inserts the invitee into band_members and
-- marks the invitation accepted. Security definer bypasses band_members RLS
-- for a user who is not yet a member.
create or replace function public.accept_band_invitation(invitation_id_arg bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_band_id bigint;
begin
  select band_id into v_band_id
  from public.band_invitations
  where id = invitation_id_arg
    and invitee_user_id = auth.uid()
    and status = 'pending';

  if v_band_id is null then
    raise exception 'invitation not found' using errcode = 'P0001';
  end if;

  insert into public.band_members (band_id, user_id)
  values (v_band_id, auth.uid());

  update public.band_invitations
  set status = 'accepted'
  where id = invitation_id_arg;
end;
$$;

grant execute on function public.accept_band_invitation(bigint) to authenticated;
