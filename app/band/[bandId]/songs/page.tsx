'use client';

import useSongs from '@/hooks/useSongs';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Link from 'next/link';
import prettyMilliseconds from 'pretty-ms';
import { BandRouteProps } from '../types';

export default function BandSongsPage({ params }: BandRouteProps) {
  const { bandId } = params;

  const { data: songs, isLoading } = useSongs({ bandId });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  let pageContent: JSX.Element;

  if (songs && songs.length) {
    pageContent = (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="Table of Songs">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Artist</TableCell>
              <TableCell>Length</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {songs.map(({ id, name, artist, duration }) => (
              <TableRow key={id}>
                <TableCell component="th" scope="row">
                  {name}
                </TableCell>
                <TableCell>{artist}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {duration
                    ? prettyMilliseconds(duration, { secondsDecimalDigits: 0 })
                    : '--'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
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
