'use client';

import useUserProfile from '@/hooks/useUserProfile';
import { createClient } from '@/utils/supabase/client';
import { PostgrestError, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import Loading from '../design/Loading';
import LoadingButton from '@mui/lab/LoadingButton';

import SaveIcon from '@mui/icons-material/Save';
interface UserProfileFormProps {
  user: User;
}

export default function UserProfileForm({ user }: Readonly<UserProfileFormProps>) {
  const [error, setError] = useState<PostgrestError>();
  const [isFormProcessing, setIsFormProcessing] = useState(false);

  const router = useRouter();

  const { data: userProfile, isLoading } = useUserProfile({ userId: user.id });
  const supabase = createClient();

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

  async function onSubmit(data: FieldValues) {
    if (userProfile) {
      setIsFormProcessing(true);
      const { error: submitError } = await supabase
        .from('user_profiles')
        .update({ first_name: data.firstName, last_name: data.lastName })
        .eq('id', userProfile.id);

      if (submitError) {
        setIsFormProcessing(false);
        setError(submitError);
      } else {
        router.push('/');
      }
    }
  }

  return (
    <FormContainer defaultValues={defaultValues} onSuccess={onSubmit}>
      <TextFieldElement name="firstName" label="First Name" fullWidth required className="mb-4" />
      <TextFieldElement name="lastName" label="Last Name" fullWidth required className="mb-4" />
      {error && <span>{error.message}</span>}
      <LoadingButton
        variant="contained"
        type="submit"
        loading={isFormProcessing}
        startIcon={<SaveIcon />}
      >
        Save
      </LoadingButton>
    </FormContainer>
  );
}
