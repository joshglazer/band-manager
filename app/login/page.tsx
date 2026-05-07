import AuthCard from '@/components/layout/AuthCard';
import LoginForm from '@/components/forms/LoginForm';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';

interface LoginPageProps {
  searchParams: {
    message: string;
  };
}

export default function LoginPage({ searchParams }: Readonly<LoginPageProps>) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
      <AuthCard>
        <Typography variant="h5" fontWeight={700} mb={0.5}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Log in to manage your band
        </Typography>
        <LoginForm errorMessage={searchParams.message} />
        <Typography variant="body2" color="text.secondary" mt={3}>
          Don&apos;t have an account?{' '}
          <Link component={NextLink} href="/signup" underline="hover" color="primary">
            Sign up
          </Link>
        </Typography>
      </AuthCard>
    </Box>
  );
}
