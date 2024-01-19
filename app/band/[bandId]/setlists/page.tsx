'use client';

import Loading from '@/components/design/Loading';
import Table, { TableProps, TablePropsDataType } from '@/components/design/Table';
import { adaptSetlist } from '@/components/setlistEditor/helpers';
import useSetlists from '@/hooks/useSetlists';
import useSongs from '@/hooks/useSongs';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import prettyMilliseconds from 'pretty-ms';
import { useCallback, useMemo } from 'react';
import { BandRouteProps } from '../types';

export default function BandSetlistsPage({ params }: Readonly<BandRouteProps>) {
  const { bandId } = params;
  const router = useRouter();

  const { data: setlists, isLoading: isLoadingSetlists } = useSetlists({ bandId });
  const { data: songs, isLoading: isLoadingSongs } = useSongs({ bandId });

  const formatSets = useCallback((setsValue: TablePropsDataType) => {
    if (typeof setsValue === 'string') {
      return (
        <div>
          {setsValue.split('//').map((set) => (
            <div key={set}>{set}</div>
          ))}
        </div>
      );
    }
    return '--';
  }, []);

  const formatEditButton = useCallback(
    (setlistId: TablePropsDataType) => {
      return (
        <Button
          variant="outlined"
          onClick={() => router.push(`/band/${bandId}/setlists/${setlistId}/edit`)}
        >
          Edit
        </Button>
      );
    },
    [bandId, router]
  );

  const isLoading = useMemo(() => {
    return isLoadingSongs || isLoadingSetlists;
  }, [isLoadingSetlists, isLoadingSongs]);

  const setlistsAdapted = useMemo(() => {
    if (setlists && songs) {
      return setlists?.map((setlist) => adaptSetlist(setlist, songs));
    }
  }, [setlists, songs]);

  if (isLoading) {
    return <Loading />;
  }

  let pageContent: JSX.Element;

  if (setlistsAdapted?.length) {
    const setlistsAdaptedForTable = setlistsAdapted.map((setlist) => ({
      name: setlist.name,
      id: setlist.id,
      sets: setlist.sets
        .map(({ songs }) => {
          const totalDuration = songs.reduce(function (acc, song) {
            return acc + (song.duration ?? 0);
          }, 0);
          return [`${songs.length} Songs, ${prettyMilliseconds(totalDuration)}`];
        })
        .join('//'),
    }));

    const setlistTableData: TableProps = {
      ariaLabel: 'Table of Setlists',
      columns: [
        { name: 'Name', dataKey: 'name', isHeader: true, headerDataKey: 'id' },
        { name: 'Sets', dataKey: 'sets', dataFormatter: formatSets },
        { name: 'Actions', dataKey: 'id', dataFormatter: formatEditButton },
      ],
      rows: setlistsAdaptedForTable,
    };

    pageContent = <Table {...setlistTableData} />;
  } else {
    pageContent = <>You haven&apos;t added any setlists</>;
  }

  return (
    <>
      {pageContent}
      <hr />
      <Link href={`/band/${bandId}/setlists/create`}>
        <Button variant="contained">Create a Setlist</Button>
      </Link>
    </>
  );
}
