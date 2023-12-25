import Link from 'next/link';
import { useMemo } from 'react';
import { BandRouteProps } from './types';

export default function Index({ params }: BandRouteProps) {
  const { bandId } = params;

  const actions = useMemo(
    () => [
      {
        title: 'Manage Songs',
        description: 'What songs do you play?',
        link: `/band/${bandId}/songs`,
      },
    ],
    [bandId]
  );

  return (
    <>
      {actions.map(({ title, description, link }) => (
        <Link href={link} key={link}>
          <h3>{title}</h3>
          <div>{description}</div>
        </Link>
      ))}
    </>
  );
}
