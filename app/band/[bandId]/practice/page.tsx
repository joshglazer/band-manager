'use client';

import Loading from '@/components/design/Loading';
import usePracticeProgress from '@/hooks/usePracticeProgress';
import useSongs from '@/hooks/useSongs';
import { createClient } from '@/utils/supabase/client';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { LoadingButton } from '@mui/lab';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { BandRouteProps } from '../types';

type PracticeStatus = 'not_ready' | 'passable' | 'ready';
type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface SongProgress {
  id?: number;
  status: PracticeStatus;
  notes: string;
  saveState: SaveState;
  errorMessage?: string;
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
        saveState: 'idle',
      };
    }
    return map;
  }, [songs, practiceRows]);

  const [progress, setProgress] = useState<Record<number, SongProgress>>({});

  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  async function save(songId: number, status: PracticeStatus, notes: string) {
    setProgress((prev) => ({
      ...prev,
      [songId]: { ...prev[songId], saveState: 'saving' },
    }));

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setProgress((prev) => ({
        ...prev,
        [songId]: { ...prev[songId], saveState: 'error', errorMessage: 'Not logged in.' },
      }));
      return;
    }

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

    if (error) {
      setProgress((prev) => ({
        ...prev,
        [songId]: { ...prev[songId], saveState: 'error', errorMessage: error.message },
      }));
    } else {
      setProgress((prev) => ({
        ...prev,
        [songId]: { ...prev[songId], id: data?.id, saveState: 'saved', errorMessage: undefined },
      }));
    }
  }

  function handleStatusChange(songId: number, status: PracticeStatus) {
    setProgress((prev) => ({
      ...prev,
      [songId]: { ...prev[songId], status, saveState: 'idle' },
    }));
  }

  function handleNotesChange(songId: number, notes: string) {
    setProgress((prev) => ({
      ...prev,
      [songId]: { ...prev[songId], notes, saveState: 'idle' },
    }));
  }

  function handleSave(songId: number) {
    const p = progress[songId];
    if (p) {
      save(songId, p.status, p.notes);
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
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {songs.map((song) => {
            const p = progress[song.id] ?? {
              status: 'not_ready' as PracticeStatus,
              notes: '',
              saveState: 'idle' as SaveState,
            };
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
                    placeholder="Quick note to yourself..."
                    size="small"
                    fullWidth
                    multiline
                    maxRows={3}
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {p.saveState === 'saved' && (
                    <Tooltip title="Saved">
                      <CheckCircleOutlineIcon color="success" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    </Tooltip>
                  )}
                  {p.saveState === 'error' && (
                    <Tooltip title={p.errorMessage ?? 'Save failed'}>
                      <ErrorOutlineIcon color="error" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    </Tooltip>
                  )}
                  <LoadingButton
                    variant="contained"
                    size="small"
                    loading={p.saveState === 'saving'}
                    onClick={() => handleSave(song.id)}
                  >
                    Save
                  </LoadingButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
