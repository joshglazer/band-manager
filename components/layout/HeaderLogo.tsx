'use client';

import MusicNoteIcon from '@mui/icons-material/MusicNote';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderLogo() {
  const pathname = usePathname();
  const bandMatch = pathname.match(/^\/band\/(\d+)/);
  const href = bandMatch ? `/band/${bandMatch[1]}` : '/';

  return (
    <Link href={href} className="no-underline" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'inherit' }}>
      <MusicNoteIcon sx={{ fontSize: 26 }} />
      <Typography variant="h6" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
        Band Manager
      </Typography>
    </Link>
  );
}
