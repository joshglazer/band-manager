'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface ChordChartFormProps {
  song: Tables<'songs'>;
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

export default function ChordChartForm({ song }: Readonly<ChordChartFormProps>) {
  const supabase = createClient();
  const [errorMessage, setErrorMessage] = useState<string>();

  async function onSuccess(data: FieldValues) {
    setErrorMessage('');
    const { error } = await supabase
      .from('songs')
      .update({ chord_chart: data.chord_chart || null })
      .eq('id', song.id);

    if (error) {
      setErrorMessage(error.message);
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
