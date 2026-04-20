'use client';

import useBands from '@/hooks/useBands';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import PeopleIcon from '@mui/icons-material/People';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import Card from './design/Card';
import Loading from './design/Loading';

export default function Bands() {
  const { data, isLoading } = useBands();

  if (isLoading) {
    return <Loading />;
  }

  if (!data?.length) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="text.secondary">
          You haven&apos;t created any bands yet.{' '}
          <MuiLink component={Link} href="/band/create" underline="hover" color="primary" fontWeight={600}>
            Create one now!
          </MuiLink>
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={2} justifyContent="flex-start" alignItems="stretch">
        {data.map(({ id, name, songs, band_members }) => {
          const bandCardDescription = (
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<PeopleIcon />}
                label={`${band_members[0]['count']} member${band_members[0]['count'] !== 1 ? 's' : ''}`}
                size="small"
                variant="outlined"
              />
              <Chip
                icon={<LibraryMusicIcon />}
                label={`${songs[0]['count']} song${songs[0]['count'] !== 1 ? 's' : ''}`}
                size="small"
                variant="outlined"
              />
            </Box>
          );

          return (
            <Card
              key={id}
              title={name}
              description={bandCardDescription}
              link={`/band/${id}`}
              className="md:basis-1/3 sm:basis-1/2 basis-full"
            />
          );
        })}
      </Grid>
      <Box sx={{ mt: 3 }}>
        <Button component={Link} href="/band/create" variant="outlined">
          Add another band
        </Button>
      </Box>
    </>
  );
}
