import Card, { CardProps } from '@/components/design/Card';
import ResponsiveGrid from '@/components/design/ResponsiveGrid';
import GroupIcon from '@mui/icons-material/Group';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import { useMemo } from 'react';
import { BandRouteProps } from './types';

export default function BandDashboardPage({ params }: Readonly<BandRouteProps>): JSX.Element {
  const { bandId } = params;

  const actions: Required<Omit<CardProps, 'className'>>[] = useMemo(
    () => [
      {
        title: 'Manage Members',
        description: "Who's in the band?",
        link: `/band/${bandId}/members`,
        icon: <GroupIcon />,
      },
      {
        title: 'Manage Songs',
        description: 'What songs do you play?',
        link: `/band/${bandId}/songs`,
        icon: <LibraryMusicIcon />,
      },
      {
        title: 'Manage Setlists',
        description: 'What are you playing at your gigs?',
        link: `/band/${bandId}/setlists`,
        icon: <QueueMusicIcon />,
      },
    ],
    [bandId]
  );

  const cardClassName = 'md:basis-1/3 sm:basis-1/2 basis-full';

  const responsiveGridItems = useMemo(() => {
    return actions.map((action) => ({
      key: action.link,
      content: <Card {...action} className={cardClassName} />,
    }));
  }, [actions]);

  return <ResponsiveGrid items={responsiveGridItems} />;
}
