'use client';

import useUserProfile from '@/hooks/useUserProfile';
import { PostgrestError, User } from '@supabase/supabase-js';
import Loading from '../design/Loading';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FieldValues, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

interface UserProfileFormProps {
  user: User;
}

export default function UserProfileForm({ user }: Readonly<UserProfileFormProps>) {
  const [error, setError] = useState<PostgrestError>();

  const router = useRouter();

  const { data: userProfile, isLoading } = useUserProfile({ userId: user.id });
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    reset({ firstName: userProfile?.first_name, lastName: userProfile?.last_name });
  }, [reset, userProfile?.first_name, userProfile?.last_name]);

  if (isLoading) {
    return <Loading />;
  }

  async function onSubmit(data: FieldValues) {
    if (userProfile) {
      const { error: submitError } = await supabase
        .from('user_profiles')
        .update({ first_name: data.firstName, last_name: data.lastName })
        .eq('id', userProfile.id);
      if (submitError) {
        setError(submitError);
      } else {
        router.push('/');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="firstName">Name: </label>
      <input id="firstName" {...register('firstName', { required: true })} />
      <input id="lastName" {...register('lastName', { required: true })} />

      {!!Object.keys(errors).length && <span>A required field is missing</span>}
      {error && <span>{error.message}</span>}

      <input type="submit" />
    </form>
  );
}
