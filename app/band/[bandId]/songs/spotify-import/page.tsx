'use client';

import { useSpotify } from '@/hooks/useSpotify';
import { createClient } from '@/utils/supabase/client';
import {
  Page,
  PlaylistedTrack,
  SimplifiedPlaylist,
  Track,
} from '@spotify/web-api-ts-sdk';
import { useEffect, useState } from 'react';
import { BandRouteProps } from '../../types';
import { useRouter } from 'next/navigation';

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_API_KEY || '';
const redirectUrl = `${location.origin}/spotifyConnect`;
const activeScopes = ['playlist-read-private'];

export default function SpotifyImportSongsPage({ params }: BandRouteProps) {
  const [playlists, setPlaylists] = useState<Page<SimplifiedPlaylist>>();
  const [tracks, setTracks] = useState<Page<PlaylistedTrack>>();
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<SimplifiedPlaylist>();
  const spotifySdk = useSpotify(clientId, redirectUrl, activeScopes);
  const supabase = createClient();
  const router = useRouter();

  const { bandId } = params;

  useEffect(() => {
    if (spotifySdk) {
      spotifySdk.currentUser.playlists.playlists().then(setPlaylists);
    }
  }, [spotifySdk]);

  useEffect(() => {
    if (selectedPlaylist && spotifySdk) {
      spotifySdk?.playlists
        .getPlaylistItems(selectedPlaylist?.id)
        .then(setTracks);
    }
  }, [selectedPlaylist, spotifySdk]);

  function handlePlaylistClick(playlist: SimplifiedPlaylist) {
    setSelectedPlaylist(playlist);
  }

  // TODO: handle errors or move to server
  async function importAllTracks() {
    if (tracks?.items) {
      for (const playlistTrack of tracks?.items) {
        const track = playlistTrack.track as Track;
        const { name, duration_ms: duration } = track;

        const artist = track.album.artists
          .map((artist) => artist.name)
          .join(', ');
        Promise.allSettled;

        await supabase
          .from('songs')
          .insert({ name, artist, band_id: bandId, duration });
      }
    }

    router.push(`/band/${bandId}/songs`);
  }

  console.log('tracks', tracks);

  if (!spotifySdk) {
    return <div>Loading...</div>;
  }

  if (selectedPlaylist) {
    return (
      <>
        <div>Selected Playlist: {selectedPlaylist.name}</div>
        {tracks && (
          <>
            <div>
              {tracks.items.map((track) => (
                <div key={track.track.id}>{track.track.name}</div>
              ))}
            </div>
            <button onClick={importAllTracks}>Import All Songs</button>
          </>
        )}
      </>
    );
  }

  return (
    <>
      {playlists?.items.map((playlist) => (
        <div key={playlist.id} onClick={() => handlePlaylistClick(playlist)}>
          {playlist.name}
        </div>
      ))}
    </>
  );
}
