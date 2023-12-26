'use client';

import { useSpotify } from '@/hooks/useSpotify';
import { Page, SimplifiedPlaylist } from '@spotify/web-api-ts-sdk';
import { useEffect, useState } from 'react';

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_API_KEY || '';
const redirectUrl = `${window.location.origin}/spotifyConnect`;
const activeScopes = ['playlist-read-private'];

export default function SpotifyPlaylistImport() {
  const [playlists, setPlaylists] = useState<Page<SimplifiedPlaylist>>();
  const spotifySdk = useSpotify(clientId, redirectUrl, activeScopes);

  useEffect(() => {
    if (spotifySdk) {
      spotifySdk.currentUser.playlists.playlists().then(setPlaylists);
    }
  }, [spotifySdk]);

  if (!spotifySdk) {
    return <div>Loading...</div>;
  } else {
    return <div>{playlists?.items.map((playlist) => playlist.name)}</div>;
  }
}
