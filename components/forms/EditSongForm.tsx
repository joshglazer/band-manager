import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { formatMsToDuration, parseDurationToMs } from '@/utils/songs';
import { useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface EditSongFormProps {
  song: Tables<'songs'>;
  onSuccess?: () => void;
}

export default function EditSongForm({ song, onSuccess }: Readonly<EditSongFormProps>) {
  const [errorMessage, setErrorMessage] = useState<string>();
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

  return (
    <Form
      onSuccess={handleSuccess}
      formFields={formFields}
      defaultValues={defaultValues}
      errorMessage={errorMessage}
      saveButtonLabel="Save Changes"
    />
  );
}
