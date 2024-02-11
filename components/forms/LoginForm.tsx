import { createClient } from '@/utils/supabase/server';
import LoginIcon from '@mui/icons-material/Login';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { useMemo } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface LoginFormProps {
  errorMessage?: string;
}

export default function LoginForm({ errorMessage }: LoginFormProps) {
  const formFields: FormField[] = useMemo(
    () => [
      {
        fieldType: 'text' as FormField['fieldType'],
        name: 'email',
        label: 'Email',
        fullWidth: true,
        required: true,
      },
      {
        fieldType: 'password' as FormField['fieldType'],
        name: 'password',
        label: 'Password',
        fullWidth: true,
        required: true,
      },
    ],
    []
  );

  async function onSuccess(data: FieldValues) {
    'use server';

    const { email, password } = data;

    const origin = headers().get('origin');
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      return redirect('/login?message=Could not authenticate user');
    }

    return redirect('/login?message=Check email to continue sign in process');
  }

  return (
    <Form
      onSuccess={onSuccess}
      formFields={formFields}
      errorMessage={errorMessage}
      saveButtonLabel="Login"
      saveButtonIcon={<LoginIcon />}
    />
  );
}
