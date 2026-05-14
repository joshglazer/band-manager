import AuthCard from '@/components/layout/AuthCard';
import LoginForm from '@/components/forms/LoginForm';
import Box from '@mui/material/Box';

interface LoginPageProps {
  searchParams: {
    message: string;
  };
}

export default function LoginPage({ searchParams }: Readonly<LoginPageProps>) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
      <AuthCard
        title="Welcome back"
        subtitle="Log in to manage your band"
        footerText="Don't have an account?"
        footerLinkText="Sign up"
        footerLinkHref="/signup"
        secondaryFooterLinkText="Forgot Password?"
        secondaryFooterLinkHref="/forgot-password"
      >
        <LoginForm errorMessage={searchParams.message} />
      </AuthCard>
    </Box>
  );
}
