import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, StarHalf } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Priya S.',
    role: 'Student',
    quote: "This app has been a game-changer in my college classes. I can finally communicate with my hearing peers without a translator. It's given me so much independence.",
    avatarSeed: 'priya',
    rating: 5,
  },
  {
    name: 'Amit K.',
    role: 'Healthcare Worker',
    quote: "Communicating with deaf patients used to be a major challenge. Now, I can understand their needs quickly and accurately. An invaluable tool for healthcare.",
    avatarSeed: 'amit',
    rating: 5,
  },
  {
    name: 'Sunita M.',
    role: 'Parent',
    quote: "SignSpeak has helped me connect with my deaf son on a whole new level. We can 'talk' about anything, and it's strengthened our bond immensely. Thank you!",
    avatarSeed: 'sunita',
    rating: 5,
  },
];

const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const stars = [];
    for(let i=0; i<fullStars; i++) {
        stars.push(<Star key={`full_${i}`} className="text-yellow-400 fill-yellow-400" />);
    }
    if (halfStar) {
        stars.push(<StarHalf key="half" className="text-yellow-400 fill-yellow-400" />);
    }
    return <div className="flex">{stars}</div>
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">User Stories and Experiences</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed mt-4">
            Hear from individuals whose lives have been positively impacted by SignSpeak.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl items-stretch gap-8 pt-12 sm:grid-cols-1 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glass-card flex flex-col">
              <CardContent className="pt-6 flex-grow">
                <blockquote className="text-lg text-foreground italic">
                  "{testimonial.quote}"
                </blockquote>
              </CardContent>
              <CardHeader>
                <div className="flex items-center gap-4">
                   <Image 
                      src={`https://picsum.photos/seed/${testimonial.avatarSeed}/40/40`}
                      width={40}
                      height={40}
                      alt={testimonial.name}
                      className="rounded-full"
                      data-ai-hint="person avatar"
                    />
                  <div>
                    <CardTitle className="text-base">{testimonial.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                   <div className="ml-auto flex items-center">
                       {renderStars(testimonial.rating)}
                    </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="text-center mt-12">
            <h3 className="text-2xl font-semibold">Video Testimonials</h3>
            <p className="text-muted-foreground mb-4">Watch our users share their stories.</p>
            <div className="relative aspect-video max-w-3xl mx-auto rounded-lg overflow-hidden border">
                 <Image 
                      src="https://picsum.photos/seed/video-testimonial/1280/720"
                      fill
                      alt="Video testimonial placeholder"
                      className="object-cover"
                      data-ai-hint="video player"
                    />
            </div>
        </div>
      </div>
    </section>
  );
}
