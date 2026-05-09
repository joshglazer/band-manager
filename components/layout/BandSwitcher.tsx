'use client';

import useBands from '@/hooks/useBands';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { usePathname, useRouter } from 'next/navigation';

interface BandSwitcherProps {
  variant?: 'appbar' | 'drawer';
  onNavigate?: () => void;
}

export default function BandSwitcher({ variant = 'appbar', onNavigate }: BandSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const bandMatch = pathname.match(/^\/band\/(\d+)/);
  const currentBandId = bandMatch ? bandMatch[1] : null;

  const { data: bands } = useBands();

  if (!currentBandId || !bands || bands.length <= 1) return null;

  const bandItems = bands.map((band) => (
    <MenuItem key={band.id} value={String(band.id)}>
      {band.name}
    </MenuItem>
  ));

  if (variant === 'drawer') {
    return (
      <FormControl size="small" fullWidth sx={{ mb: 2 }}>
        <Select
          value={currentBandId}
          onChange={(e) => { router.push(`/band/${e.target.value as string}`); onNavigate?.(); }}
        >
          {bandItems}
        </Select>
      </FormControl>
    );
  }

  return (
    <FormControl size="small" sx={{ minWidth: 140 }}>
      <Select
        value={currentBandId}
        onChange={(e) => { router.push(`/band/${e.target.value as string}`); onNavigate?.(); }}
        sx={{
          color: 'inherit',
          '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.7)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
          '.MuiSvgIcon-root': { color: 'inherit' },
        }}
      >
        {bandItems}
      </Select>
    </FormControl>
  );
}
