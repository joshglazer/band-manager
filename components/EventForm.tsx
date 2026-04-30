'use client';

import { BandEvent, EventType } from '@/types/composites';
import { createClient } from '@/utils/supabase/client';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

interface EventFormProps {
  bandId: number;
  event?: BandEvent;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EventForm({ bandId, event, onSuccess, onCancel }: EventFormProps) {
  const isEdit = !!event;
  const [type, setType] = useState<EventType>(event?.type ?? 'practice');
  const [location, setLocation] = useState(event?.location ?? '');
  const [date, setDate] = useState(event?.date ?? '');
  // PostgreSQL returns time as "HH:MM:SS"; <input type="time"> needs "HH:MM"
  const [time, setTime] = useState(event?.time ? event.time.slice(0, 5) : '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !date) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const payload = {
      type,
      location: location.trim(),
      date,
      time: time || null,
    };

    const { error: dbError } = isEdit
      ? await supabase.from('band_events').update(payload).eq('id', event.id)
      : await supabase.from('band_events').insert({ ...payload, band_id: bandId });

    if (dbError) {
      setError(dbError.message);
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

      <Box sx={{ display: 'flex', gap: 1.5 }}>
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
        <TextField
          label="Time"
          type="time"
          size="small"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {error && (
        <Box sx={{ color: 'error.main', typography: 'caption' }}>{error}</Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button variant="text" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" type="submit" disabled={submitting || !location.trim() || !date}>
          {isEdit ? 'Save Changes' : 'Add Event'}
        </Button>
      </Box>
    </Box>
  );
}
