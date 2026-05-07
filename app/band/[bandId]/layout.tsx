'use client';

import Loading from '@/components/design/Loading';
import BandBreadcrumbs from '@/components/layout/BandBreadcrumbs';
import { useNav } from '@/components/layout/NavContext';
import useBand from '@/hooks/useBand';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChecklistIcon from '@mui/icons-material/Checklist';
import GridViewIcon from '@mui/icons-material/GridView';
import GroupIcon from '@mui/icons-material/Group';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import { useTheme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { BandRouteProps } from './types';

interface ConsumerProps {
  children: ReactNode;
}

type BandLayoutProps = BandRouteProps & ConsumerProps;

const SIDEBAR_WIDTH = 200;

export default function BandLayout({ children, params }: BandLayoutProps) {
  const { bandId } = params;
  const { data: band, isLoading } = useBand({ bandId });
  const { mobileOpen, setMobileOpen } = useNav();
  const pathname = usePathname();
  const { palette } = useTheme();
  const sidebarGradient = palette.mode === 'dark'
    ? 'linear-gradient(180deg, #1a0b0d 0%, #1c0c1e 100%)'
    : 'linear-gradient(180deg, #fef2f2 0%, #fef0fc 100%)';

  if (isLoading) {
    return <Loading />;
  }

  if (band) {
    const isArchived = !!band.archived_at;

    const basePath = `/band/${bandId}`;

    const navItems = [
      { label: 'Overview', href: basePath, icon: <GridViewIcon fontSize="small" />, exact: true },
      { label: 'Events', href: `${basePath}/events`, icon: <CalendarMonthIcon fontSize="small" /> },
      { label: 'Members', href: `${basePath}/members`, icon: <GroupIcon fontSize="small" /> },
      { label: 'Songs', href: `${basePath}/songs`, icon: <LibraryMusicIcon fontSize="small" /> },
      { label: 'Setlists', href: `${basePath}/setlists`, icon: <QueueMusicIcon fontSize="small" /> },
      { label: 'Practice', href: `${basePath}/practice`, icon: <ChecklistIcon fontSize="small" /> },
      { label: 'Settings', href: `${basePath}/settings`, icon: <SettingsIcon fontSize="small" /> },
    ];

    const navList = (onNavigate?: () => void) => (
      <List disablePadding>
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                component={NextLink}
                href={item.href}
                selected={isActive}
                onClick={onNavigate}
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
    );

    const sidebarSx = {
      background: sidebarGradient,
      borderRight: '1px solid',
      borderColor: 'divider',
      pt: 3,
      px: 1.5,
    };

    return (
      // Breaks out of the root layout's max-w-4xl centered container and p-3 padding.
      // With border-box sizing, 50% of the content width equals exactly the offset needed
      // to reach the viewport left edge (centering gap + padding are both captured by 50% - 50vw).
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          width: '100vw',
          ml: 'calc(50% - 50vw)',
          mt: '-0.75rem',
          mb: '-0.75rem',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {/* Permanent sidebar — desktop only */}
        <Box
          component="nav"
          sx={{ display: { xs: 'none', sm: 'block' }, width: SIDEBAR_WIDTH, flexShrink: 0, ...sidebarSx }}
        >
          {navList()}
        </Box>

        {/* Temporary drawer — mobile only */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box', ...sidebarSx },
          }}
        >
          {navList(() => setMobileOpen(false))}
        </Drawer>

        <Box sx={{ flex: 1, minWidth: 0, pt: 3, pb: 2, pl: 3, pr: { xs: 3, sm: '0.75rem' } }}>
          <BandBreadcrumbs bandId={bandId} bandName={band.name} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {band.name}
            </Typography>
            {isArchived && (
              <Chip label="Archived" size="small" color="default" variant="outlined" />
            )}
          </Box>
          <Divider sx={{ mt: 2, mb: 3 }} />
          {children}
        </Box>
      </Box>
    );
  }

  return <Typography variant="h5">Band not found.</Typography>;
}
