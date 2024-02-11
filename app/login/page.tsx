import LoginForm from '@/components/forms/LoginForm';

interface LoginPageProps {
  searchParams: {
    message: string;
  };
}

export default function LoginPage({ searchParams }: Readonly<LoginPageProps>) {
  return <LoginForm errorMessage={searchParams.message} />;
}
