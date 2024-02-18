import Button, { ButtonProps } from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';

interface ModalWithTriggerProps {
  buttonText: string | JSX.Element;
  buttonVariant?: ButtonProps['variant'];
  modalTitle: string;
  modalContent?: string | JSX.Element;
}

export default function ModalWithTrigger({
  buttonText,
  buttonVariant = 'text',
  modalTitle,
  modalContent,
}: ModalWithTriggerProps) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button variant={buttonVariant} onClick={handleClickOpen}>
        {buttonText}
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{modalTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{modalContent}</DialogContentText>
        </DialogContent>
      </Dialog>
    </>
  );
}
