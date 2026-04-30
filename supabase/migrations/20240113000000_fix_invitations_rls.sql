-- Fix overly permissive SELECT policy on band_invitations.
-- Previously, any band member could see all pending invitations for their band,
-- which exposed invitations sent to other people.
-- Now only the invitee can see their own invitations.

drop policy if exists "users can view relevant invitations" on public.band_invitations;

create policy "invitees can view their own invitations"
  on public.band_invitations for select
  to authenticated
  using (auth.uid() = invitee_user_id);
