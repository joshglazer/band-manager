'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface BandFormProps {
  bandId?: number;
}

export default function BandForm({ bandId }: Readonly<BandFormProps>) {
  const [errorMessage, setErrorMessage] = useState<string>();

  const supabase = createClient();
  const router = useRouter();

  const formFields: FormField[] = useMemo(
    () => [
      {
        fieldType: 'text' as FormField['fieldType'],
        name: 'name',
        label: 'Name',
        fullWidth: true,
        required: true,
      },
    ],
    []
  );

  async function onSuccess(data: FieldValues) {
    if (!bandId) {
      const { error: submitError } = await supabase.from('bands').insert({ name: data.name });
      if (submitError) {
        setErrorMessage(submitError.message);
      } else {
        router.push('/');
      }
    }
  }

  return (
    <Form
      // defaultValues={defaultValues}
      onSuccess={onSuccess}
      formFields={formFields}
      errorMessage={errorMessage}
    ></Form>
  );
}
