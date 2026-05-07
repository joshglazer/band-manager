'use client';

import useBands from '@/hooks/useBands';
import ArchiveIcon from '@mui/icons-material/Archive';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import PeopleIcon from '@mui/icons-material/People';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useState } from 'react';
import Card from './design/Card';
import Loading from './design/Loading';

function BandList({ includeArchived }: { includeArchived: boolean }) {
  const { data, isLoading } = useBands({ includeArchived });

  if (isLoading) {
    return <Loading />;
  }

  if (!data?.length) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography color="text.secondary">
          {includeArchived ? 'No archived bands.' : 'No active bands.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container justifyContent="flex-start" alignItems="stretch">
      {data.map(({ id, name, song_count, member_count }) => {
        const bandCardDescription = (
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<PeopleIcon />}
              label={`${member_count} member${member_count !== 1 ? 's' : ''}`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<LibraryMusicIcon />}
              label={`${song_count} song${song_count !== 1 ? 's' : ''}`}
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
  );
}

export default function Bands() {
  const { data: activeBands, isLoading } = useBands();
  const [showArchived, setShowArchived] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  if (!activeBands?.length && !showArchived) {
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
      <BandList includeArchived={false} />
      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button component={Link} href="/band/create" variant="outlined">
          Add another band
        </Button>
        <Button
          variant="text"
          color="inherit"
          startIcon={showArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
          onClick={() => setShowArchived((prev) => !prev)}
          sx={{ color: 'text.secondary' }}
        >
          {showArchived ? 'Hide archived bands' : 'View archived bands'}
        </Button>
      </Box>
      {showArchived && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight={600} mb={2} color="text.secondary">
            Archived Bands
          </Typography>
          <BandList includeArchived={true} />
        </Box>
      )}
    </>
  );
}
