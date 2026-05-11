'use client';

import SpotifyBadge from '@/components/SpotifyBadge';
import SpotifyTrackSearch, { SpotifyTrack } from '@/components/SpotifyTrackSearch';
import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { formatMsToDuration, parseDurationToMs } from '@/utils/songs';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
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

interface EditSongFormProps {
  song: Tables<'songs'>;
  onSuccess?: () => void;
}

type Mode = 'spotify' | 'manual';

const chordChartField: FormField = {
  fieldType: 'textarea',
  name: 'chord_chart',
  label: 'Chord Chart',
  fullWidth: true,
  rows: 10,
  inputProps: { style: { fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: 1.8 } },
};

export default function EditSongForm({ song, onSuccess }: Readonly<EditSongFormProps>) {
  const [mode, setMode] = useState<Mode>('manual');
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [chordChart, setChordChart] = useState(song.chord_chart ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const supabase = createClient();
  const isSpotifyLinked = Boolean(song.spotify_url);

  const spotifyInitialQuery = [song.name, song.artist].filter(Boolean).join(' ');

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
      chordChartField,
    ],
    []
  );

  const defaultValues = useMemo(
    () => ({
      name: song.name ?? '',
      artist: song.artist ?? '',
      duration: song.duration ? formatMsToDuration(song.duration) : '',
      chord_chart: song.chord_chart ?? '',
    }),
    [song]
  );

  function handleTabChange(_: React.SyntheticEvent, newMode: Mode) {
    setMode(newMode);
    setSelectedTrack(null);
    setErrorMessage('');
  }

  async function handleManualSuccess(data: FieldValues) {
    setErrorMessage('');

    const duration = data.duration ? parseDurationToMs(data.duration) : null;
    if (data.duration && duration === null) {
      setErrorMessage('Invalid duration format. Use m:ss (e.g. 3:45).');
      return;
    }

    const { error } = await supabase
      .from('songs')
      .update({
        name: data.name,
        artist: data.artist || null,
        duration,
        chord_chart: data.chord_chart || null,
      })
      .eq('id', song.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      onSuccess?.();
    }
  }

  async function handleSpotifyLink() {
    if (!selectedTrack) return;
    setIsSubmitting(true);
    setErrorMessage('');

    const { error } = await supabase
      .from('songs')
      .update({
        name: selectedTrack.name,
        artist: selectedTrack.artists.map((a) => a.name).join(', '),
        duration: selectedTrack.duration_ms,
        spotify_url: selectedTrack.external_urls.spotify,
        chord_chart: chordChart || null,
      })
      .eq('id', song.id);

    setIsSubmitting(false);
    if (error) {
      setErrorMessage(error.message);
    } else {
      onSuccess?.();
    }
  }

  async function handleSpotifyOnlySuccess(data: FieldValues) {
    setErrorMessage('');
    const { error } = await supabase
      .from('songs')
      .update({ chord_chart: data.chord_chart || null })
      .eq('id', song.id);
    if (error) {
      setErrorMessage(error.message);
    } else {
      onSuccess?.();
    }
  }

  // Already linked to Spotify: show read-only info + chord chart editor
  if (isSpotifyLinked) {
    return (
      <>
        <Box
          sx={{
            mb: 3,
            p: 2,
            border: '1px solid #1DB954',
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <SpotifyBadge spotifyUrl={song.spotify_url!} size={24} />
            <Typography variant="caption" color="text.secondary">
              Name, artist, and duration are managed by Spotify
            </Typography>
          </Box>
          <Typography variant="h6" component="p" sx={{ lineHeight: 1.3 }}>
            {song.name}
          </Typography>
          {song.artist && (
            <Typography variant="body2" color="text.secondary">
              {song.artist}
            </Typography>
          )}
          {song.duration && (
            <Typography variant="body2" color="text.secondary">
              {formatMsToDuration(song.duration)}
            </Typography>
          )}
        </Box>
        <Divider className="mb-4" />
        <Form
          onSuccess={handleSpotifyOnlySuccess}
          formFields={[chordChartField]}
          defaultValues={{ chord_chart: song.chord_chart ?? '' }}
          errorMessage={errorMessage}
          saveButtonLabel="Save Changes"
        />
      </>
    );
  }

  // Not linked to Spotify: show tabs
  return (
    <>
      <Tabs value={mode} onChange={handleTabChange} className="mb-4">
        <Tab icon={<SearchIcon fontSize="small" />} iconPosition="start" label="Search Spotify" value="spotify" />
        <Tab label="Manual Entry" value="manual" />
      </Tabs>

      {mode === 'spotify' && (
        <>
          {!selectedTrack ? (
            <SpotifyTrackSearch onSelect={setSelectedTrack} initialQuery={spotifyInitialQuery} />
          ) : (
            <>
              <Box className="mb-4" sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Selected song
                </Typography>
                <Typography variant="h6" component="p">
                  {selectedTrack.name}
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
                  onClick={handleSpotifyLink}
                >
                  Link to Spotify
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
          defaultValues={defaultValues}
          errorMessage={errorMessage}
          saveButtonLabel="Save Changes"
        />
      )}
    </>
  );
}
