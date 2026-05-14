import AuthCard from '@/components/layout/AuthCard';
import ResetPasswordForm from '@/components/forms/ResetPasswordForm';
import Box from '@mui/material/Box';

export default function ResetPasswordPage() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
      <AuthCard
        title="Reset your password"
        subtitle="Enter your new password below"
        footerText="Remember your password?"
        footerLinkText="Log in"
        footerLinkHref="/login"
      >
        <ResetPasswordForm />
      </AuthCard>
    </Box>
  );
}
