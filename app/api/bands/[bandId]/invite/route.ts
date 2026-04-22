import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
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

  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: userList, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    return NextResponse.json({ error: 'Failed to look up user' }, { status: 500 });
  }

  const invitee = userList.users.find((u) => u.email === email);
  if (!invitee) {
    // Don't reveal whether the email exists — silently succeed
    return NextResponse.json({ success: true });
  }

  if (invitee.id === user.id) {
    return NextResponse.json({ error: 'You cannot invite yourself' }, { status: 400 });
  }

  const { error: insertError } = await supabase.from('band_invitations').insert({
    band_id: bandId,
    invitee_user_id: invitee.id,
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
