'use client';

import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import { SpotifyIcon } from './SpotifyBadge';

function extractSpotifyTrackId(url: string): string | null {
  const match = url.match(/spotify\.com\/(?:embed\/)?track\/([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

interface SpotifyEmbedPlayerProps {
  spotifyUrl: string;
  size?: number;
}

export default function SpotifyEmbedPlayer({
  spotifyUrl,
  size = 20,
}: Readonly<SpotifyEmbedPlayerProps>) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const trackId = extractSpotifyTrackId(spotifyUrl);

  if (!trackId) {
    return (
      <Tooltip title="Listen on Spotify">
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}
          aria-label="Listen on Spotify"
        >
          <SpotifyIcon size={size} />
        </a>
      </Tooltip>
    );
  }

  const embedUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`;

  return (
    <>
      <Tooltip title="Play on Spotify">
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          size="small"
          sx={{ p: 0 }}
          aria-label="Play on Spotify"
        >
          <SpotifyIcon size={size} />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <iframe
          src={embedUrl}
          width="300"
          height="80"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify player"
          style={{ display: 'block' }}
        />
      </Popover>
    </>
  );
}
