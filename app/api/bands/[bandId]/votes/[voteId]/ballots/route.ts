import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface BallotEntry {
  proposal_id: number;
  rank: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { bandId: string; voteId: string } }
) {
  const bandId = parseInt(params.bandId, 10);
  const voteId = parseInt(params.voteId, 10);
  const { ballot }: { ballot: BallotEntry[] } = await request.json();

  if (!ballot?.length) {
    return NextResponse.json({ error: 'No ballot provided' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: session, error: sessionError } = await supabase
    .from('vote_sessions')
    .select('status, votes_per_member, band_id')
    .eq('id', voteId)
    .eq('band_id', bandId)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Vote session not found' }, { status: 404 });
  }

  if (session.status !== 'voting') {
    return NextResponse.json({ error: 'Voting is not open for this session' }, { status: 400 });
  }

  if (ballot.length > session.votes_per_member) {
    return NextResponse.json(
      { error: `Cannot cast more than ${session.votes_per_member} votes` },
      { status: 400 }
    );
  }

  const ranks = ballot.map((b) => b.rank);
  const uniqueRanks = new Set(ranks);
  if (uniqueRanks.size !== ranks.length) {
    return NextResponse.json({ error: 'Duplicate ranks in ballot' }, { status: 400 });
  }

  const { error: deleteError } = await supabase
    .from('vote_ballots')
    .delete()
    .eq('vote_session_id', voteId)
    .eq('user_id', user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const rows = ballot.map((b) => ({
    vote_session_id: voteId,
    proposal_id: b.proposal_id,
    user_id: user.id,
    rank: b.rank,
  }));

  const { error: insertError } = await supabase.from('vote_ballots').insert(rows);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
