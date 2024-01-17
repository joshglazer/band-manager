'use client';

import Loading from '@/components/design/Loading';
import { useSpotify } from '@/hooks/useSpotify';
import { createClient } from '@/utils/supabase/client';
import Button from '@mui/material/Button';
import {
  Page,
  PlaylistedTrack,
  SimplifiedPlaylist,
  Track,
} from '@spotify/web-api-ts-sdk';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BandRouteProps } from '../../types';

const clientId = process.env.NEXT_PUBLIC_SPOTIFY_API_KEY || '';
const redirectUrl = `${location.origin}/spotifyConnect`;
const activeScopes = ['playlist-read-private'];

export default function SpotifyImportSongsPage({
  params,
}: Readonly<BandRouteProps>) {
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
      for (const playlistTrack of tracks.items) {
        const track = playlistTrack.track as Track;
        const { name, duration_ms: duration } = track;

        const artist = track.album.artists
          .map((artist) => artist.name)
          .join(', ');

        await supabase
          .from('songs')
          .insert({ name, artist, band_id: bandId, duration });
      }
    }

    router.push(`/band/${bandId}/songs`);
  }

  if (!spotifySdk) {
    return <Loading />;
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
            <Button onClick={importAllTracks} variant="contained">
              Import All Songs
            </Button>
          </>
        )}
      </>
    );
  }

  return (
    <>
      {playlists?.items.map((playlist) => (
        <Button
          key={playlist.id}
          variant="text"
          onClick={() => handlePlaylistClick(playlist)}
        >
          {playlist.name}
        </Button>
      ))}
    </>
  );
}
