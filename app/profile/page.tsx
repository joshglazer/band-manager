import UserProfileForm from '@/components/forms/UserProfileForm';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function ProfilePage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <h2>My Profile</h2>
      {user ? <UserProfileForm user={user} /> : 'No User Found'}
    </>
  );
}
