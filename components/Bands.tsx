'use client';

import useBands from '@/hooks/useBands';
import Link from 'next/link';

export default function Bands() {
  const { data, isLoading } = useBands();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || !data.length) {
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
        {data.map(({ id, name }) => {
          return <div key={id}>{name}</div>;
        })}
        <hr />
        <div>
          <Link href="/band/create">Add another band</Link>
        </div>
      </>
    );
  }
}
