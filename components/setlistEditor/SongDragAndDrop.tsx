/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tables } from '@/types/supabase';
import DragIndicatorOutlinedIcon from '@mui/icons-material/DragIndicatorOutlined';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import prettyMilliseconds from 'pretty-ms';
import { Draggable } from 'react-beautiful-dnd';

interface SongProps {
  song: Tables<'songs'>;
  index: number;
}

export default function SongDragAndDrop({ song, index }: Readonly<SongProps>) {
  const { id, name, artist, duration } = song;

  return (
    <Draggable key={`${id}`} draggableId={`${id}`} index={index}>
      {(provided, _snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card variant="outlined">
            <CardContent className="flex items-center">
              <DragIndicatorOutlinedIcon />
              <Box className="px-2">
                <div className="font-medium">{name}</div>
                <div>{artist}</div>
              </Box>
              <Box className="ml-auto whitespace-nowrap">
                {prettyMilliseconds(duration ?? 0, { secondsDecimalDigits: 0 })}
              </Box>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
}
