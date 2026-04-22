import { createClient } from '@/utils/supabase/server';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import UserMenu from './UserMenu/UserMenu';

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    'use server';

    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect('/login');
  };

  return user ? (
    <UserMenu user={user} signOut={signOut} />
  ) : (
    <Button
      component={Link}
      href="/login"
      variant="outlined"
      size="small"
      sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.08)' } }}
    >
      Login
    </Button>
  );
}
