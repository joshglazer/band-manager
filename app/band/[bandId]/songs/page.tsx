'use client';

import Loading from '@/components/design/Loading';
import Table, { TableProps, TablePropsDataType, TableRow } from '@/components/design/Table';
import SongCommentsModal from '@/components/modals/SongCommentsModal';
import useSongs, { SongsComposite } from '@/hooks/useSongs';
import Button from '@mui/material/Button';
import Link from 'next/link';
import prettyMilliseconds from 'pretty-ms';
import { BandRouteProps } from '../types';

function formatDuration(value?: TablePropsDataType | null) {
  return value && typeof value === 'number'
    ? prettyMilliseconds(value, { secondsDecimalDigits: 0 })
    : '--';
}

function formatComments(value: TablePropsDataType | null, row: TableRow) {
  return value !== null && value !== undefined ? (
    <SongCommentsModal commentsCount={+value} song={row as unknown as SongsComposite} />
  ) : (
    '--'
  );
}

export default function BandSongsPage({ params }: Readonly<BandRouteProps>) {
  const { bandId } = params;

  const { data: songs, isLoading } = useSongs({ bandId });

  if (isLoading) {
    return <Loading />;
  }

  let pageContent: JSX.Element;

  if (songs?.length) {
    const songsForTable = songs.map((song) => ({
      id: song.id,
      name: song.name,
      artist: song.artist,
      duration: song.duration,
      commentsCount: song.song_comments[0].count,
    }));

    const songsTableData: TableProps = {
      ariaLabel: 'Table of Songs',
      columns: [
        {
          name: 'Name',
          dataKey: 'name',
          isHeader: true,
          headerDataKey: 'id',
        },
        {
          name: 'Artist',
          dataKey: 'artist',
        },
        {
          name: 'Length',
          dataKey: 'duration',
          dataFormatter: formatDuration,
          className: 'whitespace-nowrap',
        },
        {
          name: 'Comments',
          dataKey: 'commentsCount',
          className: 'whitespace-nowrap',
          dataFormatter: formatComments,
        },
      ],
      rows: songsForTable,
    };
    pageContent = <Table {...songsTableData} />;
  } else {
    pageContent = <>You haven&apos;t added any songs</>;
  }

  return (
    <>
      {pageContent}
      <hr />
      <Link href={`/band/${bandId}/songs/spotify-import`}>
        <Button variant="contained">Import Songs From Spotify</Button>
      </Link>
    </>
  );
}
