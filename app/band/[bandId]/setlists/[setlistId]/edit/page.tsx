'use client';

import useSetlist from '@/hooks/useSetlist';
import { SetlistRouteProps } from '../types';
import SetlistEditor from '@/components/setlistEditor/SetlistEditor';
import { Setlist } from '@/components/setlistEditor/types';
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
    if (setlist) {
      const { id, name } = setlist;
      return {
        id,
        bandId: bandId,
        name: name ?? '',
        sets: [],
        unusedSongs: songs ?? [],
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
