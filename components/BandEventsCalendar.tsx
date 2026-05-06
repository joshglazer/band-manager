'use client';

import EventForm from '@/components/EventForm';
import Table from '@/components/design/Table';
import type { TableProps, TablePropsDataType, TableRow as TableRowType } from '@/components/design/Table';
import useBandEvents from '@/hooks/useBandEvents';
import useSetlists from '@/hooks/useSetlists';
import { BandEvent } from '@/types/composites';
import { createClient } from '@/utils/supabase/client';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MicIcon from '@mui/icons-material/Mic';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import ViewListIcon from '@mui/icons-material/ViewList';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function todayDateStr(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

function formatDateTime(dateStr: string, timeStr: string | null): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  const datePart = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  if (!timeStr) return datePart;
  const [hours, minutes] = timeStr.split(':').map(Number);
  const t = new Date(year, month - 1, day, hours, minutes);
  return datePart + ' · ' + t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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

interface EventActionsMenuProps {
  event: BandEvent;
  bandId: number;
  setlistId?: number;
  onMutate: () => void;
}

function EventActionsMenu({ event, bandId, setlistId, onMutate }: EventActionsMenuProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setMenuAnchor(null);
    const supabase = createClient();
    await supabase.from('band_events').delete().eq('id', event.id);
    onMutate();
  };

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setMenuAnchor(e.currentTarget)}
        sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setMenuAnchor(null); setEditOpen(true); }}>
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} disabled={deleting}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
        {setlistId !== undefined && [
          <Divider key="divider" />,
          <MenuItem key="practice" onClick={() => { setMenuAnchor(null); router.push(`/band/${bandId}/practice?setlist=${setlistId}`); }}>
            <ListItemIcon><ChecklistIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Practice</ListItemText>
          </MenuItem>,
          <MenuItem key="setlist" onClick={() => { setMenuAnchor(null); router.push(`/band/${bandId}/setlists/${setlistId}/edit`); }}>
            <ListItemIcon><QueueMusicIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Setlist</ListItemText>
          </MenuItem>,
        ]}
      </Menu>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Event</DialogTitle>
        <DialogContent>
          <EventForm
            bandId={bandId}
            event={event}
            onSuccess={() => { setEditOpen(false); onMutate(); }}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

interface EventListProps {
  events: BandEvent[];
  bandId: number;
  isLoading: boolean;
  emptyMessage: string;
  onMutate: () => void;
  setlistsByEventId: Map<number, number>;
}

function EventList({ events, bandId, isLoading, emptyMessage, onMutate, setlistsByEventId }: EventListProps) {
  const eventsById = useMemo(() => {
    const map = new Map<number, BandEvent>();
    events.forEach((e) => map.set(e.id, e));
    return map;
  }, [events]);

  if (isLoading) {
    return <Typography variant="body2" color="text.secondary">Loading…</Typography>;
  }
  if (events.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        {emptyMessage}
      </Typography>
    );
  }

  const rows: TableRowType[] = events.map((event) => ({
    id: event.id,
    type: event.type,
    location: event.location,
    date: event.date,
    time: event.time,
  }));

  const tableData: TableProps = {
    ariaLabel: 'Table of Events',
    columns: [
      {
        name: 'Type',
        dataKey: 'type',
        dataFormatter: (value: TablePropsDataType) => <EventChip type={value as BandEvent['type']} />,
      },
      {
        name: 'Date',
        dataKey: 'date',
        dataFormatter: (value: TablePropsDataType, row: TableRowType) =>
          formatDateTime(row.date as string, row.time as string | null),
      },
      { name: 'Location', dataKey: 'location', isHeader: true, headerDataKey: 'id' },
      {
        name: 'Actions',
        dataKey: 'id',
        stickyRight: true,
        hideHeader: true,
        dataFormatter: (value: TablePropsDataType) => {
          const event = eventsById.get(value as number);
          if (!event) return <></>;
          return (
            <EventActionsMenu
              event={event}
              bandId={bandId}
              setlistId={setlistsByEventId.get(event.id)}
              onMutate={onMutate}
            />
          );
        },
      },
    ],
    rows,
  };

  return <Table {...tableData} />;
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
  const { data: setlists } = useSetlists({ bandId });
  const [addOpen, setAddOpen] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());

  const today = useMemo(todayDateStr, []);

  const setlistsByEventId = useMemo(() => {
    const map = new Map<number, number>();
    setlists?.forEach((s) => {
      if (s.event_id) map.set(s.event_id, s.id);
    });
    return map;
  }, [setlists]);

  const eventDates = useMemo(() => {
    const s = new Set<string>();
    events?.forEach((e) => s.add(e.date));
    return s;
  }, [events]);

  const upcoming = useMemo(
    () => (events ?? []).filter((e) => e.date >= today),
    [events, today]
  );

  const past = useMemo(
    () => (events ?? []).filter((e) => e.date < today).reverse(),
    [events, today]
  );

  const filteredByDate = useMemo(() => {
    if (!selectedDate) return null;
    return (events ?? []).filter((e) => e.date === selectedDate);
  }, [events, selectedDate]);

  const handleMutate = () => mutate();

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h6" fontWeight={600}>
          Events
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            size="small"
            onChange={(_, v) => {
              if (v) {
                setView(v);
                setSelectedDate(null);
              }
            }}
          >
            <ToggleButton value="list" aria-label="list view">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="calendar" aria-label="calendar view">
              <CalendarMonthIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
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

      {view === 'list' ? (
        /* ── List view ── */
        <Box>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ mb: 1.5, minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0 } }}
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
          <EventList
            events={tab === 'upcoming' ? upcoming : past}
            isLoading={isLoading}
            emptyMessage={tab === 'upcoming' ? 'No upcoming events.' : 'No past events.'}
            bandId={bandId}
            onMutate={handleMutate}
            setlistsByEventId={setlistsByEventId}
          />
        </Box>
      ) : (
        /* ── Calendar view ── */
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'stretch', md: 'flex-start' },
          }}
        >
          {/* Month grid */}
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
              today={today}
              onSelectDate={(d) => {
                setSelectedDate(d);
                if (d) setTab(d < today ? 'past' : 'upcoming');
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
            {selectedDate ? (
              <>
                <Typography variant="body2" fontWeight={500} color="text.secondary" sx={{ mb: 1 }}>
                  {formatDateTime(selectedDate, null)}
                </Typography>
                <EventList
                  events={filteredByDate ?? []}
                  bandId={bandId}
                  isLoading={isLoading}
                  emptyMessage="No events on this day."
                  onMutate={handleMutate}
                  setlistsByEventId={setlistsByEventId}
                />
              </>
            ) : (
              <>
                <Tabs
                  value={tab}
                  onChange={(_, v) => setTab(v)}
                  sx={{ mb: 1, minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0 } }}
                >
                  <Tab label={`Upcoming${upcoming.length ? ` (${upcoming.length})` : ''}`} value="upcoming" />
                  <Tab label={`Past${past.length ? ` (${past.length})` : ''}`} value="past" />
                </Tabs>
                <EventList
                  events={tab === 'upcoming' ? upcoming : past}
                  bandId={bandId}
                  isLoading={isLoading}
                  emptyMessage={tab === 'upcoming' ? 'No upcoming events.' : 'No past events.'}
                  onMutate={handleMutate}
                  setlistsByEventId={setlistsByEventId}
                />
              </>
            )}
          </Box>
        </Box>
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Event</DialogTitle>
        <DialogContent>
          <EventForm
            bandId={bandId}
            onSuccess={() => { setAddOpen(false); mutate(); }}
            onCancel={() => setAddOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
