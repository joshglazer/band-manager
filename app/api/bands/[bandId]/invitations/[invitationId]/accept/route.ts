import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _request: NextRequest,
  { params }: { params: { bandId: string; invitationId: string } }
) {
  const invitationId = parseInt(params.invitationId, 10);

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // The RPC function validates ownership and pending status, inserts into
  // band_members, and marks the invitation accepted — all with security definer
  // so band_members RLS doesn't block a user who isn't yet a member.
  const { error } = await supabase.rpc('accept_band_invitation', {
    invitation_id_arg: invitationId,
  });

  if (error) {
    const status = error.code === 'P0001' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ success: true });
}
