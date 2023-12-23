import AuthButton from './AuthButton';

export default function Header() {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-4xl flex justify-between items-center py-3">
        <h1 className="text-3xl font-bold">Band Manager</h1>
        <AuthButton />
      </div>
    </nav>
  );
}
