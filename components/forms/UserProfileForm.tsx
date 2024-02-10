'use client';

import useUserProfile from '@/hooks/useUserProfile';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Loading from '../design/Loading';

import Form, { FormField } from '../design/Form';
interface UserProfileFormProps {
  user: User;
}

export default function UserProfileForm({ user }: Readonly<UserProfileFormProps>) {
  const [errorMessage, setErrorMessage] = useState<string>();

  const supabase = createClient();
  const router = useRouter();

  const { data: userProfile, isLoading } = useUserProfile({ userId: user.id });

  const formFields: FormField[] = useMemo(
    () => [
      {
        fieldType: 'text' as FormField['fieldType'],
        name: 'firstName',
        label: 'First Name',
        fullWidth: true,
        required: true,
      },
      {
        fieldType: 'text' as FormField['fieldType'],
        name: 'lastName',
        label: 'Last Name',
        fullWidth: true,
        required: true,
      },
      {
        fieldType: 'textarea' as FormField['fieldType'],
        name: 'bio',
        label: 'Bio',
        fullWidth: true,
        required: true,
      },
    ],
    []
  );

  const defaultValues = useMemo(
    () => ({
      firstName: userProfile?.first_name,
      lastName: userProfile?.last_name,
      bio: userProfile?.bio,
    }),
    [userProfile]
  );

  if (isLoading) {
    return <Loading />;
  }

  async function onSuccess(data: FieldValues) {
    if (userProfile) {
      const { firstName, lastName, bio } = data;
      const { error: submitError } = await supabase
        .from('user_profiles')
        .update({ first_name: firstName, last_name: lastName, bio })
        .eq('id', userProfile.id);

      if (submitError) {
        setErrorMessage(submitError.message);
      } else {
        router.push('/');
      }
    }
  }

  return (
    <Form
      defaultValues={defaultValues}
      onSuccess={onSuccess}
      formFields={formFields}
      errorMessage={errorMessage}
    ></Form>
  );
}
