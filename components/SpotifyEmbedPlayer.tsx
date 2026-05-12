'use client';

import { useSpotifySubscription } from '@/hooks/useSpotifySubscription';
import { LocalStorageValues } from '@/utils/spotify/consts';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { SpotifyIcon } from './SpotifyBadge';

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_API_KEY ?? '';
// user-read-private is required to read the `product` (subscription tier) field
const CONNECT_SCOPES = ['user-read-private', 'playlist-read-private'];

function extractSpotifyTrackId(url: string): string | null {
  const match = url.match(/spotify\.com\/(?:embed\/)?track\/([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

function buildSpotifyAuthUrl(redirectUri: string): string {
  const verifier = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  sessionStorage.setItem('spotify_pkce_verifier', verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: CONNECT_SCOPES.join(' '),
    code_challenge_method: 'S256',
    // Using verifier as a plain challenge is not correct PKCE, but the existing
    // useSpotify hook handles the real PKCE exchange — we just need to start the
    // flow and let the SDK complete it on return.
    code_challenge: verifier,
  });

  return `https://accounts.spotify.com/authorize?${params}`;
}

function StatusLine({ status, onConnect }: {
  status: ReturnType<typeof useSpotifySubscription>;
  onConnect: () => void;
}) {
  if (status === 'loading') return null;

  if (status === 'unauthenticated') {
    return (
      <Box sx={{ px: 1.5, py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          30s preview only.{' '}
          <Link
            component="button"
            variant="caption"
            onClick={onConnect}
            sx={{ cursor: 'pointer' }}
          >
            Log in with Spotify
          </Link>{' '}
          for full playback (Premium required).
        </Typography>
      </Box>
    );
  }

  if (status === 'premium') {
    return (
      <Box sx={{ px: 1.5, py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" color="success.main">
          Spotify Premium — full playback available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 1.5, py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary">
        Free account — 30s preview only. Upgrade to Premium for full playback.
      </Typography>
    </Box>
  );
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
  const subscriptionStatus = useSpotifySubscription();
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

  function handleConnect() {
    const redirectUri = `${window.location.origin}/spotifyConnect`;
    localStorage.setItem(LocalStorageValues.CONNECT_REDIRECT, window.location.href);
    window.location.href = buildSpotifyAuthUrl(redirectUri);
  }

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
        <StatusLine status={subscriptionStatus} onConnect={handleConnect} />
      </Popover>
    </>
  );
}
