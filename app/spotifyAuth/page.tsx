'use client';

import Loading from '@/components/design/Loading';
import { useSpotify } from '@/hooks/useSpotify';
import { SPOTIFY_AUTH_DESTINATION_KEY } from '@/components/SpotifyConnectBanner';
import { useEffect, useState } from 'react';

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_API_KEY ?? '';
const SCOPES = ['user-read-private', 'playlist-read-private'];

// Inner component rendered only after we have window.location.origin
function SpotifyAuthHandler({ redirectUrl }: { redirectUrl: string }) {
  const sdk = useSpotify(CLIENT_ID, redirectUrl, SCOPES);

  useEffect(() => {
    if (sdk) {
      const dest = localStorage.getItem(SPOTIFY_AUTH_DESTINATION_KEY) ?? '/';
      localStorage.removeItem(SPOTIFY_AUTH_DESTINATION_KEY);
      // Full reload so the module-level subscription cache is reset
      window.location.href = dest;
    }
  }, [sdk]);

  return <Loading />;
}

export default function SpotifyAuthPage() {
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    setRedirectUrl(`${window.location.origin}/spotifyConnect`);
  }, []);

  if (!redirectUrl) return <Loading />;
  return <SpotifyAuthHandler redirectUrl={redirectUrl} />;
}
