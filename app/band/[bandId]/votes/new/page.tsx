'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BandRouteProps } from '../../types';

export default function NewVoteSessionPage({ params }: Readonly<BandRouteProps>) {
  const { bandId } = params;
  const router = useRouter();

  const [name, setName] = useState('');
  const [proposalsPerMember, setProposalsPerMember] = useState(3);
  const [songsToAdd, setSongsToAdd] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/bands/${bandId}/votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        proposals_per_member: proposalsPerMember,
        songs_to_add: songsToAdd,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error ?? 'Failed to create vote session');
      setSubmitting(false);
      return;
    }

    router.push(`/band/${bandId}/votes/${json.data.id}`);
  }

  return (
    <Box sx={{ maxWidth: 520 }}>
      <Typography variant="h6" gutterBottom>
        Set Up a New Vote Session
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Members propose songs, then everyone ranks each person&apos;s proposals against each other.
      </Typography>

      <Paper sx={{ p: 3 }} component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Session name"
            placeholder="e.g. Summer 2025 Song Vote"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            autoFocus
          />

          <TextField
            label="Proposals per member"
            type="number"
            value={proposalsPerMember}
            onChange={(e) => setProposalsPerMember(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1, max: 20 }}
            helperText="How many songs each person can nominate"
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">songs</InputAdornment>,
            }}
          />

          <TextField
            label="Songs to add"
            type="number"
            value={songsToAdd}
            onChange={(e) => setSongsToAdd(Math.max(1, parseInt(e.target.value) || 1))}
            inputProps={{ min: 1, max: 50 }}
            helperText="Target number of songs to add from the results"
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">songs</InputAdornment>,
            }}
          />

          {error && <Alert severity="error">{error}</Alert>}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => router.push(`/band/${bandId}/votes`)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting || !name.trim()}>
              {submitting ? 'Creating…' : 'Create Vote Session'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
