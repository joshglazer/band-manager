'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface ChordChartFormProps {
  song: Tables<'songs'>;
  onSaved?: (chordChart: string | null) => void;
}

const formFields: FormField[] = [
  {
    fieldType: 'textarea' as FormField['fieldType'],
    name: 'chord_chart',
    label: 'Chord Chart',
    fullWidth: true,
    rows: 15,
  },
];

export default function ChordChartForm({ song, onSaved }: Readonly<ChordChartFormProps>) {
  const supabase = createClient();
  const [errorMessage, setErrorMessage] = useState<string>();

  async function onSuccess(data: FieldValues) {
    setErrorMessage('');
    const newValue = data.chord_chart || null;
    const { error } = await supabase
      .from('songs')
      .update({ chord_chart: newValue })
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
      defaultValues={{ chord_chart: song.chord_chart ?? '' }}
      errorMessage={errorMessage}
      saveButtonLabel="Save"
    />
  );
}
