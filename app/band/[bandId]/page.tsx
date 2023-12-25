'use client';

import useBand from '@/hooks/useBand';
import { BandRouteProps } from './types';

export default function Index({ params }: BandRouteProps) {
  const { bandId } = params;
  const { data: band, isLoading } = useBand({ bandId: +bandId });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (band) {
    return <h2>{band.name}</h2>;
  }

  return <h2>Whoops!</h2>;
}
