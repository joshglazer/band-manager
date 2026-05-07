import AuthCard from '@/components/layout/AuthCard';
import SignUpForm from '@/components/forms/SignUpForm';
import Box from '@mui/material/Box';

interface SignUpPageProps {
  searchParams: {
    message: string;
  };
}

export default function SignUpPage({ searchParams }: Readonly<SignUpPageProps>) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
      <AuthCard
        title="Create an account"
        subtitle="Join Band Manager and get organized"
        footerText="Already have an account?"
        footerLinkText="Log in"
        footerLinkHref="/login"
      >
        <SignUpForm errorMessage={searchParams.message} />
      </AuthCard>
    </Box>
  );
}
