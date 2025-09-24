import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-secondary/30 z-0">
            {/* Placeholder for animated background */}
        </div>
      <div className="container px-4 md:px-6 z-10">
        <div className="grid gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-primary">
              Bridge Communication Gaps with AI
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Real-time Indian Sign Language recognition using advanced computer vision. Empowering connection and understanding, one gesture at a time.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
            <Button asChild size="lg">
              <Link href="/detect">Start Detecting</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/train">Train Gestures</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
