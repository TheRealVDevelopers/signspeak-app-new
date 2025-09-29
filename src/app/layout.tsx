import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Waves } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'SignSpeak',
  description: 'Real-time sign language detection and training',
  icons: [{ rel: 'icon', url: '/icon.svg' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        <header className="flex items-center justify-between p-4 border-b border-transparent">
          <Link href="/" className="flex items-center gap-2">
            <Waves className="h-7 w-7 text-primary" />
            <span className="font-bold text-xl">SignSpeak</span>
          </Link>
        </header>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
