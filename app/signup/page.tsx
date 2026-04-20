import SignUpForm from '@/components/forms/SignUpForm';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

interface SignUpPageProps {
  searchParams: {
    message: string;
  };
}

export default function SignUpPage({ searchParams }: Readonly<SignUpPageProps>) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} mb={0.5}>
            Create an account
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Join Band Manager and get organized
          </Typography>
          <SignUpForm errorMessage={searchParams.message} />
          <Typography variant="body2" color="text.secondary" mt={3}>
            Already have an account?{' '}
            <Link component={NextLink} href="/login" underline="hover" color="primary">
              Log in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
