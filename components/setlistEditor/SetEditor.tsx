import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import prettyMilliseconds from 'pretty-ms';
import { useCallback } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import SongDragAndDrop from './SongDragAndDrop';
import { Set } from './types';

interface SetEditorProps {
  index: number;
  set: Set;
}

export default function SetEditor({ index, set }: SetEditorProps): JSX.Element {
  const getSetDuration = useCallback(() => {
    const initialValue = 0;
    return set.songs.reduce(
      (accumulator, currentValue) => accumulator + (currentValue.duration ?? 0),
      initialValue
    );
  }, [set]);

  return (
    <Droppable droppableId={`set-${index}`}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          sx={{
            marginBottom: '2em',
            backgroundColor: snapshot.isDraggingOver ? 'grey.300' : 'auto',
          }}
          elevation={1}
          {...provided.droppableProps}
        >
          <Container sx={{ p: 2 }}>
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
                Set #{index + 1}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 'bold',
                }}
              >
                {prettyMilliseconds(getSetDuration(), {
                  secondsDecimalDigits: 0,
                })}
              </Typography>
            </Box>

            <Box>
              {set.songs.length ? (
                set.songs.map((song, index) => (
                  <SongDragAndDrop key={song.id} song={song} index={index} />
                ))
              ) : (
                <div>Drag and drop songs here</div>
              )}
            </Box>
          </Container>
        </Paper>
      )}
    </Droppable>
  );
}
