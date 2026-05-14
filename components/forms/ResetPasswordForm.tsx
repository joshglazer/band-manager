'use client';

import { createClient } from '@/utils/supabase/client';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

export default function ResetPasswordForm() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const router = useRouter();

  const formFields: FormField[] = useMemo(
    () => [
      {
        fieldType: 'password' as FormField['fieldType'],
        name: 'password',
        label: 'New Password',
        fullWidth: true,
        required: true,
      },
      {
        fieldType: 'password' as FormField['fieldType'],
        name: 'confirmPassword',
        label: 'Confirm New Password',
        fullWidth: true,
        required: true,
      },
    ],
    []
  );

  async function onSuccess(data: FieldValues) {
    const { password, confirmPassword } = data;

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push('/login?message=Password updated successfully. Please log in.');
  }

  return (
    <Form
      onSuccess={onSuccess}
      formFields={formFields}
      errorMessage={errorMessage}
      saveButtonLabel="Update Password"
      saveButtonIcon={<LockResetIcon />}
    />
  );
}
