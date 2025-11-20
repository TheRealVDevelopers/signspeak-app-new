import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/frontend/lib/utils';
import { Toaster } from '@/frontend/components/ui/toaster';

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
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}