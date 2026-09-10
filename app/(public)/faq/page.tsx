import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { JsonLd } from "@/components/seo/json-ld";
import { buildFaqSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about booking, payments, treks and travel with Himaroh Travels.",
};

export const revalidate = 60;

export default async function FaqPage() {
  const faqs = await prisma.fAQ.findMany({
    where: { isPublished: true },
    orderBy: [{ packageId: "asc" }, { position: "asc" }],
    include: { package: { select: { title: true } } },
  });

  const schema = buildFaqSchema(faqs.map((f) => ({ question: f.question, answer: f.answer })));

  return (
    <div className="section max-w-3xl">
      {schema && <JsonLd data={schema} />}
      <div className="mb-10 text-center">
        <p className="eyebrow mb-3">Good to Know</p>
        <h1 className="text-4xl font-semibold text-navy sm:text-5xl">Frequently Asked Questions</h1>
      </div>

      {faqs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy/20 bg-white/50 p-16 text-center text-navy/60">
          FAQs are being added. In the meantime, reach out on WhatsApp or the contact page and
          we'll answer directly.
        </div>
      ) : (
        <Accordion type="single" collapsible>
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>
                {faq.answer}
                {faq.package && (
                  <span className="mt-2 block text-xs text-navy/40">Re: {faq.package.title}</span>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
