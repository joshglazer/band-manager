import SignUpForm from '@/components/forms/SignUpForm';

interface SignUpPageProps {
  searchParams: {
    message: string;
  };
}

export default function SignUpPage({ searchParams }: Readonly<SignUpPageProps>) {
  return <SignUpForm errorMessage={searchParams.message} />;
}
