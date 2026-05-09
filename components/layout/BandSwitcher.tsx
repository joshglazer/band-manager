'use client';

import useBands from '@/hooks/useBands';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { usePathname, useRouter } from 'next/navigation';

export default function BandSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const bandMatch = pathname.match(/^\/band\/(\d+)/);
  const currentBandId = bandMatch ? bandMatch[1] : null;

  const { data: bands } = useBands();

  if (!currentBandId || !bands || bands.length <= 1) return null;

  const handleChange = (event: SelectChangeEvent) => {
    router.push(`/band/${event.target.value}`);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 140, mr: 1 }}>
      <Select
        value={currentBandId}
        onChange={handleChange}
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
