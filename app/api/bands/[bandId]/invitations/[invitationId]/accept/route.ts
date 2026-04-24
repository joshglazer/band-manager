import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: { bandId: string; invitationId: string } }
) {
  const bandId = parseInt(params.bandId, 10);
  const invitationId = parseInt(params.invitationId, 10);

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify the invitation exists, belongs to this band, and is addressed to the current user.
  // Using the regular client here so RLS acts as a second layer of defence.
  const { data: invitation, error: invitationError } = await supabase
    .from('band_invitations')
    .select('id')
    .eq('id', invitationId)
    .eq('band_id', bandId)
    .eq('invitee_user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (invitationError || !invitation) {
    return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
  }

  // Use the admin client for writes so RLS on band_members/band_invitations doesn't
  // block a user who isn't yet a member of the band.
  const admin = createAdminClient();

  const { error: memberError } = await admin
    .from('band_members')
    .insert({ band_id: bandId, user_id: user.id });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  const { error: updateError } = await admin
    .from('band_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitationId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
