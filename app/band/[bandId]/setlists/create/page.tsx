'use client';

import SetlistEditor from '@/components/setlistEditor/SetlistEditor';
import { Setlist } from '@/components/setlistEditor/types';
import { BandRouteProps } from '../../types';
import useSongs from '@/hooks/useSongs';
import { useMemo } from 'react';

export default function SetlistCreate({ params }: Readonly<BandRouteProps>) {
  const { bandId } = params;
  const { data: songs, isLoading } = useSongs({ bandId });

  const initialSetlist: Setlist = useMemo(
    () => ({
      title: 'My Setlist',
      sets: [
        {
          songs: [],
        },
      ],
      unusedSongs: songs || [],
    }),
    [songs]
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!songs) {
    return <div>You have not added any songs yet.</div>;
  }

  return <SetlistEditor initialSetlist={initialSetlist} />;
}
