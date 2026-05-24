import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface BallotEntry {
  proposal_id: number;
  proposer_id: string;
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
    .select('status, band_id')
    .eq('id', voteId)
    .eq('band_id', bandId)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Vote session not found' }, { status: 404 });
  }

  if (session.status !== 'voting') {
    return NextResponse.json({ error: 'Voting is not open for this session' }, { status: 400 });
  }

  // Validate: within each proposer's group, ranks must be consecutive from 1..N
  const byProposer = new Map<string, BallotEntry[]>();
  for (const entry of ballot) {
    const group = byProposer.get(entry.proposer_id) ?? [];
    group.push(entry);
    byProposer.set(entry.proposer_id, group);
  }

  for (const [proposerId, entries] of Array.from(byProposer.entries())) {
    const ranks = entries.map((e) => e.rank).sort((a, b) => a - b);
    for (let i = 0; i < ranks.length; i++) {
      if (ranks[i] !== i + 1) {
        return NextResponse.json(
          { error: `Invalid ranks for proposer ${proposerId}: must be consecutive from 1` },
          { status: 400 }
        );
      }
    }
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
    proposer_id: b.proposer_id,
    user_id: user.id,
    rank: b.rank,
  }));

  const { error: insertError } = await supabase.from('vote_ballots').insert(rows);

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
