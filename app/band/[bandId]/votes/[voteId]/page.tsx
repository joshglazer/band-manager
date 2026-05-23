'use client';

import Loading from '@/components/design/Loading';
import useVoteSession from '@/hooks/useVoteSession';
import useBandMembers from '@/hooks/useBandMembers';
import useUserProfiles from '@/hooks/useUserProfiles';
import { VoteProposalWithBallots } from '@/types/composites';
import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

interface PageProps {
  params: { bandId: string; voteId: string };
}

function memberName(
  userId: string,
  profiles: Tables<'user_profiles'>[] | null | undefined
): string {
  const p = profiles?.find((up) => up.user_id === userId);
  if (!p) return 'Unknown member';
  const full = [p.first_name, p.last_name].filter(Boolean).join(' ');
  return full || 'Unknown member';
}

// ─── Proposing phase ────────────────────────────────────────────────────────

interface ProposingPhaseProps {
  bandId: number;
  voteId: number;
  session: Tables<'vote_sessions'>;
  proposals: VoteProposalWithBallots[];
  members: Tables<'band_members'>[];
  profiles: Tables<'user_profiles'>[] | null | undefined;
  currentUserId: string;
  onUpdate: () => void;
}

function ProposingPhase({
  bandId,
  voteId,
  session,
  proposals,
  members,
  profiles,
  currentUserId,
  onUpdate,
}: ProposingPhaseProps) {
  const myProposals = proposals.filter((p) => p.user_id === currentUserId);
  const hasProposed = myProposals.length > 0;

  const [songs, setSongs] = useState<{ song_name: string; artist: string }[]>(
    hasProposed
      ? myProposals.map((p) => ({ song_name: p.song_name, artist: p.artist ?? '' }))
      : Array.from({ length: session.proposals_per_member }, () => ({ song_name: '', artist: '' }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proposedUserIds = new Set(proposals.map((p) => p.user_id));

  function updateSong(index: number, field: 'song_name' | 'artist', value: string) {
    setSongs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  async function handleSubmitProposals(e: React.FormEvent) {
    e.preventDefault();
    const valid = songs.filter((s) => s.song_name.trim());
    if (!valid.length) return;

    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/bands/${bandId}/votes/${voteId}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposals: valid }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? 'Failed to submit proposals');
    } else {
      onUpdate();
    }
    setSubmitting(false);
  }

  async function handleAdvance() {
    setAdvancing(true);
    const res = await fetch(`/api/bands/${bandId}/votes/${voteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'advance' }),
    });
    if (res.ok) {
      onUpdate();
    }
    setAdvancing(false);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Who has proposed */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Proposal Status
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {members.map((m) => {
            const proposed = proposedUserIds.has(m.user_id);
            return (
              <Box key={m.user_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {proposed ? (
                  <CheckCircleIcon fontSize="small" color="success" />
                ) : (
                  <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
                )}
                <Typography variant="body2">{memberName(m.user_id, profiles)}</Typography>
                {proposed && (
                  <Typography variant="caption" color="text.secondary">
                    ({proposals.filter((p) => p.user_id === m.user_id).length} song
                    {proposals.filter((p) => p.user_id === m.user_id).length !== 1 ? 's' : ''})
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Proposal form */}
      <Paper sx={{ p: 2.5 }} component="form" onSubmit={handleSubmitProposals}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {hasProposed ? 'Update your proposals' : 'Submit your proposals'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Propose up to {session.proposals_per_member} song
          {session.proposals_per_member !== 1 ? 's' : ''} you&apos;d like the band to learn.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          {songs.map((song, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ pt: 2, minWidth: 20, textAlign: 'right' }}
              >
                {i + 1}.
              </Typography>
              <TextField
                label="Song name"
                size="small"
                value={song.song_name}
                onChange={(e) => updateSong(i, 'song_name', e.target.value)}
                sx={{ flex: 2 }}
              />
              <TextField
                label="Artist"
                size="small"
                value={song.artist}
                onChange={(e) => updateSong(i, 'artist', e.target.value)}
                sx={{ flex: 1 }}
              />
            </Box>
          ))}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !songs.some((s) => s.song_name.trim())}
          >
            {submitting ? 'Saving…' : hasProposed ? 'Update proposals' : 'Submit proposals'}
          </Button>
        </Box>
      </Paper>

      {/* Advance to voting */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleAdvance}
          disabled={advancing || proposals.length === 0}
        >
          {advancing ? 'Opening voting…' : 'Open voting →'}
        </Button>
      </Box>
    </Box>
  );
}

// ─── Voting phase ────────────────────────────────────────────────────────────

interface VotingPhaseProps {
  bandId: number;
  voteId: number;
  session: Tables<'vote_sessions'>;
  proposals: VoteProposalWithBallots[];
  members: Tables<'band_members'>[];
  profiles: Tables<'user_profiles'>[] | null | undefined;
  currentUserId: string;
  onUpdate: () => void;
}

interface BallotEntry {
  proposal_id: number;
  rank: number;
}

function VotingPhase({
  bandId,
  voteId,
  session,
  proposals,
  members,
  profiles,
  currentUserId,
  onUpdate,
}: VotingPhaseProps) {
  const allBallots = proposals.flatMap((p) => p.vote_ballots);
  const votedUserIds = new Set(allBallots.map((b) => b.user_id));
  const myBallots = allBallots.filter((b) => b.user_id === currentUserId);
  const hasVoted = myBallots.length > 0;

  const initialBallot: BallotEntry[] = hasVoted
    ? myBallots
        .sort((a, b) => a.rank - b.rank)
        .map((b) => ({ proposal_id: b.proposal_id, rank: b.rank }))
    : [];

  const [ballot, setBallot] = useState<BallotEntry[]>(initialBallot);
  const [submitting, setSubmitting] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rankedProposalIds = new Set(ballot.map((b) => b.proposal_id));
  const maxRank = session.votes_per_member;

  function addToBallot(proposalId: number) {
    if (ballot.length >= maxRank) return;
    const nextRank = ballot.length + 1;
    setBallot((prev) => [...prev, { proposal_id: proposalId, rank: nextRank }]);
  }

  function removeFromBallot(proposalId: number) {
    setBallot((prev) => {
      const filtered = prev.filter((b) => b.proposal_id !== proposalId);
      return filtered.map((b, i) => ({ ...b, rank: i + 1 }));
    });
  }

  function moveUp(proposalId: number) {
    setBallot((prev) => {
      const idx = prev.findIndex((b) => b.proposal_id === proposalId);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next.map((b, i) => ({ ...b, rank: i + 1 }));
    });
  }

  function moveDown(proposalId: number) {
    setBallot((prev) => {
      const idx = prev.findIndex((b) => b.proposal_id === proposalId);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next.map((b, i) => ({ ...b, rank: i + 1 }));
    });
  }

  async function handleSubmitBallot(e: React.FormEvent) {
    e.preventDefault();
    if (!ballot.length) return;

    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/bands/${bandId}/votes/${voteId}/ballots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ballot }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? 'Failed to submit ballot');
    } else {
      onUpdate();
    }
    setSubmitting(false);
  }

  async function handleAdvance() {
    setAdvancing(true);
    const res = await fetch(`/api/bands/${bandId}/votes/${voteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'advance' }),
    });
    if (res.ok) onUpdate();
    setAdvancing(false);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Voting status */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Voting Status
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {members.map((m) => {
            const voted = votedUserIds.has(m.user_id);
            return (
              <Box key={m.user_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {voted ? (
                  <CheckCircleIcon fontSize="small" color="success" />
                ) : (
                  <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
                )}
                <Typography variant="body2">{memberName(m.user_id, profiles)}</Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Ballot builder */}
      <Paper sx={{ p: 2.5 }} component="form" onSubmit={handleSubmitBallot}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {hasVoted ? 'Update your ballot' : 'Cast your ballot'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Rank up to {maxRank} song{maxRank !== 1 ? 's' : ''} in order of preference (1st = top
          choice). Click a song to add it; use ↑↓ to reorder.
        </Typography>

        {/* Current ranked ballot */}
        {ballot.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Your ranked ballot ({ballot.length}/{maxRank})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {ballot.map((entry, i) => {
                const proposal = proposals.find((p) => p.id === entry.proposal_id);
                if (!proposal) return null;
                return (
                  <Paper
                    key={entry.proposal_id}
                    variant="outlined"
                    sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="primary"
                      sx={{ minWidth: 28 }}
                    >
                      #{i + 1}
                    </Typography>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {proposal.song_name}
                      </Typography>
                      {proposal.artist && (
                        <Typography variant="caption" color="text.secondary">
                          {proposal.artist}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Move up">
                        <span>
                          <IconButton size="small" onClick={() => moveUp(entry.proposal_id)} disabled={i === 0}>
                            ↑
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move down">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => moveDown(entry.proposal_id)}
                            disabled={i === ballot.length - 1}
                          >
                            ↓
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Remove">
                        <IconButton size="small" onClick={() => removeFromBallot(entry.proposal_id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}

        {/* All proposals to pick from */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          All proposed songs
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {proposals.map((proposal) => {
            const inBallot = rankedProposalIds.has(proposal.id);
            const ballotFull = ballot.length >= maxRank;
            return (
              <Paper
                key={proposal.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  opacity: inBallot ? 0.5 : 1,
                  bgcolor: inBallot ? 'action.selected' : undefined,
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    {proposal.song_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {proposal.artist && `${proposal.artist} · `}
                    proposed by {memberName(proposal.user_id, profiles)}
                  </Typography>
                </Box>
                {inBallot ? (
                  <Chip
                    label={`#${ballot.find((b) => b.proposal_id === proposal.id)?.rank}`}
                    size="small"
                    color="primary"
                  />
                ) : (
                  <Tooltip title={ballotFull ? `Ballot full (${maxRank} max)` : 'Add to ballot'}>
                    <span>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => addToBallot(proposal.id)}
                        disabled={ballotFull}
                      >
                        Add
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </Paper>
            );
          })}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Button
          type="submit"
          variant="contained"
          disabled={submitting || ballot.length === 0}
        >
          {submitting ? 'Saving…' : hasVoted ? 'Update ballot' : 'Submit ballot'}
        </Button>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleAdvance}
          disabled={advancing || allBallots.length === 0}
        >
          {advancing ? 'Tallying…' : 'Close voting & see results →'}
        </Button>
      </Box>
    </Box>
  );
}

// ─── Results phase ───────────────────────────────────────────────────────────

interface ResultsPhaseProps {
  session: Tables<'vote_sessions'>;
  proposals: VoteProposalWithBallots[];
  members: Tables<'band_members'>[];
  profiles: Tables<'user_profiles'>[] | null | undefined;
}

function bordaScores(
  proposals: VoteProposalWithBallots[],
  votesPerMember: number
): { proposal: VoteProposalWithBallots; score: number }[] {
  const allBallots = proposals.flatMap((p) => p.vote_ballots);
  return proposals
    .map((proposal) => {
      const score = allBallots
        .filter((b) => b.proposal_id === proposal.id)
        .reduce((sum, b) => sum + (votesPerMember - b.rank + 1), 0);
      return { proposal, score };
    })
    .sort((a, b) => b.score - a.score);
}

function topSongPerMember(
  members: Tables<'band_members'>[],
  proposals: VoteProposalWithBallots[]
): { userId: string; topProposal: VoteProposalWithBallots | null }[] {
  const allBallots = proposals.flatMap((p) => p.vote_ballots);
  return members.map((m) => {
    const memberBallots = allBallots
      .filter((b) => b.user_id === m.user_id)
      .sort((a, b) => a.rank - b.rank);
    const top = memberBallots[0];
    const topProposal = top ? (proposals.find((p) => p.id === top.proposal_id) ?? null) : null;
    return { userId: m.user_id, topProposal };
  });
}

function ResultsPhase({ session, proposals, members, profiles }: ResultsPhaseProps) {
  const ranked = useMemo(
    () => bordaScores(proposals, session.votes_per_member),
    [proposals, session.votes_per_member]
  );

  const perMember = useMemo(
    () => topSongPerMember(members, proposals),
    [members, proposals]
  );

  const totalVoters = new Set(
    proposals.flatMap((p) => p.vote_ballots.map((b) => b.user_id))
  ).size;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Overall ranking */}
      <Paper sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <EmojiEventsIcon color="warning" />
          <Typography variant="subtitle1" fontWeight={700}>
            Top {session.songs_to_add} Song{session.songs_to_add !== 1 ? 's' : ''} to Add
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ({totalVoters} voter{totalVoters !== 1 ? 's' : ''} · Borda count)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {ranked.slice(0, session.songs_to_add).map((item, i) => (
            <Paper
              key={item.proposal.id}
              variant="outlined"
              sx={{
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                bgcolor: i === 0 ? 'warning.50' : undefined,
              }}
            >
              <Typography variant="h6" color={i === 0 ? 'warning.main' : 'text.secondary'} sx={{ minWidth: 32 }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" fontWeight={600}>
                  {item.proposal.song_name}
                </Typography>
                {item.proposal.artist && (
                  <Typography variant="body2" color="text.secondary">
                    {item.proposal.artist}
                  </Typography>
                )}
              </Box>
              <Chip label={`${item.score} pts`} size="small" variant="outlined" />
            </Paper>
          ))}
        </Box>

        {ranked.length > session.songs_to_add && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Remaining songs
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {ranked.slice(session.songs_to_add).map((item, i) => (
                <Box
                  key={item.proposal.id}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 32 }}>
                    #{i + session.songs_to_add + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {item.proposal.song_name}
                    {item.proposal.artist && (
                      <Typography component="span" variant="body2" color="text.secondary">
                        {' '}· {item.proposal.artist}
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.score} pts
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        )}
      </Paper>

      {/* Top song per member */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Each Member&apos;s Top Pick
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {perMember.map(({ userId, topProposal }) => (
            <Box key={userId} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
              <Typography variant="body2" fontWeight={500} sx={{ minWidth: 140 }}>
                {memberName(userId, profiles)}
              </Typography>
              {topProposal ? (
                <Typography variant="body2">
                  {topProposal.song_name}
                  {topProposal.artist && (
                    <Typography component="span" variant="body2" color="text.secondary">
                      {' '}· {topProposal.artist}
                    </Typography>
                  )}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">
                  Did not vote
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  proposing: 'Proposing',
  voting: 'Voting Open',
  completed: 'Completed',
};

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success'> = {
  proposing: 'warning',
  voting: 'info',
  completed: 'success',
};

export default function VoteSessionPage({ params }: PageProps) {
  const bandId = +params.bandId;
  const voteId = +params.voteId;

  const { data: session, isLoading, mutate } = useVoteSession({ voteSessionId: voteId });
  const { data: members, isLoading: loadingMembers } = useBandMembers({ bandId });

  const memberUserIds = useMemo(() => members?.map((m) => m.user_id) ?? [], [members]);
  const { data: profiles, isLoading: loadingProfiles } = useUserProfiles({
    userIds: memberUserIds,
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  if (isLoading || loadingMembers || loadingProfiles || !currentUserId) {
    return <Loading />;
  }

  if (!session) {
    return <Typography>Vote session not found.</Typography>;
  }

  const proposals = session.vote_proposals ?? [];

  const statusColor = STATUS_COLORS[session.status];
  const statusLabel = STATUS_LABELS[session.status];

  return (
    <>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h6" fontWeight={700}>
              {session.name}
            </Typography>
            <Chip label={statusLabel} color={statusColor} size="small" />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {session.proposals_per_member} proposals per member · {session.votes_per_member} votes
            per member · {session.songs_to_add} songs to add
          </Typography>
        </Box>
        <Button component={Link} href={`/band/${bandId}/votes`} variant="text" size="small">
          ← All sessions
        </Button>
      </Box>

      {session.status === 'proposing' && (
        <ProposingPhase
          bandId={bandId}
          voteId={voteId}
          session={session}
          proposals={proposals}
          members={members ?? []}
          profiles={profiles}
          currentUserId={currentUserId}
          onUpdate={mutate}
        />
      )}

      {session.status === 'voting' && (
        <VotingPhase
          bandId={bandId}
          voteId={voteId}
          session={session}
          proposals={proposals}
          members={members ?? []}
          profiles={profiles}
          currentUserId={currentUserId}
          onUpdate={mutate}
        />
      )}

      {session.status === 'completed' && (
        <ResultsPhase
          session={session}
          proposals={proposals}
          members={members ?? []}
          profiles={profiles}
        />
      )}
    </>
  );
}
