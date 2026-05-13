'use client';

import AudioFileInput from '@/components/AudioFileInput';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import LinkIcon from '@mui/icons-material/Link';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export type SongRefType = 'link' | 'audio';

interface SongReferenceInputProps {
  type: SongRefType;
  linkUrl: string;
  existingAudioUrl?: string | null;
  onTypeChange: (type: SongRefType) => void;
  onLinkChange: (url: string) => void;
  onAudioFileSelect: (file: File | null) => void;
  onRemoveExistingAudio: () => void;
}

export default function SongReferenceInput({
  type,
  linkUrl,
  existingAudioUrl,
  onTypeChange,
  onLinkChange,
  onAudioFileSelect,
  onRemoveExistingAudio,
}: Readonly<SongReferenceInputProps>) {
  function handleTypeChange(_: React.MouseEvent, newType: SongRefType | null) {
    if (!newType || newType === type) return;
    onTypeChange(newType);
  }

  return (
    <Box className="mb-4">
      <ToggleButtonGroup
        value={type}
        exclusive
        onChange={handleTypeChange}
        size="small"
        sx={{ mb: 1.5 }}
      >
        <ToggleButton value="link">
          <LinkIcon fontSize="small" sx={{ mr: 0.5 }} />
          Link (URL)
        </ToggleButton>
        <ToggleButton value="audio">
          <AudiotrackIcon fontSize="small" sx={{ mr: 0.5 }} />
          Upload Audio
        </ToggleButton>
      </ToggleButtonGroup>

      {type === 'link' && (
        <TextField
          label="Link (URL)"
          value={linkUrl}
          onChange={(e) => onLinkChange(e.target.value)}
          placeholder="e.g. https://soundcloud.com/..."
          fullWidth
        />
      )}

      {type === 'audio' && (
        <AudioFileInput
          existingUrl={existingAudioUrl}
          onFileSelect={onAudioFileSelect}
          onRemoveExisting={onRemoveExistingAudio}
        />
      )}
    </Box>
  );
}
