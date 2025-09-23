import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Tv, School, Gamepad2 } from 'lucide-react';
import Link from 'next/link';

const resources = [
  {
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    title: 'Recommended Books',
    description: 'Deepen your understanding with comprehensive guides and dictionaries on ISL.',
    link: '#',
  },
  {
    icon: <Tv className="h-6 w-6 text-primary" />,
    title: 'Online Learning Platforms',
    description: 'Interactive courses and video lessons from platforms like ISLRTC and Ali Yavar Jung National Institute.',
    link: '#',
  },
  {
    icon: <School className="h-6 w-6 text-primary" />,
    title: 'Local ISL Classes',
    description: 'Find in-person classes and workshops in your city to practice with native signers.',
    link: '#',
  },
  {
    icon: <Gamepad2 className="h-6 w-6 text-primary" />,
    title: 'Practice Exercises & Games',
    description: 'Sharpen your skills with fun, interactive games and quizzes designed for all learning levels.',
    link: '#',
  },
];

export function LearningResourcesSection() {
  return (
    <section id="learning-resources" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Expand Your Sign Language Knowledge</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed mt-4">
            Continue your learning journey with these curated resources and tools.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl items-stretch gap-6 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {resources.map((resource, index) => (
            <Link key={index} href={resource.link} passHref>
                <Card className="glass-card h-full hover:border-primary transition-colors">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            {resource.icon}
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>{resource.description}</CardDescription>
                    </CardContent>
                </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
