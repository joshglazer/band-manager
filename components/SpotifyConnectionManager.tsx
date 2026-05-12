'use client';

import { SpotifyIcon } from '@/components/SpotifyBadge';
import {
  SPOTIFY_TOKEN_CACHE_KEY,
  SPOTIFY_BANNER_DISMISSED_KEY,
  disconnectSpotify,
  useSpotifyProfile,
} from '@/hooks/useSpotifySubscription';
import { LocalStorageValues } from '@/utils/spotify/consts';
import { AuthorizationCodeWithPKCEStrategy, SpotifyApi } from '@spotify/web-api-ts-sdk';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

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

function handleDisconnect() {
  disconnectSpotify();
  window.location.reload();
}

export default function SpotifyConnectionManager() {
  const { status, displayName } = useSpotifyProfile();

  const isConnected = status === 'premium' || status === 'free';

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SpotifyIcon size={22} />
        Spotify
      </Typography>

      {status === 'loading' ? (
        <Typography variant="body2" color="text.secondary">
          Checking connection…
        </Typography>
      ) : isConnected ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography variant="body2">
              {displayName ? `Connected as ${displayName}` : 'Connected'}
            </Typography>
            <Chip
              label={status === 'premium' ? 'Premium' : 'Free'}
              size="small"
              color={status === 'premium' ? 'success' : 'default'}
              sx={{ mt: 0.5 }}
            />
          </Box>
          <Button variant="outlined" size="small" color="error" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Not connected. Log in to play songs directly in the app.
          </Typography>
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
      )}
    </Box>
  );
}
