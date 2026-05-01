import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import LoginIcon from '@mui/icons-material/Login';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { useMemo } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface SignUpFormProps {
  errorMessage?: string;
}

export default function SignUpForm({ errorMessage }: Readonly<SignUpFormProps>) {
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

    const { email, password, firstName, lastName } = data;

    const origin = headers().get('origin');
    const adminClient = createAdminClient();

    // Create the account via admin API, which separates account creation
    // from email sending and won't fail due to email rate limits.
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    });

    if (createError || !createData.user) {
      return redirect('/login?message=Could not authenticate user');
    }

    await adminClient.from('user_profiles').insert({
      user_id: createData.user.id,
      first_name: firstName,
      last_name: lastName,
    });

    // Send confirmation email — best effort, account creation already succeeded.
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });

    return redirect('/login?message=Check email to continue sign in process');
  }

  return (
    <Form
      onSuccess={onSuccess}
      formFields={formFields}
      errorMessage={errorMessage}
      saveButtonLabel="Sign Up"
      saveButtonIcon={<LoginIcon />}
    />
  );
}
