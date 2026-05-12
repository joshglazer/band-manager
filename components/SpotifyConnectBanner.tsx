'use client';

import { SpotifyIcon } from '@/components/SpotifyBadge';
import {
  SPOTIFY_BANNER_DISMISSED_KEY,
  SPOTIFY_TOKEN_CACHE_KEY,
  useSpotifySubscription,
} from '@/hooks/useSpotifySubscription';
import { LocalStorageValues } from '@/utils/spotify/consts';
import { AuthorizationCodeWithPKCEStrategy, SpotifyApi } from '@spotify/web-api-ts-sdk';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_API_KEY ?? '';
const SCOPES = ['user-read-private', 'playlist-read-private'];

async function initiateSpotifyLogin() {
  localStorage.removeItem(SPOTIFY_TOKEN_CACHE_KEY);
  localStorage.removeItem(SPOTIFY_BANNER_DISMISSED_KEY);
  localStorage.setItem(LocalStorageValues.CONNECT_REDIRECT, window.location.href);

  const redirectUrl = `${window.location.origin}/spotifyConnect`;
  const auth = new AuthorizationCodeWithPKCEStrategy(CLIENT_ID, redirectUrl, SCOPES);
  const sdk = new SpotifyApi(auth);
  await sdk.authenticate();
}

export default function SpotifyConnectBanner() {
  const status = useSpotifySubscription();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(SPOTIFY_BANNER_DISMISSED_KEY) === 'true');
    } catch {
      // localStorage unavailable
    }
  }, []);

  if (status !== 'unauthenticated' || dismissed) return null;

  function handleDismiss() {
    try {
      localStorage.setItem(SPOTIFY_BANNER_DISMISSED_KEY, 'true');
    } catch {
      // localStorage unavailable
    }
    setDismissed(true);
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity="info" onClose={handleDismiss}>
        Log in with Spotify to play songs directly in the app instead of opening a new tab.
        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            variant="contained"
            onClick={initiateSpotifyLogin}
            startIcon={<SpotifyIcon size={16} />}
            sx={{
              background: '#1DB954',
              color: '#fff',
              '&:hover': { background: '#17a349' },
            }}
          >
            Log in with Spotify
          </Button>
        </Box>
      </Alert>
    </Box>
  );
}
