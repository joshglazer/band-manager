'use client';

import Loading from '@/components/design/Loading';
import SharesBandNotesViewer from '@/components/SharesBandNotesViewer';
import { getSetlistDisplayName } from '@/components/setlistEditor/helpers';
import useSetlistWithSongs from '@/hooks/useSetlistWithSongs';
import { Tables } from '@/types/supabase';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import PrintIcon from '@mui/icons-material/Print';
import { useMemo } from 'react';

interface PrintSharesBandNotesPageProps {
  params: { setlistId: number };
}

interface OrderedSong {
  set: number;
  setWeight: number;
  song: Tables<'songs'>;
}

export default function PrintSharesBandNotesPage({ params }: Readonly<PrintSharesBandNotesPageProps>) {
  const { setlistId } = params;
  const { data: setlist, isLoading } = useSetlistWithSongs({ setlistId });

  const orderedSongs = useMemo<OrderedSong[]>(() => {
    if (!setlist) return [];
    return [...setlist.setlist_songs]
      .sort((a, b) => {
        if (a.set !== b.set) return (a.set ?? 0) - (b.set ?? 0);
        return (a.set_weight ?? 0) - (b.set_weight ?? 0);
      })
      .map((ss) => ({
        set: ss.set ?? 0,
        setWeight: ss.set_weight ?? 0,
        song: ss.songs,
      }));
  }, [setlist]);

  if (isLoading) {
    return <Loading />;
  }

  if (!setlist) {
    return <Typography variant="h5">Setlist not found.</Typography>;
  }

  const songsWithNotes = orderedSongs.filter((s) => s.song.shares_band_notes?.trim());

  return (
    <>
      <style>{`
        header, footer { display: none !important; }
        main { padding-top: 0 !important; }
        @media print {
          .no-print { display: none !important; }
          header, footer { display: none !important; }
        }
      `}</style>

      <Box className="no-print" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          {getSetlistDisplayName(setlist)} — Shares Band Notes
        </Typography>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
          Print
        </Button>
      </Box>

      {songsWithNotes.length === 0 ? (
        <Typography color="text.secondary">No songs with shares band notes in this setlist.</Typography>
      ) : (
        songsWithNotes.map(({ song }, index) => (
          <Box key={song.id} sx={{ mb: 4, pageBreakInside: 'avoid' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              {index + 1}. {song.name}
              {song.artist ? ` — ${song.artist}` : ''}
            </Typography>
            <SharesBandNotesViewer sharesBandNotes={song.shares_band_notes!} />
            {index < songsWithNotes.length - 1 && <Divider sx={{ mt: 3 }} />}
          </Box>
        ))
      )}
    </>
  );
}
