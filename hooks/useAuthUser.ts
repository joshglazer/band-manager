import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function useAuthUser() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
