'use client';

import useSetlist from '@/hooks/useSetlist';
import { SetlistRouteProps } from '../types';
import SetlistEditor from '@/components/setlistEditor/SetlistEditor';
import { Setlist, Set } from '@/components/setlistEditor/types';
import { useMemo } from 'react';
import { BandRouteProps } from '../../../types';
import useSongs from '@/hooks/useSongs';

export default function BandSetlistsPage({
  params,
}: Readonly<SetlistRouteProps & BandRouteProps>) {
  const { setlistId, bandId } = params;
  const { data: setlist, isLoading: isLoadingSetlist } = useSetlist({
    setlistId,
  });
  const { data: songs, isLoading: isLoadingSongs } = useSongs({ bandId });

  const setlistAdapted: Setlist | undefined = useMemo(() => {
    if (setlist && songs) {
      const { id, name, setlist_songs } = setlist;

      const sets: Set[] = [];

      setlist_songs
        .sort((a, b) => {
          if (a.set !== b.set) {
            return a.set - b.set;
          }
          return a.set_weight - b.set_weight;
        })
        .forEach(({ set, song_id }) => {
          let song = songs.find(({ id }) => id === song_id);
          if (!song) {
            song = {
              band_id: bandId,
              duration: 0,
              id: -1,
              name: 'Not Found',
              artist: 'Not Found',
              created_at: 'Not Found',
            };
          }
          if (set === sets.length) {
            sets.push({
              songs: [song],
            });
          } else {
            sets[sets.length - 1].songs.push(song);
          }
        });

      console.log(setlist_songs);

      return {
        id,
        bandId: bandId,
        name: name ?? '',
        sets,
        unusedSongs: songs,
      };
    }
    return undefined;
  }, [bandId, setlist, songs]);

  const isLoading = useMemo(
    () => isLoadingSetlist || isLoadingSongs,
    [isLoadingSetlist, isLoadingSongs]
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (setlistAdapted) {
    return <SetlistEditor initialSetlist={setlistAdapted} />;
  }

  return <h2>Whoops!</h2>;
}
