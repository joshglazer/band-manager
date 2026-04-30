'use client';

import Loading from '@/components/design/Loading';
import ChordChartViewer from '@/components/ChordChartViewer';
import useSetlistWithSongs from '@/hooks/useSetlistWithSongs';
import { Tables } from '@/types/supabase';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import PrintIcon from '@mui/icons-material/Print';
import { useMemo } from 'react';

interface PrintChordChartsPageProps {
  params: { setlistId: number };
}

interface OrderedSong {
  set: number;
  setWeight: number;
  song: Tables<'songs'>;
}

export default function PrintChordChartsPage({ params }: Readonly<PrintChordChartsPageProps>) {
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

  const songsWithCharts = orderedSongs.filter((s) => s.song.chord_chart?.trim());

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
          {setlist.name} — Chord Charts
        </Typography>
        <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
          Print
        </Button>
      </Box>

      {songsWithCharts.length === 0 ? (
        <Typography color="text.secondary">No songs with chord charts in this setlist.</Typography>
      ) : (
        songsWithCharts.map(({ song }, index) => (
          <Box key={song.id} sx={{ mb: 4, pageBreakInside: 'avoid' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              {index + 1}. {song.name}
              {song.artist ? ` — ${song.artist}` : ''}
            </Typography>
            <ChordChartViewer chordChart={song.chord_chart!} />
            {index < songsWithCharts.length - 1 && <Divider sx={{ mt: 3 }} />}
          </Box>
        ))
      )}
    </>
  );
}
