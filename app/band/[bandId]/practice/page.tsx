'use client';

import SongLinkIcon from '@/components/SongLinkIcon';
import SpotifyConnectBanner from '@/components/SpotifyConnectBanner';
import SpotifyEmbedPlayer from '@/components/SpotifyEmbedPlayer';
import Loading from '@/components/design/Loading';
import SharedBandNotesViewModal from '@/components/modals/SharedBandNotesViewModal';
import usePracticeProgress from '@/hooks/usePracticeProgress';
import useSetlists from '@/hooks/useSetlists';
import useSongs from '@/hooks/useSongs';
import { createClient } from '@/utils/supabase/client';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
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
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const setlistParam = searchParams.get('setlist');

  const { data: songs, isLoading: songsLoading } = useSongs({ bandId });
  const { data: practiceRows, isLoading: progressLoading } = usePracticeProgress({
    bandId: +bandId,
  });
  const { data: setlists, isLoading: setlistsLoading } = useSetlists({ bandId: +bandId });

  const isLoading = songsLoading || progressLoading || setlistsLoading;

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
    { key: 'name', direction: 'asc' }
  );
  const [statusFilter, setStatusFilter] = useState<PracticeStatus[]>([]);
  const [setlistFilter, setSetlistFilter] = useState<number | ''>(
    setlistParam ? +setlistParam : ''
  );
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

  const setlistOrderMap = useMemo<Map<number, number>>(() => {
    if (!setlistFilter || !setlists) return new Map();
    const setlist = setlists.find((s) => s.id === setlistFilter);
    if (!setlist) return new Map();
    const ordered = [...setlist.setlist_songs].sort((a, b) =>
      a.set !== b.set ? a.set - b.set : a.set_weight - b.set_weight
    );
    const map = new Map<number, number>();
    ordered.forEach((ss, idx) => map.set(ss.song_id, idx + 1));
    return map;
  }, [setlistFilter, setlists]);

  const rows = useMemo(
    () =>
      (songs ?? []).map((song) => ({
        song,
        p: progress[song.id] ?? { status: 'not_ready' as PracticeStatus, notes: '' },
      })),
    [songs, progress]
  );

  const visibleRows = useMemo(() => {
    const setlistFiltered = setlistFilter
      ? rows.filter((r) => setlistOrderMap.has(r.song.id))
      : rows;

    const statusFiltered =
      statusFilter.length === 0
        ? setlistFiltered
        : setlistFiltered.filter((r) => statusFilter.includes(r.p.status));

    if (setlistFilter) {
      return [...statusFiltered].sort((a, b) => {
        const aOrder = setlistOrderMap.get(a.song.id) ?? Infinity;
        const bOrder = setlistOrderMap.get(b.song.id) ?? Infinity;
        return aOrder - bOrder;
      });
    }

    if (sortConfig) {
      return [...statusFiltered].sort((a, b) => {
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
      });
    }

    return statusFiltered;
  }, [rows, setlistFilter, setlistOrderMap, statusFilter, sortConfig]);

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

  async function handleResetProgress() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setToast({ open: true, severity: 'error', message: 'Not logged in.' });
      return;
    }

    if (visibleRows.length === 0) return;

    const updates: Record<number, SongProgress> = {};
    for (const { song, p } of visibleRows) {
      updates[song.id] = { ...p, status: 'not_ready' };
    }
    setProgress((prev) => ({ ...prev, ...updates }));

    const upserts = visibleRows.map(({ song, p }) => ({
      song_id: song.id,
      user_id: user.id,
      band_id: +bandId,
      status: 'not_ready' as const,
      notes: p.notes,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('practice_progress')
      .upsert(upserts, { onConflict: 'song_id,user_id' });

    if (error) {
      setToast({ open: true, severity: 'error', message: error.message });
    } else {
      setToast({ open: true, severity: 'success', message: 'Progress reset' });
    }
  }

  if (isLoading) {
    return <Loading />;
  }

  if (!songs?.length) {
    return <Typography>No songs have been added to this band yet.</Typography>;
  }

  const sortDir = (key: SortColumn) =>
    sortConfig?.key === key ? sortConfig.direction : undefined;

  const hasSpotifySongs = songs.some((s) => s.spotify_url);

  return (
    <>
      {hasSpotifySongs && <SpotifyConnectBanner />}
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            Filter:
          </Typography>
          <ToggleButtonGroup
            value={statusFilter}
            onChange={(_, value: PracticeStatus[]) => setStatusFilter(value)}
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
          {setlists && setlists.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Setlist</InputLabel>
              <Select
                value={setlistFilter}
                label="Setlist"
                onChange={(e) => setSetlistFilter(e.target.value as number | '')}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {setlists.map((sl) => (
                  <MenuItem key={sl.id} value={sl.id}>
                    {sl.name ?? (sl.band_events ? `${sl.band_events.type === 'gig' ? 'Gig' : 'Practice'} — ${sl.band_events.location}` : 'Untitled Setlist')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
        <Button variant="outlined" color="warning" size="small" onClick={handleResetProgress}>
          Reset Progress
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table aria-label="Practice progress">
          <TableHead>
            <TableRow>
              {setlistFilter && <TableCell>#</TableCell>}
              <TableCell>
                {setlistFilter ? (
                  'Song'
                ) : (
                  <TableSortLabel
                    active={sortConfig?.key === 'name'}
                    direction={sortDir('name') ?? 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Song
                  </TableSortLabel>
                )}
              </TableCell>
              <TableCell>
                {setlistFilter ? (
                  'Your Status'
                ) : (
                  <TableSortLabel
                    active={sortConfig?.key === 'status'}
                    direction={sortDir('status') ?? 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Your Status
                  </TableSortLabel>
                )}
              </TableCell>
              <TableCell>Resources</TableCell>
              <TableCell>
                {setlistFilter ? (
                  'Notes'
                ) : (
                  <TableSortLabel
                    active={sortConfig?.key === 'notes'}
                    direction={sortDir('notes') ?? 'asc'}
                    onClick={() => handleSort('notes')}
                  >
                    Notes
                  </TableSortLabel>
                )}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map(({ song, p }) => (
              <TableRow key={song.id}>
                {setlistFilter && (
                  <TableCell sx={{ color: 'text.secondary', width: 40 }}>
                    {setlistOrderMap.get(song.id)}
                  </TableCell>
                )}
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
                <TableCell sx={{ verticalAlign: 'middle' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {song.song_link ? (
                      <SongLinkIcon url={song.song_link} />
                    ) : song.spotify_url ? (
                      <SpotifyEmbedPlayer spotifyUrl={song.spotify_url} />
                    ) : null}
                    {song.shared_band_notes && (
                      <SharedBandNotesViewModal songName={song.name} sharedBandNotes={song.shared_band_notes} iconOnly />
                    )}
                  </Box>
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
