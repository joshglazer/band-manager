import Bands from '@/components/Bands';
import useAuthUser from '@/hooks/useAuthUser';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

export default async function IndexPage() {
  const user = await useAuthUser();

  return (
    <Box className="animate-in">
      {user ? (
        <>
          <Typography variant="h5" fontWeight={700} mb={3}>
            Your Bands
          </Typography>
          <Bands />
        </>
      ) : (
        <Box sx={{ maxWidth: 560, pt: 6, pb: 4 }}>
          <Typography variant="h3" fontWeight={700} mb={2} lineHeight={1.2}>
            Your band, without the headache.
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={2}>
            Being in a band is <em>supposed to be</em> fun. Keeping track of
            setlists, song lists, and all the other{' '}
            <em>administrative band things</em> in spreadsheets is not.
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Band Manager handles the boring stuff so you can focus on the music.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              component={NextLink}
              href="/login"
              variant="contained"
              size="large"
            >
              Log in
            </Button>
            <Button
              component={NextLink}
              href="/signup"
              variant="outlined"
              size="large"
            >
              Sign up
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
