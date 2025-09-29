import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Waves, BookUser } from 'lucide-react';
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
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased')}>
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Waves className="h-7 w-7 text-primary" />
                    <span className="font-bold text-xl">SignSpeak</span>
                </Link>
                <nav>
                    <Button asChild variant="outline">
                        <Link href="/train">
                            <BookUser className="mr-2" />
                            Train Gestures
                        </Link>
                    </Button>
                </nav>
            </div>
        </header>
        <main className="flex-1">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
