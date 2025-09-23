import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Cpu, MessageSquare } from 'lucide-react';

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            A simple, three-step process to bridge the communication gap.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 pt-12 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
                 <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Camera className="h-8 w-8 text-primary" />
                        <CardTitle>1. Show the Gesture</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Position your hand in front of your webcam. Our app captures the video feed in real-time.</p>
                    </CardContent>
                </Card>
                 <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Cpu className="h-8 w-8 text-primary" />
                        <CardTitle>2. AI Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">A sophisticated neural network analyzes the hand's landmarks and shape locally on your device.</p>
                    </CardContent>
                </Card>
                 <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <MessageSquare className="h-8 w-8 text-primary" />
                        <CardTitle>3. Instant Translation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">The recognized gesture is instantly displayed as text, providing immediate communication.</p>
                    </CardContent>
                </Card>
            </div>
            <Image
                src="https://picsum.photos/seed/howitworks/600/800"
                width={600}
                height={800}
                alt="How it works"
                className="mx-auto aspect-[3/4] overflow-hidden rounded-xl object-cover object-center sm:w-full lg:col-span-2"
                data-ai-hint="person using sign language"
            />
        </div>
      </div>
    </section>
  );
}
