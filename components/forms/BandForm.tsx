'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { mutate } from 'swr';
import Form, { FormField } from '../design/Form';

interface BandFormProps {
  bandId?: number;
  onBandCreated?: (bandId: number) => void;
}

export default function BandForm({ bandId, onBandCreated }: Readonly<BandFormProps>) {
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
      const { data: newBandId, error } = await supabase.rpc('create_band_with_member', {
        band_name: data.name,
      });
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      await mutate('my-bands-active');
      if (onBandCreated && typeof newBandId === 'number') {
        onBandCreated(newBandId);
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
