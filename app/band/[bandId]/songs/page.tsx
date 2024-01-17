'use client';

import Loading from '@/components/design/Loading';
import Table, {
  TableProps,
  TablePropsDataType,
} from '@/components/design/Table';
import useSongs from '@/hooks/useSongs';
import Button from '@mui/material/Button';
import Link from 'next/link';
import prettyMilliseconds from 'pretty-ms';
import { BandRouteProps } from '../types';

function formatDuration(value?: TablePropsDataType | null) {
  return value && typeof value === 'number'
    ? prettyMilliseconds(value, { secondsDecimalDigits: 0 })
    : '--';
}

export default function BandSongsPage({ params }: Readonly<BandRouteProps>) {
  const { bandId } = params;

  const { data: songs, isLoading } = useSongs({ bandId });

  if (isLoading) {
    return <Loading />;
  }

  let pageContent: JSX.Element;

  if (songs?.length) {
    const songsTableData: TableProps = {
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
      ],
      rows: songs,
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
