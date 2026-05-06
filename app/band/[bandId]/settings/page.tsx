'use client';

import Loading from '@/components/design/Loading';
import useBand from '@/hooks/useBand';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BandRouteProps } from '../types';

export default function BandSettingsPage({ params }: Readonly<BandRouteProps>) {
  const { bandId } = params;
  const { data: band, isLoading } = useBand({ bandId });
  const router = useRouter();

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (band) setName(band.name);
  }, [band]);

  if (isLoading) return <Loading />;
  if (!band) return <Typography variant="h5">Band not found.</Typography>;

  const isArchived = !!band.archived_at;
  const nameChanged = name.trim() !== band.name;

  const handleRename = async () => {
    if (!nameChanged) return;
    setSaving(true);
    try {
      await fetch(`/api/bands/${bandId}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    setConfirmOpen(false);
    setArchiving(true);
    try {
      await fetch(`/api/bands/${bandId}/archive`, { method: 'POST' });
      router.refresh();
    } finally {
      setArchiving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Band Name
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="small"
          fullWidth
          inputProps={{ maxLength: 100 }}
        />
        <Button
          variant="contained"
          onClick={handleRename}
          disabled={!nameChanged || saving || !name.trim()}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" fontWeight={600} color="error" gutterBottom>
        Danger Zone
      </Typography>
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'error.main',
          borderRadius: 1,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {isArchived ? 'Unarchive this band' : 'Archive this band'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isArchived
              ? 'Restore this band and make it active again.'
              : 'Hide this band from your active bands list.'}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color={isArchived ? 'inherit' : 'error'}
          startIcon={isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}
          onClick={isArchived ? handleArchive : () => setConfirmOpen(true)}
          disabled={archiving}
        >
          {isArchived ? 'Unarchive band' : 'Archive band'}
        </Button>
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Archive band?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to archive <strong>{band.name}</strong>? It will be hidden from
            your active bands list. You can unarchive it at any time from the settings page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleArchive} color="error" variant="contained" disabled={archiving}>
            Archive band
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
