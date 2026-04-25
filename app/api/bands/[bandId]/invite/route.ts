import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { bandId: string } }
) {
  const bandId = parseInt(params.bandId, 10);
  const { email } = await request.json();

  if (!email || !bandId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: inviteeId, error: lookupError } = await supabase.rpc('get_user_id_by_email', {
    email_arg: email,
  });

  if (lookupError) {
    return NextResponse.json({ error: 'Failed to look up user' }, { status: 500 });
  }

  if (!inviteeId) {
    // Don't reveal whether the email exists — silently succeed
    return NextResponse.json({ success: true });
  }

  if (inviteeId === user.id) {
    return NextResponse.json({ error: 'You cannot invite yourself' }, { status: 400 });
  }

  const { error: insertError } = await supabase.from('band_invitations').insert({
    band_id: bandId,
    invitee_user_id: inviteeId,
    invited_by: user.id,
  });

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'This person has already been invited' }, { status: 409 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
