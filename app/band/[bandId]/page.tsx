import Card from '@/components/design/Card';
import ResponsiveGrid from '@/components/design/ResponsiveGrid';
import Link from 'next/link';
import { useMemo } from 'react';
import { BandRouteProps } from './types';

export default function BandDashboardPage({ params }: Readonly<BandRouteProps>): JSX.Element {
  const { bandId } = params;

  const actions = useMemo(
    () => [
      {
        title: 'Manage Members',
        description: "Who's in the band?",
        link: `/band/${bandId}/members`,
      },
      {
        title: 'Manage Songs',
        description: 'What songs do you play?',
        link: `/band/${bandId}/songs`,
      },
      {
        title: 'Manage Setlists',
        description: 'What are you playing at your gigs?',
        link: `/band/${bandId}/setlists`,
      },
    ],
    [bandId]
  );

  const responsiveGridItems = useMemo(() => {
    return actions.map(({ title, description, link }) => ({
      key: link,
      content: (
        <Link href={link} key={link} className="no-underline md:basis-1/3 sm:basis-1/2 basis-full">
          <Card title={title} description={description} />
        </Link>
      ),
    }));
  }, [actions]);

  return <ResponsiveGrid items={responsiveGridItems} />;
}
