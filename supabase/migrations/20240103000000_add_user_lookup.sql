-- Helper function to look up a user's ID by email.
-- Uses security definer so authenticated users can query auth.users without a service role key.
create or replace function public.get_user_id_by_email(email_arg text)
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from auth.users where email = email_arg;
$$;

grant execute on function public.get_user_id_by_email(text) to authenticated;
