'use client';

import useBands from '@/hooks/useBands';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import PeopleIcon from '@mui/icons-material/People';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import Loading from './design/Loading';

export default function Bands() {
  const { data, isLoading } = useBands();

  if (isLoading) {
    return <Loading />;
  }

  if (!data?.length) {
    return (
      <div>
        It looks like you haven&apos;t made any bands yet.{' '}
        <Link href="/band/create">Create one now!</Link>
      </div>
    );
  }

  if (data.length) {
    return (
      <>
        <Grid
          container
          spacing={2}
          justifyContent="flex-start"
          alignItems="center"
        >
          {data.map(({ id, name, songs, band_members }) => {
            return (
              <Link
                href={`/band/${id}`}
                key={id}
                className="no-underline md:basis-1/3 sm:basis-1/2 basis-full"
              >
                <Card className="flex m-3 justify-center">
                  <Box className="flex flex-col">
                    <CardContent>
                      <Typography component="div" variant="h5">
                        <div>{name}</div>
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        component="div"
                        className="flex justify-between pt-1"
                      >
                        <Box>
                          <PeopleIcon titleAccess="Count of Members" />:{' '}
                          {band_members[0]['count']}
                        </Box>
                        <Box>
                          <LibraryMusicIcon titleAccess="Count of Songs" />:{' '}
                          {songs[0]['count']}
                        </Box>
                      </Typography>
                    </CardContent>
                  </Box>
                </Card>
              </Link>
            );
          })}
        </Grid>
        <hr />
        <div>
          <Link href="/band/create">
            <Button variant="contained">Add another band</Button>
          </Link>
        </div>
      </>
    );
  }
}
