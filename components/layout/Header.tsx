import MusicNoteIcon from '@mui/icons-material/MusicNote';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { Suspense } from 'react';
import AuthButton from './AuthButton';

export default function Header() {
  return (
    <AppBar position="static" sx={{ width: '100%' }}>
      <Toolbar sx={{ maxWidth: '64rem', width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Link href="/" className="no-underline" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'inherit' }}>
            <MusicNoteIcon sx={{ fontSize: 26 }} />
            <Typography variant="h6" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
              Band Manager
            </Typography>
          </Link>
        </Box>
        <Suspense>
          <AuthButton />
        </Suspense>
      </Toolbar>
    </AppBar>
  );
}
