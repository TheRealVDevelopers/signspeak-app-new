import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const alphabet = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 
  'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

export function IslEducationSection() {
  return (
    <section id="isl-education" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Understanding Indian Sign Language (ISL)</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Discover the basics of ISL, a rich and expressive language used by millions across India.
          </p>
        </div>
        <div className="mx-auto max-w-5xl pt-12 grid gap-8">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>History and Recognition of ISL</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <p className="text-muted-foreground">
                        Indian Sign Language has a rich history but was only officially recognized as a language by the Indian government in 2005. The establishment of the Indian Sign Language Research and Training Centre (ISLRTC) in 2015 was a major milestone. ISL is the primary language for a large community of deaf and hard-of-hearing individuals in India, with regional variations and dialects.
                    </p>
                    <Image 
                        src="https://picsum.photos/seed/history/600/400" 
                        width={600}
                        height={400}
                        alt="Historic ISL" 
                        className="rounded-lg object-cover"
                        data-ai-hint="historic photo india"
                     />
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Interactive ISL Alphabet Chart</CardTitle>
                    <CardDescription>Hover over a letter to see the corresponding sign (illustration).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-6 md:grid-cols-9 lg:grid-cols-13 gap-2 text-center">
                        {alphabet.map(letter => (
                            <div key={letter} className="relative group p-2 border rounded-md aspect-square flex items-center justify-center bg-secondary hover:bg-primary/20 transition-colors cursor-pointer">
                                <span className="text-2xl font-bold">{letter}</span>
                                <div className="absolute bottom-full mb-2 hidden group-hover:block">
                                    <Image 
                                        src={`https://picsum.photos/seed/${letter}/100/100`} 
                                        width={100}
                                        height={100}
                                        alt={`Sign for ${letter}`} 
                                        className="rounded-md border-2 border-primary"
                                        data-ai-hint={`sign language ${letter}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Common Phrases</CardTitle>
                    <CardDescription>Learn some basic phrases to get you started.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {['Hello', 'Thank You', 'Sorry', 'How are you?', 'My name is...', 'Goodbye'].map(phrase => (
                        <div key={phrase} className="flex items-center gap-4 p-4 rounded-lg bg-secondary">
                             <Image 
                                src={`https://picsum.photos/seed/${phrase.replace(/\s/g, '')}/100/100`} 
                                width={100}
                                height={100}
                                alt={`Sign for ${phrase}`} 
                                className="rounded-lg"
                                data-ai-hint="sign language gesture"
                            />
                            <p className="font-semibold">{phrase}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </section>
  );
}
