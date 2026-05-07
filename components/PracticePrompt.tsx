'use client';

import usePracticeProgress from '@/hooks/usePracticeProgress';
import useSongs, { SongsComposite } from '@/hooks/useSongs';
import { createClient } from '@/utils/supabase/client';
import CasinoIcon from '@mui/icons-material/Casino';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';

type PracticeStatus = 'not_ready' | 'passable' | 'ready';

const STATUS_LABEL: Record<PracticeStatus, string> = {
  not_ready: 'Not Ready',
  passable: 'Passable',
  ready: 'Ready',
};

const STATUS_COLOR: Record<PracticeStatus, 'error' | 'warning' | 'success'> = {
  not_ready: 'error',
  passable: 'warning',
  ready: 'success',
};

function pickRandom<T>(arr: T[], exclude?: T): T {
  if (arr.length === 1) return arr[0];
  const candidates = exclude !== undefined ? arr.filter((x) => x !== exclude) : arr;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

interface PracticePromptProps {
  bandId: number;
}

export default function PracticePrompt({ bandId }: PracticePromptProps) {
  const { data: songs, isLoading: songsLoading } = useSongs({ bandId });
  const { data: practiceRows, isLoading: progressLoading, mutate } = usePracticeProgress({ bandId });
  const [pickedSongId, setPickedSongId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; severity: 'success' | 'error'; message: string }>({
    open: false,
    severity: 'success',
    message: '',
  });

  const statusBySongId = useMemo(() => {
    const map = new Map<number, PracticeStatus>();
    practiceRows?.forEach((r) => {
      if (r.song_id !== null) map.set(r.song_id, (r.status as PracticeStatus) ?? 'not_ready');
    });
    return map;
  }, [practiceRows]);

  const { notReady, passable, allSongs } = useMemo(() => {
    const all = (songs ?? []).filter((s) => s.name);
    const nr = all.filter((s) => (statusBySongId.get(s.id) ?? 'not_ready') === 'not_ready');
    const pa = all.filter((s) => statusBySongId.get(s.id) === 'passable');
    return { notReady: nr, passable: pa, allSongs: all };
  }, [songs, statusBySongId]);

  const pickSong = useCallback(
    (exclude?: number) => {
      if (allSongs.length === 0) return;
      const pool = notReady.length > 0 ? notReady : passable.length > 0 ? passable : allSongs;
      const excludeSong = exclude !== undefined ? pool.find((s) => s.id === exclude) : undefined;
      const picked = pickRandom(pool, excludeSong);
      setPickedSongId(picked.id);
    },
    [notReady, passable, allSongs]
  );

  useEffect(() => {
    if (!songsLoading && !progressLoading && pickedSongId === null && allSongs.length > 0) {
      pickSong();
    }
  }, [songsLoading, progressLoading, pickedSongId, allSongs.length, pickSong]);

  const pickedSong = useMemo(
    () => allSongs.find((s) => s.id === pickedSongId) ?? null,
    [allSongs, pickedSongId]
  );

  const currentStatus: PracticeStatus = pickedSongId
    ? (statusBySongId.get(pickedSongId) ?? 'not_ready')
    : 'not_ready';

  async function handleStatusChange(_: React.MouseEvent, newStatus: PracticeStatus | null) {
    if (!newStatus || !pickedSongId) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setToast({ open: true, severity: 'error', message: 'Not logged in.' });
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('practice_progress')
      .upsert(
        {
          song_id: pickedSongId,
          user_id: user.id,
          band_id: bandId,
          status: newStatus,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'song_id,user_id' }
      );

    setSaving(false);

    if (error) {
      setToast({ open: true, severity: 'error', message: error.message });
    } else {
      mutate();
      setToast({ open: true, severity: 'success', message: 'Status updated.' });
    }
  }

  const isLoading = songsLoading || progressLoading;

  if (!isLoading && allSongs.length === 0) return null;

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <MusicNoteIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography variant="subtitle1" fontWeight={600}>
            Practice This Song
          </Typography>
        </Box>

        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        ) : pickedSong ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                {pickedSong.name}
              </Typography>
              {pickedSong.artist && (
                <Typography variant="body2" color="text.secondary">
                  — {pickedSong.artist}
                </Typography>
              )}
              <Chip
                size="small"
                label={STATUS_LABEL[currentStatus]}
                color={STATUS_COLOR[currentStatus]}
                sx={{ ml: 0.5 }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                Update status:
              </Typography>
              <ToggleButtonGroup
                value={currentStatus}
                exclusive
                size="small"
                disabled={saving}
                onChange={handleStatusChange}
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

              <Tooltip title="Pick a different song">
                <IconButton
                  size="small"
                  onClick={() => pickSong(pickedSongId ?? undefined)}
                  sx={{ ml: 'auto' }}
                >
                  <CasinoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        ) : null}
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}
