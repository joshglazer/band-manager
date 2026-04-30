'use client';

import { EventType } from '@/types/composites';
import { createClient } from '@/utils/supabase/client';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

interface AddEventFormProps {
  bandId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddEventForm({ bandId, onSuccess, onCancel }: AddEventFormProps) {
  const [type, setType] = useState<EventType>('practice');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !date) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from('band_events').insert({
      band_id: bandId,
      type,
      location: location.trim(),
      date,
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
    } else {
      onSuccess();
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Type</InputLabel>
        <Select
          value={type}
          label="Type"
          onChange={(e) => setType(e.target.value as EventType)}
        >
          <MenuItem value="practice">Practice</MenuItem>
          <MenuItem value="gig">Gig</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Location"
        size="small"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
        fullWidth
        placeholder="e.g. Rehearsal Studio, The Roxy"
      />

      <TextField
        label="Date"
        type="date"
        size="small"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
      />

      {error && (
        <Box sx={{ color: 'error.main', typography: 'caption' }}>{error}</Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="text" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" type="submit" disabled={submitting || !location.trim() || !date}>
          Add Event
        </Button>
      </Box>
    </Box>
  );
}
