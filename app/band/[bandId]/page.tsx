'use client';

import useBand from '@/hooks/useBand';

export default function Index({ params }: { params: { bandId: number } }) {
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
