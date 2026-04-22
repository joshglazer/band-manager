import UserProfileForm from '@/components/forms/UserProfileForm';
import { createClient } from '@/utils/supabase/server';

export default async function ProfilePage() {
  const supabase = await createClient();

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
