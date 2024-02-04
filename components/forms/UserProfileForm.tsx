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
    ],
    []
  );

  const defaultValues = useMemo(
    () => ({
      firstName: userProfile?.first_name,
      lastName: userProfile?.last_name,
    }),
    [userProfile?.first_name, userProfile?.last_name]
  );

  if (isLoading) {
    return <Loading />;
  }

  async function onSuccess(data: FieldValues) {
    if (userProfile) {
      const { error: submitError } = await supabase
        .from('user_profiles')
        .update({ first_name: data.firstName, last_name: data.lastName })
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
