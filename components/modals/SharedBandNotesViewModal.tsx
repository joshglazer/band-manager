import SharedBandNotesViewer from '@/components/SharedBandNotesViewer';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';

interface SharedBandNotesViewModalProps {
  songName: string | null;
  sharedBandNotes: string;
}

export default function SharedBandNotesViewModal({ songName, sharedBandNotes }: Readonly<SharedBandNotesViewModalProps>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<MusicNoteIcon />}
        onClick={() => setOpen(true)}
      >
        View Shared Band Notes
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{songName ?? 'Shared Band Notes'}</DialogTitle>
        <DialogContent>
          <SharedBandNotesViewer sharedBandNotes={sharedBandNotes} />
        </DialogContent>
      </Dialog>
    </>
  );
}
