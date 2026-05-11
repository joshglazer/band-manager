'use client';

import Loading from '@/components/design/Loading';
import SharesBandNotesForm from '@/components/forms/SharesBandNotesForm';
import SharesBandNotesViewer from '@/components/SharesBandNotesViewer';
import useSong from '@/hooks/useSong';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useState } from 'react';

interface SharesBandNotesPageProps {
  params: {
    bandId: string;
    songId: string;
  };
}

export default function SharesBandNotesPage({ params }: Readonly<SharesBandNotesPageProps>) {
  const { bandId, songId } = params;

  const { data: song, isLoading } = useSong({ songId: +songId });
  const [isEditing, setIsEditing] = useState(false);
  const [sharesBandNotes, setSharesBandNotes] = useState<string | null | undefined>(undefined);

  if (isLoading) {
    return <Loading />;
  }

  const currentSharesBandNotes = sharesBandNotes !== undefined ? sharesBandNotes : song?.shares_band_notes ?? null;

  function handleSaved(newValue: string | null) {
    setSharesBandNotes(newValue);
    setIsEditing(false);
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

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Shares Band Notes</Typography>
        {!isEditing && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
          >
            {currentSharesBandNotes ? 'Edit' : 'Add'}
          </Button>
        )}
        {isEditing && (
          <Button variant="text" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        )}
      </Box>

      <Box sx={{ maxWidth: 800 }}>
        {isEditing && song ? (
          <SharesBandNotesForm
            song={{ ...song, shares_band_notes: currentSharesBandNotes }}
            onSaved={handleSaved}
          />
        ) : (
          <SharesBandNotesViewer sharesBandNotes={currentSharesBandNotes ?? ''} />
        )}
      </Box>
    </>
  );
}
