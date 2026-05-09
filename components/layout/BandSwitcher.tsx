'use client';

import BandForm from '@/components/forms/BandForm';
import useBands from '@/hooks/useBands';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface BandSwitcherProps {
  variant?: 'appbar' | 'drawer';
  onNavigate?: () => void;
}

export default function BandSwitcher({ variant = 'appbar', onNavigate }: BandSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const bandMatch = pathname.match(/^\/band\/(\d+)/);
  const currentBandId = bandMatch ? bandMatch[1] : null;
  const [addBandOpen, setAddBandOpen] = useState(false);

  const { data: bands } = useBands();

  if (!currentBandId || !bands || bands.length < 1) return null;

  const handleChange = (value: string) => {
    if (value === 'add-band') {
      setAddBandOpen(true);
    } else {
      router.push(`/band/${value}`);
      onNavigate?.();
    }
  };

  const handleBandCreated = (newBandId: number) => {
    setAddBandOpen(false);
    router.push(`/band/${newBandId}`);
    onNavigate?.();
  };

  const bandItems = bands.map((band) => (
    <MenuItem key={band.id} value={String(band.id)}>
      {band.name}
    </MenuItem>
  ));

  const addBandModal = (
    <Dialog open={addBandOpen} onClose={() => setAddBandOpen(false)}>
      <DialogTitle>Add another band</DialogTitle>
      <DialogContent>
        <BandForm onBandCreated={handleBandCreated} />
      </DialogContent>
    </Dialog>
  );

  if (variant === 'drawer') {
    return (
      <>
        <FormControl size="small" fullWidth sx={{ mb: 2 }}>
          <Select
            value={currentBandId}
            onChange={(e) => handleChange(e.target.value as string)}
          >
            {bandItems}
            <Divider />
            <MenuItem value="add-band" sx={{ color: 'primary.main' }}>
              Add another band
            </MenuItem>
          </Select>
        </FormControl>
        {addBandModal}
      </>
    );
  }

  return (
    <>
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <Select
          value={currentBandId}
          onChange={(e) => handleChange(e.target.value as string)}
          sx={{
            color: 'inherit',
            '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.4)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.7)' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
            '.MuiSvgIcon-root': { color: 'inherit' },
          }}
        >
          {bandItems}
          <Divider />
          <MenuItem value="add-band" sx={{ color: 'primary.main' }}>
            Add another band
          </MenuItem>
        </Select>
      </FormControl>
      {addBandModal}
    </>
  );
}
