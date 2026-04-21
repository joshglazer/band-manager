'use client';

import Alert from '@mui/material/Alert';
import { useMemo, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface InviteMemberFormProps {
  bandId: number;
  onInviteSent?: () => void;
}

export default function InviteMemberForm({ bandId, onInviteSent }: Readonly<InviteMemberFormProps>) {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();

  const formFields: FormField[] = useMemo(
    () => [
      {
        fieldType: 'text' as FormField['fieldType'],
        name: 'email',
        label: 'Email address',
        fullWidth: true,
        required: true,
        type: 'email',
      },
    ],
    []
  );

  async function onSuccess(data: FieldValues) {
    setErrorMessage(undefined);
    setSuccessMessage(undefined);

    const response = await fetch(`/api/bands/${bandId}/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email }),
    });

    if (response.ok) {
      setSuccessMessage('Invitation sent.');
      onInviteSent?.();
    } else {
      const body = await response.json();
      setErrorMessage(body.error ?? 'Failed to send invitation.');
    }
  }

  return (
    <>
      {successMessage && (
        <Alert severity="success" className="mb-4">
          {successMessage}
        </Alert>
      )}
      <Form
        onSuccess={onSuccess}
        formFields={formFields}
        errorMessage={errorMessage}
        saveButtonLabel="Send Invite"
      />
    </>
  );
}
