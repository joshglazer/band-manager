'use client';

import { useEffect, useState } from 'react';

export type SpotifySubscriptionStatus = 'loading' | 'unauthenticated' | 'free' | 'premium';

export const SPOTIFY_TOKEN_CACHE_KEY = 'spotify-sdk:AuthorizationCodeWithPKCEStrategy:token';
export const SPOTIFY_BANNER_DISMISSED_KEY = 'spotify_banner_dismissed';

interface SpotifyProfileData {
  status: SpotifySubscriptionStatus;
  displayName: string | null;
}

function getCachedAccessToken(): string | null {
  try {
    const raw = localStorage.getItem(SPOTIFY_TOKEN_CACHE_KEY);
    if (!raw) return null;
    const token = JSON.parse(raw);
    if (!token?.access_token) return null;
    if (token.expires && token.expires < Date.now()) return null;
    return token.access_token as string;
  } catch {
    return null;
  }
}

// Module-level cache shared across all hook instances in a session
let cachedData: SpotifyProfileData | null = null;
let pendingFetch: Promise<SpotifyProfileData> | null = null;

async function resolveProfile(): Promise<SpotifyProfileData> {
  if (cachedData) return cachedData;
  if (pendingFetch) return pendingFetch;

  pendingFetch = (async (): Promise<SpotifyProfileData> => {
    const token = getCachedAccessToken();
    if (!token) return (cachedData = { status: 'unauthenticated', displayName: null });

    try {
      const res = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return (cachedData = { status: 'unauthenticated', displayName: null });

      const data: { product?: string; display_name?: string } = await res.json();
      let status: SpotifySubscriptionStatus;
      if (data.product === 'premium') status = 'premium';
      else if (data.product) status = 'free';
      else status = 'unauthenticated';

      return (cachedData = { status, displayName: data.display_name ?? null });
    } catch {
      return (cachedData = { status: 'unauthenticated', displayName: null });
    } finally {
      pendingFetch = null;
    }
  })();

  return pendingFetch;
}

export function disconnectSpotify() {
  cachedData = null;
  pendingFetch = null;
  try {
    localStorage.removeItem(SPOTIFY_TOKEN_CACHE_KEY);
    localStorage.removeItem(SPOTIFY_BANNER_DISMISSED_KEY);
  } catch {
    // localStorage unavailable
  }
}

export function useSpotifySubscription(): SpotifySubscriptionStatus {
  const [status, setStatus] = useState<SpotifySubscriptionStatus>(
    cachedData?.status ?? 'loading'
  );
  useEffect(() => {
    resolveProfile().then(({ status: s }) => setStatus(s));
  }, []);
  return status;
}

export function useSpotifyProfile(): SpotifyProfileData {
  const [profile, setProfile] = useState<SpotifyProfileData>({
    status: cachedData?.status ?? 'loading',
    displayName: cachedData?.displayName ?? null,
  });
  useEffect(() => {
    resolveProfile().then(setProfile);
  }, []);
  return profile;
}
