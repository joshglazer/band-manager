'use client';

import Loading from '@/components/design/Loading';
import useVoteSession from '@/hooks/useVoteSession';
import useBandMembers from '@/hooks/useBandMembers';
import useUserProfiles from '@/hooks/useUserProfiles';
import { VoteProposalWithBallots } from '@/types/composites';
import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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
    if (res.ok) onUpdate();
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
            const memberProposals = proposals.filter((p) => p.user_id === m.user_id);
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
                    ({memberProposals.length} song{memberProposals.length !== 1 ? 's' : ''})
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
          Nominate up to {session.proposals_per_member} song
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

        <Button
          type="submit"
          variant="contained"
          disabled={submitting || !songs.some((s) => s.song_name.trim())}
        >
          {submitting ? 'Saving…' : hasProposed ? 'Update proposals' : 'Submit proposals'}
        </Button>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
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

interface RankedGroup {
  proposerId: string;
  /** proposal ids in rank order (index 0 = rank 1) */
  orderedIds: number[];
}

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

function VotingPhase({
  bandId,
  voteId,
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

  // Group proposals by proposer
  const proposerGroups = useMemo(() => {
    const grouped = new Map<string, VoteProposalWithBallots[]>();
    for (const p of proposals) {
      const list = grouped.get(p.user_id) ?? [];
      list.push(p);
      grouped.set(p.user_id, list);
    }
    return grouped;
  }, [proposals]);

  // Build initial ranked state per group
  const initialGroups = useMemo((): RankedGroup[] => {
    return Array.from(proposerGroups.entries()).map(([proposerId, groupProposals]) => {
      if (hasVoted) {
        // Restore from existing ballots
        const sorted = groupProposals
          .map((p) => {
            const ballot = myBallots.find((b) => b.proposal_id === p.id);
            return { id: p.id, rank: ballot?.rank ?? 999 };
          })
          .sort((a, b) => a.rank - b.rank);
        return { proposerId, orderedIds: sorted.map((s) => s.id) };
      }
      return { proposerId, orderedIds: groupProposals.map((p) => p.id) };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [groups, setGroups] = useState<RankedGroup[]>(initialGroups);
  const [submitting, setSubmitting] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function moveInGroup(proposerId: string, proposalId: number, direction: -1 | 1) {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.proposerId !== proposerId) return g;
        const idx = g.orderedIds.indexOf(proposalId);
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= g.orderedIds.length) return g;
        const next = [...g.orderedIds];
        [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
        return { ...g, orderedIds: next };
      })
    );
  }

  async function handleSubmitBallot(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const ballot = groups.flatMap((g) =>
      g.orderedIds.map((proposalId, i) => ({
        proposal_id: proposalId,
        proposer_id: g.proposerId,
        rank: i + 1,
      }))
    );

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
      {/* Who has voted */}
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

      {/* Ballot — one section per proposer */}
      <Paper sx={{ p: 2.5 }} component="form" onSubmit={handleSubmitBallot}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {hasVoted ? 'Update your ballot' : 'Cast your ballot'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          For each member&apos;s nominations, drag or use ↑↓ to rank their songs from most to least
          preferred. Rank 1 = your top choice within that person&apos;s list.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {groups.map((group) => {
            const groupProposals = proposerGroups.get(group.proposerId) ?? [];
            const name = memberName(group.proposerId, profiles);
            return (
              <Box key={group.proposerId}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {name}&apos;s nominations
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {group.orderedIds.map((proposalId, i) => {
                    const proposal = groupProposals.find((p) => p.id === proposalId);
                    if (!proposal) return null;
                    return (
                      <Paper
                        key={proposalId}
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
                        <Box sx={{ display: 'flex' }}>
                          <Tooltip title="Move up (more preferred)">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => moveInGroup(group.proposerId, proposalId, -1)}
                                disabled={i === 0}
                              >
                                ↑
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Move down (less preferred)">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => moveInGroup(group.proposerId, proposalId, 1)}
                                disabled={i === group.orderedIds.length - 1}
                              >
                                ↓
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2, mb: 1 }}>{error}</Alert>}

        <Box sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={submitting || groups.length === 0}>
            {submitting ? 'Saving…' : hasVoted ? 'Update ballot' : 'Submit ballot'}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
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

interface RankedProposal {
  proposal: VoteProposalWithBallots;
  avgRank: number;
  voteCount: number;
}

function rankProposalsForProposer(
  proposerProposals: VoteProposalWithBallots[]
): RankedProposal[] {
  return proposerProposals
    .map((proposal) => {
      const ballots = proposal.vote_ballots;
      const voteCount = ballots.length;
      const avgRank =
        voteCount > 0
          ? ballots.reduce((sum, b) => sum + b.rank, 0) / voteCount
          : Infinity;
      return { proposal, avgRank, voteCount };
    })
    .sort((a, b) => a.avgRank - b.avgRank);
}

function ResultsPhase({ proposals, members, profiles }: ResultsPhaseProps) {
  // Group by proposer
  const proposerGroups = useMemo(() => {
    const grouped = new Map<string, VoteProposalWithBallots[]>();
    for (const p of proposals) {
      const list = grouped.get(p.user_id) ?? [];
      list.push(p);
      grouped.set(p.user_id, list);
    }
    return grouped;
  }, [proposals]);

  const totalVoters = new Set(
    proposals.flatMap((p) => p.vote_ballots.map((b) => b.user_id))
  ).size;

  // Build ordered results per proposer
  const proposerResults = useMemo(() => {
    return members
      .filter((m) => proposerGroups.has(m.user_id))
      .map((m) => ({
        userId: m.user_id,
        ranked: rankProposalsForProposer(proposerGroups.get(m.user_id) ?? []),
      }));
  }, [members, proposerGroups]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <EmojiEventsIcon color="warning" />
        <Typography variant="h6" fontWeight={700}>
          Results
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ({totalVoters} voter{totalVoters !== 1 ? 's' : ''} · average rank per group, lower = more preferred)
        </Typography>
      </Box>

      {/* Winner summary */}
      <Paper sx={{ p: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Top pick per member
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The song from each member&apos;s nominations that the band ranked highest on average.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {proposerResults.map(({ userId, ranked }) => {
            const winner = ranked[0];
            return (
              <Box key={userId} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0.5 }}>
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 140 }}>
                  {memberName(userId, profiles)}
                </Typography>
                {winner ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      {winner.proposal.song_name}
                      {winner.proposal.artist && (
                        <Typography component="span" variant="body2" color="text.secondary">
                          {' '}· {winner.proposal.artist}
                        </Typography>
                      )}
                    </Typography>
                    {winner.voteCount > 0 && (
                      <Chip
                        label={`avg rank ${winner.avgRank.toFixed(1)}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    No proposals
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Full breakdown per proposer */}
      {proposerResults.map(({ userId, ranked }) => (
        <Paper key={userId} sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            {memberName(userId, profiles)}&apos;s nominations — full ranking
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {ranked.map((item, i) => (
              <Paper
                key={item.proposal.id}
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: i === 0 ? 'success.50' : undefined,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={i === 0 ? 'success.main' : 'text.secondary'}
                  sx={{ minWidth: 28 }}
                >
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={i === 0 ? 600 : 400}>
                    {item.proposal.song_name}
                  </Typography>
                  {item.proposal.artist && (
                    <Typography variant="caption" color="text.secondary">
                      {item.proposal.artist}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {item.voteCount > 0 ? (
                    <>
                      <Typography variant="caption" color="text.secondary">
                        avg rank {item.avgRank.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.voteCount} vote{item.voteCount !== 1 ? 's' : ''}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No votes
                    </Typography>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
          {ranked.length > 1 && (
            <Divider sx={{ mt: 2, mb: 1 }} />
          )}
        </Paper>
      ))}
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

  return (
    <>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 3,
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography variant="h6" fontWeight={700}>
              {session.name}
            </Typography>
            <Chip
              label={STATUS_LABELS[session.status]}
              color={STATUS_COLORS[session.status]}
              size="small"
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {session.proposals_per_member} nominations per member · {session.songs_to_add} songs to
            add
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
