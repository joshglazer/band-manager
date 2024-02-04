'use client';

import useUserProfile from '@/hooks/useUserProfile';
import { createClient } from '@/utils/supabase/client';
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { PostgrestError, User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import Loading from '../design/Loading';

interface UserProfileFormProps {
  user: User;
}

export default function UserProfileForm({ user }: Readonly<UserProfileFormProps>) {
  const [error, setError] = useState<PostgrestError>();
  const [isFormProcessing, setIsFormProcessing] = useState(false);

  const router = useRouter();

  const { data: userProfile, isLoading } = useUserProfile({ userId: user.id });
  const supabase = createClient();

  const {
    handleSubmit,
    reset,
    control,
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
    <Box
      component="form"
      sx={{
        width: 500,
        maxWidth: '100%',
        '& > :not(style)': { m: 1 },
      }}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name="firstName"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            helperText={error ? error.message : null}
            size="small"
            error={!!error}
            onChange={onChange}
            value={value}
            fullWidth
            label="First Name"
            variant="outlined"
            required
          />
        )}
      />
      <Controller
        name="lastName"
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            helperText={error ? error.message : null}
            size="small"
            error={!!error}
            onChange={onChange}
            value={value}
            fullWidth
            label="Last Name"
            variant="outlined"
            required
          />
        )}
      />

      {!!Object.keys(errors).length && <span>A required field is missing</span>}
      {error && <span>{error.message}</span>}

      <LoadingButton
        variant="contained"
        type="submit"
        loading={isFormProcessing}
        startIcon={<SaveIcon />}
      >
        Save
      </LoadingButton>
    </Box>
  );
}
