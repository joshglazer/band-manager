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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1 }}>
          <HeaderLogo />
          {/* Desktop only — on mobile the switcher lives inside the nav drawer */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <BandSwitcher />
          </Box>
        </Box>
        <Suspense>
          <AuthButton />
        </Suspense>
      </Toolbar>
    </AppBar>
  );
}
