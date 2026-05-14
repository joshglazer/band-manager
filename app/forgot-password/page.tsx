import AuthCard from '@/components/layout/AuthCard';
import ForgotPasswordForm from '@/components/forms/ForgotPasswordForm';
import Box from '@mui/material/Box';

interface ForgotPasswordPageProps {
  searchParams: {
    message: string;
  };
}

export default function ForgotPasswordPage({
  searchParams,
}: Readonly<ForgotPasswordPageProps>) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
      <AuthCard
        title="Forgot your password?"
        subtitle="Enter your email to receive a password reset link"
        footerText="Remember your password?"
        footerLinkText="Log in"
        footerLinkHref="/login"
      >
        <ForgotPasswordForm errorMessage={searchParams.message} />
      </AuthCard>
    </Box>
  );
}
