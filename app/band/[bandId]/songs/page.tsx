'use client';

import useSongs from '@/hooks/useSongs';
import { BandRouteProps } from '../types';
import SpotifyPlaylistImport from '@/components/SpotifyPlaylistImport';

export default function Index({ params }: BandRouteProps) {
  const { bandId } = params;

  const { data: songs, isLoading } = useSongs({ bandId });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  let pageContent: JSX.Element;

  if (songs && songs.length) {
    pageContent = (
      <>
        {songs.map(({ name, artist }) => (
          <>
            <div>{name}</div>
            <div>{artist}</div>
          </>
        ))}
      </>
    );
  } else {
    pageContent = <>You haven&apos;t added any songs</>;
  }

  return (
    <>
      {pageContent}
      <hr />
      <SpotifyPlaylistImport />
    </>
  );
}
