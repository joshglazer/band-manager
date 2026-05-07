export const dynamic = 'force-dynamic';

import BandForm from '@/components/forms/BandForm';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default async function Index() {
  return (
    <Box sx={{ pt: 3, maxWidth: 480 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        Create a band
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Give your band a name to get started.
      </Typography>
      <BandForm />
    </Box>
  );
}
