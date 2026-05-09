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
      {/* Main toolbar row */}
      <Toolbar sx={{ width: '100%', px: { xs: 2, sm: 3 } }}>
        <HeaderNavToggle />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
          <HeaderLogo />
          {/* Band switcher inline with logo — desktop only */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <BandSwitcher />
          </Box>
        </Box>
        <Suspense>
          <AuthButton />
        </Suspense>
      </Toolbar>
      {/* Band switcher sub-row — mobile only */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, px: 2, pb: 0.75 }}>
        <BandSwitcher sx={{ minWidth: 0, width: 'auto' }} />
      </Box>
    </AppBar>
  );
}
