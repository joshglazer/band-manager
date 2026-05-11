'use client';

import { SpotifyIcon } from '@/components/SpotifyBadge';
import SpotifyTrackSearch, { SpotifyTrack } from '@/components/SpotifyTrackSearch';
import { createClient } from '@/utils/supabase/client';
import { cleanSpotifyTrackName, formatMsToDuration, parseDurationToMs } from '@/utils/songs';
import SaveIcon from '@mui/icons-material/Save';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import LoadingButton from '@mui/lab/LoadingButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface AddSongFormProps {
  bandId: number;
  onSuccess?: () => void;
}

type Mode = 'spotify' | 'manual';

export default function AddSongForm({ bandId, onSuccess }: Readonly<AddSongFormProps>) {
  const [mode, setMode] = useState<Mode>('spotify');
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [chordChart, setChordChart] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const supabase = createClient();

  const manualFormFields: FormField[] = useMemo(
    () => [
      {
        fieldType: 'text' as FormField['fieldType'],
        name: 'name',
        label: 'Song Name',
        fullWidth: true,
        required: true,
      },
      {
        fieldType: 'text' as FormField['fieldType'],
        name: 'artist',
        label: 'Artist',
        fullWidth: true,
      },
      {
        fieldType: 'text' as FormField['fieldType'],
        name: 'duration',
        label: 'Duration (m:ss)',
        placeholder: 'e.g. 3:45',
        fullWidth: true,
      },
      {
        fieldType: 'textarea' as FormField['fieldType'],
        name: 'chord_chart',
        label: 'Chord Chart',
        fullWidth: true,
        rows: 10,
        inputProps: { style: { fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: 1.8 } },
      },
    ],
    []
  );

  async function handleSpotifySubmit() {
    if (!selectedTrack) return;
    setIsSubmitting(true);
    setErrorMessage('');

    const { error } = await supabase.from('songs').insert({
      name: cleanSpotifyTrackName(selectedTrack.name),
      artist: selectedTrack.artists.map((a) => a.name).join(', '),
      duration: selectedTrack.duration_ms,
      chord_chart: chordChart || null,
      band_id: bandId,
      spotify_url: selectedTrack.external_urls.spotify,
    });

    setIsSubmitting(false);
    if (error) {
      setErrorMessage(error.message);
    } else {
      onSuccess?.();
    }
  }

  async function handleManualSuccess(data: FieldValues) {
    setErrorMessage('');

    const duration = data.duration ? parseDurationToMs(data.duration) : null;
    if (data.duration && duration === null) {
      setErrorMessage('Invalid duration format. Use m:ss (e.g. 3:45).');
      return;
    }

    const { error } = await supabase.from('songs').insert({
      name: data.name,
      artist: data.artist || null,
      duration,
      chord_chart: data.chord_chart || null,
      band_id: bandId,
      spotify_url: null,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      onSuccess?.();
    }
  }

  function handleTabChange(_: React.SyntheticEvent, newMode: Mode) {
    setMode(newMode);
    setSelectedTrack(null);
    setChordChart('');
    setErrorMessage('');
  }

  return (
    <>
      <Tabs value={mode} onChange={handleTabChange} className="mb-4">
        <Tab icon={<SpotifyIcon size={16} />} iconPosition="start" label="Search Spotify" value="spotify" />
        <Tab label="Manual Entry" value="manual" />
      </Tabs>

      {mode === 'spotify' && (
        <>
          {!selectedTrack ? (
            <SpotifyTrackSearch onSelect={setSelectedTrack} />
          ) : (
            <>
              <Box className="mb-4" sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Selected song
                </Typography>
                <Typography variant="h6" component="p">
                  {cleanSpotifyTrackName(selectedTrack.name)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedTrack.artists.map((a) => a.name).join(', ')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatMsToDuration(selectedTrack.duration_ms)}
                </Typography>
              </Box>
              <Divider className="mb-4" />
              <TextField
                label="Chord Chart"
                value={chordChart}
                onChange={(e) => setChordChart(e.target.value)}
                fullWidth
                multiline
                rows={10}
                className="mb-4"
                inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: 1.8 } }}
              />
              {errorMessage && (
                <Alert severity="error" className="mb-4">
                  {errorMessage}
                </Alert>
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={() => setSelectedTrack(null)}>
                  Search Again
                </Button>
                <LoadingButton
                  variant="contained"
                  loading={isSubmitting}
                  startIcon={<SaveIcon />}
                  onClick={handleSpotifySubmit}
                >
                  Add Song
                </LoadingButton>
              </Box>
            </>
          )}
        </>
      )}

      {mode === 'manual' && (
        <Form
          onSuccess={handleManualSuccess}
          formFields={manualFormFields}
          errorMessage={errorMessage}
          saveButtonLabel="Add Song"
        />
      )}
    </>
  );
}
