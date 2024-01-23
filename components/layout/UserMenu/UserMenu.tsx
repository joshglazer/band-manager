'use client';

import useUserProfile from '@/hooks/useUserProfile';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import { User } from '@supabase/supabase-js';
import { useMemo, useState } from 'react';
import Loading from '../../design/Loading';
import UserMenuItemLogout from './UserMenuItemLogout';
import UserMenuItemProfile from './UserMenuItemProfile';

interface UserMenuProps {
  user: User;
  signOut: () => Promise<void>;
}

export default function UserMenu({ user, signOut }: Readonly<UserMenuProps>): JSX.Element {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const { data: userProfile } = useUserProfile({ userId: user.id });

  const avatarInitials: string = useMemo(() => {
    const initials: string[] = [];
    if (userProfile) {
      [userProfile.first_name, userProfile.last_name].forEach((namePart) => {
        if (!!namePart) {
          initials.push(namePart);
        }
      });
    }

    if (initials.length === 0) {
      initials.push(user.email ?? '?');
    }

    return initials.map((initial) => initial[0].toUpperCase()).join('');
  }, [user.email, userProfile]);

  if (!avatarInitials) {
    return <Loading />;
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }}>{avatarInitials}</Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <UserMenuItemProfile handleClose={handleClose} />
        <UserMenuItemLogout handleClose={handleClose} signOut={signOut} />
      </Menu>
    </>
  );
}
