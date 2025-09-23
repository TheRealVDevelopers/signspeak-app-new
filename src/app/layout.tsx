import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset } from '@/components/ui/sidebar';
import { BrainCircuit, Scan, Hand, Home } from 'lucide-react';
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
        <SidebarProvider>
          <Sidebar>
            <SidebarContent className="p-4">
              <div className="mb-4">
                <Link href="/" className="flex items-center gap-2">
                    <Hand className="h-7 w-7 text-primary" />
                    <span className="font-bold text-xl">SignSpeak</span>
                </Link>
              </div>
              <SidebarMenu>
                 <SidebarMenuItem>
                   <SidebarMenuButton asChild>
                      <Link href="/">
                        <Home />
                        <span>Home</span>
                      </Link>
                   </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                   <SidebarMenuButton asChild>
                      <Link href="/detect">
                        <Scan />
                        <span>Detect</span>
                      </Link>
                   </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
             <header className="flex items-center justify-between p-4 border-b md:justify-end">
                <div className="md:hidden">
                    <SidebarTrigger />
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" asChild>
                        <a href="https://github.com/firebase/studio-e2e-sign-language" target="_blank" rel="noopener noreferrer">
                           View on GitHub
                        </a>
                    </Button>
                </div>
             </header>
            <main className="p-0 md:p-0">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
