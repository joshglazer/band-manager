'use client';

import Loading from '@/components/design/Loading';
import BandBreadcrumbs from '@/components/layout/BandBreadcrumbs';
import useBand from '@/hooks/useBand';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { BandRouteProps } from './types';

interface ConsumerProps {
  children: ReactNode;
}

type BandLayoutProps = BandRouteProps & ConsumerProps;

export default function BandLayout({ children, params }: BandLayoutProps) {
  const { bandId } = params;
  const { data: band, isLoading } = useBand({ bandId });
  const [archiving, setArchiving] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return <Loading />;
  }

  if (band) {
    const isArchived = !!band.archived_at;

    const toggleArchive = async () => {
      setArchiving(true);
      try {
        await fetch(`/api/bands/${bandId}/archive`, { method: 'POST' });
        router.refresh();
      } finally {
        setArchiving(false);
      }
    };

    return (
      <>
        <Box sx={{ pt: 3, pb: 2 }}>
          <BandBreadcrumbs bandId={bandId} bandName={band.name} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {band.name}
            </Typography>
            {isArchived && (
              <Chip label="Archived" size="small" color="default" variant="outlined" />
            )}
            <Box sx={{ ml: 'auto' }}>
              <Button
                size="small"
                variant="text"
                color="inherit"
                startIcon={isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
                onClick={toggleArchive}
                disabled={archiving}
                sx={{ color: 'text.secondary' }}
              >
                {isArchived ? 'Unarchive band' : 'Archive band'}
              </Button>
            </Box>
          </Box>
          <Divider sx={{ mt: 2 }} />
        </Box>
        <Box>{children}</Box>
      </>
    );
  }

  return <Typography variant="h5">Band not found.</Typography>;
}
