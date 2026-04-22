import { createClient } from '@/utils/supabase/server';

export default async function useAuthUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
