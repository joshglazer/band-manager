'use client';

import Loading from '@/components/design/Loading';
import ChordChartForm from '@/components/forms/ChordChartForm';
import useChordChart from '@/hooks/useChordChart';
import useSong from '@/hooks/useSong';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

interface ChordChartPageProps {
  params: {
    bandId: string;
    songId: string;
  };
}

export default function ChordChartPage({ params }: Readonly<ChordChartPageProps>) {
  const { bandId, songId } = params;
  const songIdNum = +songId;

  const { data: song, isLoading: songLoading } = useSong({ songId: songIdNum });
  const { data: chordChart, isLoading: chartLoading, mutate } = useChordChart({ songId: songIdNum });

  if (songLoading || chartLoading) {
    return <Loading />;
  }

  return (
    <>
      <Button
        component={Link}
        href={`/band/${bandId}/songs`}
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Songs
      </Button>

      <Typography variant="h4" component="h1">
        {song?.name ?? 'Song'}
      </Typography>
      {song?.artist && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
          {song.artist}
        </Typography>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" sx={{ mb: 3 }}>
        Chord Chart
      </Typography>

      <Box sx={{ maxWidth: 800 }}>
        <ChordChartForm songId={songIdNum} existingChart={chordChart} onSuccess={mutate} />
      </Box>
    </>
  );
}
