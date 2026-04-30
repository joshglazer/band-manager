'use client';

import AddEventForm from '@/components/AddEventForm';
import useBandEvents from '@/hooks/useBandEvents';
import { BandEvent } from '@/types/composites';
import { createClient } from '@/utils/supabase/client';
import AddIcon from '@mui/icons-material/Add';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MicIcon from '@mui/icons-material/Mic';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function EventIcon({ type }: { type: BandEvent['type'] }) {
  return type === 'gig'
    ? <MicIcon sx={{ fontSize: 14 }} />
    : <MusicNoteIcon sx={{ fontSize: 14 }} />;
}

function EventChip({ type }: { type: BandEvent['type'] }) {
  return (
    <Chip
      size="small"
      icon={<EventIcon type={type} />}
      label={type === 'gig' ? 'Gig' : 'Practice'}
      color={type === 'gig' ? 'primary' : 'default'}
      variant={type === 'gig' ? 'filled' : 'outlined'}
      sx={{ fontSize: 11, height: 20 }}
    />
  );
}

interface EventRowProps {
  event: BandEvent;
  onDelete: () => void;
}

function EventRow({ event, onDelete }: EventRowProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from('band_events').delete().eq('id', event.id);
    onDelete();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1,
        px: 1.5,
        borderRadius: 1,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <EventChip type={event.type} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {event.location}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDisplayDate(event.date)}
        </Typography>
      </Box>
      <Tooltip title="Delete event">
        <IconButton size="small" onClick={handleDelete} disabled={deleting} sx={{ flexShrink: 0, opacity: 0.5, '&:hover': { opacity: 1 } }}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

interface CalendarGridProps {
  year: number;
  month: number;
  eventDates: Set<string>;
  selectedDate: string | null;
  today: string;
  onSelectDate: (date: string | null) => void;
}

function CalendarGrid({ year, month, eventDates, selectedDate, today, onSelectDate }: CalendarGridProps) {
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) result.push(d);
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [year, month]);

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
        {DAY_NAMES.map((d) => (
          <Typography key={d} variant="caption" color="text.secondary" align="center" sx={{ py: 0.5 }}>
            {d}
          </Typography>
        ))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.25 }}>
        {cells.map((day, i) => {
          if (!day) return <Box key={i} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasEvent = eventDates.has(dateStr);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;

          return (
            <Box
              key={i}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '1',
                borderRadius: 1,
                cursor: hasEvent ? 'pointer' : 'default',
                bgcolor: isSelected ? 'primary.main' : isToday ? 'action.selected' : 'transparent',
                '&:hover': hasEvent ? { bgcolor: isSelected ? 'primary.dark' : 'action.hover' } : {},
                border: isToday && !isSelected ? '1px solid' : 'none',
                borderColor: 'primary.main',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isToday || hasEvent ? 600 : 400,
                  color: isSelected ? 'primary.contrastText' : 'text.primary',
                  lineHeight: 1,
                }}
              >
                {day}
              </Typography>
              {hasEvent && (
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: isSelected ? 'primary.contrastText' : 'primary.main',
                    mt: 0.25,
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

interface BandEventsCalendarProps {
  bandId: number;
}

export default function BandEventsCalendar({ bandId }: BandEventsCalendarProps) {
  const { data: events, isLoading, mutate } = useBandEvents({ bandId });
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  const eventDates = useMemo(() => {
    const s = new Set<string>();
    events?.forEach((e) => s.add(e.date));
    return s;
  }, [events]);

  const upcoming = useMemo(
    () => (events ?? []).filter((e) => e.date >= todayStr),
    [events, todayStr]
  );

  const past = useMemo(
    () => (events ?? []).filter((e) => e.date < todayStr).reverse(),
    [events, todayStr]
  );

  const filteredByDate = useMemo(() => {
    if (!selectedDate) return null;
    return (events ?? []).filter((e) => e.date === selectedDate);
  }, [events, selectedDate]);

  const displayList = filteredByDate ?? (tab === 'upcoming' ? upcoming : past);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  const handleDelete = () => {
    mutate();
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Events
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setAddOpen(true)}
          >
            Add Event
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 3,
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'flex-start' },
        }}
      >
        {/* Calendar grid */}
        <Box sx={{ flexShrink: 0, width: { xs: '100%', md: 260 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <IconButton size="small" onClick={prevMonth}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" fontWeight={600} sx={{ flex: 1, textAlign: 'center' }}>
              {MONTH_NAMES[calMonth]} {calYear}
            </Typography>
            <IconButton size="small" onClick={nextMonth}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
          <CalendarGrid
            year={calYear}
            month={calMonth}
            eventDates={eventDates}
            selectedDate={selectedDate}
            today={todayStr}
            onSelectDate={(d) => {
              setSelectedDate(d);
              if (d) {
                const isPast = d < todayStr;
                setTab(isPast ? 'past' : 'upcoming');
              }
            }}
          />
          {selectedDate && (
            <Button size="small" sx={{ mt: 1 }} onClick={() => setSelectedDate(null)}>
              Clear filter
            </Button>
          )}
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
        <Divider sx={{ display: { xs: 'block', md: 'none' } }} />

        {/* Event list */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {!selectedDate && (
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{ mb: 1, minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0 } }}
            >
              <Tab
                label={`Upcoming${upcoming.length ? ` (${upcoming.length})` : ''}`}
                value="upcoming"
              />
              <Tab
                label={`Past${past.length ? ` (${past.length})` : ''}`}
                value="past"
              />
            </Tabs>
          )}

          {selectedDate && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              {formatDisplayDate(selectedDate)}
            </Typography>
          )}

          {isLoading ? (
            <Typography variant="body2" color="text.secondary">Loading…</Typography>
          ) : displayList.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              {selectedDate ? 'No events on this day.' : tab === 'upcoming' ? 'No upcoming events.' : 'No past events.'}
            </Typography>
          ) : (
            <Box>
              {displayList.map((event, i) => (
                <EventRow key={i} event={event} onDelete={handleDelete} />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Event</DialogTitle>
        <DialogContent>
          <AddEventForm
            bandId={bandId}
            onSuccess={() => {
              setAddOpen(false);
              mutate();
            }}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
