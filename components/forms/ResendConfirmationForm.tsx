'use client';

import { createClient } from '@/utils/supabase/client';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

export default function ResendConfirmationForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(undefined);
    setError(undefined);
    setLoading(true);

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    setLoading(false);

    if (resendError) {
      setError(resendError.message);
    } else {
      setMessage('Confirmation email sent. Check your inbox.');
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="body2" color="text.secondary" mb={1}>
        Need a new confirmation email?
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <Button type="submit" variant="outlined" disabled={loading} sx={{ whiteSpace: 'nowrap' }}>
          Resend
        </Button>
      </Box>
      {message && (
        <Alert severity="success" sx={{ mt: 1 }}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
