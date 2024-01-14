'use client';

import useSetlists from '@/hooks/useSetlists';
import { BandRouteProps } from '../types';
import Button from '@mui/material/Button';
import Link from 'next/link';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';

export default function BandSetlistsPage({ params }: Readonly<BandRouteProps>) {
  const { bandId } = params;

  const { data: setlists, isLoading } = useSetlists({ bandId });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  let pageContent: JSX.Element;

  if (setlists?.length) {
    pageContent = (
      <TableContainer component={Paper}>
        <Table aria-label="Table of Songs">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {setlists.map(({ id, name }) => (
              <TableRow key={id}>
                <TableCell component="th" scope="row">
                  {name}
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
