'use client';

import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import { usePathname } from 'next/navigation';
import { useNav } from './NavContext';

export default function HeaderNavToggle() {
  const pathname = usePathname();
  const { setMobileOpen } = useNav();

  if (!pathname.startsWith('/band/')) return null;

  return (
    <IconButton
      onClick={() => setMobileOpen(true)}
      size="small"
      sx={{ display: { sm: 'none' }, color: 'inherit', mr: 1 }}
      aria-label="Open navigation menu"
    >
      <MenuIcon />
    </IconButton>
  );
}
