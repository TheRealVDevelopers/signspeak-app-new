import Image from 'next/image';
import { School, Hospital, Building, Users, Briefcase } from 'lucide-react';

const useCases = [
  {
    icon: <School className="h-10 w-10 text-primary" />,
    title: 'Educational Institutions',
    description: 'Empowering deaf students to participate fully in classroom discussions and lectures.',
  },
  {
    icon: <Hospital className="h-10 w-10 text-primary" />,
    title: 'Healthcare Settings',
    description: 'Enabling clear communication between healthcare providers and deaf patients for better care.',
  },
  {
    icon: <Building className="h-10 w-10 text-primary" />,
    title: 'Public Services',
    description: 'Improving accessibility at government offices, banks, and public transport.',
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Family Communication',
    description: 'Strengthening bonds between deaf individuals and their hearing family members.',
  },
   {
    icon: <Briefcase className="h-10 w-10 text-primary" />,
    title: 'Workplace Inclusion',
    description: 'Fostering an inclusive environment in meetings, brainstorming sessions, and daily interactions.',
  },
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Where SignSpeak Makes a Difference</h2>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            From classrooms to clinics, our technology is breaking down communication barriers in various real-world scenarios.
          </p>
          <div className="grid gap-6 pt-6">
            {useCases.map((useCase, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-1">
                  {useCase.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{useCase.title}</h3>
                  <p className="text-muted-foreground">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Image
          src="https://picsum.photos/seed/usecases/600/800"
          width={600}
          height={800}
          alt="Use Cases"
          className="mx-auto aspect-[3/4] overflow-hidden rounded-xl object-cover object-center sm:w-full"
          data-ai-hint="diverse people interacting"
        />
      </div>
    </section>
  );
}
