import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const STATUS_TRANSITIONS: Record<string, string> = {
  proposing: 'voting',
  voting: 'completed',
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { bandId: string; voteId: string } }
) {
  const bandId = parseInt(params.bandId, 10);
  const voteId = parseInt(params.voteId, 10);
  const { action } = await request.json();

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: session, error: fetchError } = await supabase
    .from('vote_sessions')
    .select('status')
    .eq('id', voteId)
    .eq('band_id', bandId)
    .single();

  if (fetchError || !session) {
    return NextResponse.json({ error: 'Vote session not found' }, { status: 404 });
  }

  if (action === 'advance') {
    const nextStatus = STATUS_TRANSITIONS[session.status];
    if (!nextStatus) {
      return NextResponse.json({ error: 'Session is already completed' }, { status: 400 });
    }

    const { error } = await supabase
      .from('vote_sessions')
      .update({ status: nextStatus })
      .eq('id', voteId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ status: nextStatus });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
