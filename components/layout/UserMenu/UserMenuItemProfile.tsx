import { MenuItem } from '@mui/material';
import { useRouter } from 'next/navigation';

interface UserMenuItemProps {
  handleClose: () => void;
}

export default function UserMenuItem({ handleClose }: UserMenuItemProps) {
  const router = useRouter();

  function handleClick() {
    router.push('/profile');
    handleClose();
  }

  return <MenuItem onClick={handleClick}>Profile</MenuItem>;
}
