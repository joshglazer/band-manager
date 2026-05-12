'use client';

import { useSpotifySubscription } from '@/hooks/useSpotifySubscription';
import { SpotifyIcon } from '@/components/SpotifyBadge';
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
      <Alert severity="info">
        Log in with Spotify to play songs directly in the app instead of opening a new tab.
        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            variant="contained"
            onClick={initiateSpotifyLogin}
            startIcon={<SpotifyIcon size={16} />}
            sx={{
              backgroundColor: '#1DB954',
              color: '#fff',
              '&:hover': { backgroundColor: '#17a349' },
            }}
          >
            Log in with Spotify
          </Button>
        </Box>
      </Alert>
    </Box>
  );
}
