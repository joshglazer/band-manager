'use client';

import SpotifyTrackSearch, { SpotifyTrack } from '@/components/SpotifyTrackSearch';
import { createClient } from '@/utils/supabase/client';
import { formatMsToDuration, parseDurationToMs } from '@/utils/songs';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface AddSongFormProps {
  bandId: number;
  onSuccess?: () => void;
}

export default function AddSongForm({ bandId, onSuccess }: Readonly<AddSongFormProps>) {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [defaultValues, setDefaultValues] = useState<Record<string, string>>({});
  const supabase = createClient();

  const formFields: FormField[] = useMemo(
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

  function handleSpotifySelect(track: SpotifyTrack) {
    setSelectedTrack(track);
    setDefaultValues({
      name: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      duration: formatMsToDuration(track.duration_ms),
      chord_chart: '',
    });
    setFormKey((k) => k + 1);
  }

  function handleClearSpotify() {
    setSelectedTrack(null);
    setDefaultValues({});
    setFormKey((k) => k + 1);
  }

  async function handleSuccess(data: FieldValues) {
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
      spotify_url: selectedTrack?.external_urls.spotify ?? null,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      onSuccess?.();
    }
  }

  return (
    <>
      <SpotifyTrackSearch onSelect={handleSpotifySelect} />
      {selectedTrack && (
        <Chip
          icon={<CheckCircleIcon />}
          label={`${selectedTrack.name} — ${selectedTrack.artists.map((a) => a.name).join(', ')}`}
          onDelete={handleClearSpotify}
          deleteIcon={<CloseIcon />}
          color="success"
          variant="outlined"
          className="mb-4"
        />
      )}
      <Divider className="mb-4">
        <Typography variant="caption" color="text.secondary">
          {selectedTrack ? 'Edit song details' : 'Or enter details manually'}
        </Typography>
      </Divider>
      <Form
        key={formKey}
        onSuccess={handleSuccess}
        formFields={formFields}
        defaultValues={defaultValues}
        errorMessage={errorMessage}
        saveButtonLabel="Add Song"
      />
    </>
  );
}
