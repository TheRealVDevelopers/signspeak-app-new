import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Hand, BrainCircuit, Scan } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-40 xl:py-48 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    SignSpeak: Real-Time Sign Language Translation
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Bridge communication gaps with our cutting-edge AI. Train custom sign language gestures and see them recognized in real-time.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                    <Link href="/train">
                      Start Training <BrainCircuit className="ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                     <Link href="/detect">
                       Go to Detection <Scan className="ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                 <Hand className="w-48 h-48 lg:w-72 lg:h-72 text-primary opacity-10" />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Teach, Detect, Communicate</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  SignSpeak provides a seamless experience for building your own sign language recognition model.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <div className="grid gap-2 p-6 rounded-lg bg-background shadow-md transition-transform hover:scale-105">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-full bg-primary/10 p-2">
                    <BrainCircuit className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Custom Training</h3>
                </div>
                <p className="text-muted-foreground">
                  Easily train the AI to recognize new gestures. Capture multiple samples right from your webcam to ensure accuracy.
                </p>
              </div>
              <div className="grid gap-2 p-6 rounded-lg bg-background shadow-md transition-transform hover:scale-105">
                 <div className="flex items-center gap-3">
                   <div className="flex items-center justify-center rounded-full bg-primary/10 p-2">
                    <Scan className="h-6 w-6 text-primary" />
                   </div>
                  <h3 className="text-xl font-bold">Real-Time Detection</h3>
                </div>
                <p className="text-muted-foreground">
                  Our optimized model runs directly in your browser, providing instant feedback and gesture recognition without any lag.
                </p>
              </div>
              <div className="grid gap-2 p-6 rounded-lg bg-background shadow-md transition-transform hover:scale-105">
                 <div className="flex items-center gap-3">
                   <div className="flex items-center justify-center rounded-full bg-primary/10 p-2">
                    <Hand className="h-6 w-6 text-primary" />
                   </div>
                  <h3 className="text-xl font-bold">Offline Capable</h3>
                </div>
                <p className="text-muted-foreground">
                  Once loaded, the entire application can run offline, making it reliable and accessible anywhere, anytime.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 SignSpeak. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
