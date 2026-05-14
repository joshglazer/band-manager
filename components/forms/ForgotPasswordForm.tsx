import { createClient } from '@/utils/supabase/server';
import EmailIcon from '@mui/icons-material/Email';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { useMemo } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface ForgotPasswordFormProps {
  errorMessage?: string;
}

export default function ForgotPasswordForm({ errorMessage }: Readonly<ForgotPasswordFormProps>) {
  const formFields: FormField[] = useMemo(
    () => [
      {
        fieldType: 'text' as FormField['fieldType'],
        name: 'email',
        label: 'Email',
        fullWidth: true,
        required: true,
      },
    ],
    []
  );

  async function onSuccess(data: FieldValues) {
    'use server';

    const { email } = data;
    const origin = headers().get('origin');
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    return redirect('/forgot-password?message=Check your email for a password reset link');
  }

  return (
    <Form
      onSuccess={onSuccess}
      formFields={formFields}
      errorMessage={errorMessage}
      saveButtonLabel="Send Reset Link"
      saveButtonIcon={<EmailIcon />}
    />
  );
}
