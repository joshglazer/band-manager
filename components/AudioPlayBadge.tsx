'use client';

import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';

interface AudioPlayBadgeProps {
  audioUrl: string;
  size?: number;
}

export default function AudioPlayBadge({ audioUrl, size = 20 }: Readonly<AudioPlayBadgeProps>) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  return (
    <>
      <Tooltip title="Play audio">
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ p: 0, flexShrink: 0, color: 'primary.main' }}
          aria-label="Play audio"
        >
          <PlayCircleIcon sx={{ fontSize: size }} />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <audio
          controls
          autoPlay
          src={audioUrl}
          style={{ display: 'block', width: 280, padding: '8px' }}
        />
      </Popover>
    </>
  );
}
