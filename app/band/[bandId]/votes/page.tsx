'use client';

import Loading from '@/components/design/Loading';
import useVoteSessions from '@/hooks/useVoteSessions';
import AddIcon from '@mui/icons-material/Add';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { BandRouteProps } from '../types';

const STATUS_LABELS: Record<string, string> = {
  proposing: 'Proposing',
  voting: 'Voting',
  completed: 'Completed',
};

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success'> = {
  proposing: 'warning',
  voting: 'info',
  completed: 'success',
};

export default function VotesPage({ params }: Readonly<BandRouteProps>) {
  const { bandId } = params;
  const { data: sessions, isLoading } = useVoteSessions({ bandId: +bandId });

  if (isLoading) return <Loading />;

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Song Vote Sessions</Typography>
        <Button
          component={Link}
          href={`/band/${bandId}/votes/new`}
          variant="contained"
          startIcon={<AddIcon />}
        >
          New Vote Session
        </Button>
      </Box>

      {!sessions?.length ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <HowToVoteIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary" gutterBottom>
            No vote sessions yet.
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Start one to let your band propose and vote on new songs to learn.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sessions.map((session) => (
            <Paper
              key={session.id}
              component={Link}
              href={`/band/${bandId}/votes/${session.id}`}
              sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { bgcolor: 'action.hover' },
                cursor: 'pointer',
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {session.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {session.proposals_per_member} proposals per member ·{' '}
                  {session.songs_to_add} songs to add
                </Typography>
              </Box>
              <Chip
                label={STATUS_LABELS[session.status]}
                color={STATUS_COLORS[session.status]}
                size="small"
              />
            </Paper>
          ))}
        </Box>
      )}
    </>
  );
}
