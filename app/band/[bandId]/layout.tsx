'use client';

import Loading from '@/components/design/Loading';
import useBand from '@/hooks/useBand';
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
        <h2>{band.name}</h2>
        <div>{children}</div>
      </>
    );
  }

  return <h2>Whoops!</h2>;
}
