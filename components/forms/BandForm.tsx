'use client';

import { createClient } from '@/utils/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';

interface BandFormProps {
  bandId?: number;
}

export default function BandForm({ bandId }: BandFormProps) {
  const [error, setError] = useState<PostgrestError>();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const router = useRouter();

  async function onSubmit(data: FieldValues) {
    console.log(bandId);
    console.log(data);
    const { error: submitError } = await supabase
      .from('bands')
      .insert({ name: data.name });
    if (submitError) {
      setError(submitError);
    } else {
      router.push('/');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="name">Name: </label>
      <input
        id="name"
        placeholder="Smash Mouth"
        {...register('name', { required: true })}
      />

      {errors.name && <span>This field is required</span>}
      {error && <span>{error.message}</span>}

      <input type="submit" />
    </form>
  );
}
