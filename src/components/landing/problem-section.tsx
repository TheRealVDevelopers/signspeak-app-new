import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertCircle, MessageCircleOff } from 'lucide-react';

export function ProblemSection() {
  return (
    <section id="problem" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">The Communication Challenge</h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              In India, millions of individuals with hearing impairments face significant barriers in daily communication,
              leading to social isolation and limited access to education and employment.
            </p>
            <div className="grid grid-cols-2 gap-4">
                <Card className="glass-card">
                    <CardHeader>
                        <Users className="h-8 w-8 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">18 Million+</div>
                        <p className="text-xs text-muted-foreground">People in India with hearing impairments.</p>
                    </CardContent>
                </Card>
                 <Card className="glass-card">
                    <CardHeader>
                        <AlertCircle className="h-8 w-8 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">&lt;5%</div>
                        <p className="text-xs text-muted-foreground">Literacy rate in sign language, creating a huge gap.</p>
                    </CardContent>
                </Card>
            </div>
             <Card className="glass-card mt-4">
                <CardHeader className="flex flex-row items-center gap-4">
                    <MessageCircleOff className="h-8 w-8 text-primary" />
                    <CardTitle>A Personal Story</CardTitle>
                </CardHeader>
                <CardContent>
                    <blockquote className="text-muted-foreground border-l-2 pl-4 italic">
                        "Every day was a challenge. Simple things like asking for directions or ordering food felt like monumental tasks. Technology like this doesn't just translate; it opens up the world." - An ISL user
                    </blockquote>
                </CardContent>
            </Card>
          </div>
          <Image
            src="https://picsum.photos/seed/communication/800/800"
            width={800}
            height={800}
            alt="Communication Barrier"
            className="mx-auto aspect-square overflow-hidden rounded-xl object-cover"
            data-ai-hint="person looking confused"
          />
        </div>
      </div>
    </section>
  );
}
