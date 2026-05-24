import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface ProposalInput {
  song_name: string;
  artist?: string;
  spotify_url?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { bandId: string; voteId: string } }
) {
  const bandId = parseInt(params.bandId, 10);
  const voteId = parseInt(params.voteId, 10);
  const { proposals }: { proposals: ProposalInput[] } = await request.json();

  if (!proposals?.length) {
    return NextResponse.json({ error: 'No proposals provided' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: session, error: sessionError } = await supabase
    .from('vote_sessions')
    .select('status, proposals_per_member')
    .eq('id', voteId)
    .eq('band_id', bandId)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Vote session not found' }, { status: 404 });
  }

  if (session.status !== 'proposing') {
    return NextResponse.json({ error: 'Proposals are closed for this session' }, { status: 400 });
  }

  if (proposals.length > session.proposals_per_member) {
    return NextResponse.json(
      { error: `Cannot submit more than ${session.proposals_per_member} proposals` },
      { status: 400 }
    );
  }

  const { error: deleteError } = await supabase
    .from('vote_proposals')
    .delete()
    .eq('vote_session_id', voteId)
    .eq('user_id', user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const rows = proposals.map((p) => ({
    vote_session_id: voteId,
    band_id: bandId,
    user_id: user.id,
    song_name: p.song_name,
    artist: p.artist ?? null,
    spotify_url: p.spotify_url ?? null,
  }));

  const { error: insertError } = await supabase.from('vote_proposals').insert(rows);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
