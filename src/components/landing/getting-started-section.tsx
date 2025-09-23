import { CheckCircle, AlertCircle, Cpu, Camera, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function GettingStartedSection() {
  return (
    <section id="getting-started" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/20">
      <div className="container px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Begin?</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed mt-4">
            Follow this simple guide to get started with SignSpeak and unlock a new way to communicate.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 pt-12 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500" /> System Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Cpu /> A modern computer (desktop or laptop).</p>
              <p className="flex items-center gap-2"><Camera /> A webcam connected to your device.</p>
              <p>A recent version of a web browser like Chrome or Firefox.</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertCircle className="text-yellow-500" /> Tips for Best Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Ensure your room is well-lit.</p>
              <p>Use a plain, non-distracting background.</p>
              <p>Position your hand gestures clearly in front of the camera.</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HelpCircle className="text-blue-500" /> Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>If the camera doesn&apos;t start, check browser permissions.</p>
              <p>For slow detection, try closing other browser tabs.</p>
              <p>Contact support if you encounter persistent issues.</p>
            </CardContent>
          </Card>
        </div>
        <div className="text-center mt-12">
            <Button asChild size="lg">
                <Link href="/detect">Start Detecting Now</Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
