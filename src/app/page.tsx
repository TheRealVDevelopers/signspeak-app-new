import { HeroSection } from '@/components/landing/hero-section';
import { ProblemSection } from '@/components/landing/problem-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { IslEducationSection } from '@/components/landing/isl-education-section';
import { TechnologySection } from '@/components/landing/technology-section';
import { UseCasesSection } from '@/components/landing/use-cases-section';
import { LearningResourcesSection } from '@/components/landing/learning-resources-section';
import { FaqSection } from '@/components/landing/faq-section';
import { GettingStartedSection } from '@/components/landing/getting-started-section';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">
      <HeroSection />
      <div className="container mx-auto px-4 md:px-8 space-y-24 md:space-y-32 my-24 md:my-32">
        <ProblemSection />
        <Separator />
        <HowItWorksSection />
        <Separator />
        <FeaturesSection />
        <Separator />
        <Separator />
        <TechnologySection />
        <Separator />
        <UseCasesSection />
        <Separator />
        <LearningResourcesSection />
        <Separator />
        <FaqSection />
        <Separator />
        <GettingStartedSection />
      </div>
    </div>
  );
}
