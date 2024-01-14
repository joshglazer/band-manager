'use client';

import { Tables } from '@/types/supabase';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Hidden from '@mui/material/Hidden';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { getDragDropBackgroundColorClassName } from './helpers';
import SetEditor from './SetEditor';
import SongDragAndDrop from './SongDragAndDrop';
import { Set, Setlist } from './types';
import TextField from '@mui/material/TextField';
import { createClient } from '@/utils/supabase/client';

interface SetlistEditorProps {
  initialSetlist: Setlist;
  bandId: number;
}

export default function SetlistEditor({
  initialSetlist,
  bandId,
}: Readonly<SetlistEditorProps>): JSX.Element {
  const [setlist, setSetlist] = useState<Setlist>(initialSetlist);

  const router = useRouter();
  const supabase = createClient();

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
    await supabase
      .from('setlists')
      .insert({ name: setlist.name, band_id: bandId });
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
      title: event.target.value,
    }));
  }

  return (
    <>
      <Box className="flex justify-between pb-3">
        <TextField
          id="title"
          label="Title"
          variant="outlined"
          value={setlist.name}
          onChange={handleTitleChange}
          placeholder="My Setlist"
        />
        {/* <Typography variant="h6">{setlist.title}</Typography> */}
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
