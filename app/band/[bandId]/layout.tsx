'use client';

import Loading from '@/components/design/Loading';
import useBand from '@/hooks/useBand';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';
import { BandRouteProps } from './types';

interface ConsumerProps {
  children: ReactNode;
}

type BandLayoutProps = BandRouteProps & ConsumerProps;

export default function BandLayout({ children, params }: BandLayoutProps) {
  const { bandId } = params;
  const { data: band, isLoading } = useBand({ bandId });

  if (isLoading) {
    return <Loading />;
  }

  if (band) {
    return (
      <>
        <Box sx={{ pt: 3, pb: 2 }}>
          <Typography variant="h4" fontWeight={700} color="text.primary">
            {band.name}
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Box>
        <Box>{children}</Box>
      </>
    );
  }

  return <Typography variant="h5">Band not found.</Typography>;
}
