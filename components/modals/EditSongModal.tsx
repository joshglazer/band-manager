import { Tables } from '@/types/supabase';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import EditSongForm from '../forms/EditSongForm';

interface EditSongModalProps {
  song: Tables<'songs'>;
  onSuccess?: () => void;
}

export default function EditSongModal({ song, onSuccess }: Readonly<EditSongModalProps>) {
  const [open, setOpen] = useState(false);

  function handleSuccess() {
    setOpen(false);
    onSuccess?.();
  }

  return (
    <>
      <IconButton aria-label="Edit song" size="small" onClick={() => setOpen(true)}>
        <EditIcon fontSize="small" />
      </IconButton>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit Song</DialogTitle>
        <DialogContent className="pt-3">
          <EditSongForm song={song} onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
}
