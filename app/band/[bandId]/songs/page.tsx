'use client';

import useSongs from '@/hooks/useSongs';
import { BandRouteProps } from '../types';

export default function Index({ params }: BandRouteProps) {
  const { bandId } = params;

  const { data: songs, isLoading } = useSongs({ bandId });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (songs && songs.length) {
    return (
      <>
        {songs.map(({ name, artist }) => (
          <>
            <div>{name}</div>
            <div>{artist}</div>
          </>
        ))}
      </>
    );
  }

  return <>You haven&apos;t added any songs</>;
}
