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

// Module-level cache: all hook instances in a session share one /me fetch
let cachedStatus: SpotifySubscriptionStatus | null = null;
let pendingFetch: Promise<SpotifySubscriptionStatus> | null = null;

async function resolveStatus(): Promise<SpotifySubscriptionStatus> {
  if (cachedStatus) return cachedStatus;
  if (pendingFetch) return pendingFetch;

  pendingFetch = (async (): Promise<SpotifySubscriptionStatus> => {
    const token = getCachedAccessToken();
    if (!token) return (cachedStatus = 'unauthenticated');

    try {
      const res = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return (cachedStatus = 'unauthenticated');
      const data: { product?: string } = await res.json();
      if (data.product === 'premium') return (cachedStatus = 'premium');
      if (data.product) return (cachedStatus = 'free');
      // Token lacks user-read-private scope
      return (cachedStatus = 'unauthenticated');
    } catch {
      return (cachedStatus = 'unauthenticated');
    } finally {
      pendingFetch = null;
    }
  })();

  return pendingFetch;
}

export function useSpotifySubscription(): SpotifySubscriptionStatus {
  const [status, setStatus] = useState<SpotifySubscriptionStatus>(cachedStatus ?? 'loading');

  useEffect(() => {
    resolveStatus().then(setStatus);
  }, []);

  return status;
}
