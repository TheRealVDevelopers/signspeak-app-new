import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Camera, Save } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function TrainingSection() {
  return (
    <section id="training" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/20">
      <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Train Your Own Custom Gestures</h2>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Expand the application's vocabulary by teaching it new signs. Our intuitive training interface makes it easy to add custom gestures, personalizing the experience and making the tool even more powerful.
          </p>
          <div className="grid gap-4 pt-6">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Lightbulb className="h-6 w-6 text-primary" />
                  <CardTitle>1. Name Your Gesture</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Give your new gesture a clear and descriptive name, like "Water" or "Help".</p>
                </CardContent>
              </Card>
               <Card className="glass-card">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Camera className="h-6 w-6 text-primary" />
                  <CardTitle>2. Capture Samples</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Record a number of samples of the gesture from slightly different angles to create a robust model.</p>
                </CardContent>
              </Card>
               <Card className="glass-card">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Save className="h-6 w-6 text-primary" />
                  <CardTitle>3. Save and Detect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Save your gesture, and the AI will be able to recognize it instantly during detection.</p>
                </CardContent>
              </Card>
          </div>
           <div className="pt-6">
             <Button asChild size="lg">
                <Link href="/train">Start Training Now</Link>
             </Button>
           </div>
        </div>
        <Image
          src="https://picsum.photos/seed/training/600/800"
          width={600}
          height={800}
          alt="Gesture Training"
          className="mx-auto aspect-[3/4] overflow-hidden rounded-xl object-cover object-center sm:w-full"
          data-ai-hint="person teaching a robot"
        />
      </div>
    </section>
  );
}
