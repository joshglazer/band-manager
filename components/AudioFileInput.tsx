'use client';

import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import ClearIcon from '@mui/icons-material/Clear';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';

interface AudioFileInputProps {
  existingUrl?: string | null;
  onFileSelect: (file: File | null) => void;
  onRemoveExisting?: () => void;
}

export default function AudioFileInput({
  existingUrl,
  onFileSelect,
  onRemoveExisting,
}: Readonly<AudioFileInputProps>) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    onFileSelect(file);
  }

  function handleClearSelected() {
    setSelectedFile(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <Box className="mb-4">
      <Typography variant="subtitle2" gutterBottom>
        Audio File (optional)
      </Typography>

      {existingUrl && !selectedFile && (
        <Box sx={{ mb: 1 }}>
          <audio controls src={existingUrl} style={{ width: '100%', marginBottom: 8 }} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AudiotrackIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Replace Audio
            </Button>
            {onRemoveExisting && (
              <Button
                size="small"
                color="error"
                startIcon={<ClearIcon />}
                onClick={onRemoveExisting}
              >
                Remove Audio
              </Button>
            )}
          </Box>
        </Box>
      )}

      {selectedFile && previewUrl && (
        <Box sx={{ mb: 1 }}>
          <audio controls src={previewUrl} style={{ width: '100%', marginBottom: 4 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AudiotrackIcon fontSize="small" color="action" />
            <Typography variant="body2" sx={{ flex: 1 }} noWrap>
              {selectedFile.name}
            </Typography>
            <IconButton size="small" onClick={handleClearSelected} aria-label="clear selected file">
              <ClearIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      )}

      {!existingUrl && !selectedFile && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<AudiotrackIcon />}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload Audio
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </Box>
  );
}
