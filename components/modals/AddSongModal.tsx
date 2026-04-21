import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';
import AddSongForm from '../forms/AddSongForm';

interface AddSongModalProps {
  bandId: number;
  onSuccess?: () => void;
}

export default function AddSongModal({ bandId, onSuccess }: Readonly<AddSongModalProps>) {
  const [open, setOpen] = useState(false);

  function handleSuccess() {
    setOpen(false);
    onSuccess?.();
  }

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Add Song
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Song</DialogTitle>
        <DialogContent className="pt-3">
          <AddSongForm bandId={bandId} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
