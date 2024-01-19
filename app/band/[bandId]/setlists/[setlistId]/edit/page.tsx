'use client';

import Loading from '@/components/design/Loading';
import SetlistEditor from '@/components/setlistEditor/SetlistEditor';
import { adaptSetlist } from '@/components/setlistEditor/helpers';
import { Setlist } from '@/components/setlistEditor/types';
import useSetlist from '@/hooks/useSetlist';
import useSongs from '@/hooks/useSongs';
import { useMemo } from 'react';
import { BandRouteProps } from '../../../types';
import { SetlistRouteProps } from '../types';

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
      return adaptSetlist(setlist, songs);
    }
    return undefined;
  }, [setlist, songs]);

  const isLoading = useMemo(
    () => isLoadingSetlist || isLoadingSongs,
    [isLoadingSetlist, isLoadingSongs]
  );

  if (isLoading) {
    return <Loading />;
  }

  if (setlistAdapted) {
    return <SetlistEditor initialSetlist={setlistAdapted} />;
  }

  return <h2>Whoops!</h2>;
}
