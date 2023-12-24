'use client';

import useBands from '@/hooks/useBands';

export default function Bands() {
  const { data, isLoading } = useBands();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || !data.length) {
    return (
      <div>
        It looks like you haven&apos;t made any bands yet. Create one now!
      </div>
    );
  }

  if (data.length) {
    return data.map(({ id, name }) => {
      return <div key={id}>{name}</div>;
    });
  }
}
