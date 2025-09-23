import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scan, BrainCircuit, CloudOff, UserCheck, Lock, MonitorSmartphone } from 'lucide-react';

const features = [
  {
    icon: <Scan className="h-8 w-8 text-primary" />,
    title: 'Real-time Detection',
    description: 'Instantly recognize and translate sign language gestures from your webcam feed.',
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: '30+ Pre-trained Gestures',
    description: 'Comes with a built-in library of common Indian Sign Language gestures ready to use.',
  },
  {
    icon: <CloudOff className="h-8 w-8 text-primary" />,
    title: 'Offline Functionality',
    description: 'Works entirely in your browser without needing an internet connection.',
  },
  {
    icon: <UserCheck className="h-8 w-8 text-primary" />,
    title: 'Easy-to-Use Interface',
    description: 'A simple and intuitive design that makes navigation and operation effortless.',
  },
  {
    icon: <Lock className="h-8 w-8 text-primary" />,
    title: 'Privacy-First Design',
    description: 'All processing happens on your device. Your camera data never leaves your computer.',
  },
  {
    icon: <MonitorSmartphone className="h-8 w-8 text-primary" />,
    title: 'Multi-Device Support',
    description: 'Runs on any desktop or laptop with a modern web browser and a webcam.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features Showcase</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Explore the powerful features that make SignSpeak a leading tool for sign language communication.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 pt-12 sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="glass-card text-center h-full">
              <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
