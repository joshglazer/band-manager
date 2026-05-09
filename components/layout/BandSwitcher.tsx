'use client';

import useBands from '@/hooks/useBands';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { SxProps, Theme } from '@mui/material/styles';
import { usePathname, useRouter } from 'next/navigation';

interface BandSwitcherProps {
  sx?: SxProps<Theme>;
}

export default function BandSwitcher({ sx }: BandSwitcherProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const bandMatch = pathname.match(/^\/band\/(\d+)/);
  const currentBandId = bandMatch ? bandMatch[1] : null;

  const { data: bands } = useBands();

  if (!currentBandId || !bands || bands.length <= 1) return null;

  return (
    <FormControl size="small" sx={{ minWidth: 140, ...sx }}>
      <Select
        value={currentBandId}
        onChange={(e) => router.push(`/band/${e.target.value}`)}
        sx={{
          color: 'inherit',
          '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.7)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
          '.MuiSvgIcon-root': { color: 'inherit' },
        }}
      >
        {bands.map((band) => (
          <MenuItem key={band.id} value={String(band.id)}>
            {band.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
