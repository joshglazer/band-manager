'use client';

import useMyInvitations from '@/hooks/useMyInvitations';
import { createClient } from '@/utils/supabase/client';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { mutate } from 'swr';

export default function PendingInvitations() {
  const { data: invitations, isLoading } = useMyInvitations();
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>();
  const supabase = createClient();

  if (isLoading) return null;
  if (!invitations?.length) return null;

  async function handleAccept(invitationId: number, bandId: number) {
    setProcessingId(invitationId);
    setErrorMessage(undefined);

    const response = await fetch(`/api/bands/${bandId}/invitations/${invitationId}/accept`, {
      method: 'POST',
    });

    if (!response.ok) {
      const body = await response.json();
      setErrorMessage(body.error ?? 'Failed to join band.');
    }

    setProcessingId(null);
    mutate(() => true);
  }

  async function handleDecline(invitationId: number) {
    setProcessingId(invitationId);
    setErrorMessage(undefined);

    const { error } = await supabase
      .from('band_invitations')
      .update({ status: 'declined' })
      .eq('id', invitationId);

    if (error) {
      setErrorMessage('Failed to decline invitation.');
    }

    setProcessingId(null);
    mutate(() => true);
  }

  return (
    <Box mb={4}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Pending Invitations
      </Typography>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {invitations.map((invitation) => (
          <Box
            key={invitation.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography>
              You&apos;ve been invited to join{' '}
              <strong>{invitation.bands?.name ?? 'a band'}</strong>
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {processingId === invitation.id ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CheckIcon />}
                    onClick={() =>
                      handleAccept(invitation.id, invitation.band_id)
                    }
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CloseIcon />}
                    onClick={() => handleDecline(invitation.id)}
                  >
                    Decline
                  </Button>
                </>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
