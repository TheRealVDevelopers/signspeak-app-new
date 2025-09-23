'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "How accurate is the gesture detection?",
    answer: "Our model achieves over 95% accuracy on pre-trained gestures in good lighting conditions. Accuracy can be improved by providing clear, well-lit video and ensuring your hand gestures are distinct.",
  },
  {
    question: "What gestures are supported?",
    answer: "The application comes with over 30 pre-trained common Indian Sign Language (ISL) gestures. You can also train your own custom gestures using the 'Train' feature to expand the vocabulary.",
  },
  {
    question: "Is an internet connection required?",
    answer: "No! Our application is designed to be fully functional offline. All gesture recognition processing happens locally on your device, ensuring privacy and accessibility anywhere, anytime.",
  },
  {
    question: "How can I improve detection accuracy?",
    answer: "For best results, use a plain background, ensure your hand is well-lit, and make your gestures clear and deliberate. When training new gestures, provide multiple samples from slightly different angles to build a robust model.",
  },
  {
    question: "How is my privacy and data handled?",
    answer: "We prioritize your privacy. All camera processing and gesture data storage happen entirely on your device. No video footage or personal data ever leaves your computer.",
  },
  {
    question: "What are the technical requirements to run the application?",
    answer: "The application runs in a modern web browser like Chrome, Firefox, or Safari on a desktop or laptop computer with a webcam. No installation is required.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-muted-foreground md:text-xl/relaxed">
            Find answers to common questions about SignSpeak.
          </p>
        </div>
        <div className="mx-auto max-w-3xl pt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
