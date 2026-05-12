'use client';

import { useEffect, useState } from 'react';

export type SpotifySubscriptionStatus = 'loading' | 'unauthenticated' | 'free' | 'premium';

// Key used by @spotify/web-api-ts-sdk to cache the access token
const TOKEN_CACHE_KEY = 'spotify-sdk:AuthorizationCodeWithPKCEStrategy:token';

function getCachedAccessToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_CACHE_KEY);
    if (!raw) return null;
    const token = JSON.parse(raw);
    if (!token?.access_token) return null;
    if (token.expires && token.expires < Date.now()) return null;
    return token.access_token as string;
  } catch {
    return null;
  }
}

export function useSpotifySubscription(): SpotifySubscriptionStatus {
  const [status, setStatus] = useState<SpotifySubscriptionStatus>('loading');

  useEffect(() => {
    const token = getCachedAccessToken();
    if (!token) {
      setStatus('unauthenticated');
      return;
    }

    fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { product?: string } | null) => {
        if (!data) {
          setStatus('unauthenticated');
        } else if (data.product === 'premium') {
          setStatus('premium');
        } else if (data.product) {
          setStatus('free');
        } else {
          // Token lacks user-read-private scope — treat as unauthenticated for status purposes
          setStatus('unauthenticated');
        }
      })
      .catch(() => setStatus('unauthenticated'));
  }, []);

  return status;
}
