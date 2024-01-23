import { MenuItem } from '@mui/material';

interface UserMenuItemProps {
  handleClose: () => void;
  signOut: () => Promise<void>;
}

export default function UserMenuItem({ handleClose, signOut }: Readonly<UserMenuItemProps>) {
  function handleClick() {
    signOut();
    handleClose();
  }

  return <MenuItem onClick={handleClick}>Logout</MenuItem>;
}
