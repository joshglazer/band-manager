'use client';

import Loading from '@/components/design/Loading';
import BandBreadcrumbs from '@/components/layout/BandBreadcrumbs';
import useBand from '@/hooks/useBand';
import ArchiveIcon from '@mui/icons-material/Archive';
import ChecklistIcon from '@mui/icons-material/Checklist';
import GroupIcon from '@mui/icons-material/Group';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { BandRouteProps } from './types';

interface ConsumerProps {
  children: ReactNode;
}

type BandLayoutProps = BandRouteProps & ConsumerProps;

export default function BandLayout({ children, params }: BandLayoutProps) {
  const { bandId } = params;
  const { data: band, isLoading } = useBand({ bandId });
  const [archiving, setArchiving] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
    return <Loading />;
  }

  if (band) {
    const isArchived = !!band.archived_at;

    const toggleArchive = async () => {
      setArchiving(true);
      try {
        await fetch(`/api/bands/${bandId}/archive`, { method: 'POST' });
        router.refresh();
      } finally {
        setArchiving(false);
      }
    };

    const navItems = [
      { label: 'Members', href: `/band/${bandId}/members`, icon: <GroupIcon fontSize="small" /> },
      { label: 'Songs', href: `/band/${bandId}/songs`, icon: <LibraryMusicIcon fontSize="small" /> },
      { label: 'Setlists', href: `/band/${bandId}/setlists`, icon: <QueueMusicIcon fontSize="small" /> },
      { label: 'Practice', href: `/band/${bandId}/practice`, icon: <ChecklistIcon fontSize="small" /> },
    ];

    return (
      <>
        <Box sx={{ pt: 3, pb: 2 }}>
          <BandBreadcrumbs bandId={bandId} bandName={band.name} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {band.name}
            </Typography>
            {isArchived && (
              <Chip label="Archived" size="small" color="default" variant="outlined" />
            )}
            <Box sx={{ ml: 'auto' }}>
              <Button
                size="small"
                variant="text"
                color="inherit"
                startIcon={isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
                onClick={toggleArchive}
                disabled={archiving}
                sx={{ color: 'text.secondary' }}
              >
                {isArchived ? 'Unarchive band' : 'Archive band'}
              </Button>
            </Box>
          </Box>
          <Divider sx={{ mt: 2 }} />
        </Box>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box
            component="nav"
            sx={{
              width: 200,
              flexShrink: 0,
              borderRight: '1px solid',
              borderColor: 'divider',
              pr: 1,
            }}
          >
            <List disablePadding>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <ListItem key={item.href} disablePadding>
                    <ListItemButton
                      component={NextLink}
                      href={item.href}
                      selected={isActive}
                      sx={{
                        borderRadius: 1,
                        mb: 0.5,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                          '&:hover': { bgcolor: 'primary.dark' },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
        </Box>
      </>
    );
  }

  return <Typography variant="h5">Band not found.</Typography>;
}
