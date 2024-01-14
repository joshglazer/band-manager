'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Hidden from '@mui/material/Hidden';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import SetEditor from './SetEditor';
import SongDragAndDrop from './SongDragAndDrop';
import { Set, Setlist } from './types';
import { Tables } from '@/types/supabase';
interface SetlistEditorProps {
  initialSetlist: Setlist;
}

export default function SetlistEditor({
  initialSetlist,
}: SetlistEditorProps): JSX.Element {
  const [setlist, setSetlist] = useState<Setlist>(initialSetlist);

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

  function renderUnusedSongs() {
    return (
      <Droppable droppableId="unused">
        {(provided, snapshot) => (
          <div>
            <Paper
              elevation={1}
              ref={provided.innerRef}
              sx={{
                p: 2,
                backgroundColor: snapshot.isDraggingOver ? 'grey.300' : 'auto',
              }}
              {...provided.droppableProps}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  p: 1,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 'bold',
                  }}
                >
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

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 3 }}>
        <Typography variant="h6">{setlist.title}</Typography>
      </Box>
      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            {renderSetlists()}
            <Button variant="contained" onClick={addSetlist}>
              Add Set
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Hidden smUp>
              <Divider sx={{ my: 2 }} />
            </Hidden>
            {renderUnusedSongs()}
          </Grid>
        </Grid>
      </DragDropContext>
    </>
  );
}
