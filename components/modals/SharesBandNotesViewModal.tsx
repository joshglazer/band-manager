import SharesBandNotesViewer from '@/components/SharesBandNotesViewer';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';

interface SharesBandNotesViewModalProps {
  songName: string | null;
  sharesBandNotes: string;
}

export default function SharesBandNotesViewModal({ songName, sharesBandNotes }: Readonly<SharesBandNotesViewModalProps>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<MusicNoteIcon />}
        onClick={() => setOpen(true)}
      >
        View Shares Band Notes
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{songName ?? 'Shares Band Notes'}</DialogTitle>
        <DialogContent>
          <SharesBandNotesViewer sharesBandNotes={sharesBandNotes} />
        </DialogContent>
      </Dialog>
    </>
  );
}
