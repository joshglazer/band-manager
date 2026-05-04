'use client';

import Loading from '@/components/design/Loading';
import Table, { TableProps, TablePropsDataType } from '@/components/design/Table';
import { adaptSetlist } from '@/components/setlistEditor/helpers';
import useSetlists from '@/hooks/useSetlists';
import useSongs from '@/hooks/useSongs';
import { TablesInsert } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import prettyMilliseconds from 'pretty-ms';
import { useCallback, useMemo, useState } from 'react';
import { BandRouteProps } from '../types';

function SetlistActionsMenu({
  setlistId,
  bandId,
  onDuplicate,
}: {
  setlistId: number;
  bandId: number;
  onDuplicate: (id: number) => void;
}) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={handleOpen} aria-label="actions" size="small">
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            router.push(`/band/${bandId}/practice?setlist=${setlistId}`);
            handleClose();
          }}
        >
          <ListItemIcon><ChecklistIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Practice</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            router.push(`/band/${bandId}/setlists/${setlistId}/edit`);
            handleClose();
          }}
        >
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDuplicate(setlistId);
            handleClose();
          }}
        >
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            window.open(`/print/setlist/${setlistId}/chord-charts`, '_blank');
            handleClose();
          }}
        >
          <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Print Chord Charts</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}

export default function BandSetlistsPage({ params }: Readonly<BandRouteProps>) {
  const { bandId } = params;

  const [showPast, setShowPast] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const supabase = createClient();
  const { data: setlists, isLoading: isLoadingSetlists, mutate: mutateSetlists } = useSetlists({ bandId });
  const { data: songs, isLoading: isLoadingSongs } = useSongs({ bandId });

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const formatSets = useCallback((setsValue: TablePropsDataType) => {
    if (typeof setsValue === 'string') {
      return (
        <div>
          {setsValue.split('//').map((set) => (
            <div key={set}>{set}</div>
          ))}
        </div>
      );
    }
    return '--';
  }, []);

  const formatDate = useCallback((dateValue: TablePropsDataType) => {
    if (typeof dateValue === 'string' && dateValue) {
      const [year, month, day] = dateValue.split('-');
      return `${month}/${day}/${year}`;
    }
    return '--';
  }, []);

  const duplicateSetlist = useCallback(
    async (setlistId: number) => {
      const original = setlists?.find((s) => s.id === setlistId);
      if (!original) return;

      const newSetlistData: TablesInsert<'setlists'> = {
        band_id: original.band_id,
        name: `Copy of ${original.name}`,
        date: original.date,
      };

      const { data: inserted } = await supabase.from('setlists').insert(newSetlistData).select();
      if (!inserted?.[0]) return;

      const newSetlistId = inserted[0].id;

      if (original.setlist_songs.length > 0) {
        const songInserts: TablesInsert<'setlist_songs'>[] = original.setlist_songs.map((s) => ({
          setlist_id: newSetlistId,
          song_id: s.song_id,
          set: s.set,
          set_weight: s.set_weight,
        }));
        await supabase.from('setlist_songs').insert(songInserts);
      }

      mutateSetlists();
    },
    [setlists, supabase, mutateSetlists]
  );

  const formatEditButton = useCallback(
    (setlistId: TablePropsDataType) => {
      return (
        <SetlistActionsMenu
          setlistId={setlistId as number}
          bandId={bandId}
          onDuplicate={duplicateSetlist}
        />
      );
    },
    [bandId, duplicateSetlist]
  );

  const isLoading = useMemo(() => {
    return isLoadingSongs || isLoadingSetlists;
  }, [isLoadingSetlists, isLoadingSongs]);

  const setlistsAdapted = useMemo(() => {
    if (setlists && songs) {
      return setlists.map((setlist) => adaptSetlist(setlist, songs));
    }
  }, [setlists, songs]);

  const filteredAndSortedSetlists = useMemo(() => {
    if (!setlistsAdapted) return [];

    return setlistsAdapted
      .filter((setlist) => {
        if (showPast) {
          if (!setlist.date) return false;
          return setlist.date < today;
        } else {
          if (!setlist.date) return true;
          return setlist.date >= today;
        }
      })
      .filter((setlist) => {
        if (nameFilter) {
          return setlist.name.toLowerCase().includes(nameFilter.toLowerCase());
        }
        return true;
      })
      .filter((setlist) => {
        if (dateFilter) {
          return setlist.date === dateFilter;
        }
        return true;
      })
      .sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
      });
  }, [setlistsAdapted, showPast, nameFilter, dateFilter, today]);

  if (isLoading) {
    return <Loading />;
  }

  let pageContent: JSX.Element;

  if (filteredAndSortedSetlists.length) {
    const setlistsAdaptedForTable = filteredAndSortedSetlists.map((setlist) => ({
      name: setlist.name,
      id: setlist.id,
      date: setlist.date ?? '',
      sets: setlist.sets
        .map(({ songs }) => {
          const totalDuration = songs.reduce(function (acc, song) {
            return acc + (song.duration ?? 0);
          }, 0);
          return [`${songs.length} Songs, ${prettyMilliseconds(totalDuration)}`];
        })
        .join('//'),
    }));

    const setlistTableData: TableProps = {
      ariaLabel: 'Table of Setlists',
      columns: [
        { name: 'Name', dataKey: 'name', isHeader: true, headerDataKey: 'id' },
        { name: 'Date', dataKey: 'date', dataFormatter: formatDate },
        { name: 'Sets', dataKey: 'sets', dataFormatter: formatSets },
        { name: 'Actions', dataKey: 'id', dataFormatter: formatEditButton, stickyRight: true },
      ],
      rows: setlistsAdaptedForTable,
    };

    pageContent = <Table {...setlistTableData} />;
  } else {
    const hasSetlists = setlistsAdapted && setlistsAdapted.length > 0;
    pageContent = (
      <>
        {hasSetlists
          ? 'No setlists match your filters.'
          : "You haven't added any setlists"}
      </>
    );
  }

  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <TextField
          label="Search by name"
          variant="outlined"
          size="small"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <TextField
          label="Search by date"
          variant="outlined"
          size="small"
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
            />
          }
          label="Show past setlists"
        />
      </Stack>
      {pageContent}
      <Box sx={{ mt: 3 }}>
        <Button
          component={Link}
          href={`/band/${bandId}/setlists/create`}
          variant="contained"
        >
          Create a Setlist
        </Button>
      </Box>
    </>
  );
}
