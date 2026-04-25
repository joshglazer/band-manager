'use client';

import useUserProfile from '@/hooks/useUserProfile';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Loading from '../design/Loading';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

import Form, { FormField } from '../design/Form';
interface UserProfileFormProps {
  user: User;
}

export default function UserProfileForm({ user }: Readonly<UserProfileFormProps>) {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [resetMessage, setResetMessage] = useState<string>();
  const [resetError, setResetError] = useState<string>();

  const supabase = createClient();
  const router = useRouter();

  const { data: userProfile, isLoading } = useUserProfile({ userId: user.id });

  const formFields: FormField[] = useMemo(
    () => [
      {
        fieldType: 'text' as FormField['fieldType'],
        name: 'email',
        label: 'Email',
        fullWidth: true,
        disabled: true,
      },
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
      email: user.email,
      firstName: userProfile?.first_name,
      lastName: userProfile?.last_name,
      bio: userProfile?.bio,
    }),
    [user.email, userProfile]
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

  async function handleResetPassword() {
    if (!user.email) return;
    setResetMessage(undefined);
    setResetError(undefined);
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) {
      setResetError(error.message);
    } else {
      setResetMessage('Password reset email sent. Check your inbox.');
    }
  }

  return (
    <>
      <Form
        defaultValues={defaultValues}
        onSuccess={onSuccess}
        formFields={formFields}
        errorMessage={errorMessage}
      />
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">Password</h3>
        <Button variant="outlined" onClick={handleResetPassword}>
          Reset Password
        </Button>
        {resetMessage && (
          <Alert severity="success" className="mt-2">
            {resetMessage}
          </Alert>
        )}
        {resetError && (
          <Alert severity="error" className="mt-2">
            {resetError}
          </Alert>
        )}
      </div>
    </>
  );
}
