import ChordChartViewer from '@/components/ChordChartViewer';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';

interface ChordChartViewModalProps {
  songName: string | null;
  chordChart: string;
}

export default function ChordChartViewModal({ songName, chordChart }: Readonly<ChordChartViewModalProps>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<MusicNoteIcon />}
        onClick={() => setOpen(true)}
      >
        View Chords
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{songName ?? 'Chord Chart'}</DialogTitle>
        <DialogContent>
          <ChordChartViewer chordChart={chordChart} />
        </DialogContent>
      </Dialog>
    </>
  );
}
