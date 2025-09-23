import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Brain, Eye, Cpu } from 'lucide-react';
import Image from 'next/image';

export function TechnologySection() {
  return (
    <section id="technology" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/20">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powered by Advanced AI</h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our application leverages state-of-the-art machine learning and computer vision to deliver fast and accurate sign language recognition directly in your browser.
            </p>
            <div className="space-y-4 pt-4">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Brain className="h-6 w-6 text-primary" />
                  <CardTitle>Machine Learning Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    We use a sophisticated Convolutional Neural Network (CNN) trained on thousands of gesture samples. This model is optimized to run efficiently on-device without sacrificing accuracy.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Eye className="h-6 w-6 text-primary" />
                  <CardTitle>Computer Vision Technology</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Using MediaPipe, we extract 21 key landmarks from the hand in real-time. This data provides the precise geometry of the hand's position and shape, which is fed to our AI model for analysis.
                  </CardDescription>
                </CardContent>
              </Card>
               <Card className="glass-card">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Cpu className="h-6 w-6 text-primary" />
                  <CardTitle>Performance & Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our model achieves <span className="text-primary font-bold">~95% accuracy</span> on trained gestures with an average detection time of less than <span className="text-primary font-bold">50ms</span>, ensuring a smooth, real-time experience.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Image
                src="https://picsum.photos/seed/techdiagram/600/600"
                width={600}
                height={600}
                alt="Technical Architecture"
                className="mx-auto aspect-square overflow-hidden rounded-xl object-contain"
                data-ai-hint="neural network diagram"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
