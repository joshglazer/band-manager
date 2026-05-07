'use client';

import useBandEvents from '@/hooks/useBandEvents';
import useSetlists from '@/hooks/useSetlists';
import { BandEvent } from '@/types/composites';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MicIcon from '@mui/icons-material/Mic';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { useMemo, useState } from 'react';
import { BandRouteProps } from './types';

function todayDateStr(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

function daysUntil(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string, timeStr: string | null): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const datePart = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  if (!timeStr) return datePart;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const t = new Date(year, month - 1, day, hours, minutes);
  return datePart + ' · ' + t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

interface GigCardProps {
  gig: BandEvent;
  bandId: number;
  setlistId?: number;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

function GigCard({ gig, bandId, setlistId, index, total, onPrev, onNext }: GigCardProps) {
  const days = daysUntil(gig.date);

  let countdownLabel: string;
  let countdownSub: string;
  if (days === 0) {
    countdownLabel = 'Today';
    countdownSub = "It's gig day!";
  } else if (days === 1) {
    countdownLabel = '1';
    countdownSub = 'day to go';
  } else {
    countdownLabel = String(days);
    countdownSub = 'days to go';
  }

  const heading = index === 0 ? 'Next Gig' : `Upcoming Gig`;

  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 480 }}>
      {/* Header row: label + nav arrows */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <MicIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="overline" color="primary" fontWeight={700} lineHeight={1} sx={{ flex: 1 }}>
          {heading}
        </Typography>
        {total > 1 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton size="small" onClick={onPrev} disabled={index === 0} aria-label="Previous gig">
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32, textAlign: 'center' }}>
              {index + 1} / {total}
            </Typography>
            <IconButton size="small" onClick={onNext} disabled={index === total - 1} aria-label="Next gig">
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Countdown */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 1 }}>
        <Typography variant="h2" fontWeight={800} color="primary" lineHeight={1}>
          {countdownLabel}
        </Typography>
        {days > 0 && (
          <Typography variant="h6" color="text.secondary" fontWeight={400}>
            {countdownSub}
          </Typography>
        )}
      </Box>
      {days === 0 && (
        <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ mb: 1 }}>
          {countdownSub}
        </Typography>
      )}

      {/* Gig details */}
      <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
        {gig.location}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        {formatDate(gig.date, gig.time)}
      </Typography>

      {/* Links */}
      {setlistId !== undefined && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            component={NextLink}
            href={`/band/${bandId}/setlists/${setlistId}/edit`}
            variant="outlined"
            size="small"
            startIcon={<QueueMusicIcon />}
          >
            Setlist
          </Button>
          <Button
            component={NextLink}
            href={`/band/${bandId}/practice?setlist=${setlistId}`}
            variant="outlined"
            size="small"
            startIcon={<ChecklistIcon />}
          >
            Practice
          </Button>
        </Box>
      )}
    </Paper>
  );
}

function NoGigCard({ bandId }: { bandId: number }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, maxWidth: 480 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <CalendarMonthIcon color="disabled" />
        <Typography variant="overline" color="text.secondary" fontWeight={700} lineHeight={1}>
          No Upcoming Gigs
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Nothing scheduled yet. Add a gig to start the countdown.
      </Typography>
      <Button
        component={NextLink}
        href={`/band/${bandId}/events`}
        variant="outlined"
        size="small"
        startIcon={<CalendarMonthIcon />}
      >
        View Events
      </Button>
    </Paper>
  );
}

export default function BandDashboardPage({ params }: Readonly<BandRouteProps>): JSX.Element {
  const { bandId } = params;
  const { data: events, isLoading: eventsLoading } = useBandEvents({ bandId });
  const { data: setlists } = useSetlists({ bandId });
  const [gigIndex, setGigIndex] = useState(0);

  const today = useMemo(todayDateStr, []);

  const setlistsByEventId = useMemo(() => {
    const map = new Map<number, number>();
    setlists?.forEach((s) => {
      if (s.event_id) map.set(s.event_id, s.id);
    });
    return map;
  }, [setlists]);

  const upcomingGigs = useMemo(
    () => (events ?? []).filter((e) => e.type === 'gig' && e.date >= today),
    [events, today]
  );

  if (eventsLoading) {
    return (
      <Box>
        <Skeleton variant="rounded" width={480} height={180} />
      </Box>
    );
  }

  if (upcomingGigs.length === 0) {
    return <NoGigCard bandId={bandId} />;
  }

  const safeIndex = Math.min(gigIndex, upcomingGigs.length - 1);
  const gig = upcomingGigs[safeIndex];

  return (
    <GigCard
      gig={gig}
      bandId={bandId}
      setlistId={setlistsByEventId.get(gig.id)}
      index={safeIndex}
      total={upcomingGigs.length}
      onPrev={() => setGigIndex((i) => Math.max(0, i - 1))}
      onNext={() => setGigIndex((i) => Math.min(upcomingGigs.length - 1, i + 1))}
    />
  );
}
