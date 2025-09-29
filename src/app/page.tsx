import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Waves, Zap, BrainCircuit, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function HeroSection() {
  return (
    <section className="w-full py-24 md:py-32 lg:py-40 text-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-4">
            <Waves className="h-12 w-12 text-primary" />
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
              SignSpeak
            </h1>
          </div>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Bridge the communication gap. Instantly translate Indian Sign Language gestures into text with the power of AI.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary text-white">
            <Link href="/detect">
              Start Detecting Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: 'Real-time Detection',
      description: 'Instantly translate sign language gestures into text using your webcam.',
      link: '/detect'
    },
    {
      icon: <BrainCircuit className="h-8 w-8 text-primary" />,
      title: 'Train Your Own Signs',
      description: 'Teach the AI new gestures and build your own personalized sign language model.',
      link: '/train'
    },
  ];

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
        </div>
        <div className="mx-auto grid max-w-3xl items-start gap-8 sm:grid-cols-2">
          {features.map((feature, index) => (
            <Link key={index} href={feature.link}>
                <Card className="glass-card text-center h-full flex flex-col items-center justify-center p-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    {feature.icon}
                  </div>
                  <CardHeader className="p-0">
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <HeroSection />
      <FeaturesSection />
       <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
            {/* Content for this section will be added later */}
        </div>
      </section>
    </div>
  );
}
