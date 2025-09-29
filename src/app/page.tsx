import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves, Zap, BrainCircuit, ArrowRight, Camera, BookOpen } from 'lucide-react';
import Link from 'next/link';

function HeroSection() {
  return (
    <section className="w-full py-24 md:py-32 lg:py-40 text-center">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-4">
            <Waves className="h-16 w-16 text-primary" />
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SignSpeak
              </span>
            </h1>
          </div>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl">
            Bridge the communication gap. Instantly translate Indian Sign Language gestures into text with the power of AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-10 py-6 text-lg">
              <Link href="/detect">
                Start Detecting Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: 'Real-time Detection',
      description: 'Instantly translate sign language gestures into text using your webcam.',
      link: '/detect'
    },
    {
      icon: <BrainCircuit className="h-10 w-10 text-primary" />,
      title: 'Train Your Own Signs',
      description: 'Teach the AI new gestures and build your own personalized sign language model.',
      link: '/train'
    },
  ];

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">Features</h2>
        </div>
        <div className="mx-auto grid max-w-4xl items-stretch gap-10 sm:grid-cols-2">
          {features.map((feature, index) => (
            <Link key={index} href={feature.link} className="flex">
                <Card className="glass-card text-center h-full flex flex-col items-center justify-center p-8 w-full">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
                    {feature.icon}
                  </div>
                  <CardHeader className="p-0">
                    <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-3">
                    <p className="text-muted-foreground text-lg">{feature.description}</p>
                  </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: <Camera className="h-10 w-10 text-primary" />,
      title: '1. Enable Camera',
      description: 'Grant access to your webcam to get started.',
    },
    {
      icon: <Zap className="h-10 w-10 text-accent" />,
      title: '2. Make a Sign',
      description: 'Position your hand clearly in the frame.',
    },
    {
      icon: <BookOpen className="h-10 w-10 text-secondary" />,
      title: '3. Get Translation',
      description: 'Our AI instantly provides the text translation.',
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">How It Works</h2>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-14 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                {step.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground text-lg">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GlimpseIntoISLSection() {
  const gestures = [
    { emoji: '👋', name: 'Hello' },
    { emoji: '👍', name: 'Yes' },
    { emoji: '👎', name: 'No' },
    { emoji: '🙏', name: 'Thank You' },
  ];

  return (
    <section id="glimpse" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">A Glimpse into ISL</h2>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-2 items-stretch gap-10 sm:grid-cols-4">
          {gestures.map((gesture, index) => (
            <Card key={index} className="glass-card text-center flex flex-col items-center justify-center p-8 aspect-square">
              <div className="text-8xl mb-4">{gesture.emoji}</div>
              <p className="font-semibold text-xl">{gesture.name}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToActionSection() {
  return (
    <section id="cta" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
            <Card className="glass-card p-10 md:p-16 flex flex-col items-center">
                <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl mb-6">
                Ready to Communicate?
                </h2>
                <p className="text-muted-foreground md:text-xl lg:text-2xl mb-10">
                Experience seamless sign language detection and break down communication barriers today.
                </p>
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-10 py-6 text-lg">
                  <Link href="/detect">
                      Go to Detector <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
            </Card>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="flex-1">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <GlimpseIntoISLSection />
      <CallToActionSection />
    </main>
  );
}
