import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import type { PackageDetail } from "@/lib/queries/packages";

export function TripFAQ({ pkg }: { pkg: PackageDetail }) {
  if (pkg.faqs.length === 0) return null;

  return (
    <section className="section !py-14 max-w-3xl">
      <p className="eyebrow mb-3">Good to Know</p>
      <h2 className="mb-6 text-3xl font-semibold text-navy">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible>
        {pkg.faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
