'use client';

import useBands from '@/hooks/useBands';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import PeopleIcon from '@mui/icons-material/People';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import Loading from './design/Loading';
import Card from './design/Card';

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
        <Grid container spacing={2} justifyContent="flex-start" alignItems="center">
          {data.map(({ id, name, songs, band_members }) => {
            const bandCardDescription = (
              <>
                <Box>
                  <PeopleIcon titleAccess="Count of Members" />: {band_members[0]['count']}
                </Box>
                <Box>
                  <LibraryMusicIcon titleAccess="Count of Songs" />: {songs[0]['count']}
                </Box>
              </>
            );

            const bandCardLink = `/band/${id}`;

            const bandCardClassName = 'md:basis-1/3 sm:basis-1/2 basis-full';

            return (
              <Card
                key={id}
                title={name}
                description={bandCardDescription}
                link={bandCardLink}
                className={bandCardClassName}
              />
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
