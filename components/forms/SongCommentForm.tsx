import { createClient } from '@/utils/supabase/client';
import { useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';
import useCommentTypes from '@/hooks/useCommentTypes';

interface SongCommentFormProps {
  songId?: number;
  onSubmit?: () => void;
}

export default function SongCommentForm({ songId, onSubmit }: Readonly<SongCommentFormProps>) {
  const { data: commentTypes, isLoading } = useCommentTypes();

  console.log(commentTypes, isLoading);

  const [errorMessage, setErrorMessage] = useState<string>();

  const supabase = createClient();

  const formFields: FormField[] = useMemo(
    () => [
      {
        fieldType: 'select' as FormField['fieldType'],
        name: 'comment_type_id',
        label: 'Type',
        options: commentTypes,
        fullWidth: true,
        required: true,
      },

      {
        fieldType: 'textarea' as FormField['fieldType'],
        name: 'comment',
        label: 'Comment',
        fullWidth: true,
        required: true,
      },
    ],
    [commentTypes]
  );

  async function onSuccess(data: FieldValues) {
    setErrorMessage('');
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (songId && user) {
      console.log(data);
      const { error: submitError } = await supabase.from('song_comments').insert({
        song_id: songId,
        user_id: user.id,
        comment: data.comment,
        comment_type_id: data.comment_type_id,
      });
      if (submitError) {
        setErrorMessage(submitError.message);
      } else {
        onSubmit && onSubmit();
      }
    }
  }

  return <Form onSuccess={onSuccess} formFields={formFields} errorMessage={errorMessage}></Form>;
}
