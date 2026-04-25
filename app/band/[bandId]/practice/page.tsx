'use client';

import Loading from '@/components/design/Loading';
import usePracticeProgress from '@/hooks/usePracticeProgress';
import useSongs from '@/hooks/useSongs';
import { createClient } from '@/utils/supabase/client';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { BandRouteProps } from '../types';

type PracticeStatus = 'not_ready' | 'passable' | 'ready';

interface SongProgress {
  id?: number;
  status: PracticeStatus;
  notes: string;
}

export default function BandPracticePage({ params }: Readonly<BandRouteProps>) {
  const { bandId } = params;
  const supabase = createClient();

  const { data: songs, isLoading: songsLoading } = useSongs({ bandId });
  const { data: practiceRows, isLoading: progressLoading } = usePracticeProgress({
    bandId: +bandId,
  });

  const isLoading = songsLoading || progressLoading;

  const initialProgress = useMemo<Record<number, SongProgress>>(() => {
    if (!songs) return {};
    const map: Record<number, SongProgress> = {};
    for (const song of songs) {
      const pp = practiceRows?.find((r) => r.song_id === song.id);
      map[song.id] = {
        id: pp?.id,
        status: (pp?.status as PracticeStatus) ?? 'not_ready',
        notes: pp?.notes ?? '',
      };
    }
    return map;
  }, [songs, practiceRows]);

  const [progress, setProgress] = useState<Record<number, SongProgress>>({});

  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  async function upsert(songId: number, status: PracticeStatus, notes: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('practice_progress')
      .upsert(
        {
          song_id: songId,
          user_id: user.id,
          band_id: +bandId,
          status,
          notes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'song_id,user_id' }
      )
      .select('id')
      .single();

    if (!error && data) {
      setProgress((prev) => ({
        ...prev,
        [songId]: { ...prev[songId], id: data.id },
      }));
    }
  }

  function handleStatusChange(songId: number, status: PracticeStatus) {
    setProgress((prev) => ({
      ...prev,
      [songId]: { ...prev[songId], status },
    }));
    upsert(songId, status, progress[songId]?.notes ?? '');
  }

  function handleNotesChange(songId: number, notes: string) {
    setProgress((prev) => ({
      ...prev,
      [songId]: { ...prev[songId], notes },
    }));
  }

  function handleNotesBlur(songId: number) {
    const p = progress[songId];
    if (p) {
      upsert(songId, p.status, p.notes);
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!songs?.length) {
    return <Typography>No songs have been added to this band yet.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table aria-label="Practice progress">
        <TableHead>
          <TableRow>
            <TableCell>Song</TableCell>
            <TableCell>Your Status</TableCell>
            <TableCell>Notes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {songs.map((song) => {
            const p = progress[song.id] ?? { status: 'not_ready' as PracticeStatus, notes: '' };
            return (
              <TableRow key={song.id}>
                <TableCell component="th" scope="row">
                  <Typography fontWeight={600}>{song.name}</Typography>
                  {song.artist && (
                    <Typography variant="body2" color="text.secondary">
                      {song.artist}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <ToggleButtonGroup
                    value={p.status}
                    exclusive
                    onChange={(_, value: PracticeStatus | null) =>
                      value && handleStatusChange(song.id, value)
                    }
                    size="small"
                  >
                    <ToggleButton value="not_ready" color="error">
                      Not Ready
                    </ToggleButton>
                    <ToggleButton value="passable" color="warning">
                      Passable
                    </ToggleButton>
                    <ToggleButton value="ready" color="success">
                      Ready
                    </ToggleButton>
                  </ToggleButtonGroup>
                </TableCell>
                <TableCell sx={{ minWidth: 260 }}>
                  <TextField
                    value={p.notes}
                    onChange={(e) => handleNotesChange(song.id, e.target.value)}
                    onBlur={() => handleNotesBlur(song.id)}
                    placeholder="Quick note to yourself..."
                    size="small"
                    fullWidth
                    multiline
                    maxRows={3}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
