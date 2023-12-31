'use client';

import { LocalStorageValues } from '@/utils/spotify/consts';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SpotifyConnectPage() {
  const router = useRouter();
  useEffect(() => {
    const redirectUrl = window.localStorage.getItem(
      LocalStorageValues.CONNECT_REDIRECT
    );
    if (redirectUrl) {
      router.push(`${redirectUrl}${window.location.search}`);
    }
  }, [router]);
  return <div>Loading...</div>;
}
