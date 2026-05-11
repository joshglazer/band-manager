import SpotifyBadge from '@/components/SpotifyBadge';
import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { formatMsToDuration, parseDurationToMs } from '@/utils/songs';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface EditSongFormProps {
  song: Tables<'songs'>;
  onSuccess?: () => void;
}

const chordChartField: FormField = {
  fieldType: 'textarea',
  name: 'chord_chart',
  label: 'Chord Chart',
  fullWidth: true,
  rows: 10,
  inputProps: { style: { fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: 1.8 } },
};

export default function EditSongForm({ song, onSuccess }: Readonly<EditSongFormProps>) {
  const [errorMessage, setErrorMessage] = useState<string>();
  const supabase = createClient();
  const isSpotifyLinked = Boolean(song.spotify_url);

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

  async function handleSuccess(data: FieldValues) {
    setErrorMessage('');

    const updateData: Record<string, unknown> = {
      chord_chart: data.chord_chart || null,
    };

    if (!isSpotifyLinked) {
      const duration = data.duration ? parseDurationToMs(data.duration) : null;
      if (data.duration && duration === null) {
        setErrorMessage('Invalid duration format. Use m:ss (e.g. 3:45).');
        return;
      }
      updateData.name = data.name;
      updateData.artist = data.artist || null;
      updateData.duration = duration;
    }

    const { error } = await supabase.from('songs').update(updateData).eq('id', song.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      onSuccess?.();
    }
  }

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
            <SpotifyBadge spotifyUrl={song.spotify_url!} />
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
          onSuccess={handleSuccess}
          formFields={[chordChartField]}
          defaultValues={{ chord_chart: song.chord_chart ?? '' }}
          errorMessage={errorMessage}
          saveButtonLabel="Save Changes"
        />
      </>
    );
  }

  return (
    <Form
      onSuccess={handleSuccess}
      formFields={manualFormFields}
      defaultValues={defaultValues}
      errorMessage={errorMessage}
      saveButtonLabel="Save Changes"
    />
  );
}
