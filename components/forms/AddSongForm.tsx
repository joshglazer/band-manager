import { createClient } from '@/utils/supabase/client';
import { useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface AddSongFormProps {
  bandId: number;
  onSuccess?: () => void;
}

function parseDurationToMs(value: string): number | null {
  const match = value.trim().match(/^(\d+):([0-5]\d)$/);
  if (!match) return null;
  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);
  return (minutes * 60 + seconds) * 1000;
}

export default function AddSongForm({ bandId, onSuccess }: Readonly<AddSongFormProps>) {
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
    ],
    []
  );

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
      band_id: bandId,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      onSuccess?.();
    }
  }

  return <Form onSuccess={handleSuccess} formFields={formFields} errorMessage={errorMessage} saveButtonLabel="Add Song" />;
}
