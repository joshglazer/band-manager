'use client';

import Loading from '@/components/design/Loading';
import Table, { TableProps, TablePropsDataType } from '@/components/design/Table';
import { adaptSetlist, getSetlistDisplayName } from '@/components/setlistEditor/helpers';
import useSetlists from '@/hooks/useSetlists';
import useSongs from '@/hooks/useSongs';
import { TablesInsert } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
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
  onDelete,
}: {
  setlistId: number;
  bandId: number;
  onDuplicate: (id: number) => void;
  onDelete: (id: number) => Promise<void>;
}) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const open = Boolean(anchorEl);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleDeleteClick = () => {
    handleClose();
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(setlistId);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

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
            window.open(`/print/setlist/${setlistId}/songs`, '_blank');
            handleClose();
          }}
        >
          <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Print Setlist</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            window.open(`/print/setlist/${setlistId}/shared-band-notes`, '_blank');
            handleClose();
          }}
        >
          <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Print Shared Band Notes</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      <Dialog open={confirmOpen} onClose={() => !deleting && setConfirmOpen(false)}>
        <DialogTitle>Delete Setlist</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this setlist? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function BandSetlistsPage({ params }: Readonly<BandRouteProps>) {
  const { bandId } = params;

  const [nameFilter, setNameFilter] = useState('');

  const supabase = createClient();
  const { data: setlists, isLoading: isLoadingSetlists, mutate: mutateSetlists } = useSetlists({ bandId });
  const { data: songs, isLoading: isLoadingSongs } = useSongs({ bandId });

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

  const duplicateSetlist = useCallback(
    async (setlistId: number) => {
      const original = setlists?.find((s) => s.id === setlistId);
      if (!original) return;

      const newSetlistData: TablesInsert<'setlists'> = {
        band_id: original.band_id,
        name: original.name ? `Copy of ${original.name}` : null,
        event_id: null,
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

  const deleteSetlist = useCallback(
    async (setlistId: number) => {
      await supabase.from('setlist_songs').delete().eq('setlist_id', setlistId);
      await supabase.from('setlists').delete().eq('id', setlistId);
      await mutateSetlists();
    },
    [supabase, mutateSetlists]
  );

  const formatEditButton = useCallback(
    (setlistId: TablePropsDataType) => {
      return (
        <SetlistActionsMenu
          setlistId={setlistId as number}
          bandId={bandId}
          onDuplicate={duplicateSetlist}
          onDelete={deleteSetlist}
        />
      );
    },
    [bandId, duplicateSetlist, deleteSetlist]
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
        if (nameFilter) {
          return getSetlistDisplayName(setlist).toLowerCase().includes(nameFilter.toLowerCase());
        }
        return true;
      })
      .sort((a, b) => {
        const aDate = a.event?.date;
        const bDate = b.event?.date;
        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;
        return aDate.localeCompare(bDate);
      });
  }, [setlistsAdapted, nameFilter]);

  if (isLoading) {
    return <Loading />;
  }

  let pageContent: JSX.Element;

  if (filteredAndSortedSetlists.length) {
    const setlistsAdaptedForTable = filteredAndSortedSetlists.map((setlist) => ({
      name: getSetlistDisplayName(setlist),
      id: setlist.id,
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
        { name: 'Sets', dataKey: 'sets', dataFormatter: formatSets },
        { name: 'Actions', dataKey: 'id', dataFormatter: formatEditButton, stickyRight: true, hideHeader: true },
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
