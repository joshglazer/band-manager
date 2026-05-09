import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Suspense } from 'react';
import AuthButton from './AuthButton';
import BandSwitcher from './BandSwitcher';
import HeaderLogo from './HeaderLogo';
import HeaderNavToggle from './HeaderNavToggle';

export default function Header() {
  return (
    <AppBar position="static" sx={{ width: '100%' }}>
      <Toolbar sx={{ width: '100%', px: { xs: 2, sm: 3 } }}>
        <HeaderNavToggle />
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <HeaderLogo />
        </Box>
        <BandSwitcher />
        <Suspense>
          <AuthButton />
        </Suspense>
      </Toolbar>
    </AppBar>
  );
}
