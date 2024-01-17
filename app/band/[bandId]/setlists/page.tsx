'use client';

import Loading from '@/components/design/Loading';
import useSetlists from '@/hooks/useSetlists';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BandRouteProps } from '../types';

export default function BandSetlistsPage({ params }: Readonly<BandRouteProps>) {
  const { bandId } = params;
  const router = useRouter();

  const { data: setlists, isLoading } = useSetlists({ bandId });

  if (isLoading) {
    return <Loading />;
  }

  function handleSetlistEditClick(id: number) {
    router.push(`/band/${bandId}/setlists/${id}/edit`);
  }

  let pageContent: JSX.Element;

  if (setlists?.length) {
    pageContent = (
      <TableContainer component={Paper}>
        <Table aria-label="Table of Songs">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {setlists.map(({ id, name }) => (
              <TableRow key={id}>
                <TableCell component="th" scope="row">
                  {name}
                </TableCell>
                <TableCell component="th" scope="row">
                  <Button
                    variant="outlined"
                    onClick={() => handleSetlistEditClick(id)}
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
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
