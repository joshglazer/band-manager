import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { Suspense } from 'react';
import AuthButton from './AuthButton';

export default function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <>
          <Typography variant="h5" component="h1" className="flex-grow">
            <Link href="/" className="text-inherit no-underline">
              Band Manager
            </Link>
          </Typography>
          <Suspense>
            <AuthButton />
          </Suspense>
        </>
      </Toolbar>
    </AppBar>
  );
}
