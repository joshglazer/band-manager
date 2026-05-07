import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { NavProvider } from '@/components/layout/NavContext';
import ThemeRegistry from '@/components/ThemeRegistry';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
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

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <html lang="en" className={GeistSans.className}>
        <body>
          <ThemeRegistry>
            <NavProvider>
              <div className="min-h-screen flex-1 w-full flex flex-col">
                <Header />
                <main className="flex flex-col grow w-full">
                  <div className="w-full max-w-4xl mx-auto p-3">{children}</div>
                </main>
                <Footer />
              </div>
            </NavProvider>
          </ThemeRegistry>
        </body>
      </html>
    </AppRouterCacheProvider>
  );
}
