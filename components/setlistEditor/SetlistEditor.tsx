'use client';

import { Tables, TablesInsert } from '@/types/supabase';
import { createClient } from '@/utils/supabase/client';
import useBandEvents from '@/hooks/useBandEvents';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Hidden from '@mui/material/Hidden';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PrintDropdownButton from '@/components/PrintDropdownButton';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { getDragDropBackgroundColorClassName, getEventDisplayName } from './helpers';
import SetEditor from './SetEditor';
import SongDragAndDrop from './SongDragAndDrop';
import { Set, Setlist } from './types';

interface SetlistEditorProps {
  initialSetlist: Setlist;
}

export default function SetlistEditor({
  initialSetlist,
}: Readonly<SetlistEditorProps>): JSX.Element {
  const [setlist, setSetlist] = useState<Setlist>(initialSetlist);

  const router = useRouter();
  const supabase = createClient();
  const { data: events } = useBandEvents({ bandId: setlist.bandId });

  const selectedEvent = events?.find((e) => e.id === setlist.eventId) ?? null;

  function renderSet(set: Set, index: number): JSX.Element {
    return <SetEditor key={index} index={index} set={set} />;
  }

  function renderSetlists(): JSX.Element {
    return <div>{setlist.sets.map(renderSet)}</div>;
  }

  function addSetlist() {
    const newSetlist = structuredClone(setlist);
    setSetlist({
      ...newSetlist,
      sets: [...newSetlist.sets, { songs: [] }],
    });
  }

  async function saveSetlist() {
    const { id, name, eventId, bandId } = setlist;
    const upsertData: TablesInsert<'setlists'> = {
      name: name?.trim() || null,
      band_id: bandId,
      event_id: eventId ?? null,
    };
    let setlistIdForSongs: number | undefined;
    if (id) {
      setlistIdForSongs = id;
      await supabase.from('setlist_songs').delete().eq('setlist_id', id);
      await supabase.from('setlists').update(upsertData).eq('id', id);
    } else {
      const { data: insertedData } = await supabase
        .from('setlists')
        .insert(upsertData)
        .select();
      if (insertedData) {
        setlistIdForSongs = insertedData[0].id;
      }
    }

    if (setlistIdForSongs) {
      await Promise.all(
        setlist.sets.map(async (set, setIndex) => {
          await Promise.all(
            set.songs.map(async (song, songIndex) => {
              const setlistSongInsertData: TablesInsert<'setlist_songs'> = {
                setlist_id: setlistIdForSongs as number,
                set: setIndex,
                set_weight: songIndex,
                song_id: song.id,
              };
              await supabase
                .from('setlist_songs')
                .insert(setlistSongInsertData);
            })
          );
        })
      );
    }

    router.push(`/band/${bandId}/setlists`);
  }

  function renderUnusedSongs() {
    return (
      <Droppable droppableId="unused">
        {(provided, snapshot) => (
          <div>
            <Paper
              elevation={1}
              ref={provided.innerRef}
              className={`p-2 ${getDragDropBackgroundColorClassName(snapshot)}`}
              {...provided.droppableProps}
            >
              <Box className="flex justify-between p-1">
                <Typography variant="body1" className="font-bold">
                  Unused Songs
                </Typography>
              </Box>
              <Box>
                {setlist.unusedSongs.map((unusedSong, index) => (
                  <SongDragAndDrop
                    key={unusedSong.id}
                    song={unusedSong}
                    index={index}
                  />
                ))}
              </Box>
            </Paper>
          </div>
        )}
      </Droppable>
    );
  }

  function getSetlistIndexFromContainerId(setlistContainerId: string) {
    const setlistIndex = +setlistContainerId.split('-')[1];
    return setlistIndex;
  }

  function moveSong(
    sourceId: string,
    sourceIndex: number,
    destinationId: string,
    destinationIndex: number
  ): void {
    let song: Tables<'songs'> | null = null;
    const newSetlist = structuredClone(setlist);

    if (sourceId === 'unused') {
      song = setlist.unusedSongs[sourceIndex];
      if (song) {
        newSetlist.unusedSongs.splice(sourceIndex, 1);
      }
    } else if (sourceId.startsWith('set-')) {
      const setIndex = getSetlistIndexFromContainerId(sourceId);
      song = setlist.sets[setIndex].songs[sourceIndex];
      newSetlist.sets[setIndex].songs.splice(sourceIndex, 1);
    }

    if (song !== null) {
      if (destinationId.startsWith('set-')) {
        const setIndex = getSetlistIndexFromContainerId(destinationId);
        newSetlist.sets[setIndex].songs.splice(destinationIndex, 0, song);
      } else if (destinationId === 'unused') {
        newSetlist.unusedSongs.splice(destinationIndex, 0, song);
      }
    }
    setSetlist(newSetlist);
  }

  function onDragEnd(result: DropResult) {
    const { source, destination } = result;
    if (destination) {
      moveSong(
        source.droppableId,
        source.index,
        destination.droppableId,
        destination.index
      );
    }
  }

  function handleTitleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setSetlist((value) => ({
      ...value,
      name: event.target.value,
    }));
  }

  function handleEventChange(eventId: number | '') {
    const newEvent = eventId ? (events?.find((e) => e.id === eventId) ?? null) : null;
    setSetlist((value) => ({
      ...value,
      eventId: eventId || undefined,
      event: newEvent,
    }));
  }

  return (
    <>
      <Box className="flex gap-4 pb-3" sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl variant="outlined" size="small" sx={{ width: 300 }}>
          <InputLabel id="event-select-label">Event</InputLabel>
          <Select
            labelId="event-select-label"
            label="Event"
            size="small"
            value={setlist.eventId ?? ''}
            onChange={(e) => handleEventChange(e.target.value as number | '')}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {events?.map((event) => (
              <MenuItem key={event.id} value={event.id}>
                {getEventDisplayName(event)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          id="title"
          label="Custom Name (optional)"
          variant="outlined"
          value={setlist.name ?? ''}
          onChange={handleTitleChange}
          placeholder={selectedEvent ? 'Override event name…' : 'My Setlist'}
          sx={{ width: 300 }}
        />
        {setlist.id && (
          <Box sx={{ ml: { xs: 0, sm: 'auto' } }}>
            <PrintDropdownButton
              options={[
                { label: 'Print Setlist', url: `/print/setlist/${setlist.id}/songs` },
                { label: 'Print Chord Charts', url: `/print/setlist/${setlist.id}/chord-charts` },
              ]}
            />
          </Box>
        )}
      </Box>
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {renderSetlists()}
            <Box className="flex justify-between">
              <Button variant="contained" onClick={addSetlist}>
                Add Set
              </Button>
              <Button variant="contained" onClick={saveSetlist}>
                Save Setlist
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Hidden smUp>
              <Divider className="my-4" />
            </Hidden>
            {renderUnusedSongs()}
          </Grid>
        </Grid>
      </DragDropContext>
    </>
  );
}
