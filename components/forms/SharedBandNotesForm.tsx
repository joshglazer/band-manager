'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface SharedBandNotesFormProps {
  song: Tables<'songs'>;
  onSaved?: (sharedBandNotes: string | null) => void;
}

const formFields: FormField[] = [
  {
    fieldType: 'textarea' as FormField['fieldType'],
    name: 'shared_band_notes',
    label: 'Shared Band Notes',
    fullWidth: true,
    rows: 15,
    inputProps: { style: { fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: 1.8 } },
    helperText: 'Only upload content you have the right to use (your own notes, original transcriptions, or content you are licensed to store).',
  },
];

export default function SharedBandNotesForm({ song, onSaved }: Readonly<SharedBandNotesFormProps>) {
  const supabase = createClient();
  const [errorMessage, setErrorMessage] = useState<string>();

  async function onSuccess(data: FieldValues) {
    setErrorMessage('');
    const newValue = data.shared_band_notes || null;
    const { error } = await supabase
      .from('songs')
      .update({ shared_band_notes: newValue })
      .eq('id', song.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      onSaved?.(newValue);
    }
  }

  return (
    <Form
      onSuccess={onSuccess}
      formFields={formFields}
      defaultValues={{ shared_band_notes: song.shared_band_notes ?? '' }}
      errorMessage={errorMessage}
      saveButtonLabel="Save"
    />
  );
}
