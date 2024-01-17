'use client';

import Loading from '@/components/design/Loading';
import Table, {
  TableProps,
  TablePropsDataType,
} from '@/components/design/Table';
import useSetlists from '@/hooks/useSetlists';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BandRouteProps } from '../types';
import { useCallback } from 'react';

export default function BandSetlistsPage({ params }: Readonly<BandRouteProps>) {
  const { bandId } = params;
  const router = useRouter();

  const { data: setlists, isLoading } = useSetlists({ bandId });

  const formatEditButton = useCallback(
    (setlistId: TablePropsDataType) => {
      return (
        <Button
          variant="outlined"
          onClick={() =>
            router.push(`/band/${bandId}/setlists/${setlistId}/edit`)
          }
        >
          Edit
        </Button>
      );
    },
    [bandId, router]
  );

  if (isLoading) {
    return <Loading />;
  }

  let pageContent: JSX.Element;

  if (setlists?.length) {
    const setlistTableData: TableProps = {
      ariaLabel: 'Table of Setlists',
      columns: [
        { name: 'Name', dataKey: 'name', isHeader: true, headerDataKey: 'id' },
        { name: 'Actions', dataKey: 'id', dataFormatter: formatEditButton },
      ],
      rows: setlists,
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
