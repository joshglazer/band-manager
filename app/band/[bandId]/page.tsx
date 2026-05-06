'use client';

import BandEventsCalendar from '@/components/BandEventsCalendar';
import { BandRouteProps } from './types';

export default function BandDashboardPage({ params }: Readonly<BandRouteProps>): JSX.Element {
  const { bandId } = params;

  return <BandEventsCalendar bandId={bandId} />;
}
