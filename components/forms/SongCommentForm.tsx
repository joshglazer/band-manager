import { createClient } from '@/utils/supabase/client';
import { useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface SongCommentFormProps {
  songId?: number;
  onSubmit?: () => void;
}

export default function SongCommentForm({ songId, onSubmit }: Readonly<SongCommentFormProps>) {
  const [errorMessage, setErrorMessage] = useState<string>();

  const supabase = createClient();

  const formFields: FormField[] = useMemo(
    () => [
      {
        fieldType: 'textarea' as FormField['fieldType'],
        name: 'comment',
        label: 'Comment',
        fullWidth: true,
        required: true,
      },
    ],
    []
  );

  async function onSuccess(data: FieldValues) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (songId && user) {
      console.log(data);
      const { error: submitError } = await supabase
        .from('song_comments')
        .insert({ song_id: data.name, user_id: user.id, comment: data.comment });
      if (submitError) {
        setErrorMessage(submitError.message);
      } else {
        onSubmit && onSubmit();
      }
    }
  }

  return <Form onSuccess={onSuccess} formFields={formFields} errorMessage={errorMessage}></Form>;
}
