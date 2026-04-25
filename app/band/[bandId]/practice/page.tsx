'use client';

import Loading from '@/components/design/Loading';
import usePracticeProgress from '@/hooks/usePracticeProgress';
import useSongs from '@/hooks/useSongs';
import { createClient } from '@/utils/supabase/client';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BandRouteProps } from '../types';

type PracticeStatus = 'not_ready' | 'passable' | 'ready';
type SortColumn = 'name' | 'status' | 'notes';
type SortDir = 'asc' | 'desc';

const STATUS_ORDER: Record<PracticeStatus, number> = { not_ready: 0, passable: 1, ready: 2 };

interface SongProgress {
  id?: number;
  status: PracticeStatus;
  notes: string;
}

interface ToastState {
  open: boolean;
  severity: 'success' | 'error';
  message: string;
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
  const [sortConfig, setSortConfig] = useState<{ key: SortColumn; direction: SortDir } | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<PracticeStatus | 'all'>('all');
  const [toast, setToast] = useState<ToastState>({ open: false, severity: 'success', message: '' });
  const debounceRefs = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    setProgress(initialProgress);
  }, [initialProgress]);

  useEffect(() => {
    const refs = debounceRefs.current;
    return () => {
      Object.values(refs).forEach(clearTimeout);
    };
  }, []);

  async function save(songId: number, status: PracticeStatus, notes: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setToast({ open: true, severity: 'error', message: 'Not logged in.' });
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
      setToast({ open: true, severity: 'error', message: error.message });
    } else {
      setProgress((prev) => ({
        ...prev,
        [songId]: { ...prev[songId], id: data?.id },
      }));
      setToast({ open: true, severity: 'success', message: 'Changes saved' });
    }
  }

  function handleStatusChange(songId: number, status: PracticeStatus) {
    setProgress((prev) => {
      const updated = { ...prev, [songId]: { ...prev[songId], status } };
      save(songId, status, updated[songId].notes);
      return updated;
    });
  }

  function handleNotesChange(songId: number, notes: string) {
    setProgress((prev) => {
      const updated = { ...prev, [songId]: { ...prev[songId], notes } };
      if (debounceRefs.current[songId]) clearTimeout(debounceRefs.current[songId]);
      debounceRefs.current[songId] = setTimeout(() => {
        save(songId, updated[songId].status, notes);
      }, 700);
      return updated;
    });
  }

  function handleSort(key: SortColumn) {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!songs?.length) {
    return <Typography>No songs have been added to this band yet.</Typography>;
  }

  const rows = songs.map((song) => ({
    song,
    p: progress[song.id] ?? { status: 'not_ready' as PracticeStatus, notes: '' },
  }));

  const filtered =
    statusFilter === 'all' ? rows : rows.filter((r) => r.p.status === statusFilter);

  const sorted = sortConfig
    ? [...filtered].sort((a, b) => {
        let cmp = 0;
        if (sortConfig.key === 'name') {
          const aName = a.song.name ?? '';
          const bName = b.song.name ?? '';
          cmp = aName < bName ? -1 : aName > bName ? 1 : 0;
        } else if (sortConfig.key === 'status') {
          cmp = STATUS_ORDER[a.p.status] - STATUS_ORDER[b.p.status];
        } else if (sortConfig.key === 'notes') {
          const aN = a.p.notes ?? '';
          const bN = b.p.notes ?? '';
          cmp = aN < bN ? -1 : aN > bN ? 1 : 0;
        }
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      })
    : filtered;

  const sortDir = (key: SortColumn) =>
    sortConfig?.key === key ? sortConfig.direction : undefined;

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">
          Filter:
        </Typography>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, value) => value && setStatusFilter(value)}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
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
      </Box>
      <TableContainer component={Paper}>
        <Table aria-label="Practice progress">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig?.key === 'name'}
                  direction={sortDir('name') ?? 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Song
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig?.key === 'status'}
                  direction={sortDir('status') ?? 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Your Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig?.key === 'notes'}
                  direction={sortDir('notes') ?? 'asc'}
                  onClick={() => handleSort('notes')}
                >
                  Notes
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map(({ song, p }) => (
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}
