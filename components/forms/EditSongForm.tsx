'use client';

import AudioFileInput from '@/components/AudioFileInput';
import SpotifyBadge, { SpotifyIcon } from '@/components/SpotifyBadge';
import SpotifyTrackSearch, { SpotifyTrack } from '@/components/SpotifyTrackSearch';
import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import { cleanSpotifyTrackName, formatMsToDuration, parseDurationToMs } from '@/utils/songs';
import SaveIcon from '@mui/icons-material/Save';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import LoadingButton from '@mui/lab/LoadingButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useRef, useState } from 'react';
import { FieldValues } from 'react-hook-form';
import Form, { FormField } from '../design/Form';

interface EditSongFormProps {
  song: Tables<'songs'>;
  onSuccess?: () => void;
}

type Mode = 'spotify' | 'manual';
type LinkedAction = null | 're-search' | 'confirm-unlink' | 'manual-edit';

const sharedBandNotesField: FormField = {
  fieldType: 'textarea',
  name: 'shared_band_notes',
  label: 'Shared Band Notes',
  fullWidth: true,
  rows: 10,
  inputProps: { style: { fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: 1.8 } },
  helperText: 'Only upload content you have the right to use (your own notes, original transcriptions, or content you are licensed to store).',
};

const songLinkField: FormField = {
  fieldType: 'text',
  name: 'song_link',
  label: 'Link (URL)',
  placeholder: 'e.g. https://soundcloud.com/...',
  fullWidth: true,
};

async function uploadSongAudio(
  supabase: ReturnType<typeof createClient>,
  file: File,
  bandId: number
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'audio';
  const path = `${bandId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('song-audio').upload(path, file, {
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('song-audio').getPublicUrl(path);
  return data.publicUrl;
}

async function deleteSongAudio(
  supabase: ReturnType<typeof createClient>,
  audioUrl: string
): Promise<void> {
  try {
    const url = new URL(audioUrl);
    const pathParts = url.pathname.split('/song-audio/');
    if (pathParts.length < 2) return;
    await supabase.storage.from('song-audio').remove([pathParts[1]]);
  } catch {
    // ignore storage delete errors — the DB update is the source of truth
  }
}

export default function EditSongForm({ song, onSuccess }: Readonly<EditSongFormProps>) {
  const [mode, setMode] = useState<Mode>('manual');
  const [linkedAction, setLinkedAction] = useState<LinkedAction>(null);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [sharedBandNotes, setSharedBandNotes] = useState(song.shared_band_notes ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [removeAudio, setRemoveAudio] = useState(false);
  const audioFileRef = useRef<File | null>(null);
  const supabase = createClient();
  const isSpotifyLinked = Boolean(song.spotify_url);

  const spotifyInitialQuery = [song.name, song.artist].filter(Boolean).join(' ');

  const manualFormFields: FormField[] = useMemo(
    () => [
      {
        fieldType: 'text' as FormField['fieldType'],
        name: 'name',
        label: 'Song Name',
        fullWidth: true,
        required: true,
      },
      {
        fieldType: 'text' as FormField['fieldType'],
        name: 'artist',
        label: 'Artist',
        fullWidth: true,
      },
      {
        fieldType: 'text' as FormField['fieldType'],
        name: 'duration',
        label: 'Duration (m:ss)',
        placeholder: 'e.g. 3:45',
        fullWidth: true,
      },
      {
        fieldType: 'text' as FormField['fieldType'],
        name: 'song_link',
        label: 'Link (URL)',
        placeholder: 'e.g. https://soundcloud.com/...',
        fullWidth: true,
      },
      sharedBandNotesField,
    ],
    []
  );

  const defaultValues = useMemo(
    () => ({
      name: song.name ?? '',
      artist: song.artist ?? '',
      duration: song.duration ? formatMsToDuration(song.duration) : '',
      song_link: song.song_link ?? '',
      shared_band_notes: song.shared_band_notes ?? '',
    }),
    [song]
  );

  async function resolveAudioUrl(): Promise<{ audio_url?: string | null }> {
    if (removeAudio) {
      if (song.audio_url) await deleteSongAudio(supabase, song.audio_url);
      return { audio_url: null };
    }
    if (audioFileRef.current) {
      if (song.audio_url) await deleteSongAudio(supabase, song.audio_url);
      const url = await uploadSongAudio(supabase, audioFileRef.current, song.band_id);
      return { audio_url: url };
    }
    return {};
  }

  function handleTabChange(_: React.SyntheticEvent, newMode: Mode) {
    setMode(newMode);
    setSelectedTrack(null);
    setErrorMessage('');
  }

  async function handleManualSuccess(data: FieldValues) {
    setErrorMessage('');

    const duration = data.duration ? parseDurationToMs(data.duration) : null;
    if (data.duration && duration === null) {
      setErrorMessage('Invalid duration format. Use m:ss (e.g. 3:45).');
      return;
    }

    let audioUpdate: { audio_url?: string | null } = {};
    try {
      audioUpdate = await resolveAudioUrl();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload audio file.');
      return;
    }

    const { error } = await supabase
      .from('songs')
      .update({
        name: data.name,
        artist: data.artist || null,
        duration,
        song_link: data.song_link || null,
        shared_band_notes: data.shared_band_notes || null,
        ...audioUpdate,
      })
      .eq('id', song.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      onSuccess?.();
    }
  }

  async function handleSpotifyLink() {
    if (!selectedTrack) return;
    setIsSubmitting(true);
    setErrorMessage('');

    const { error } = await supabase
      .from('songs')
      .update({
        name: cleanSpotifyTrackName(selectedTrack.name),
        artist: selectedTrack.artists.map((a) => a.name).join(', '),
        duration: selectedTrack.duration_ms,
        spotify_url: selectedTrack.external_urls.spotify,
        shared_band_notes: sharedBandNotes || null,
      })
      .eq('id', song.id);

    setIsSubmitting(false);
    if (error) {
      setErrorMessage(error.message);
    } else {
      onSuccess?.();
    }
  }

  async function handleSpotifyOnlySuccess(data: FieldValues) {
    setErrorMessage('');
    const { error } = await supabase
      .from('songs')
      .update({
        shared_band_notes: data.shared_band_notes || null,
        song_link: data.song_link || null,
      })
      .eq('id', song.id);
    if (error) {
      setErrorMessage(error.message);
    } else {
      onSuccess?.();
    }
  }

  async function handleManualEditSuccess(data: FieldValues) {
    setErrorMessage('');

    const duration = data.duration ? parseDurationToMs(data.duration) : null;
    if (data.duration && duration === null) {
      setErrorMessage('Invalid duration format. Use m:ss (e.g. 3:45).');
      return;
    }

    let audioUpdate: { audio_url?: string | null } = {};
    try {
      audioUpdate = await resolveAudioUrl();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upload audio file.');
      return;
    }

    const { error } = await supabase
      .from('songs')
      .update({
        name: data.name,
        artist: data.artist || null,
        duration,
        song_link: data.song_link || null,
        shared_band_notes: data.shared_band_notes || null,
        spotify_url: null,
        ...audioUpdate,
      })
      .eq('id', song.id);

    if (error) {
      setErrorMessage(error.message);
    } else {
      onSuccess?.();
    }
  }

  const audioInputElement = (
    <AudioFileInput
      existingUrl={removeAudio ? null : song.audio_url}
      onFileSelect={(file) => {
        audioFileRef.current = file;
        if (file) setRemoveAudio(false);
      }}
      onRemoveExisting={() => {
        setRemoveAudio(true);
        audioFileRef.current = null;
      }}
    />
  );

  // Already linked to Spotify
  if (isSpotifyLinked) {
    // Confirmed unlink: show manual form; spotify_url removed only on save
    if (linkedAction === 'manual-edit') {
      return (
        <Form
          onSuccess={handleManualEditSuccess}
          formFields={manualFormFields}
          defaultValues={defaultValues}
          errorMessage={errorMessage}
          saveButtonLabel="Save Changes"
          extraContent={audioInputElement}
        />
      );
    }

    // Unlink confirmation
    if (linkedAction === 'confirm-unlink') {
      return (
        <>
          <Alert severity="warning" className="mb-4">
            Switching to manual entry will remove the Spotify link for this song. You will be able
            to edit the name, artist, and duration freely, but the song will no longer be linked to
            Spotify.
          </Alert>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={() => setLinkedAction(null)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={() => setLinkedAction('manual-edit')}
            >
              Confirm — Switch to Manual
            </Button>
          </Box>
        </>
      );
    }

    // Re-search Spotify
    if (linkedAction === 're-search') {
      return (
        <>
          {!selectedTrack ? (
            <>
              <SpotifyTrackSearch onSelect={setSelectedTrack} initialQuery={spotifyInitialQuery} />
              <Button variant="outlined" size="small" onClick={() => setLinkedAction(null)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Box className="mb-4" sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Selected song
                </Typography>
                <Typography variant="h6" component="p">
                  {cleanSpotifyTrackName(selectedTrack.name)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedTrack.artists.map((a) => a.name).join(', ')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatMsToDuration(selectedTrack.duration_ms)}
                </Typography>
              </Box>
              <Divider className="mb-4" />
              <TextField
                label="Shared Band Notes"
                value={sharedBandNotes}
                onChange={(e) => setSharedBandNotes(e.target.value)}
                fullWidth
                multiline
                rows={10}
                className="mb-4"
                inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: 1.8 } }}
              />
              {errorMessage && (
                <Alert severity="error" className="mb-4">
                  {errorMessage}
                </Alert>
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={() => setSelectedTrack(null)}>
                  Search Again
                </Button>
                <LoadingButton
                  variant="contained"
                  loading={isSubmitting}
                  startIcon={<SaveIcon />}
                  onClick={handleSpotifyLink}
                >
                  Update Spotify Link
                </LoadingButton>
              </Box>
            </>
          )}
        </>
      );
    }

    // Default: show linked info + chord chart
    return (
      <>
        <Box
          sx={{
            mb: 3,
            p: 2,
            border: '1px solid #1DB954',
            borderRadius: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <SpotifyBadge spotifyUrl={song.spotify_url!} size={24} />
            <Typography variant="caption" color="text.secondary">
              Name, artist, and duration are managed by Spotify
            </Typography>
          </Box>
          <Typography variant="h6" component="p" sx={{ lineHeight: 1.3 }}>
            {song.name}
          </Typography>
          {song.artist && (
            <Typography variant="body2" color="text.secondary">
              {song.artist}
            </Typography>
          )}
          {song.duration && (
            <Typography variant="body2" color="text.secondary">
              {formatMsToDuration(song.duration)}
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 1, mt: 1, pt: 1.5, borderTop: '1px solid rgba(29,185,84,0.25)' }}>
            <Button size="small" variant="outlined" onClick={() => setLinkedAction('re-search')}
              sx={{ borderColor: '#1DB954', color: '#1DB954', '&:hover': { borderColor: '#17a349', color: '#17a349' } }}>
              Change Spotify Link
            </Button>
            <Button size="small" color="inherit" onClick={() => setLinkedAction('confirm-unlink')}>
              Switch to Manual
            </Button>
          </Box>
        </Box>
        <Divider className="mb-4" />
        <Form
          onSuccess={handleSpotifyOnlySuccess}
          formFields={[songLinkField, sharedBandNotesField]}
          defaultValues={{ song_link: song.song_link ?? '', shared_band_notes: song.shared_band_notes ?? '' }}
          errorMessage={errorMessage}
          saveButtonLabel="Save Changes"
        />
      </>
    );
  }

  // Not linked to Spotify: show tabs
  return (
    <>
      <Tabs value={mode} onChange={handleTabChange} className="mb-4">
        <Tab icon={<span style={{ marginRight: 6, display: 'inline-flex' }}><SpotifyIcon size={16} /></span>} iconPosition="start" label="Search Spotify" value="spotify" />
        <Tab label="Manual Entry" value="manual" />
      </Tabs>

      {mode === 'spotify' && (
        <>
          {!selectedTrack ? (
            <SpotifyTrackSearch onSelect={setSelectedTrack} initialQuery={spotifyInitialQuery} />
          ) : (
            <>
              <Box className="mb-4" sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Selected song
                </Typography>
                <Typography variant="h6" component="p">
                  {cleanSpotifyTrackName(selectedTrack.name)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedTrack.artists.map((a) => a.name).join(', ')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatMsToDuration(selectedTrack.duration_ms)}
                </Typography>
              </Box>
              <Divider className="mb-4" />
              <TextField
                label="Shared Band Notes"
                value={sharedBandNotes}
                onChange={(e) => setSharedBandNotes(e.target.value)}
                fullWidth
                multiline
                rows={10}
                className="mb-4"
                inputProps={{ style: { fontFamily: 'monospace', fontSize: '0.95rem', lineHeight: 1.8 } }}
              />
              {errorMessage && (
                <Alert severity="error" className="mb-4">
                  {errorMessage}
                </Alert>
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={() => setSelectedTrack(null)}>
                  Search Again
                </Button>
                <LoadingButton
                  variant="contained"
                  loading={isSubmitting}
                  startIcon={<SaveIcon />}
                  onClick={handleSpotifyLink}
                >
                  Link to Spotify
                </LoadingButton>
              </Box>
            </>
          )}
        </>
      )}

      {mode === 'manual' && (
        <Form
          onSuccess={handleManualSuccess}
          formFields={manualFormFields}
          defaultValues={defaultValues}
          errorMessage={errorMessage}
          saveButtonLabel="Save Changes"
          extraContent={audioInputElement}
        />
      )}
    </>
  );
}
