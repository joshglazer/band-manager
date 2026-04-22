'use client';

import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

export interface ChordChartSection {
  name: string;
  chords: string;
}

interface ChordChartFormValues {
  key: string;
  bpm: string;
  time_signature: string;
  notes: string;
  sections: ChordChartSection[];
}

interface ChordChartFormProps {
  song: Tables<'songs'>;
  onSuccess?: () => void;
}

export default function ChordChartForm({ song, onSuccess }: Readonly<ChordChartFormProps>) {
  const supabase = createClient();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const existingSections = song.sections as ChordChartSection[] | undefined;

  const { register, control, handleSubmit } = useForm<ChordChartFormValues>({
    defaultValues: {
      key: song.key ?? '',
      bpm: song.bpm?.toString() ?? '',
      time_signature: song.time_signature ?? '',
      notes: song.notes ?? '',
      sections: existingSections?.length ? existingSections : [{ name: '', chords: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'sections' });

  async function onSubmit(data: ChordChartFormValues) {
    setIsSaving(true);
    setErrorMessage('');
    setSavedMessage(false);

    const { error } = await supabase
      .from('songs')
      .update({
        key: data.key || null,
        bpm: data.bpm ? parseInt(data.bpm, 10) : null,
        time_signature: data.time_signature || null,
        notes: data.notes || null,
        sections: data.sections.filter((s) => s.name || s.chords),
      })
      .eq('id', song.id);

    setIsSaving(false);
    if (error) {
      setErrorMessage(error.message);
    } else {
      setSavedMessage(true);
      onSuccess?.();
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField label="Key" {...register('key')} size="small" placeholder="G, Dm, F#m..." />
        <TextField
          label="BPM"
          {...register('bpm')}
          size="small"
          type="number"
          inputProps={{ min: 1, max: 300 }}
          sx={{ width: 100 }}
        />
        <TextField
          label="Time Signature"
          {...register('time_signature')}
          size="small"
          placeholder="4/4"
          sx={{ width: 130 }}
        />
      </Box>

      <TextField
        label="Notes"
        {...register('notes')}
        multiline
        rows={3}
        fullWidth
        placeholder="General notes about the song..."
        sx={{ mb: 4 }}
      />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Sections
      </Typography>

      {fields.map((field, index) => (
        <Box key={field.id}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
            <TextField
              label="Section"
              {...register(`sections.${index}.name`)}
              size="small"
              placeholder="Verse, Chorus, Bridge..."
              sx={{ width: 180, flexShrink: 0 }}
            />
            <TextField
              label="Chords"
              {...register(`sections.${index}.chords`)}
              multiline
              rows={2}
              fullWidth
              placeholder="G - D - Em - C"
            />
            <IconButton
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              sx={{ mt: 0.5 }}
              aria-label="Remove section"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
          {index < fields.length - 1 && <Divider sx={{ mb: 2 }} />}
        </Box>
      ))}

      <Button
        startIcon={<AddIcon />}
        onClick={() => append({ name: '', chords: '' })}
        sx={{ mb: 4 }}
      >
        Add Section
      </Button>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      {savedMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Chord chart saved.
        </Alert>
      )}

      <Box>
        <LoadingButton
          variant="contained"
          type="submit"
          loading={isSaving}
          startIcon={<SaveIcon />}
        >
          Save Chord Chart
        </LoadingButton>
      </Box>
    </Box>
  );
}
