'use client';

import ChordChartViewer from '@/components/ChordChartViewer';
import Loading from '@/components/design/Loading';
import Table, { TableProps, TablePropsDataType, TableRow } from '@/components/design/Table';
import EditSongForm from '@/components/forms/EditSongForm';
import SongCommentForm from '@/components/forms/SongCommentForm';
import AddSongModal from '@/components/modals/AddSongModal';
import useSongs, { SongsComposite } from '@/hooks/useSongs';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Link from 'next/link';
import prettyMilliseconds from 'pretty-ms';
import { useState } from 'react';
import { BandRouteProps } from '../types';

function SongActionsMenu({
  song,
  onEditSuccess,
}: {
  song: SongsComposite;
  onEditSuccess: () => void;
}) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeModal, setActiveModal] = useState<'edit' | 'comments' | 'chords' | null>(null);

  const menuOpen = Boolean(menuAnchor);
  const commentsCount = song.song_comments[0].count;
  const hasChordChart = Boolean(song.chord_chart);

  const openMenu = (e: React.MouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget);
  const closeMenu = () => setMenuAnchor(null);
  const openModal = (modal: 'edit' | 'comments' | 'chords') => {
    closeMenu();
    setActiveModal(modal);
  };
  const closeModal = () => setActiveModal(null);

  return (
    <>
      <IconButton onClick={openMenu} aria-label="actions" size="small">
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={menuAnchor} open={menuOpen} onClose={closeMenu}>
        <MenuItem onClick={() => openModal('comments')}>
          Comments ({commentsCount})
        </MenuItem>
        {hasChordChart && (
          <MenuItem onClick={() => openModal('chords')}>View Chord Chart</MenuItem>
        )}
        <MenuItem onClick={() => openModal('edit')}>Edit</MenuItem>
      </Menu>

      <Dialog open={activeModal === 'edit'} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle>Edit Song</DialogTitle>
        <DialogContent className="pt-3">
          <EditSongForm
            song={song}
            onSuccess={() => {
              closeModal();
              onEditSuccess();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === 'comments'} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle>{song.name} Comments</DialogTitle>
        <DialogContent>
          <SongCommentForm songId={song.id} />
        </DialogContent>
      </Dialog>

      {hasChordChart && (
        <Dialog open={activeModal === 'chords'} onClose={closeModal} maxWidth="md" fullWidth>
          <DialogTitle>{song.name ?? 'Chord Chart'}</DialogTitle>
          <DialogContent>
            <ChordChartViewer chordChart={song.chord_chart!} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

function formatDuration(value?: TablePropsDataType | null) {
  return value && typeof value === 'number'
    ? prettyMilliseconds(value, { secondsDecimalDigits: 0 })
    : '--';
}

export default function BandSongsPage({ params }: Readonly<BandRouteProps>) {
  const { bandId } = params;

  const { data: songs, isLoading, mutate } = useSongs({ bandId });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null
  );

  function handleSort(key: string) {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  }

  function formatActions(_value: TablePropsDataType | null, row: TableRow) {
    const song = songs?.find((s) => s.id === row.id);
    if (!song) return '';
    return <SongActionsMenu song={song} onEditSuccess={mutate} />;
  }

  if (isLoading) {
    return <Loading />;
  }

  let pageContent: JSX.Element;

  if (songs?.length) {
    const allSongs = songs.map((song) => ({
      id: song.id,
      name: song.name,
      artist: song.artist,
      duration: song.duration,
    }));

    const q = searchQuery.toLowerCase();
    const filteredSongs = q
      ? allSongs.filter(
          (song) =>
            song.name?.toString().toLowerCase().includes(q) ||
            song.artist?.toString().toLowerCase().includes(q)
        )
      : allSongs;

    const songsForTable = sortConfig
      ? [...filteredSongs].sort((a, b) => {
          const aVal = a[sortConfig.key as keyof typeof a] ?? '';
          const bVal = b[sortConfig.key as keyof typeof b] ?? '';
          const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sortConfig.direction === 'asc' ? cmp : -cmp;
        })
      : filteredSongs;

    const sortDir = (key: string) =>
      sortConfig?.key === key ? sortConfig.direction : undefined;

    const songsTableData: TableProps = {
      ariaLabel: 'Table of Songs',
      columns: [
        {
          name: 'Name',
          dataKey: 'name',
          isHeader: true,
          headerDataKey: 'id',
          sortable: true,
          sortDirection: sortDir('name'),
          onSort: () => handleSort('name'),
        },
        {
          name: 'Artist',
          dataKey: 'artist',
          sortable: true,
          sortDirection: sortDir('artist'),
          onSort: () => handleSort('artist'),
        },
        {
          name: 'Length',
          dataKey: 'duration',
          dataFormatter: formatDuration,
          className: 'whitespace-nowrap',
          sortable: true,
          sortDirection: sortDir('duration'),
          onSort: () => handleSort('duration'),
        },
        {
          name: 'Actions',
          dataKey: 'id',
          dataFormatter: formatActions,
          stickyRight: true,
        },
      ],
      rows: songsForTable,
    };
    pageContent = <Table {...songsTableData} />;
  } else {
    pageContent = <>You haven&apos;t added any songs</>;
  }

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="Search songs"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by name or artist"
        />
      </Box>
      {pageContent}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <AddSongModal bandId={+bandId} onSuccess={mutate} />
        <Button
          component={Link}
          href={`/band/${bandId}/songs/spotify-import`}
          variant="contained"
        >
          Import Songs From Spotify
        </Button>
      </Box>
    </>
  );
}
