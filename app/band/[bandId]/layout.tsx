'use client';

import useBand from '@/hooks/useBand';
import { BandRouteProps } from './types';
import { ReactNode } from 'react';

interface ConsumerProps {
  children: ReactNode;
}

type BandLayoutProps = BandRouteProps & ConsumerProps;

export default function BandLayout({ children, params }: BandLayoutProps) {
  const { bandId } = params;
  const { data: band, isLoading } = useBand({ bandId });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (band) {
    return (
      <>
        <h2>{band.name}</h2>
        <div>{children}</div>
      </>
    );
  }

  return <h2>Whoops!</h2>;
}
