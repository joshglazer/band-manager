import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { GeistSans } from 'geist/font/sans';
import { ReactNode } from 'react';
import './globals.css';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Band Manager',
  description:
    'Let us handle the boring parts of being in a band, so you can focus on the fun stuff!',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground">
        <div className="min-h-screen flex-1 w-full flex flex-col items-center">
          <Header />
          <main className="flex flex-col items-center grow py-3 w-full">
            <div className="w-full max-w-4xl">{children}</div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
