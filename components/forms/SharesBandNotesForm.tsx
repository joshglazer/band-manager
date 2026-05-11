'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface SharesBandNotesFormProps {
  song: Tables<'songs'>;
  onSaved?: (sharesBandNotes: string | null) => void;
}

const formFields: FormField[] = [
  {
    fieldType: 'textarea' as FormField['fieldType'],
    name: 'shares_band_notes',
    label: 'Shares Band Notes',
    fullWidth: true,
    rows: 15,
    inputProps: { style: { fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: 1.8 } },
  },
];

export default function SharesBandNotesForm({ song, onSaved }: Readonly<SharesBandNotesFormProps>) {
  const supabase = createClient();
  const [errorMessage, setErrorMessage] = useState<string>();

  async function onSuccess(data: FieldValues) {
    setErrorMessage('');
    const newValue = data.shares_band_notes || null;
    const { error } = await supabase
      .from('songs')
      .update({ shares_band_notes: newValue })
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
      defaultValues={{ shares_band_notes: song.shares_band_notes ?? '' }}
      errorMessage={errorMessage}
      saveButtonLabel="Save"
    />
  );
}
