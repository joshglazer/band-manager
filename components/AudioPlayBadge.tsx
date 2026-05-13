'use client';

import CloseIcon from '@mui/icons-material/Close';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { usePlayerDrawer } from '@/hooks/usePlayerDrawer';
import { createPortal } from 'react-dom';

interface AudioPlayBadgeProps {
  audioUrl: string;
  size?: number;
}

export default function AudioPlayBadge({ audioUrl, size = 20 }: Readonly<AudioPlayBadgeProps>) {
  const { open, openDrawer, closeDrawer, drawerRef } = usePlayerDrawer();

  return (
    <>
      <Tooltip title="Play audio">
        <IconButton
          size="small"
          onClick={openDrawer}
          sx={{ p: 0, flexShrink: 0, color: 'primary.main' }}
          aria-label="Play audio"
        >
          <PlayCircleIcon sx={{ fontSize: size }} />
        </IconButton>
      </Tooltip>
      {open &&
        createPortal(
          <Paper
            ref={drawerRef}
            elevation={8}
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1300,
              borderRadius: '8px 8px 0 0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Now Playing
              </Typography>
              <IconButton size="small" onClick={closeDrawer} aria-label="Close player">
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ px: 2, pb: 1.5 }}>
              <audio
                controls
                autoPlay
                src={audioUrl}
                style={{ display: 'block', width: '100%' }}
              />
            </Box>
          </Paper>,
          document.body,
        )}
    </>
  );
}
