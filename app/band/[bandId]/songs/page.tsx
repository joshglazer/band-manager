'use client';

import Loading from '@/components/design/Loading';
import Table, { TableProps, TablePropsDataType, TableRow } from '@/components/design/Table';
import AddSongModal from '@/components/modals/AddSongModal';
import ChordChartViewModal from '@/components/modals/ChordChartViewModal';
import EditSongModal from '@/components/modals/EditSongModal';
import SongCommentsModal from '@/components/modals/SongCommentsModal';
import useSongs, { SongsComposite } from '@/hooks/useSongs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from 'next/link';
import prettyMilliseconds from 'pretty-ms';
import { useState } from 'react';
import { BandRouteProps } from '../types';

function formatDuration(value?: TablePropsDataType | null) {
  return value && typeof value === 'number'
    ? prettyMilliseconds(value, { secondsDecimalDigits: 0 })
    : '--';
}

function formatComments(value: TablePropsDataType | null, row: TableRow) {
  return (
    <SongCommentsModal commentsCount={+(value ?? 0)} song={row as unknown as SongsComposite} />
  );
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

  function formatChordChart(value: TablePropsDataType | null, row: TableRow) {
    if (!value) return null;
    return <ChordChartViewModal songName={row.name as string | null} chordChart={value as string} />;
  }

  function formatActions(_value: TablePropsDataType | null, row: TableRow) {
    return <EditSongModal song={row as unknown as SongsComposite} onSuccess={mutate} />;
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
      chord_chart: song.chord_chart,
      commentsCount: song.song_comments[0].count,
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
          name: 'Comments',
          dataKey: 'commentsCount',
          className: 'whitespace-nowrap',
          dataFormatter: formatComments,
        },
        {
          name: 'Chord Chart',
          dataKey: 'chord_chart',
          className: 'whitespace-nowrap',
          dataFormatter: formatChordChart,
        },
        {
          name: '',
          dataKey: 'id',
          dataFormatter: formatActions,
          className: 'whitespace-nowrap',
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
