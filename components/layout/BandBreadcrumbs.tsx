'use client';

import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import MuiLink from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

interface BandBreadcrumbsProps {
  bandId: number;
  bandName: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  members: 'Members',
  songs: 'Songs',
  setlists: 'Setlists',
  create: 'Create Setlist',
  edit: 'Edit Setlist',
  'spotify-import': 'Import from Spotify',
  practice: 'Practice',
};

export default function BandBreadcrumbs({ bandId, bandName }: BandBreadcrumbsProps) {
  const pathname = usePathname();

  const basePath = `/band/${bandId}`;
  const rest = pathname.replace(basePath, '').split('/').filter(Boolean);
  const isBandDashboard = rest.length === 0;

  const breadcrumbs: { label: string; href: string | null }[] = [{ label: 'Home', href: '/' }];

  if (isBandDashboard) {
    breadcrumbs.push({ label: bandName, href: null });
  } else {
    breadcrumbs.push({ label: bandName, href: basePath });

    let cumulativePath = basePath;
    const displayItems: { label: string; href: string | null }[] = [];

    for (const segment of rest) {
      cumulativePath += `/${segment}`;
      if (!isNaN(Number(segment))) continue;
      displayItems.push({ label: SEGMENT_LABELS[segment] ?? segment, href: cumulativePath });
    }

    if (displayItems.length > 0) {
      displayItems[displayItems.length - 1].href = null;
    }

    breadcrumbs.push(...displayItems);
  }

  return (
    <MuiBreadcrumbs sx={{ mb: 2 }}>
      {breadcrumbs.map((crumb, index) =>
        crumb.href ? (
          <MuiLink
            key={index}
            component={NextLink}
            href={crumb.href}
            underline="hover"
            color="inherit"
            variant="body2"
          >
            {crumb.label}
          </MuiLink>
        ) : (
          <Typography key={index} color="text.primary" variant="body2">
            {crumb.label}
          </Typography>
        )
      )}
    </MuiBreadcrumbs>
  );
}
