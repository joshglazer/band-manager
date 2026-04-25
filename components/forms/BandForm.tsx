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
      const { error } = await supabase.rpc('create_band_with_member', {
        band_name: data.name,
      });
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      router.push('/');
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
