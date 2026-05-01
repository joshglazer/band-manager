drop policy "users can view their own profile" on public.user_profiles;

create policy "authenticated users can view all profiles"
  on public.user_profiles for select
  to authenticated
  using (true);
