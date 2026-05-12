'use client';

import { useSpotifySubscription } from '@/hooks/useSpotifySubscription';
import { LocalStorageValues } from '@/utils/spotify/consts';
import { AuthorizationCodeWithPKCEStrategy, SpotifyApi } from '@spotify/web-api-ts-sdk';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_API_KEY ?? '';
const SCOPES = ['user-read-private', 'playlist-read-private'];
// Token cache key used by the SDK — cleared to force re-auth with updated scopes
const TOKEN_CACHE_KEY = 'spotify-sdk:AuthorizationCodeWithPKCEStrategy:token';

async function initiateSpotifyLogin() {
  localStorage.removeItem(TOKEN_CACHE_KEY);
  localStorage.setItem(LocalStorageValues.CONNECT_REDIRECT, window.location.href);

  const redirectUrl = `${window.location.origin}/spotifyConnect`;
  const auth = new AuthorizationCodeWithPKCEStrategy(CLIENT_ID, redirectUrl, SCOPES);
  const sdk = new SpotifyApi(auth);
  await sdk.authenticate();
}

export default function SpotifyConnectBanner() {
  const status = useSpotifySubscription();

  if (status !== 'unauthenticated') return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Alert
        severity="info"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={initiateSpotifyLogin}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Log in with Spotify
          </Button>
        }
      >
        Log in with Spotify to play songs directly in the app instead of opening a new tab.
      </Alert>
    </Box>
  );
}
