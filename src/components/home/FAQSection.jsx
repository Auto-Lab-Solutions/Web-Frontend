import {
  Accordion,
  AccordionItem,
} from "@/components/ui/accordion";
import { faqs } from "@/utils/itemContent";
import SectionHeading from "@/components/home/SectionHeading";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function FAQSection() {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div className="w-full space-y-6 bg-background-tertiary">
      <SectionHeading text="Frequently Asked Questions" dark={false} />
      <Accordion
        type="single"
        collapsible
        className="space-y-4 my-8 mx-5 sm:mx-auto max-w-3xl"
      >
        {faqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            value={`item-${faq.id}`}
            className="rounded-xl transition-all bg-zinc-900 border border-zinc-700 shadow-sm"
            onMouseEnter={() => setHoveredItem(faq.id)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="p-5 text-lg font-medium text-zinc-100 transition-colors cursor-pointer">
              {faq.question}
            </div>

            <AnimatePresence initial={false}>
              {hoveredItem === faq.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="px-5 pb-4 text-sm text-zinc-400 overflow-hidden"
                >
                  {faq.answer.map((answer, idx) => (
                    <p key={idx} className="mb-2 leading-relaxed">
                      {answer}
                    </p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export default FAQSection;
